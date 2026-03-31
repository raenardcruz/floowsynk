package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/raenardcruz/floowsynk/Common"
	"github.com/raenardcruz/floowsynk/Server/workflow"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

// AuthMiddleware wraps handlers and validates the JWT token
func AuthMiddleware(next func(http.ResponseWriter, *http.Request, *Common.ValidateResults)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		if token == "" {
			http.Error(w, "Missing authorization token", http.StatusUnauthorized)
			return
		}
		// Remove "Bearer " prefix if present
		token = strings.TrimPrefix(token, "Bearer ")

		results := validateToken(token)
		if results.Status != http.StatusOK {
			http.Error(w, results.Message, http.StatusUnauthorized)
			return
		}
		next(w, r, results)
	}
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var creds Common.Credential
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	token, err := Login(creds.Username, creds.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	json.NewEncoder(w).Encode(Common.Token{Token: token})
}

func ExtendTokenHandler(w http.ResponseWriter, r *http.Request, results *Common.ValidateResults) {
	token := r.Header.Get("Authorization")
	token = strings.TrimPrefix(token, "Bearer ")
	newToken, err := ExtendToken(token)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(Common.Token{Token: newToken})
}

func ListWorkflowsHandler(w http.ResponseWriter, r *http.Request, results *Common.ValidateResults) {
	wl, err := ListWorkflows(0, 100) // Default for now
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(wl)
}

func GetWorkflowHandler(w http.ResponseWriter, r *http.Request, results *Common.ValidateResults) {
	id := strings.TrimPrefix(r.URL.Path, "/api/workflows/")
	if id == "" {
		http.Error(w, "Missing workflow ID", http.StatusBadRequest)
		return
	}
	wf, err := GetWorkflow(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(wf)
}

func CreateWorkflowHandler(w http.ResponseWriter, r *http.Request, results *Common.ValidateResults) {
	var wf Common.Workflow
	if err := json.NewDecoder(r.Body).Decode(&wf); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	wf.CreatedBy = results.Id
	wf.UpdatedBy = results.Id
	createdWf, err := CreateWorkflow(&wf)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdWf)
}

func UpdateWorkflowHandler(w http.ResponseWriter, r *http.Request, results *Common.ValidateResults) {
	id := strings.TrimPrefix(r.URL.Path, "/api/workflows/")
	if id == "" {
		http.Error(w, "Missing workflow ID", http.StatusBadRequest)
		return
	}
	var wf Common.Workflow
	if err := json.NewDecoder(r.Body).Decode(&wf); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	wf.Id = id
	wf.UpdatedBy = results.Id
	updatedWf, err := UpdateWorkflow(&wf)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedWf)
}

func DeleteWorkflowHandler(w http.ResponseWriter, r *http.Request, results *Common.ValidateResults) {
	id := strings.TrimPrefix(r.URL.Path, "/api/workflows/")
	if id == "" {
		http.Error(w, "Missing workflow ID", http.StatusBadRequest)
		return
	}
	if err := DeleteWorkflow(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func ListWorkflowHistoryHandler(w http.ResponseWriter, r *http.Request, results *Common.ValidateResults) {
	wh, err := ListWorkflowHistoryImpl()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(wh)
}

func GetWorkflowHistoryHandler(w http.ResponseWriter, r *http.Request, results *Common.ValidateResults) {
	id := strings.TrimPrefix(r.URL.Path, "/api/workflow-history/")
	if id == "" {
		http.Error(w, "Missing history ID", http.StatusBadRequest)
		return
	}
	wh, err := GetWorkflowHistoryImpl(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(wh)
}

type WsStream struct {
	conn *websocket.Conn
}

func (s *WsStream) Send(data *Common.ReplayData) error {
	return s.conn.WriteJSON(data)
}

func WorkflowRunWsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}
	defer conn.Close()

	// Read first message to get token and start command
	var msg map[string]interface{}
	if err := conn.ReadJSON(&msg); err != nil {
		log.Printf("Error reading start signal: %v", err)
		return
	}

	token, _ := msg["token"].(string)
	results := validateToken(token)
	if results.Status != http.StatusOK {
		conn.WriteJSON(map[string]string{"error": "Unauthorized"})
		return
	}

	workflowId, _ := msg["workflowId"].(string)
	wfObj, _ := msg["workflow"].(map[string]interface{})

	var targetWf *Common.Workflow
	if workflowId != "" {
		targetWf, err = GetWorkflow(workflowId)
		if err != nil {
			conn.WriteJSON(map[string]string{"error": "Workflow not found"})
			return
		}
	} else if wfObj != nil {
		// Convert map to Workflow struct
		data, _ := json.Marshal(wfObj)
		json.Unmarshal(data, &targetWf)
	}

	if targetWf == nil {
		conn.WriteJSON(map[string]string{"error": "No workflow provided"})
		return
	}

	processor := workflow.WorkflowProcessor{
		ID:               uuid.NewString(),
		Stream:           &WsStream{conn: conn},
		Workflow:         targetWf,
		ProcessVariables: make(map[string]interface{}),
		DBcon:            *DBCon,
		Producer:         producer,
		Step:             1,
	}

	if err := processor.StartWorkflow(); err != nil {
		conn.WriteJSON(map[string]string{"error": err.Error()})
	}
}
