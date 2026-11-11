package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// CheckSupabaseConnection verifies the stored Supabase project URL and API key.
func CheckSupabaseConnection(creds map[string]string) (bool, string) {
	projectURL := strings.TrimRight(creds["project_url"], "/")
	apiKey := creds["api_key"]
	if projectURL == "" || apiKey == "" {
		return false, "Missing Supabase Project URL or API Key"
	}

	req, err := http.NewRequest("GET", projectURL+"/rest/v1/", nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.Header.Set("apikey", apiKey)
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Supabase connection request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusNoContent {
		return true, ""
	}
	return false, fmt.Sprintf("Supabase returned HTTP %d: %s", resp.StatusCode, resp.Status)
}

// TransformSupabaseResponse parses Supabase JSON responses
func TransformSupabaseResponse(actionID string, rawResponse interface{}) interface{} {
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

	var parsed interface{}
	if err := json.Unmarshal(data, &parsed); err == nil {
		return parsed
	}
	return rawResponse
}
