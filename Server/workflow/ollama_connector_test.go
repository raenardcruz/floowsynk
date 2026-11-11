package workflow

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestTransformOllamaResponse(t *testing.T) {
	t.Run("generate_chat response", func(t *testing.T) {
		raw := `{"model":"gemma4","message":{"role":"assistant","content":"Hello from Ollama!"},"done":true}`
		res := TransformOllamaResponse("generate_chat", raw)
		strRes, ok := res.(string)
		if !ok {
			t.Fatalf("expected string response, got %T", res)
		}
		var parsed map[string]interface{}
		if err := json.Unmarshal([]byte(strRes), &parsed); err != nil {
			t.Fatalf("failed to parse transformed response: %v", err)
		}
		msg, ok := parsed["message"].(map[string]interface{})
		if !ok || msg["content"] != "Hello from Ollama!" {
			t.Errorf("unexpected content: %v", msg)
		}
	})

	t.Run("generate_completion response", func(t *testing.T) {
		raw := `{"model":"gemma4","response":"Completed text.","done":true}`
		res := TransformOllamaResponse("generate_completion", raw)
		strRes, ok := res.(string)
		if !ok {
			t.Fatalf("expected string response, got %T", res)
		}
		var parsed map[string]interface{}
		if err := json.Unmarshal([]byte(strRes), &parsed); err != nil {
			t.Fatalf("failed to parse transformed response: %v", err)
		}
		if parsed["response"] != "Completed text." {
			t.Errorf("unexpected completion: %v", parsed["response"])
		}
	})

	t.Run("generate_embedding response", func(t *testing.T) {
		raw := `{"embedding":[0.1, 0.2, 0.3]}`
		res := TransformOllamaResponse("generate_embedding", raw)
		strRes, ok := res.(string)
		if !ok {
			t.Fatalf("expected string response, got %T", res)
		}
		var parsed map[string]interface{}
		if err := json.Unmarshal([]byte(strRes), &parsed); err != nil {
			t.Fatalf("failed to parse transformed response: %v", err)
		}
		vec, ok := parsed["embedding"].([]interface{})
		if !ok || len(vec) != 3 {
			t.Errorf("unexpected embedding vector: %v", parsed["embedding"])
		}
	})
}

func TestCheckOllamaConnection(t *testing.T) {
	// Mock Ollama tags server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/api/tags" {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"models": []map[string]interface{}{
					{"name": "gemma4:latest", "model": "gemma4"},
				},
			})
			return
		}
		w.WriteHeader(http.StatusNotFound)
	}))
	defer server.Close()

	t.Run("valid mock server", func(t *testing.T) {
		valid, msg := CheckOllamaConnection(map[string]string{
			"base_url": server.URL,
		})
		if !valid {
			t.Errorf("expected connection valid, got false: %s", msg)
		}
	})

	t.Run("invalid host", func(t *testing.T) {
		valid, _ := CheckOllamaConnection(map[string]string{
			"base_url": "http://127.0.0.1:59999",
		})
		if valid {
			t.Errorf("expected connection to fail for non-existent server")
		}
	})
}
