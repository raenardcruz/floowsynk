package workflow

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/raenardcruz/floowsynk/Server/rag"
)

// CheckOllamaConnection verifies that the Ollama instance is reachable.
func CheckOllamaConnection(creds map[string]string) (bool, string) {
	baseURL := ""
	if creds != nil {
		if u, ok := creds["base_url"]; ok && strings.TrimSpace(u) != "" {
			baseURL = strings.TrimSpace(u)
		} else if u, ok := creds["baseUrl"]; ok && strings.TrimSpace(u) != "" {
			baseURL = strings.TrimSpace(u)
		}
	}
	if baseURL == "" {
		baseURL = os.Getenv("OLLAMA_BASE_URL")
	}
	baseURL = rag.NormalizeOllamaURL(baseURL)

	client := &http.Client{Timeout: 5 * time.Second}
	reqURL := baseURL + "/api/tags"

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, reqURL, nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}

	if creds != nil && creds["api_key"] != "" {
		req.Header.Set("Authorization", "Bearer "+creds["api_key"])
	}

	resp, err := client.Do(req)
	if err != nil {
		// Fallback check: if running inside docker or loopback localhost, try host.docker.internal
		u, parseErr := url.Parse(baseURL)
		if parseErr == nil && (u.Hostname() == "localhost" || u.Hostname() == "127.0.0.1") {
			port := u.Port()
			if port == "" {
				port = "11434"
			}
			fallbackURL := "http://host.docker.internal:" + port + "/api/tags"
			reqFallback, errFallback := http.NewRequestWithContext(ctx, http.MethodGet, fallbackURL, nil)
			if errFallback == nil {
				if creds != nil && creds["api_key"] != "" {
					reqFallback.Header.Set("Authorization", "Bearer "+creds["api_key"])
				}
				respFallback, errDo := client.Do(reqFallback)
				if errDo == nil {
					defer respFallback.Body.Close()
					if respFallback.StatusCode == http.StatusOK {
						return true, ""
					}
				}
			}
		}
		return false, fmt.Sprintf("Connection request failed to %s: %v", baseURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("HTTP %d: %s", resp.StatusCode, resp.Status)
	}
	return true, ""
}

// TransformOllamaResponse formats Ollama API responses into standardized outputs.
func TransformOllamaResponse(actionID string, rawResponse interface{}) interface{} {
	var data []byte
	switch val := rawResponse.(type) {
	case string:
		data = []byte(val)
	case []byte:
		data = val
	default:
		bytes, err := json.Marshal(val)
		if err != nil {
			return rawResponse
		}
		data = bytes
	}

	switch actionID {
	case "generate_chat":
		var res struct {
			Model   string `json:"model"`
			Message struct {
				Role    string `json:"role"`
				Content string `json:"content"`
			} `json:"message"`
			Done bool `json:"done"`
		}
		if err := json.Unmarshal(data, &res); err == nil && res.Message.Content != "" {
			resBytes, err := json.Marshal(res)
			if err == nil {
				return string(resBytes)
			}
			return res
		}
	case "generate_completion":
		var res struct {
			Model    string `json:"model"`
			Response string `json:"response"`
			Done     bool   `json:"done"`
		}
		if err := json.Unmarshal(data, &res); err == nil && res.Response != "" {
			resBytes, err := json.Marshal(res)
			if err == nil {
				return string(resBytes)
			}
			return res
		}
	case "generate_embedding":
		var res struct {
			Embedding  []float32   `json:"embedding,omitempty"`
			Embeddings [][]float32 `json:"embeddings,omitempty"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res)
			if err == nil {
				return string(resBytes)
			}
			return res
		}
	}

	return rawResponse
}
