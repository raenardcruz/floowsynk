package rag

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type OllamaClient struct {
	BaseURL    string
	HTTPClient *http.Client
}

func NewOllamaClient(baseURL string) *OllamaClient {
	if baseURL == "" {
		baseURL = "http://localhost:11434"
	}
	baseURL = strings.TrimSuffix(baseURL, "/")
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

	url := c.BaseURL + "/api/embeddings"
	resp, err := c.HTTPClient.Post(url, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		// Fallback to /api/embed endpoint if available
		urlEmbed := c.BaseURL + "/api/embed"
		respFallback, errFallback := c.HTTPClient.Post(urlEmbed, "application/json", bytes.NewBuffer(reqBody))
		if errFallback != nil {
			return nil, fmt.Errorf("failed to call Ollama embedding endpoint (%s): %w", url, err)
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

	url := c.BaseURL + "/api/chat"
	resp, err := c.HTTPClient.Post(url, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		return "", fmt.Errorf("failed to call Ollama chat API (%s): %w", url, err)
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
