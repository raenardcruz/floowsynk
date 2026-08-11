package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckGmailConnection verifies access token against Gmail API.
func CheckGmailConnection(creds map[string]string) (bool, string) {
	accessToken := creds["access_token"]
	if accessToken == "" {
		return false, "Missing access token"
	}

	req, err := http.NewRequest("GET", "https://gmail.googleapis.com/gmail/v1/users/me/profile", nil)
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

// TransformGmailResponse formats Gmail API responses.
func TransformGmailResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "send_message":
		var res struct {
			ID       string   `json:"id"`
			ThreadID string   `json:"threadId"`
			LabelIDs []string `json:"labelIds"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res)
			if err == nil {
				return string(resBytes)
			}
			return res
		}
	case "list_messages":
		var res struct {
			Messages []struct {
				ID       string `json:"id"`
				ThreadID string `json:"threadId"`
			} `json:"messages"`
			ResultSizeEstimate int `json:"resultSizeEstimate"`
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
