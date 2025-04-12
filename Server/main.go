package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
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

func main() {
	err := initializeDatabase()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	grpcServer := setupGRPCServer()
	httpServer := setupHTTPServer(grpcServer)

	startRESTServer()

	log.Println("Server started at :8080")
	if err := http.ListenAndServe(":8080", corsMiddleware(httpServer)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
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
	restServer.HandleFunc("/api/webhook/", runWebhookHandler)

	go func() {
		log.Println("REST API server started at", restAPIPort)
		if err := http.ListenAndServe(restAPIPort, corsMiddleware(restServer)); err != nil {
			log.Fatalf("Failed to start REST API server: %v", err)
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
		DBcon:            *DBCon,
		Workflow:         workflowObj,
		Stream:           nil,
		ProcessVariables: make(map[string]interface{}),
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
