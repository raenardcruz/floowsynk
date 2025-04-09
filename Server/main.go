package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/raenardcruz/floowsynk/db"
	"github.com/raenardcruz/floowsynk/proto"
	"github.com/raenardcruz/floowsynk/workflow"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

type LoginServer struct {
	proto.UnimplementedLoginServiceServer
}

type WorkflowServer struct {
	proto.UnimplementedWorkflowServiceServer
}

func main() {
	dbobj, err := db.NewDB()
	if err != nil {
		panic(err)
	}
	defer dbobj.Close()
	dbobj.InitDB()
	dbcon = DBConnection{dbobj}
	grpcServer := grpc.NewServer()
	proto.RegisterLoginServiceServer(grpcServer, &LoginServer{})
	proto.RegisterWorkflowServiceServer(grpcServer, &WorkflowServer{})
	reflection.Register(grpcServer)
	wrap := grpcweb.WrapServer(grpcServer)
	httpServer := http.NewServeMux()
	httpServer.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		wrap.ServeHTTP(w, r)
	})

	restAPIPort := ":8081" // New port for REST API and webhooks
	restServer := http.NewServeMux()

	restServer.HandleFunc("/run-workflow", runWorkflowHandler)

	go func() {
		log.Println("REST API server started at", restAPIPort)
		if err := http.ListenAndServe(restAPIPort, corsMiddleware(restServer)); err != nil {
			log.Fatalf("Failed to start REST API server: %v", err)
		}
	}()

	log.Println("Server started at :8080")
	if err := http.ListenAndServe(":8080", corsMiddleware(httpServer)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func runWorkflowHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte("Only POST method is allowed"))
		return
	}

	workflowID := r.URL.Query().Get("id")
	if workflowID == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Missing workflow ID"))
		return
	}

	workflowObj, err := dbcon.DB.GetWorkflow(workflowID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to get workflow: " + err.Error()))
		return
	}
	wp := workflow.WorkflowProcessor{
		DBcon:            *dbcon.DB,
		Workflow:         workflowObj,
		Stream:           nil, // Replace with a valid implementation if required
		ProcessVariables: make(map[string]interface{}),
	}

	if err := wp.StartWorkflow(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Failed to start workflow: " + err.Error()))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := map[string]interface{}{
		"message":   "Workflow started successfully",
		"variables": wp.ProcessVariables,
	}
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
