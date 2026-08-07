package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckOpenAIConnection verifies the stored API key against the OpenAI API models endpoint.
func CheckOpenAIConnection(creds map[string]string) (bool, string) {
	apiKey := creds["api_key"]
	if apiKey == "" {
		apiKey = creds["access_token"]
	}
	if apiKey == "" {
		return false, "Missing OpenAI API Key"
	}

	req, err := http.NewRequest("GET", "https://api.openai.com/v1/models", nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
	if orgID := creds["organization_id"]; orgID != "" {
		req.Header.Set("OpenAI-Organization", orgID)
	}
	if projectID := creds["project_id"]; projectID != "" {
		req.Header.Set("OpenAI-Project", projectID)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("OpenAI API returned status code %d", resp.StatusCode)
	}

	return true, ""
}

// TransformOpenAIResponse formats/cleans OpenAI API responses.
func TransformOpenAIResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "chat_completions":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	case "create_embeddings":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	case "audio_transcriptions":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	}

	return rawResponse
}
