package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckMicrosoftTeamsConnection verifies access token against Microsoft Graph API.
func CheckMicrosoftTeamsConnection(creds map[string]string) (bool, string) {
	accessToken := creds["access_token"]
	if accessToken == "" {
		return false, "Missing access token"
	}

	req, err := http.NewRequest("GET", "https://graph.microsoft.com/v1.0/me", nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("HTTP %d: %s", resp.StatusCode, resp.Status)
	}
	return true, ""
}

// TransformMicrosoftTeamsResponse formats Microsoft Teams / Graph API responses.
func TransformMicrosoftTeamsResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "send_channel_message", "send_chat_message":
		var res struct {
			ID              string `json:"id"`
			CreatedDateTime string `json:"createdDateTime"`
			Body            struct {
				Content string `json:"content"`
			} `json:"body"`
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
