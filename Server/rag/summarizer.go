package rag

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	DB "github.com/raenardcruz/floowsynk/Database"
	"github.com/raenardcruz/floowsynk/Server/crypto"
)

// GenerateGeminiContent sends a prompt with optional system instruction to Google Gemini API
func GenerateGeminiContent(apiKey string, model string, systemPrompt string, userPrompt string) (string, error) {
	if apiKey == "" {
		return "", fmt.Errorf("Gemini API key is required")
	}
	if model == "" || !strings.Contains(model, "gemini") {
		model = "gemini-1.5-flash"
	}
	model = strings.TrimPrefix(model, "models/")

	apiURL := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent", model)

	type Part struct {
		Text string `json:"text"`
	}
	type Content struct {
		Parts []Part `json:"parts"`
	}
	type RequestBody struct {
		SystemInstruction *Content  `json:"systemInstruction,omitempty"`
		Contents          []Content `json:"contents"`
	}

	reqPayload := RequestBody{
		Contents: []Content{
			{Parts: []Part{{Text: userPrompt}}},
		},
	}
	if systemPrompt != "" {
		reqPayload.SystemInstruction = &Content{
			Parts: []Part{{Text: systemPrompt}},
		}
	}

	bodyBytes, err := json.Marshal(reqPayload)
	if err != nil {
		return "", fmt.Errorf("failed to serialize Gemini request: %w", err)
	}

	client := &http.Client{Timeout: 60 * time.Second}
	req, err := http.NewRequest(http.MethodPost, apiURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", fmt.Errorf("failed to create Gemini request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-goog-api-key", apiKey)

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("Gemini API request failed: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read Gemini response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Gemini API error (status %d): %s", resp.StatusCode, string(respBytes))
	}

	var res struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.Unmarshal(respBytes, &res); err != nil {
		return "", fmt.Errorf("failed to parse Gemini response: %w", err)
	}

	if len(res.Candidates) > 0 && len(res.Candidates[0].Content.Parts) > 0 {
		return res.Candidates[0].Content.Parts[0].Text, nil
	}

	return "", fmt.Errorf("empty response received from Gemini")
}

// GenerateOpenAIChat sends a chat completion prompt to OpenAI
func GenerateOpenAIChat(apiKey string, model string, systemPrompt string, userPrompt string) (string, error) {
	if apiKey == "" {
		return "", fmt.Errorf("OpenAI API key is required")
	}
	if model == "" {
		model = "gpt-4o-mini"
	}

	type Message struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	}
	type RequestBody struct {
		Model    string    `json:"model"`
		Messages []Message `json:"messages"`
	}

	msgs := make([]Message, 0, 2)
	if systemPrompt != "" {
		msgs = append(msgs, Message{Role: "system", Content: systemPrompt})
	}
	msgs = append(msgs, Message{Role: "user", Content: userPrompt})

	bodyBytes, _ := json.Marshal(RequestBody{
		Model:    model,
		Messages: msgs,
	})

	client := &http.Client{Timeout: 60 * time.Second}
	req, err := http.NewRequest(http.MethodPost, "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("OpenAI error (%d): %s", resp.StatusCode, string(respBytes))
	}

	var res struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(respBytes, &res); err != nil || len(res.Choices) == 0 {
		return "", fmt.Errorf("failed to decode OpenAI chat response")
	}
	return res.Choices[0].Message.Content, nil
}

// GenerateAnthropicChat sends a message prompt to Anthropic Claude
func GenerateAnthropicChat(apiKey string, model string, systemPrompt string, userPrompt string) (string, error) {
	if apiKey == "" {
		return "", fmt.Errorf("Anthropic API key is required")
	}
	if model == "" {
		model = "claude-3-5-sonnet-20241022"
	}

	type Message struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	}
	type RequestBody struct {
		Model     string    `json:"model"`
		MaxTokens int       `json:"max_tokens"`
		System    string    `json:"system,omitempty"`
		Messages  []Message `json:"messages"`
	}

	bodyBytes, _ := json.Marshal(RequestBody{
		Model:     model,
		MaxTokens: 2048,
		System:    systemPrompt,
		Messages:  []Message{{Role: "user", Content: userPrompt}},
	})

	client := &http.Client{Timeout: 60 * time.Second}
	req, err := http.NewRequest(http.MethodPost, "https://api.anthropic.com/v1/messages", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Anthropic error (%d): %s", resp.StatusCode, string(respBytes))
	}

	var res struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
	}
	if err := json.Unmarshal(respBytes, &res); err != nil || len(res.Content) == 0 {
		return "", fmt.Errorf("failed to decode Anthropic response")
	}
	return res.Content[0].Text, nil
}

// SummarizeWithConnection routes prompt summarization to a specified LLM connection or defaults to Ollama
func SummarizeWithConnection(
	db *DB.DatabaseConnection,
	env string,
	llmConnID string,
	defaultOllamaBaseURL string,
	defaultChatModel string,
	systemPrompt string,
	userPrompt string,
) (string, error) {
	if llmConnID != "" && db != nil {
		conn, err := db.GetConnectionEnv(llmConnID, env)
		if err == nil {
			var creds map[string]string
			if conn.Credentials != "" {
				if dec, errDec := crypto.Decrypt(conn.Credentials); errDec == nil {
					_ = json.Unmarshal([]byte(dec), &creds)
				}
			}
			if creds == nil {
				creds = make(map[string]string)
			}

			switch strings.ToLower(conn.ConnectorID) {
			case "google_gemini":
				apiKey := creds["api_key"]
				model := defaultChatModel
				if model == "" || !strings.Contains(model, "gemini") {
					model = "gemini-1.5-flash"
				}
				return GenerateGeminiContent(apiKey, model, systemPrompt, userPrompt)

			case "ollama":
				baseURL := creds["base_url"]
				if baseURL == "" {
					baseURL = creds["baseUrl"]
				}
				if baseURL == "" {
					baseURL = defaultOllamaBaseURL
				}
				model := defaultChatModel
				if model == "" {
					model = "gemma4"
				}
				client := NewOllamaClient(baseURL)
				return client.GenerateChat(model, systemPrompt, userPrompt)

			case "openai":
				apiKey := creds["api_key"]
				model := defaultChatModel
				if model == "" || !strings.Contains(model, "gpt") {
					model = "gpt-4o-mini"
				}
				return GenerateOpenAIChat(apiKey, model, systemPrompt, userPrompt)

			case "anthropic":
				apiKey := creds["api_key"]
				model := defaultChatModel
				if model == "" || !strings.Contains(model, "claude") {
					model = "claude-3-5-sonnet-20241022"
				}
				return GenerateAnthropicChat(apiKey, model, systemPrompt, userPrompt)
			}
		}
	}

	// Default fallback: local Ollama
	ollamaClient := NewOllamaClient(defaultOllamaBaseURL)
	return ollamaClient.GenerateChat(defaultChatModel, systemPrompt, userPrompt)
}
