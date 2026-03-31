package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/IBM/sarama"
	"github.com/google/uuid"
	"github.com/raenardcruz/floowsynk/Broker"
	"github.com/raenardcruz/floowsynk/Common"
	db "github.com/raenardcruz/floowsynk/Database"
	"github.com/raenardcruz/floowsynk/Server/crypto"
	"github.com/raenardcruz/floowsynk/Server/workflow"
)

var DBCon *db.DatabaseConnection
var producer *sarama.SyncProducer
var jwtKey = []byte("secret_key")

func initJWTKey() {
	jwtKey = []byte(db.AppConfig.JWT_Secret)
}

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

	startRESTServer()
}

func initializeDatabase() (err error) {
	db.ConnectToRedis()
	if DBCon, err = db.ConnectToDatabase(); err != nil {
		return err
	}
	initJWTKey()
	crypto.SetKey(db.AppConfig.Crypto_Key)
	DBCon.MigrateAndSeedDatabase()
	return nil
}

func startRESTServer() {
	restAPIPort := db.AppConfig.Server_REST_Port
	mux := http.NewServeMux()

	// Auth routes
	mux.HandleFunc("/api/login", LoginHandler)
	mux.HandleFunc("/api/extend-token", AuthMiddleware(ExtendTokenHandler))

	// Workflow routes
	mux.HandleFunc("/api/workflows", AuthMiddleware(func(w http.ResponseWriter, r *http.Request, results *Common.ValidateResults) {
		switch r.Method {
		case http.MethodGet:
			ListWorkflowsHandler(w, r, results)
		case http.MethodPost:
			CreateWorkflowHandler(w, r, results)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	mux.HandleFunc("/api/workflows/", AuthMiddleware(func(w http.ResponseWriter, r *http.Request, results *Common.ValidateResults) {
		switch r.Method {
		case http.MethodGet:
			GetWorkflowHandler(w, r, results)
		case http.MethodPut:
			UpdateWorkflowHandler(w, r, results)
		case http.MethodDelete:
			DeleteWorkflowHandler(w, r, results)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	// Workflow History routes
	mux.HandleFunc("/api/workflow-history", AuthMiddleware(ListWorkflowHistoryHandler))
	mux.HandleFunc("/api/workflow-history/", AuthMiddleware(GetWorkflowHistoryHandler))

	// Real-time monitoring via WebSockets
	mux.HandleFunc("/api/ws/workflow/run", WorkflowRunWsHandler)

	// Webhook handler (no auth, uses workflow-specific secret in reality, but here simplified)
	mux.HandleFunc("/api/webhook/", runWebhookHandler)

	log.Println("REST API and WebSocket server started at", restAPIPort)
	if err := http.ListenAndServe(":"+restAPIPort, corsMiddleware(mux)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func runWebhookHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 4 || pathParts[2] != "webhook" {
		http.Error(w, "Invalid webhook route", http.StatusBadRequest)
		return
	}
	workflowID := pathParts[3]

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
	json.NewEncoder(w).Encode(response)
}

func corsMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-agent")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		h.ServeHTTP(w, r)
	})
}
