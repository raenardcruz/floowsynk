package rag

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestGenerateGeminiContent(t *testing.T) {
	// Mock Gemini generateContent endpoint
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.Header.Get("x-goog-api-key")
		if apiKey != "test-gemini-key" {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error":{"message":"API key not valid"}}`))
			return
		}

		var req struct {
			Contents []struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"contents"`
		}
		_ = json.NewDecoder(r.Body).Decode(&req)

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"candidates": []map[string]interface{}{
				{
					"content": map[string]interface{}{
						"parts": []map[string]interface{}{
							{"text": "Summary from Gemini based on retrieved context."},
						},
					},
				},
			},
		})
	}))
	defer server.Close()

	t.Run("valid mock call", func(t *testing.T) {
		// Test standard payload serialization & response parsing logic
		type Part struct {
			Text string `json:"text"`
		}
		type Content struct {
			Parts []Part `json:"parts"`
		}
		type RequestBody struct {
			Contents []Content `json:"contents"`
		}

		payload := RequestBody{
			Contents: []Content{
				{Parts: []Part{{Text: "Summarize this context"}}},
			},
		}
		bodyBytes, err := json.Marshal(payload)
		if err != nil {
			t.Fatalf("marshal failed: %v", err)
		}

		req, _ := http.NewRequest(http.MethodPost, server.URL, strings.NewReader(string(bodyBytes)))
		req.Header.Set("x-goog-api-key", "test-gemini-key")
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			t.Fatalf("request failed: %v", err)
		}
		defer resp.Body.Close()

		var res struct {
			Candidates []struct {
				Content struct {
					Parts []struct {
						Text string `json:"text"`
					} `json:"parts"`
				} `json:"content"`
			} `json:"candidates"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
			t.Fatalf("decode failed: %v", err)
		}
		if len(res.Candidates) == 0 || res.Candidates[0].Content.Parts[0].Text != "Summary from Gemini based on retrieved context." {
			t.Errorf("unexpected gemini answer: %v", res)
		}
	})

	t.Run("missing api key", func(t *testing.T) {
		_, err := GenerateGeminiContent("", "gemini-1.5-flash", "system prompt", "user query")
		if err == nil {
			t.Errorf("expected error when API key is missing")
		}
	})
}

func TestSummarizeWithConnectionFallback(t *testing.T) {
	// Mock Ollama chat server for default fallback
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/api/chat" {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"model": "gemma4",
				"message": map[string]interface{}{
					"role":    "assistant",
					"content": "Default Ollama RAG summary",
				},
				"done": true,
			})
			return
		}
		w.WriteHeader(http.StatusNotFound)
	}))
	defer server.Close()

	ans, err := SummarizeWithConnection(nil, "staging", "", server.URL, "gemma4", "sys", "query")
	if err != nil {
		t.Fatalf("unexpected error from default Ollama: %v", err)
	}
	if ans != "Default Ollama RAG summary" {
		t.Errorf("unexpected answer: %s", ans)
	}
}
