package mcp

import (
	"encoding/json"
	"testing"
)

func TestMCPServer_InitializeAndListTools(t *testing.T) {
	server := NewServer(nil, nil)

	// 1. Test initialize
	initReq := &Request{
		JSONRPC: "2.0",
		ID:      1,
		Method:  "initialize",
	}
	resp := server.HandleRequest(initReq)
	if resp == nil || resp.Error != nil {
		t.Fatalf("expected successful initialize response, got: %+v", resp)
	}

	resultMap, ok := resp.Result.(map[string]interface{})
	if !ok {
		t.Fatalf("expected result map, got %T", resp.Result)
	}
	if resultMap["protocolVersion"] != "2024-11-05" {
		t.Fatalf("unexpected protocol version: %v", resultMap["protocolVersion"])
	}

	// 2. Test tools/list
	listReq := &Request{
		JSONRPC: "2.0",
		ID:      2,
		Method:  "tools/list",
	}
	listResp := server.HandleRequest(listReq)
	if listResp == nil || listResp.Error != nil {
		t.Fatalf("expected successful tools/list response, got: %+v", listResp)
	}

	toolsMap, ok := listResp.Result.(map[string]interface{})
	if !ok {
		t.Fatalf("expected tools map, got %T", listResp.Result)
	}
	tools, ok := toolsMap["tools"].([]Tool)
	if !ok || len(tools) < 4 {
		t.Fatalf("expected at least 4 tools registered, got: %+v", toolsMap)
	}

	toolNames := make(map[string]bool)
	for _, tool := range tools {
		toolNames[tool.Name] = true
	}

	expectedTools := []string{
		"floowsynk_list_workflows",
		"floowsynk_get_workflow",
		"floowsynk_execute_workflow",
		"floowsynk_list_connectors",
	}
	for _, expected := range expectedTools {
		if !toolNames[expected] {
			t.Errorf("missing expected tool: %s", expected)
		}
	}
}

func TestMCPServer_ListConnectorsTool(t *testing.T) {
	server := NewServer(nil, nil)

	paramsBytes, _ := json.Marshal(ToolCallParams{
		Name:      "floowsynk_list_connectors",
		Arguments: map[string]interface{}{},
	})

	callReq := &Request{
		JSONRPC: "2.0",
		ID:      3,
		Method:  "tools/call",
		Params:  paramsBytes,
	}

	resp := server.HandleRequest(callReq)
	if resp == nil || resp.Error != nil {
		t.Fatalf("expected successful tools/call response, got: %+v", resp)
	}
	result, ok := resp.Result.(ToolCallResult)
	if !ok || result.IsError || len(result.Content) == 0 {
		t.Fatalf("expected valid ToolCallResult, got: %+v", resp.Result)
	}
}

func TestMCPServer_UnknownMethod(t *testing.T) {
	server := NewServer(nil, nil)

	req := &Request{
		JSONRPC: "2.0",
		ID:      4,
		Method:  "unknown/method",
	}
	resp := server.HandleRequest(req)
	if resp == nil || resp.Error == nil {
		t.Fatalf("expected method not found error, got: %+v", resp)
	}
	if resp.Error.Code != -32601 {
		t.Fatalf("expected error code -32601, got: %d", resp.Error.Code)
	}
}
