package mcp

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/IBM/sarama"
	"github.com/google/uuid"
	db "github.com/raenardcruz/floowsynk/Database"
	"github.com/raenardcruz/floowsynk/Server/workflow"
)

// JSON-RPC 2.0 Types
type Request struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      interface{}     `json:"id,omitempty"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params,omitempty"`
}

type Response struct {
	JSONRPC string      `json:"jsonrpc"`
	ID      interface{} `json:"id,omitempty"`
	Result  interface{} `json:"result,omitempty"`
	Error   *RPCError   `json:"error,omitempty"`
}

type RPCError struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type Tool struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	InputSchema interface{} `json:"inputSchema"`
}

type ToolCallParams struct {
	Name      string                 `json:"name"`
	Arguments map[string]interface{} `json:"arguments"`
}

type ContentItem struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type ToolCallResult struct {
	Content []ContentItem `json:"content"`
	IsError bool          `json:"isError,omitempty"`
}

// Server provides Model Context Protocol (MCP) tool integration for FlowSynk.
type Server struct {
	DBCon    *db.DatabaseConnection
	Producer *sarama.SyncProducer
	mu       sync.RWMutex
}

func NewServer(dbCon *db.DatabaseConnection, producer *sarama.SyncProducer) *Server {
	return &Server{
		DBCon:    dbCon,
		Producer: producer,
	}
}

// GetTools returns all tools exposed to AI agents via MCP.
func (s *Server) GetTools() []Tool {
	return []Tool{
		{
			Name:        "floowsynk_list_workflows",
			Description: "List all FloowSynk workflows with their IDs, names, descriptions, and statuses.",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"limit": map[string]interface{}{
						"type":        "integer",
						"description": "Max number of workflows to return (default 50)",
					},
					"offset": map[string]interface{}{
						"type":        "integer",
						"description": "Offset pagination index (default 0)",
					},
					"environment": map[string]interface{}{
						"type":        "string",
						"description": "Environment: 'staging' or 'production' (default 'staging')",
					},
				},
			},
		},
		{
			Name:        "floowsynk_get_workflow",
			Description: "Get details, nodes, configuration and triggers for a specific FloowSynk workflow by ID or name.",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"workflow_id": map[string]interface{}{
						"type":        "string",
						"description": "Unique identifier of the workflow",
					},
					"environment": map[string]interface{}{
						"type":        "string",
						"description": "Environment: 'staging' or 'production' (default 'staging')",
					},
				},
				"required": []string{"workflow_id"},
			},
		},
		{
			Name:        "floowsynk_execute_workflow",
			Description: "Execute a FloowSynk workflow synchronously with optional input variables and return the results.",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"workflow_id": map[string]interface{}{
						"type":        "string",
						"description": "ID of the workflow to run",
					},
					"input": map[string]interface{}{
						"type":        "object",
						"description": "Key-value input payload to pass to the workflow execution",
					},
					"environment": map[string]interface{}{
						"type":        "string",
						"description": "Environment: 'staging' or 'production' (default 'staging')",
					},
				},
				"required": []string{"workflow_id"},
			},
		},
		{
			Name:        "floowsynk_list_connectors",
			Description: "List available 3rd party integration connectors (e.g. GitHub, Slack, Linear, Supabase, Resend, Sentry, Pinecone).",
			InputSchema: map[string]interface{}{
				"type":       "object",
				"properties": map[string]interface{}{},
			},
		},
	}
}

// HandleRequest processes an incoming JSON-RPC request and returns the appropriate response.
func (s *Server) HandleRequest(req *Request) *Response {
	resp := &Response{
		JSONRPC: "2.0",
		ID:      req.ID,
	}

	switch req.Method {
	case "initialize":
		resp.Result = map[string]interface{}{
			"protocolVersion": "2024-11-05",
			"capabilities": map[string]interface{}{
				"tools": map[string]interface{}{},
			},
			"serverInfo": map[string]interface{}{
				"name":    "floowsynk-mcp",
				"version": "1.0.0",
			},
		}
		return resp

	case "notifications/initialized", "initialized":
		return nil // Notification, no response required

	case "ping":
		resp.Result = map[string]interface{}{}
		return resp

	case "tools/list":
		resp.Result = map[string]interface{}{
			"tools": s.GetTools(),
		}
		return resp

	case "tools/call":
		var params ToolCallParams
		if err := json.Unmarshal(req.Params, &params); err != nil {
			resp.Error = &RPCError{Code: -32602, Message: fmt.Sprintf("Invalid params: %v", err)}
			return resp
		}

		res, err := s.callTool(params.Name, params.Arguments)
		if err != nil {
			resp.Result = ToolCallResult{
				Content: []ContentItem{{Type: "text", Text: fmt.Sprintf("Error: %v", err)}},
				IsError: true,
			}
			return resp
		}

		jsonBytes, _ := json.MarshalIndent(res, "", "  ")
		resp.Result = ToolCallResult{
			Content: []ContentItem{{Type: "text", Text: string(jsonBytes)}},
		}
		return resp

	default:
		resp.Error = &RPCError{Code: -32601, Message: fmt.Sprintf("Method not found: %s", req.Method)}
		return resp
	}
}

func (s *Server) callTool(name string, args map[string]interface{}) (interface{}, error) {
	switch name {
	case "floowsynk_list_workflows":
		limit := 50
		offset := 0
		env := "staging"
		if l, ok := args["limit"].(float64); ok && l > 0 {
			limit = int(l)
		}
		if o, ok := args["offset"].(float64); ok && o >= 0 {
			offset = int(o)
		}
		if e, ok := args["environment"].(string); ok && e != "" {
			env = e
		}

		if s.DBCon == nil {
			return nil, fmt.Errorf("database connection not available")
		}

		wfList, err := s.DBCon.GetWorkflowsEnv(limit, offset, env)
		if err != nil {
			return nil, err
		}

		var summary []map[string]interface{}
		for _, w := range wfList.Workflows {
			summary = append(summary, map[string]interface{}{
				"id":          w.Id,
				"name":        w.Name,
				"description": w.Description,
				"nodes_count": len(w.Nodes),
				"edges_count": len(w.Edges),
				"environment": w.Environment,
			})
		}
		return map[string]interface{}{
			"count":     len(summary),
			"workflows": summary,
		}, nil

	case "floowsynk_get_workflow":
		wfID, _ := args["workflow_id"].(string)
		if wfID == "" {
			return nil, fmt.Errorf("workflow_id is required")
		}
		env := "staging"
		if e, ok := args["environment"].(string); ok && e != "" {
			env = e
		}

		if s.DBCon == nil {
			return nil, fmt.Errorf("database connection not available")
		}

		wfObj, err := s.DBCon.GetWorkflowEnv(wfID, env)
		if err != nil {
			return nil, err
		}
		return wfObj, nil

	case "floowsynk_execute_workflow":
		wfID, _ := args["workflow_id"].(string)
		if wfID == "" {
			return nil, fmt.Errorf("workflow_id is required")
		}
		env := "staging"
		if e, ok := args["environment"].(string); ok && e != "" {
			env = e
		}

		if s.DBCon == nil {
			return nil, fmt.Errorf("database connection not available")
		}

		wfObj, err := s.DBCon.GetWorkflowEnv(wfID, env)
		if err != nil {
			return nil, fmt.Errorf("failed to find workflow %s: %v", wfID, err)
		}

		inputPayload, _ := args["input"].(map[string]interface{})
		if inputPayload == nil {
			inputPayload = make(map[string]interface{})
		}

		initVars := make(map[string]interface{})
		for k, v := range inputPayload {
			initVars[k] = v
		}
		initVars["input"] = inputPayload
		initVars["output"] = inputPayload

		responseChan := make(chan string, 10)
		wp := workflow.WorkflowProcessor{
			ID:               uuid.NewString(),
			DBcon:            *s.DBCon,
			Workflow:         wfObj,
			Stream:           nil,
			ProcessVariables: initVars,
			Step:             1,
			Producer:         s.Producer,
			ResponseChan:     responseChan,
		}

		errChan := make(chan error, 1)
		go func() {
			errChan <- wp.StartWorkflow()
		}()

		select {
		case err := <-errChan:
			if err != nil {
				return nil, fmt.Errorf("workflow execution failed: %v", err)
			}
			return map[string]interface{}{
				"status":    "completed",
				"variables": wp.ProcessVariables,
			}, nil
		case resp := <-responseChan:
			return map[string]interface{}{
				"status":   "completed",
				"response": resp,
			}, nil
		case <-time.After(30 * time.Second):
			return nil, fmt.Errorf("workflow execution timed out after 30 seconds")
		}

	case "floowsynk_list_connectors":
		templates := workflow.ListConnectorTemplates()
		return map[string]interface{}{
			"count":      len(templates),
			"connectors": templates,
		}, nil

	default:
		return nil, fmt.Errorf("unknown tool: %s", name)
	}
}

// ServeHTTP provides the HTTP JSON-RPC endpoint for MCP clients.
func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed. Use POST.", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(Response{
			JSONRPC: "2.0",
			Error:   &RPCError{Code: -32700, Message: "Parse error"},
		})
		return
	}

	var req Request
	if err := json.Unmarshal(body, &req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(Response{
			JSONRPC: "2.0",
			Error:   &RPCError{Code: -32700, Message: "Invalid JSON-RPC request"},
		})
		return
	}

	resp := s.HandleRequest(&req)
	if resp != nil {
		_ = json.NewEncoder(w).Encode(resp)
	}
}

// RunStdio starts a JSON-RPC stdio loop for local MCP agent clients (e.g. Cursor, Claude Desktop).
func (s *Server) RunStdio() {
	reader := bufio.NewReader(os.Stdin)
	for {
		line, err := reader.ReadBytes('\n')
		if err != nil {
			if err == io.EOF {
				break
			}
			log.Printf("MCP stdio read error: %v", err)
			continue
		}

		trimmed := strings.TrimSpace(string(line))
		if trimmed == "" {
			continue
		}

		var req Request
		if err := json.Unmarshal([]byte(trimmed), &req); err != nil {
			errResp, _ := json.Marshal(Response{
				JSONRPC: "2.0",
				Error:   &RPCError{Code: -32700, Message: "Parse error"},
			})
			fmt.Printf("%s\n", errResp)
			continue
		}

		resp := s.HandleRequest(&req)
		if resp != nil {
			outBytes, _ := json.Marshal(resp)
			fmt.Printf("%s\n", outBytes)
		}
	}
}
