package workflow

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckDropboxConnection verifies access token against Dropbox API.
func CheckDropboxConnection(creds map[string]string) (bool, string) {
	accessToken := creds["access_token"]
	if accessToken == "" {
		return false, "Missing access token"
	}

	payload := []byte(`{"path": ""}`)
	req, err := http.NewRequest("POST", "https://api.dropboxapi.com/2/files/list_folder", bytes.NewBuffer(payload))
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	req.Header.Set("Content-Type", "application/json")

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

// TransformDropboxResponse formats Dropbox API responses.
func TransformDropboxResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "list_folder":
		var res struct {
			Entries []struct {
				Tag       string `json:".tag"`
				Name      string `json:"name"`
				ID        string `json:"id"`
				PathLower string `json:"path_lower"`
				Size      int64  `json:"size,omitempty"`
			} `json:"entries"`
			HasMore bool `json:"has_more"`
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
