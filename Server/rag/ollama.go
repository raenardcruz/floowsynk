package rag

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

type OllamaClient struct {
	BaseURL    string
	HTTPClient *http.Client
}

func isRunningInDocker() bool {
	if _, err := os.Stat("/.dockerenv"); err == nil {
		return true
	}
	if os.Getenv("DB_HOST") == "host.docker.internal" || os.Getenv("REDIS_HOST") == "host.docker.internal" {
		return true
	}
	return false
}

func isLoopbackHost(host string) bool {
	h := strings.ToLower(strings.TrimSpace(host))
	if strippedHost, _, err := net.SplitHostPort(h); err == nil {
		h = strippedHost
	}
	h = strings.Trim(h, "[]")
	return h == "localhost" || h == "127.0.0.1" || h == "::1"
}

func replaceHostWithDockerInternal(rawURL string) string {
	u, err := url.Parse(rawURL)
	if err != nil {
		return rawURL
	}
	port := u.Port()
	if port == "" {
		port = "11434"
	}
	u.Host = "host.docker.internal:" + port
	return u.String()
}

// NormalizeOllamaURL cleans up the Ollama endpoint, auto-adding scheme and default port,
// and resolving Docker defaults when applicable.
func NormalizeOllamaURL(baseURL string) string {
	baseURL = strings.TrimSpace(baseURL)
	if baseURL == "" {
		if envURL := strings.TrimSpace(os.Getenv("OLLAMA_BASE_URL")); envURL != "" {
			baseURL = envURL
		} else if isRunningInDocker() {
			baseURL = "http://host.docker.internal:11434"
		} else {
			baseURL = "http://localhost:11434"
		}
	}

	if !strings.HasPrefix(baseURL, "http://") && !strings.HasPrefix(baseURL, "https://") {
		baseURL = "http://" + baseURL
	}

	u, err := url.Parse(baseURL)
	if err == nil {
		if u.Port() == "" && u.Scheme == "http" {
			u.Host = u.Host + ":11434"
			baseURL = u.String()
		}
	}

	return strings.TrimSuffix(baseURL, "/")
}

func NewOllamaClient(baseURL string) *OllamaClient {
	baseURL = NormalizeOllamaURL(baseURL)
	return &OllamaClient{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
}

type EmbeddingRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
}

type EmbeddingResponse struct {
	Embedding  []float32   `json:"embedding,omitempty"`
	Embeddings [][]float32 `json:"embeddings,omitempty"`
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Model    string        `json:"model"`
	Messages []ChatMessage `json:"messages"`
	Stream   bool          `json:"stream"`
}

type ChatResponse struct {
	Message ChatMessage `json:"message"`
	Response string     `json:"response,omitempty"`
}

type OllamaModelDetails struct {
	ParentModel       string   `json:"parent_model,omitempty"`
	Format            string   `json:"format,omitempty"`
	Family            string   `json:"family,omitempty"`
	Families          []string `json:"families,omitempty"`
	ParameterSize     string   `json:"parameter_size,omitempty"`
	QuantizationLevel string   `json:"quantization_level,omitempty"`
}

type OllamaTagModel struct {
	Name         string             `json:"name"`
	Model        string             `json:"model"`
	ModifiedAt   string             `json:"modified_at,omitempty"`
	Size         int64              `json:"size,omitempty"`
	Digest       string             `json:"digest,omitempty"`
	Details      OllamaModelDetails `json:"details,omitempty"`
	Capabilities []string           `json:"capabilities,omitempty"`
}

type OllamaTagsResponse struct {
	Models []OllamaTagModel `json:"models"`
}

type InstalledModelInfo struct {
	Name          string   `json:"name"`
	Model         string   `json:"model"`
	Size          int64    `json:"size"`
	ParameterSize string   `json:"parameterSize,omitempty"`
	Family        string   `json:"family,omitempty"`
	Capabilities  []string `json:"capabilities,omitempty"`
	IsEmbedding   bool     `json:"isEmbedding"`
	IsChat        bool     `json:"isChat"`
}

func (c *OllamaClient) getWithContext(ctx context.Context, path string) (*http.Response, error) {
	reqURL := c.BaseURL + path
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, reqURL, nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		u, parseErr := url.Parse(c.BaseURL)
		if parseErr == nil && isLoopbackHost(u.Host) {
			fallbackBase := replaceHostWithDockerInternal(c.BaseURL)
			fallbackURL := fallbackBase + path
			reqFallback, errReq := http.NewRequestWithContext(ctx, http.MethodGet, fallbackURL, nil)
			if errReq == nil {
				respFallback, errFallback := c.HTTPClient.Do(reqFallback)
				if errFallback == nil {
					log.Printf("[RAG] Ollama connection to %s failed (%v); auto-routed via host.docker.internal: %s", reqURL, err, fallbackURL)
					c.BaseURL = fallbackBase
					return respFallback, nil
				}
			}
		}
		return nil, err
	}
	return resp, nil
}

func (c *OllamaClient) ListInstalledModels() ([]InstalledModelInfo, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	resp, err := c.getWithContext(ctx, "/api/tags")
	if err != nil {
		return nil, fmt.Errorf("failed to query Ollama models (%s/api/tags): %w", c.BaseURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("ollama /api/tags error (status %d): %s", resp.StatusCode, string(body))
	}

	var tagsResp OllamaTagsResponse
	if err := json.NewDecoder(resp.Body).Decode(&tagsResp); err != nil {
		return nil, fmt.Errorf("failed to decode ollama /api/tags response: %w", err)
	}

	result := make([]InstalledModelInfo, 0, len(tagsResp.Models))
	for _, m := range tagsResp.Models {
		isEmbed := false
		isChat := false
		lowerName := strings.ToLower(m.Name)
		lowerFamily := strings.ToLower(m.Details.Family)

		for _, cap := range m.Capabilities {
			cLower := strings.ToLower(cap)
			if cLower == "embedding" {
				isEmbed = true
			}
			if cLower == "completion" || cLower == "chat" {
				isChat = true
			}
		}

		if strings.Contains(lowerName, "embed") || strings.Contains(lowerFamily, "embed") {
			isEmbed = true
		}

		if !isEmbed || isChat {
			isChat = true
		}

		result = append(result, InstalledModelInfo{
			Name:          m.Name,
			Model:         m.Model,
			Size:          m.Size,
			ParameterSize: m.Details.ParameterSize,
			Family:        m.Details.Family,
			Capabilities:  m.Capabilities,
			IsEmbedding:   isEmbed,
			IsChat:        isChat,
		})
	}

	return result, nil
}

func (c *OllamaClient) post(path string, reqBody []byte) (*http.Response, error) {
	reqURL := c.BaseURL + path
	resp, err := c.HTTPClient.Post(reqURL, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		u, parseErr := url.Parse(c.BaseURL)
		if parseErr == nil && isLoopbackHost(u.Host) {
			fallbackBase := replaceHostWithDockerInternal(c.BaseURL)
			fallbackURL := fallbackBase + path
			respFallback, errFallback := c.HTTPClient.Post(fallbackURL, "application/json", bytes.NewBuffer(reqBody))
			if errFallback == nil {
				log.Printf("[RAG] Ollama connection to %s failed (%v); auto-routed via host.docker.internal: %s", reqURL, err, fallbackURL)
				c.BaseURL = fallbackBase
				return respFallback, nil
			}
		}
		return nil, err
	}
	return resp, nil
}

func (c *OllamaClient) GetEmbedding(model string, prompt string) ([]float32, error) {
	if model == "" {
		model = "nomic-embed-text"
	}

	reqBody, err := json.Marshal(EmbeddingRequest{
		Model:  model,
		Prompt: prompt,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to marshal embedding request: %w", err)
	}

	resp, err := c.post("/api/embeddings", reqBody)
	if err != nil {
		// Fallback to /api/embed endpoint if available
		respFallback, errFallback := c.post("/api/embed", reqBody)
		if errFallback != nil {
			return nil, fmt.Errorf("failed to call Ollama embedding endpoint (%s/api/embeddings): %w", c.BaseURL, err)
		}
		resp = respFallback
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Ollama embedding API error (status %d): %s", resp.StatusCode, string(bodyBytes))
	}

	var res EmbeddingResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, fmt.Errorf("failed to decode embedding response: %w", err)
	}

	if len(res.Embedding) > 0 {
		return res.Embedding, nil
	}
	if len(res.Embeddings) > 0 && len(res.Embeddings[0]) > 0 {
		return res.Embeddings[0], nil
	}

	return nil, fmt.Errorf("empty embedding returned from Ollama for model %s", model)
}

func (c *OllamaClient) GenerateChat(model string, systemPrompt string, userPrompt string) (string, error) {
	if model == "" {
		model = "gemma4"
	}

	messages := make([]ChatMessage, 0, 2)
	if systemPrompt != "" {
		messages = append(messages, ChatMessage{
			Role:    "system",
			Content: systemPrompt,
		})
	}
	messages = append(messages, ChatMessage{
		Role:    "user",
		Content: userPrompt,
	})

	reqBody, err := json.Marshal(ChatRequest{
		Model:    model,
		Messages: messages,
		Stream:   false,
	})
	if err != nil {
		return "", fmt.Errorf("failed to marshal chat request: %w", err)
	}

	resp, err := c.post("/api/chat", reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to call Ollama chat API (%s/api/chat): %w", c.BaseURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Ollama chat API error (status %d): %s", resp.StatusCode, string(bodyBytes))
	}

	var res ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", fmt.Errorf("failed to decode chat response: %w", err)
	}

	if res.Message.Content != "" {
		return res.Message.Content, nil
	}
	if res.Response != "" {
		return res.Response, nil
	}

	return "", fmt.Errorf("empty chat response returned from Ollama")
}
