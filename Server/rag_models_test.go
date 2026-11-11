package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestListRagModelsHandler_MethodNotAllowed(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/api/rag/models", nil)
	rec := httptest.NewRecorder()

	listRagModelsHandler(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected status %d, got %d", http.StatusMethodNotAllowed, rec.Code)
	}
}

func TestListRagModelsHandler_Success(t *testing.T) {
	// Create mock Ollama server
	mockOllama := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/tags" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{
			"models": [
				{
					"name": "gemma4:e2b-mlx",
					"model": "gemma4:e2b-mlx",
					"size": 7476595162,
					"details": { "family": "safetensors", "parameter_size": "7b" },
					"capabilities": ["completion", "vision"]
				},
				{
					"name": "embeddinggemma-2:latest",
					"model": "embeddinggemma-2:latest",
					"size": 1325205612,
					"details": { "family": "safetensors", "parameter_size": "2b" },
					"capabilities": ["embedding"]
				}
			]
		}`))
	}))
	defer mockOllama.Close()

	req := httptest.NewRequest(http.MethodGet, "/api/rag/models?url="+mockOllama.URL, nil)
	rec := httptest.NewRecorder()

	listRagModelsHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d. Body: %s", http.StatusOK, rec.Code, rec.Body.String())
	}

	var resp struct {
		Success bool `json:"success"`
		Models  []struct {
			Name        string `json:"name"`
			IsEmbedding bool   `json:"isEmbedding"`
			IsChat      bool   `json:"isChat"`
		} `json:"models"`
		BaseURL string `json:"baseUrl"`
	}

	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if !resp.Success {
		t.Errorf("expected success: true, got false")
	}

	if len(resp.Models) != 2 {
		t.Fatalf("expected 2 models, got %d", len(resp.Models))
	}

	if resp.Models[0].Name != "gemma4:e2b-mlx" || !resp.Models[0].IsChat || resp.Models[0].IsEmbedding {
		t.Errorf("unexpected model 0: %+v", resp.Models[0])
	}

	if resp.Models[1].Name != "embeddinggemma-2:latest" || !resp.Models[1].IsEmbedding {
		t.Errorf("unexpected model 1: %+v", resp.Models[1])
	}
}

func TestListRagModelsHandler_UnreachableURL(t *testing.T) {
	// Point to an invalid unreachable address
	req := httptest.NewRequest(http.MethodGet, "/api/rag/models?url=http://127.0.0.1:59999", nil)
	rec := httptest.NewRecorder()

	listRagModelsHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200 with success: false on unreachable URL, got %d", rec.Code)
	}

	var resp struct {
		Success bool   `json:"success"`
		Error   string `json:"error"`
		Models  []any  `json:"models"`
	}

	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Success {
		t.Errorf("expected success: false for unreachable URL, got true")
	}
	if len(resp.Models) != 0 {
		t.Errorf("expected 0 models, got %d", len(resp.Models))
	}
}
