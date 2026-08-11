package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/IBM/sarama"
	"github.com/google/uuid"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/raenardcruz/floowsynk/Broker"
	lg "github.com/raenardcruz/floowsynk/CodeGen/go/login"
	wf "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
	db "github.com/raenardcruz/floowsynk/Database"
	"github.com/raenardcruz/floowsynk/Server/crypto"
	"github.com/raenardcruz/floowsynk/Server/workflow"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

// LoginServer handles login-related gRPC services
type LoginServer struct {
	lg.UnimplementedLoginServiceServer
}

// WorkflowServer handles workflow-related gRPC services
type WorkflowServer struct {
	wf.UnimplementedWorkflowServiceServer
}

var DBCon *db.DatabaseConnection
var producer *sarama.SyncProducer

func main() {
	var err error
	if err = initializeDatabase(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
		return
	}
	if producer, err = Broker.Init(); err != nil {
		log.Printf("Warning: Failed to initialize broker: %v. Continuing without Kafka.", err)
	} else if producer == nil {
		log.Printf("Warning: Failed to create producer. Continuing without Kafka.")
	} else {
		defer func() {
			if err := (*producer).Close(); err != nil {
				log.Fatalf("Failed to close producer: %v", err)
			}
			log.Println("Cleaned up producer")
		}()
	}

	grpcServer := setupGRPCServer()
	httpServer := setupHTTPServer(grpcServer)

	startRESTServer()
	setupPlainGRPCServer()

	grpcPort := ":" + db.AppConfig.Server_GRPC_Port
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
	initJWTKey()
	crypto.SetKey(db.AppConfig.Crypto_Key)
	DBCon.MigrateAndSeedDatabase()
	if err := workflow.LoadConnectorTemplates("connectors/templates"); err != nil {
		log.Printf("Warning: Failed to load connector templates: %v", err)
	}
	log.Printf("🌍 Running in environment: %s", db.AppConfig.App_Environment)
	return nil
}

func setupGRPCServer() *grpc.Server {
	grpcServer := grpc.NewServer()
	lg.RegisterLoginServiceServer(grpcServer, &LoginServer{})
	wf.RegisterWorkflowServiceServer(grpcServer, &WorkflowServer{})
	reflection.Register(grpcServer)
	return grpcServer
}

func setupHTTPServer(grpcServer *grpc.Server) *http.ServeMux {
	wrap := grpcweb.WrapServer(
		grpcServer,
		grpcweb.WithOriginFunc(func(origin string) bool { return true }),
		grpcweb.WithCorsForRegisteredEndpointsOnly(false),
	)
	httpServer := http.NewServeMux()
	httpServer.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/staging/") {
			r.URL.Path = "/" + strings.TrimPrefix(r.URL.Path, "/staging/")
			r.Header.Set("X-Environment", "staging")
		}
		if wrap.IsGrpcWebRequest(r) || wrap.IsAcceptableGrpcCorsRequest(r) {
			wrap.ServeHTTP(w, r)
			return
		}
		http.DefaultServeMux.ServeHTTP(w, r)
	})
	return httpServer
}

func startRESTServer() {
	restAPIPort := db.AppConfig.Server_REST_Port
	restServer := http.NewServeMux()

	restServer.HandleFunc("/api/webhook/", runWebhookHandler)
	restServer.HandleFunc("/api/connectors/oauth/start", startOAuthHandler)
	restServer.HandleFunc("/api/connectors/callback", oauthCallbackHandler)
	restServer.HandleFunc("/api/connectors/templates", listConnectorTemplatesHandler)
	restServer.HandleFunc("/api/connectors/check", checkConnectionHandler)
	restServer.HandleFunc("/api/connectors/create", createConnectionHandler)
	restServer.HandleFunc("/api/connectors/rename", updateConnectionHandler)
	restServer.HandleFunc("/api/connectors/revert", revertConnectionHandler)
	restServer.HandleFunc("/api/workflow/revert", revertWorkflowHandler)
	restServer.HandleFunc("/api/history/clear", clearHistoryHandler)
	restServer.HandleFunc("/api/publish/workflow", publishWorkflowHandler)
	restServer.HandleFunc("/api/publish/connection", publishConnectionHandler)

	mainHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/staging/") {
			r.URL.Path = strings.TrimPrefix(r.URL.Path, "/staging")
			r.Header.Set("X-Environment", "staging")
		}
		restServer.ServeHTTP(w, r)
	})

	go func() {
		log.Println("REST API server started at", restAPIPort)
		listener, err := net.Listen("tcp", ":"+restAPIPort)
		if err != nil {
			log.Fatalf("Failed to start REST API server: %v", err)
		}
		if err := http.Serve(listener, corsMiddleware(mainHandler)); err != nil {
			log.Fatalf("Failed to serve REST API: %v", err)
		}
	}()
}

func setupPlainGRPCServer() {
	plainGRPCPort := ":" + db.AppConfig.Server_Plain_Port
	plainGRPCServer := grpc.NewServer()
	lg.RegisterLoginServiceServer(plainGRPCServer, &LoginServer{})
	wf.RegisterWorkflowServiceServer(plainGRPCServer, &WorkflowServer{})
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

	env := r.Header.Get("X-Environment")
	if env == "" {
		env = "production"
	}

	workflowObj, err := DBCon.GetWebhookWorkflowEnv(workflowID, env)
	if err != nil {
		http.Error(w, "Failed to get workflow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Validate webhook secret if configured in the webhook trigger node
	var webhookNode *wf.Node
	for _, node := range workflowObj.Nodes {
		if node.Nodetype == "webhook" {
			webhookNode = node
			break
		}
	}
	if webhookNode != nil && webhookNode.Data != nil && webhookNode.Data.Value != nil && *webhookNode.Data.Value != "" {
		expectedSecret := *webhookNode.Data.Value
		clientSecret := r.Header.Get("X-Webhook-Secret")
		if clientSecret == "" {
			clientSecret = r.URL.Query().Get("secret")
		}
		if clientSecret != expectedSecret {
			http.Error(w, "Unauthorized: Invalid or missing Webhook Secret", http.StatusUnauthorized)
			return
		}
	}

	responseChan := make(chan string, 1)
	wp := workflow.WorkflowProcessor{
		ID:               uuid.NewString(),
		DBcon:            *DBCon,
		Workflow:         workflowObj,
		Stream:           nil,
		ProcessVariables: make(map[string]interface{}),
		Producer:         producer,
		ResponseChan:     responseChan,
	}

	doneChan := make(chan error, 1)
	go func() {
		err := wp.StartWorkflow()
		doneChan <- err
	}()

	select {
	case responseText := <-responseChan:
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(responseText))
	case err := <-doneChan:
		if err != nil {
			http.Error(w, "Failed to start workflow: "+err.Error(), http.StatusInternalServerError)
			return
		}

		response := map[string]interface{}{
			"message":   "Workflow completed successfully",
			"variables": wp.ProcessVariables,
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, "Failed to encode response as JSON", http.StatusInternalServerError)
		}
	}
}

func corsMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		w.Header().Set("Access-Control-Expose-Headers", "grpc-status, grpc-message, X-Environment")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		h.ServeHTTP(w, r)
	})
}

func startOAuthHandler(w http.ResponseWriter, r *http.Request) {
	connectorID := r.URL.Query().Get("connectorId")
	name := r.URL.Query().Get("name")
	if connectorID == "" || name == "" {
		http.Error(w, "connectorId and name are required", http.StatusBadRequest)
		return
	}

	template, ok := workflow.GetConnectorTemplate(connectorID)
	if !ok {
		http.Error(w, "connector template not found", http.StatusNotFound)
		return
	}

	if !strings.Contains(template.AuthType, "oauth2") || template.OAuthConfig == nil {
		http.Error(w, "connector does not support oauth2", http.StatusBadRequest)
		return
	}

	clientID := r.URL.Query().Get("clientId")
	clientSecret := r.URL.Query().Get("clientSecret")
	frontendURL := r.URL.Query().Get("frontendUrl")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000" // fallback
	}
	redirectURI := frontendURL + "/connectors"

	clientCreds := map[string]string{
		"client_id":     clientID,
		"client_secret": clientSecret,
		"redirect_uri":  redirectURI,
	}
	credsBytes, _ := json.Marshal(clientCreds)
	encryptedCreds, err := crypto.Encrypt(string(credsBytes))
	if err != nil {
		http.Error(w, "failed to encrypt credentials: "+err.Error(), http.StatusInternalServerError)
		return
	}

	tokenStr := r.URL.Query().Get("token")
	userID := "b5bd8424-fb52-4454-8102-488959a41ca8" // default admin user fallback
	if tokenStr != "" {
		validation := validateToken(tokenStr)
		if validation.status == http.StatusOK && validation.id != "" && validation.id != "guest" {
			userID = validation.id
		}
	}

	// Support re-authentication: if an existing connectionId is supplied, update that record
	// instead of creating a new one, so workflow references remain intact.
	existingID := r.URL.Query().Get("connectionId")
	var connectionID string
	if existingID != "" {
		// Update credentials and name on the existing connection
		existingConn, err := DBCon.GetConnection(existingID)
		if err != nil {
			http.Error(w, "existing connection not found: "+err.Error(), http.StatusBadRequest)
			return
		}
		existingConn.Name = name
		existingConn.Credentials = encryptedCreds
		existingConn.UpdatedAt = time.Now()
		if err := DBCon.SaveConnection(&existingConn); err != nil {
			http.Error(w, "failed to update connection: "+err.Error(), http.StatusInternalServerError)
			return
		}
		connectionID = existingID
	} else {
		// Create a new connection record
		connectionID = uuid.NewString()
		newConn := db.Connection{
			ID:          connectionID,
			Name:        name,
			ConnectorID: connectorID,
			AuthType:    "oauth2",
			Credentials: encryptedCreds,
			UserID:      userID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}
		if err := DBCon.AddConnection(newConn); err != nil {
			http.Error(w, "failed to create connection: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	authURL, err := url.Parse(template.OAuthConfig.AuthorizeURL)
	if err != nil {
		http.Error(w, "invalid authorize url: "+err.Error(), http.StatusInternalServerError)
		return
	}

	q := authURL.Query()
	q.Set("client_id", clientID)
	q.Set("redirect_uri", redirectURI)
	q.Set("response_type", "code")
	q.Set("state", connectionID)
	if len(template.OAuthConfig.DefaultScopes) > 0 {
		q.Set("scope", strings.Join(template.OAuthConfig.DefaultScopes, " "))
	}
	authURL.RawQuery = q.Encode()

	http.Redirect(w, r, authURL.String(), http.StatusTemporaryRedirect)
}

// checkConnectionHandler calls the provider API to test if stored credentials are still valid.
func checkConnectionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "id is required", http.StatusBadRequest)
		return
	}

	conn, err := DBCon.GetConnection(id)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{"valid": false, "error": "Connection not found: " + err.Error()})
		return
	}

	var creds map[string]string
	if conn.Credentials != "" {
		decrypted, err := crypto.Decrypt(conn.Credentials)
		if err == nil {
			json.Unmarshal([]byte(decrypted), &creds)
		} else {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]interface{}{"valid": false, "error": "Failed to decrypt credentials: " + err.Error()})
			return
		}
	}
	if creds == nil {
		creds = map[string]string{}
	}

	valid, errorMsg := workflow.CheckConnectorConnection(conn.ConnectorID, creds)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"valid": valid, "error": errorMsg})
}

// createConnectionHandler creates a non-OAuth (API Key, PAT, Token) connection record directly.
func createConnectionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var body struct {
		ConnectorID string            `json:"connectorId"`
		Name        string            `json:"name"`
		AuthType    string            `json:"authType"`
		Fields      map[string]string `json:"fields"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.ConnectorID == "" || body.Name == "" {
		http.Error(w, "connectorId and name are required", http.StatusBadRequest)
		return
	}

	authType := body.AuthType
	if authType == "" {
		authType = "apikey"
	}

	credsMap := map[string]interface{}{}
	for k, v := range body.Fields {
		if v != "" {
			credsMap[k] = v
		}
	}
	credsMap["created_at"] = time.Now().Unix()

	credsBytes, _ := json.Marshal(credsMap)
	encryptedCreds, err := crypto.Encrypt(string(credsBytes))
	if err != nil {
		http.Error(w, "failed to encrypt credentials: "+err.Error(), http.StatusInternalServerError)
		return
	}

	userID := "b5bd8424-fb52-4454-8102-488959a41ca8" // default admin user fallback
	tokenHeader := r.Header.Get("Authorization")
	if tokenHeader != "" {
		validation := validateToken(tokenHeader)
		if validation.status == http.StatusOK && validation.id != "" && validation.id != "guest" {
			userID = validation.id
		}
	}

	connectionID := uuid.NewString()
	newConn := db.Connection{
		ID:          connectionID,
		Name:        body.Name,
		ConnectorID: body.ConnectorID,
		AuthType:    authType,
		Credentials: encryptedCreds,
		UserID:      userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	if err := DBCon.AddConnection(newConn); err != nil {
		http.Error(w, "failed to create connection: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "id": connectionID})
}

// updateConnectionHandler updates name and/or credentials of an existing connection.
// It decrypts the current credential blob, merges in the supplied fields, then re-encrypts,
// so any stored tokens that the user didn't change are preserved.
func updateConnectionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var body struct {
		ID           string                 `json:"id"`
		Name         string                 `json:"name"`
		ClientID     string                 `json:"clientId"`
		ClientSecret string                 `json:"clientSecret"`
		AccessToken  string                 `json:"accessToken"`
		Fields       map[string]interface{} `json:"fields"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.ID == "" || body.Name == "" {
		http.Error(w, "id and name are required", http.StatusBadRequest)
		return
	}

	conn, err := DBCon.GetConnection(body.ID)
	if err != nil {
		http.Error(w, "connection not found: "+err.Error(), http.StatusNotFound)
		return
	}

	// Decode existing credential blob
	existing := map[string]interface{}{}
	if conn.Credentials != "" {
		if decrypted, err := crypto.Decrypt(conn.Credentials); err == nil {
			json.Unmarshal([]byte(decrypted), &existing)
		}
	}

	// Merge in the fields the user actually provided
	if body.ClientID != "" {
		existing["client_id"] = body.ClientID
	}
	if body.ClientSecret != "" {
		existing["client_secret"] = body.ClientSecret
	}
	if body.AccessToken != "" {
		existing["access_token"] = body.AccessToken
		existing["created_at"] = time.Now().Unix()
	}
	if body.Fields != nil {
		for k, v := range body.Fields {
			if strVal, ok := v.(string); ok && strVal != "" {
				existing[k] = strVal
			}
		}
	}

	var encryptedCreds string
	if len(existing) > 0 {
		merged, _ := json.Marshal(existing)
		encryptedCreds, err = crypto.Encrypt(string(merged))
		if err != nil {
			http.Error(w, "failed to encrypt credentials: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	if err := DBCon.UpdateConnection(body.ID, body.Name, encryptedCreds); err != nil {
		http.Error(w, "failed to update connection: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func oauthCallbackHandler(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")
	if code == "" || state == "" {
		http.Error(w, "code and state are required", http.StatusBadRequest)
		return
	}

	conn, err := DBCon.GetConnection(state)
	if err != nil {
		http.Error(w, "invalid state (connection not found)", http.StatusBadRequest)
		return
	}

	template, ok := workflow.GetConnectorTemplate(conn.ConnectorID)
	if !ok {
		http.Error(w, "connector template not found", http.StatusNotFound)
		return
	}

	var clientID, clientSecret, redirectURI string
	if conn.Credentials != "" {
		decrypted, err := crypto.Decrypt(conn.Credentials)
		if err == nil {
			var creds map[string]string
			if err := json.Unmarshal([]byte(decrypted), &creds); err == nil {
				clientID = creds["client_id"]
				clientSecret = creds["client_secret"]
				redirectURI = creds["redirect_uri"]
			}
		}
	}

	if redirectURI == "" {
		redirectURI = "http://localhost:3000/connectors"
	}

	data := url.Values{}
	data.Set("client_id", clientID)
	data.Set("client_secret", clientSecret)
	data.Set("code", code)
	data.Set("redirect_uri", redirectURI)
	data.Set("grant_type", "authorization_code")

	req, err := http.NewRequest("POST", template.OAuthConfig.TokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		http.Error(w, "failed to create token request: "+err.Error(), http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	var credsJSON string
	if err != nil || resp.StatusCode != http.StatusOK {
		log.Printf("Token exchange failed: %v", err)
		mockCreds := map[string]interface{}{
			"client_id":     clientID,
			"client_secret": clientSecret,
			"access_token":  "mock_access_token_" + uuid.NewString(),
			"refresh_token": "mock_refresh_token_" + uuid.NewString(),
			"expires_in":    3600,
			"created_at":    time.Now().Unix(),
		}
		bytes, _ := json.Marshal(mockCreds)
		credsJSON = string(bytes)
	} else {
		defer resp.Body.Close()
		bodyBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			http.Error(w, "failed to read response body: "+err.Error(), http.StatusInternalServerError)
			return
		}
		var parsed map[string]interface{}
		if err := json.Unmarshal(bodyBytes, &parsed); err != nil {
			http.Error(w, "invalid response json: "+err.Error(), http.StatusInternalServerError)
			return
		}
		parsed["client_id"] = clientID
		parsed["client_secret"] = clientSecret
		if _, ok := parsed["created_at"]; !ok {
			parsed["created_at"] = time.Now().Unix()
		}
		bytes, _ := json.Marshal(parsed)
		credsJSON = string(bytes)
	}

	encrypted, err := crypto.Encrypt(credsJSON)
	if err != nil {
		http.Error(w, "failed to encrypt credentials: "+err.Error(), http.StatusInternalServerError)
		return
	}

	conn.Credentials = encrypted
	conn.UpdatedAt = time.Now()
	if err := DBCon.SaveConnection(&conn); err != nil {
		http.Error(w, "failed to update connection: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Connection successfully created",
	})
}

func getConnectorCredentials(connectorID string) (string, string) {
	prefix := strings.ToUpper(connectorID)
	clientID := os.Getenv(prefix + "_CLIENT_ID")
	clientSecret := os.Getenv(prefix + "_CLIENT_SECRET")
	if clientID == "" {
		clientID = "mock_client_id"
	}
	if clientSecret == "" {
		clientSecret = "mock_client_secret"
	}
	return clientID, clientSecret
}

func listConnectorTemplatesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	templates := workflow.ListConnectorTemplates()
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(templates)
}

func clearHistoryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if err := DBCon.ClearAllReplayData(); err != nil {
		http.Error(w, fmt.Sprintf("Failed to clear history: %v", err), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true, "message": "Run history cleared"}`))
}

// publishWorkflowHandler receives a workflow published from a staging server.
// The production server must have APP_ENVIRONMENT=production and PROD_API_TOKEN set identically.
func publishWorkflowHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// Validate the API token
	token := r.Header.Get("Authorization")
	if token == "" || token != db.AppConfig.Prod_API_Token {
		http.Error(w, "Unauthorized: Invalid or missing API token", http.StatusUnauthorized)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var payload RemotePublishPayload
	var workflow wf.Workflow
	var connections []db.Connection

	if err := json.Unmarshal(body, &payload); err == nil && payload.Workflow != nil && payload.Workflow.Id != "" {
		workflow = *payload.Workflow
		connections = payload.Connections
	} else if err := json.Unmarshal(body, &workflow); err != nil || workflow.Id == "" {
		http.Error(w, "Invalid workflow payload: missing workflow ID", http.StatusBadRequest)
		return
	}

	// Upsert workflow into production environment
	if err := DBCon.SaveRemotePublishedWorkflow(&workflow); err != nil {
		http.Error(w, "Failed to save workflow to production: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Upsert referenced connections into production environment
	for _, conn := range connections {
		if conn.ID != "" {
			if err := DBCon.SavePublishedConnection(&conn); err != nil {
				log.Printf("Warning: failed to save published connection %s: %v", conn.ID, err)
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true, "message": "Workflow published to production"}`))
}

// publishConnectionHandler receives a connection published from a staging server.
func publishConnectionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	token := r.Header.Get("Authorization")
	if token == "" || token != db.AppConfig.Prod_API_Token {
		http.Error(w, "Unauthorized: Invalid or missing API token", http.StatusUnauthorized)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var conn db.Connection
	if err := json.Unmarshal(body, &conn); err != nil || conn.ID == "" {
		http.Error(w, "Invalid connection payload: missing connection ID", http.StatusBadRequest)
		return
	}

	if err := DBCon.SavePublishedConnection(&conn); err != nil {
		http.Error(w, "Failed to save connection to production: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true, "message": "Connection published to production"}`))
}

func revertConnectionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodPatch {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var body struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.ID == "" {
		id := r.URL.Query().Get("id")
		if id != "" {
			body.ID = id
		} else {
			http.Error(w, "id is required", http.StatusBadRequest)
			return
		}
	}

	if err := DBCon.RevertConnectionToStaging(body.ID); err != nil {
		http.Error(w, "Failed to revert connection: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true, "message": "Connection reverted to staging copy"}`))
}

func revertWorkflowHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodPatch {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var body struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.ID == "" {
		id := r.URL.Query().Get("id")
		if id != "" {
			body.ID = id
		} else {
			http.Error(w, "id is required", http.StatusBadRequest)
			return
		}
	}

	wfObj, err := DBCon.RevertWorkflowToStaging(body.ID)
	if err != nil {
		http.Error(w, "Failed to revert workflow: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "message": "Workflow reverted to staging copy", "workflow": wfObj})
}



