package main

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"strings"

	"github.com/IBM/sarama"
	"github.com/google/uuid"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/raenardcruz/floowsynk/Broker"
	db "github.com/raenardcruz/floowsynk/Database"
	"github.com/raenardcruz/floowsynk/Server/proto"
	"github.com/raenardcruz/floowsynk/Server/workflow"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

// LoginServer handles login-related gRPC services
type LoginServer struct {
	proto.UnimplementedLoginServiceServer
}

// WorkflowServer handles workflow-related gRPC services
type WorkflowServer struct {
	proto.UnimplementedWorkflowServiceServer
}

const JobToken = "6c9e5318-6e7b-452d-9e22-9f35a755bcbd"

var DBCon *db.DatabaseConnection
var producer *sarama.SyncProducer

func main() {
	var err error
	if err = initializeDatabase(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
		return
	}
	if producer, err = Broker.Init(); err != nil {
		log.Fatalf("Failed to initialize broker: %v", err)
		return
	}
	if producer == nil {
		log.Fatalf("Failed to create producer")
		return
	}
	defer func() {
		if err := (*producer).Close(); err != nil {
			log.Fatalf("Failed to close producer: %v", err)
		}
		log.Println("Cleaned up producer")
	}()

	grpcServer := setupGRPCServer()
	httpServer := setupHTTPServer(grpcServer)

	startRESTServer()
	setupPlainGRPCServer()

	grpcPort := ":8080"
	log.Println("gRPC Web server started at", grpcPort)
	listener, err := net.Listen("tcp", grpcPort)
	if err != nil {
		log.Fatalf("Failed to start gRPC server: %v", err)
	}
	if err := http.Serve(listener, corsMiddleware(httpServer)); err != nil {
		log.Fatalf("Failed to serve gRPC: %v", err)
	}
}

func initializeDatabase() (err error) {
	db.ConnectToRedis()
	if DBCon, err = db.ConnectToDatabase(); err != nil {
		return err
	}
	DBCon.MigrateAndSeedDatabase()
	return nil
}

func setupGRPCServer() *grpc.Server {
	grpcServer := grpc.NewServer()
	proto.RegisterLoginServiceServer(grpcServer, &LoginServer{})
	proto.RegisterWorkflowServiceServer(grpcServer, &WorkflowServer{})
	reflection.Register(grpcServer)
	return grpcServer
}

func setupHTTPServer(grpcServer *grpc.Server) *http.ServeMux {
	wrap := grpcweb.WrapServer(grpcServer)
	httpServer := http.NewServeMux()
	httpServer.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		wrap.ServeHTTP(w, r)
	})
	return httpServer
}

func startRESTServer() {
	restAPIPort := ":8081"
	restServer := http.NewServeMux()

	// Define the route for the webhook handler
	restServer.HandleFunc("/api/webhook/", runWebhookHandler)

	go func() {
		log.Println("REST API server started at", restAPIPort)
		listener, err := net.Listen("tcp", restAPIPort)
		if err != nil {
			log.Fatalf("Failed to start REST API server: %v", err)
		}
		if err := http.Serve(listener, corsMiddleware(restServer)); err != nil {
			log.Fatalf("Failed to serve REST API: %v", err)
		}
	}()
}

func setupPlainGRPCServer() {
	plainGRPCPort := ":50051"
	plainGRPCServer := grpc.NewServer()
	proto.RegisterLoginServiceServer(plainGRPCServer, &LoginServer{})
	proto.RegisterWorkflowServiceServer(plainGRPCServer, &WorkflowServer{})
	reflection.Register(plainGRPCServer)

	go func() {
		log.Println("Plain gRPC server started at", plainGRPCPort)
		listener, err := net.Listen("tcp", plainGRPCPort)
		if err != nil {
			log.Fatalf("Failed to start plain gRPC server: %v", err)
		}
		if err := plainGRPCServer.Serve(listener); err != nil {
			log.Fatalf("Failed to serve plain gRPC: %v", err)
		}
	}()
}

func runWebhookHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract workflow ID from the route after /webhook/
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 4 || pathParts[2] != "webhook" {
		http.Error(w, "Invalid webhook route", http.StatusBadRequest)
		return
	}
	workflowID := pathParts[3]

	if workflowID == "" {
		http.Error(w, "Missing workflow ID", http.StatusBadRequest)
		return
	}

	workflowObj, err := DBCon.GetWebhookWorkflow(workflowID)
	if err != nil {
		http.Error(w, "Failed to get workflow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	wp := workflow.WorkflowProcessor{
		ID:               uuid.NewString(),
		DBcon:            *DBCon,
		Workflow:         workflowObj,
		Stream:           nil,
		ProcessVariables: make(map[string]interface{}),
		Producer:         producer,
	}

	if err := wp.StartWorkflow(); err != nil {
		http.Error(w, "Failed to start workflow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message":   "Workflow started successfully",
		"variables": wp.ProcessVariables,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response as JSON", http.StatusInternalServerError)
	}
}

func corsMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-agent, x-grpc-web")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		h.ServeHTTP(w, r)
	})
}
