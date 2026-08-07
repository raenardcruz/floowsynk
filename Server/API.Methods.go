package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	wf "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
	DB "github.com/raenardcruz/floowsynk/Database"
	"github.com/raenardcruz/floowsynk/Server/crypto"
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
	if tokenString == DB.AppConfig.Job_Token {
		return &ValidateResults{
			id:       "",
			username: "job",
			role:     UserRoleService,
			status:   http.StatusOK,
		}
	}
	token, err := jwt.ParseWithClaims(tokenString, jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil {
		return &ValidateResults{status: http.StatusUnauthorized, message: err.Error()}
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return &ValidateResults{
			id:       claims["id"].(string),
			username: claims["username"].(string),
			role:     claims["role"].(string),
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

func GetWorkflow(id string) (workflow *wf.Workflow, err error) {
	workflow, err = DBCon.GetWorkflow(id)
	if err != nil {
		return workflow, err
	}
	return workflow, nil
}

func ListWorkflows(offset int32, limit int32) (wl *wf.WorkflowList, err error) {
	wl, err = DBCon.GetWorkflows(int(limit), int(offset))
	if err != nil {
		return nil, err
	}
	return wl, nil
}
func UpdateWorkflow(workflow *wf.Workflow) (w *wf.Workflow, err error) {
	if err := DBCon.UpdateWorkflow(workflow); err != nil {
		return nil, err
	}
	return workflow, nil
}
func CreateWorkflow(workflow *wf.Workflow) (*wf.Workflow, error) {
	id, err := DBCon.CreateWorkflow(workflow)
	if err != nil {
		return nil, err
	}
	workflow.Id = id
	return workflow, nil
}
func DeleteWorkflow(id string) error {
	return DBCon.DeleteWorkflow(id)
}
func ListWorkflowHistoryImpl() (*wf.WorkflowHistoryList, error) {
	history, err := DBCon.GetWorkflowHistory()
	if err != nil {
		return nil, err
	}

	var hl []*wf.WorkflowHistory
	for _, data := range history {
		w, err := DBCon.GetWorkflow(data.WorkflowID)
		if err != nil {
			continue
		}
		hl = append(hl, &wf.WorkflowHistory{
			Id:           data.ProcessID,
			WorkflowId:   data.WorkflowID,
			WorkflowName: w.Name,
			RunDate:      time.Unix(data.CreatedAt, 0).Format("Jan 02, 2006"),
			Status:       wf.NodeStatus(data.Status),
		})
	}

	return &wf.WorkflowHistoryList{
		History: hl,
	}, nil
}
func GetWorkflowHistoryImpl(Id string) (*wf.WorkflowHistoryResponse, error) {
	replayDataList, err := DBCon.GetReplayDataGroupedByProcessID(Id)
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

// ListWorkflowVersionsImpl returns all version snapshots for a workflow.
// Only meaningful in staging environments.
func ListWorkflowVersionsImpl(workflowID string) (*wf.WorkflowVersionList, error) {
	versions, err := DBCon.ListWorkflowVersions(workflowID)
	if err != nil {
		return nil, err
	}
	return &wf.WorkflowVersionList{Versions: versions}, nil
}

// RestoreWorkflowVersionImpl restores the live staging workflow to a previous version's snapshot.
func RestoreWorkflowVersionImpl(version *wf.WorkflowVersion, userID string) (*wf.Workflow, error) {
	if DB.AppConfig.App_Environment != "staging" {
		return nil, fmt.Errorf("version restore is only available in the staging environment")
	}
	// Fetch the current workflow to preserve metadata
	existing, err := DBCon.GetWorkflow(version.WorkflowId)
	if err != nil {
		return nil, fmt.Errorf("workflow %s not found: %w", version.WorkflowId, err)
	}
	// Apply the version's nodes and edges onto the live workflow
	existing.Nodes = version.Nodes
	existing.Edges = version.Edges
	existing.UpdatedBy = userID
	if err := DBCon.UpdateWorkflow(existing); err != nil {
		return nil, fmt.Errorf("failed to restore workflow version: %w", err)
	}
	return existing, nil
}

// PublishWorkflowImpl pushes a workflow version to production.
// If PROD_SERVER_URL is set, it pushes via HTTP to the remote server.
// Otherwise, it upserts the workflow in the same DB with environment="production".
func PublishWorkflowImpl(req *wf.PublishWorkflowRequest) (*wf.PublishWorkflowResponse, error) {
	if DB.AppConfig.App_Environment != "staging" {
		return &wf.PublishWorkflowResponse{
			Success: false,
			Message: "Publishing is only available from the staging environment",
		}, nil
	}

	// Remote server publish mode
	if DB.AppConfig.Prod_Server_URL != "" {
		resp, err := publishToRemoteServer(req)
		if err != nil {
			return &wf.PublishWorkflowResponse{Success: false, Message: err.Error()}, nil
		}
		return resp, nil
	}

	// Same-DB publish mode: upsert with environment="production"
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


