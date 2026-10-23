package main

import (
	"context"
	"crypto/subtle"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	wf "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
	DB "github.com/raenardcruz/floowsynk/Database"
	"github.com/raenardcruz/floowsynk/Server/crypto"
	"github.com/raenardcruz/floowsynk/Server/rag"
	"google.golang.org/grpc/metadata"
)

const UserRoleService = DB.UserRoleService

func generateToken(id string, username, role string, expiry int64) string {
	claims := jwt.MapClaims{
		"id":       id,
		"username": username,
		"role":     role,
		"exp":      expiry,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(jwtKey)
	return tokenString
}

func getTokenFromContext(ctx context.Context) (token string, err error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return "", fmt.Errorf("metadata not found")
	}
	token = strings.Join(md.Get("Authorization"), "")
	if token == "" {
		return "", fmt.Errorf("token not found")
	}
	return token, nil
}

func validateToken(tokenString string) *ValidateResults {
	if tokenString == "guest" {
		return &ValidateResults{
			id:       "guest",
			username: "guest",
			role:     "guest",
			status:   http.StatusOK,
		}
	}
	if DB.AppConfig.Job_Token != "" && subtle.ConstantTimeCompare([]byte(tokenString), []byte(DB.AppConfig.Job_Token)) == 1 {
		return &ValidateResults{
			id:       "",
			username: "job",
			role:     UserRoleService,
			status:   http.StatusOK,
		}
	}
	token, err := jwt.ParseWithClaims(tokenString, jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtKey, nil
	})
	if err != nil {
		return &ValidateResults{status: http.StatusUnauthorized, message: err.Error()}
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		id, _ := claims["id"].(string)
		username, _ := claims["username"].(string)
		role, _ := claims["role"].(string)
		return &ValidateResults{
			id:       id,
			username: username,
			role:     role,
			status:   http.StatusOK,
		}
	}

	return &ValidateResults{status: http.StatusUnauthorized, message: "Invalid token"}
}

func ExtendToken(token string) (string, error) {
	if token == "guest" {
		return "guest", nil
	}
	results := validateToken(token)
	if results.status != http.StatusOK {
		return "", fmt.Errorf("Unauthorized")
	}

	newToken := generateToken(results.id, results.username, results.role, time.Now().Add(time.Minute*60).UTC().Unix())
	return newToken, nil
}

func Login(userName string, password string) (string, error) {
	dbUser, err := DBCon.GetUserByUsername(userName)
	if err != nil {
		return "", fmt.Errorf("error getting user")
	}
	if dbUser.ID == "" {
		return "", fmt.Errorf("user not found")
	}

	if dbUser.Role == UserRoleService {
		return "", fmt.Errorf("login not allowed for service users")
	}

	if crypto.VerifyPassword(dbUser.Password, password) {
		token := generateToken(dbUser.ID, userName, dbUser.Role, time.Now().Add(time.Minute*60).UTC().Unix())
		return token, nil
	}

	return "", fmt.Errorf("invalid password")
}

func GetWorkflow(id string, env string) (workflow *wf.Workflow, err error) {
	workflow, err = DBCon.GetWorkflowEnv(id, env)
	if err != nil {
		return workflow, err
	}
	return workflow, nil
}

func ListWorkflows(offset int32, limit int32, env string) (wl *wf.WorkflowList, err error) {
	wl, err = DBCon.GetWorkflowsEnv(int(limit), int(offset), env)
	if err != nil {
		return nil, err
	}
	return wl, nil
}

func UpdateWorkflow(workflow *wf.Workflow, env string) (w *wf.Workflow, err error) {
	if err := DBCon.UpdateWorkflowEnv(workflow, env); err != nil {
		return nil, err
	}
	return workflow, nil
}

func CreateWorkflow(workflow *wf.Workflow, env string) (*wf.Workflow, error) {
	id, err := DBCon.CreateWorkflowEnv(workflow, env)
	if err != nil {
		return nil, err
	}
	workflow.Id = id
	return workflow, nil
}

func DeleteWorkflow(id string, env string) error {
	return DBCon.DeleteWorkflowEnv(id, env)
}

func ListWorkflowHistoryImpl(env string) (*wf.WorkflowHistoryList, error) {
	history, err := DBCon.GetWorkflowHistoryEnv(env)
	if err != nil {
		return nil, err
	}

	workflowIDMap := make(map[string]bool)
	var workflowIDs []string
	for _, data := range history {
		if data.WorkflowID != "" && !workflowIDMap[data.WorkflowID] {
			workflowIDMap[data.WorkflowID] = true
			workflowIDs = append(workflowIDs, data.WorkflowID)
		}
	}

	namesMap, err := DBCon.GetWorkflowNamesByIDsEnv(workflowIDs, env)
	if err != nil {
		return nil, err
	}

	hl := make([]*wf.WorkflowHistory, 0, len(history))
	for _, data := range history {
		name, exists := namesMap[data.WorkflowID]
		if !exists {
			continue
		}
		hl = append(hl, &wf.WorkflowHistory{
			Id:           data.ProcessID,
			WorkflowId:   data.WorkflowID,
			WorkflowName: name,
			RunDate:      time.Unix(data.CreatedAt, 0).Format("Jan 02, 2006"),
			Status:       wf.NodeStatus(data.Status),
		})
	}

	return &wf.WorkflowHistoryList{
		History: hl,
	}, nil
}

func GetWorkflowHistoryImpl(Id string, env string) (*wf.WorkflowHistoryResponse, error) {
	replayDataList, err := DBCon.GetReplayDataGroupedByProcessIDEnv(Id, env)
	if err != nil {
		return nil, err
	}

	var data []*wf.ReplayData
	for _, rd := range replayDataList {
		var nodeData wf.NodeData
		if len(rd.Data) > 0 && string(rd.Data) != "null" {
			if err := json.Unmarshal([]byte(rd.Data), &nodeData); err != nil {
				log.Printf("Warning unmarshalling replay data for node %s: %v", rd.NodeID, err)
			}
		}
		var variables map[string]string
		if len(rd.Variables) > 0 && string(rd.Variables) != "null" {
			if err := json.Unmarshal([]byte(rd.Variables), &variables); err != nil {
				log.Printf("Warning unmarshalling replay variables for node %s: %v", rd.NodeID, err)
			}
		}
		if variables == nil {
			variables = make(map[string]string)
		}

		data = append(data, &wf.ReplayData{
			NodeId:    rd.NodeID,
			Data:      &nodeData,
			Variables: variables,
			Status:    wf.NodeStatus(rd.Status),
			Message:   rd.Message,
		})
	}

	return &wf.WorkflowHistoryResponse{
		Data: data,
	}, nil
}

func ListWorkflowVersionsImpl(workflowID string, env string) (*wf.WorkflowVersionList, error) {
	versions, err := DBCon.ListWorkflowVersionsEnv(workflowID, env)
	if err != nil {
		return nil, err
	}
	return &wf.WorkflowVersionList{Versions: versions}, nil
}

func RestoreWorkflowVersionImpl(version *wf.WorkflowVersion, userID string, env string) (*wf.Workflow, error) {
	existing, err := DBCon.GetWorkflowEnv(version.WorkflowId, env)
	if err != nil {
		return nil, fmt.Errorf("workflow %s not found: %w", version.WorkflowId, err)
	}
	existing.Nodes = version.Nodes
	existing.Edges = version.Edges
	existing.UpdatedBy = userID
	if err := DBCon.UpdateWorkflowEnv(existing, env); err != nil {
		return nil, fmt.Errorf("failed to restore workflow version: %w", err)
	}
	return existing, nil
}

func PublishWorkflowImpl(req *wf.PublishWorkflowRequest) (*wf.PublishWorkflowResponse, error) {
	if DB.AppConfig.Prod_Server_URL != "" {
		resp, err := publishToRemoteServer(req)
		if err != nil {
			return &wf.PublishWorkflowResponse{Success: false, Message: err.Error()}, nil
		}
		return resp, nil
	}

	if err := DBCon.PublishWorkflowVersion(req.WorkflowId, req.VersionId); err != nil {
		return &wf.PublishWorkflowResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to publish workflow: %v", err),
		}, nil
	}
	return &wf.PublishWorkflowResponse{
		Success: true,
		Message: fmt.Sprintf("Workflow %s published to production successfully", req.WorkflowId),
	}, nil
}

type RemotePublishPayload struct {
	Workflow    *wf.Workflow    `json:"workflow"`
	Connections []DB.Connection `json:"connections"`
}

// publishToRemoteServer sends a publish request to a separate production server via HTTP.
func publishToRemoteServer(req *wf.PublishWorkflowRequest) (*wf.PublishWorkflowResponse, error) {
	// Fetch the workflow version data to send
	workflow, err := DBCon.GetWorkflow(req.WorkflowId)
	if err != nil {
		return nil, fmt.Errorf("workflow not found: %w", err)
	}

	// If a specific version is requested, load it
	if req.VersionId != "" {
		version, err := DBCon.GetWorkflowVersion(req.VersionId)
		if err != nil {
			return nil, fmt.Errorf("version not found: %w", err)
		}
		var nodes []*wf.Node
		var edges []*wf.Edge
		if err := json.Unmarshal(version.Nodes, &nodes); err != nil {
			return nil, fmt.Errorf("failed to unmarshal version nodes: %w", err)
		}
		if err := json.Unmarshal(version.Edges, &edges); err != nil {
			return nil, fmt.Errorf("failed to unmarshal version edges: %w", err)
		}
		workflow.Nodes = nodes
		workflow.Edges = edges
	}

	// Extract referenced connections from nodes
	connMap := make(map[string]DB.Connection)
	for _, n := range workflow.Nodes {
		if n.Data != nil && n.Data.Listvar != nil && *n.Data.Listvar != "" {
			connID := *n.Data.Listvar
			if _, exists := connMap[connID]; !exists {
				conn, err := DBCon.GetConnection(connID)
				if err == nil && conn.ID != "" {
					connMap[connID] = conn
				}
			}
		}
	}

	var connList []DB.Connection
	for _, conn := range connMap {
		connList = append(connList, conn)
	}

	payloadStruct := RemotePublishPayload{
		Workflow:    workflow,
		Connections: connList,
	}

	payload, err := json.Marshal(payloadStruct)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal workflow payload: %w", err)
	}

	targetURL := DB.AppConfig.Prod_Server_URL + "/api/publish/workflow"
	httpReq, err := http.NewRequest(http.MethodPost, targetURL, strings.NewReader(string(payload)))
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", DB.AppConfig.Prod_API_Token)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to reach production server: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		errMsg := strings.TrimSpace(string(bodyBytes))
		if errMsg != "" {
			return &wf.PublishWorkflowResponse{
				Success: false,
				Message: fmt.Sprintf("Production server returned status %d: %s", resp.StatusCode, errMsg),
			}, nil
		}
		return &wf.PublishWorkflowResponse{
			Success: false,
			Message: fmt.Sprintf("Production server returned status %d", resp.StatusCode),
		}, nil
	}
	return &wf.PublishWorkflowResponse{
		Success: true,
		Message: fmt.Sprintf("Workflow %s published to remote production server successfully", req.WorkflowId),
	}, nil
}

// PublishConnectionToRemoteServer sends a single connection record to a remote production server via HTTP.
func PublishConnectionToRemoteServer(connID string) error {
	if DB.AppConfig.Prod_Server_URL == "" {
		return fmt.Errorf("remote production server URL is not configured")
	}
	conn, err := DBCon.GetConnection(connID)
	if err != nil {
		return fmt.Errorf("connection %s not found: %w", connID, err)
	}

	payload, err := json.Marshal(conn)
	if err != nil {
		return fmt.Errorf("failed to marshal connection: %w", err)
	}

	targetURL := DB.AppConfig.Prod_Server_URL + "/api/publish/connection"
	httpReq, err := http.NewRequest(http.MethodPost, targetURL, strings.NewReader(string(payload)))
	if err != nil {
		return fmt.Errorf("failed to create HTTP request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", DB.AppConfig.Prod_API_Token)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return fmt.Errorf("failed to reach production server: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("production server returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}
	return nil
}

// RAG API Implementation Methods

func ListRagConnectionsImpl(env string) ([]*wf.RagConnectionProto, error) {
	dbConns, err := DBCon.ListRagConnectionsEnv(env)
	if err != nil {
		return nil, err
	}

	var result []*wf.RagConnectionProto
	for _, c := range dbConns {
		docCount, _ := DBCon.GetRagDocumentCountEnv(c.ID, env)
		chunkCount, _ := DBCon.GetRagChunkCountEnv(c.ID, env)
		result = append(result, &wf.RagConnectionProto{
			Id:             c.ID,
			Name:           c.Name,
			OllamaBaseUrl:  c.OllamaBaseURL,
			EmbeddingModel: c.EmbeddingModel,
			ChatModel:      c.ChatModel,
			Description:    c.Description,
			CreatedAt:      c.CreatedAt.Format(time.RFC3339),
			UpdatedAt:      c.UpdatedAt.Format(time.RFC3339),
			DocumentCount:  int32(docCount),
			ChunkCount:     int32(chunkCount),
			IsModified:     c.IsModified,
		})
	}
	return result, nil
}

func CreateRagConnectionImpl(req *wf.RagConnectionProto, env string) (*wf.RagConnectionProto, error) {
	id := req.Id
	if id == "" {
		id = uuid.New().String()
	}
	ollamaURL := req.OllamaBaseUrl
	if ollamaURL == "" {
		ollamaURL = "http://localhost:11434"
	}
	embedModel := req.EmbeddingModel
	if embedModel == "" {
		embedModel = "nomic-embed-text"
	}
	chatModel := req.ChatModel
	if chatModel == "" {
		chatModel = "gemma4"
	}

	now := time.Now()
	conn := DB.RagConnection{
		ID:             id,
		Name:           req.Name,
		OllamaBaseURL:  ollamaURL,
		EmbeddingModel: embedModel,
		ChatModel:      chatModel,
		Description:    req.Description,
		CreatedAt:      now,
		UpdatedAt:      now,
		IsModified:     false,
	}

	if err := DBCon.AddRagConnectionEnv(conn, env); err != nil {
		return nil, err
	}

	return &wf.RagConnectionProto{
		Id:             conn.ID,
		Name:           conn.Name,
		OllamaBaseUrl:  conn.OllamaBaseURL,
		EmbeddingModel: conn.EmbeddingModel,
		ChatModel:      conn.ChatModel,
		Description:    conn.Description,
		CreatedAt:      conn.CreatedAt.Format(time.RFC3339),
		UpdatedAt:      conn.UpdatedAt.Format(time.RFC3339),
		DocumentCount:  0,
		ChunkCount:     0,
		IsModified:     false,
	}, nil
}

func UpdateRagConnectionImpl(req *wf.RagConnectionProto, env string) (*wf.RagConnectionProto, error) {
	conn, err := DBCon.GetRagConnectionEnv(req.Id, env)
	if err != nil {
		return nil, fmt.Errorf("RAG connection not found: %w", err)
	}

	if req.Name != "" {
		conn.Name = req.Name
	}
	if req.OllamaBaseUrl != "" {
		conn.OllamaBaseURL = req.OllamaBaseUrl
	}
	if req.EmbeddingModel != "" {
		conn.EmbeddingModel = req.EmbeddingModel
	}
	if req.ChatModel != "" {
		conn.ChatModel = req.ChatModel
	}
	if req.Description != "" {
		conn.Description = req.Description
	}
	conn.UpdatedAt = time.Now()

	if err := DBCon.SaveRagConnectionEnv(&conn, env); err != nil {
		return nil, err
	}

	docCount, _ := DBCon.GetRagDocumentCountEnv(conn.ID, env)
	chunkCount, _ := DBCon.GetRagChunkCountEnv(conn.ID, env)

	return &wf.RagConnectionProto{
		Id:             conn.ID,
		Name:           conn.Name,
		OllamaBaseUrl:  conn.OllamaBaseURL,
		EmbeddingModel: conn.EmbeddingModel,
		ChatModel:      conn.ChatModel,
		Description:    conn.Description,
		CreatedAt:      conn.CreatedAt.Format(time.RFC3339),
		UpdatedAt:      conn.UpdatedAt.Format(time.RFC3339),
		DocumentCount:  int32(docCount),
		ChunkCount:     int32(chunkCount),
		IsModified:     conn.IsModified,
	}, nil
}

func ListRagDocumentsImpl(ragConnID string, env string) ([]*wf.RagDocumentProto, error) {
	docs, err := DBCon.ListRagDocumentsEnv(ragConnID, env)
	if err != nil {
		return nil, err
	}

	var result []*wf.RagDocumentProto
	for _, d := range docs {
		result = append(result, &wf.RagDocumentProto{
			Id:                  d.ID,
			RagConnectionId:     d.RagConnectionID,
			FileName:            d.FileName,
			FileSize:            d.FileSize,
			FileType:            d.FileType,
			ChunkCount:          int32(d.ChunkCount),
			Status:              d.Status,
			ErrorMessage:        d.ErrorMessage,
			CreatedAt:           d.CreatedAt.Format(time.RFC3339),
			ProcessedChunkCount: int32(d.ProcessedChunkCount),
			TotalChunkCount:     int32(d.TotalChunkCount),
		})
	}
	return result, nil
}

func UploadRagDocumentImpl(ragConnID string, fileName string, fileContent []byte, env string) (*wf.RagDocumentProto, error) {
	ragConn, err := DBCon.GetRagConnectionEnv(ragConnID, env)
	if err != nil {
		return nil, fmt.Errorf("RAG connection not found: %w", err)
	}

	docID := uuid.New().String()
	fileType := "txt"
	if parts := strings.Split(fileName, "."); len(parts) > 1 {
		fileType = strings.ToLower(parts[len(parts)-1])
	}

	doc := DB.RagDocument{
		ID:                  docID,
		RagConnectionID:     ragConnID,
		FileName:            fileName,
		FileSize:            int64(len(fileContent)),
		FileType:            fileType,
		ChunkCount:          0,
		ProcessedChunkCount: 0,
		TotalChunkCount:     0,
		Status:              "PROCESSING",
		ErrorMessage:        "",
		CreatedAt:           time.Now(),
	}

	if err := DBCon.AddRagDocumentEnv(doc, env); err != nil {
		return nil, fmt.Errorf("failed to create document record: %w", err)
	}

	// Synchronously process & index document chunks via Ollama
	go func() {
		if err := rag.ProcessAndIndexDocument(DBCon, env, ragConn, doc, fileContent); err != nil {
			log.Printf("Error processing RAG document %s: %v", fileName, err)
		}
	}()

	return &wf.RagDocumentProto{
		Id:                  doc.ID,
		RagConnectionId:     doc.RagConnectionID,
		FileName:            doc.FileName,
		FileSize:            doc.FileSize,
		FileType:            doc.FileType,
		ChunkCount:          0,
		ProcessedChunkCount: 0,
		TotalChunkCount:     0,
		Status:              "PROCESSING",
		ErrorMessage:        "",
		CreatedAt:           doc.CreatedAt.Format(time.RFC3339),
	}, nil
}

func QueryRagImpl(ragConnID string, query string, topK int32, systemPrompt string, env string) (*wf.QueryRagResponse, error) {
	ragConn, err := DBCon.GetRagConnectionEnv(ragConnID, env)
	if err != nil {
		return nil, fmt.Errorf("RAG connection not found: %w", err)
	}

	if topK <= 0 {
		topK = 3
	}

	answer, sources, err := rag.PerformRAGQuery(DBCon, env, ragConn, query, int(topK), systemPrompt)
	if err != nil {
		return nil, fmt.Errorf("RAG query processing failed: %w", err)
	}

	var protoSources []*wf.RagSourceChunk
	for _, sc := range sources {
		protoSources = append(protoSources, &wf.RagSourceChunk{
			DocumentName: sc.DocumentName,
			Content:      sc.Chunk.Content,
			Score:        sc.Score,
		})
	}

	return &wf.QueryRagResponse{
		Answer:  answer,
		Sources: protoSources,
	}, nil
}


