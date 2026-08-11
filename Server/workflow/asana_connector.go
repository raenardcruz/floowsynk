package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckAsanaConnection checks Asana access token validity.
func CheckAsanaConnection(creds map[string]string) (bool, string) {
	token := creds["access_token"]
	if token == "" {
		return false, "Missing access token"
	}
	req, err := http.NewRequest("GET", "https://app.asana.com/api/1.0/users/me", nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
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

// TransformAsanaResponse formats raw Asana API responses.
func TransformAsanaResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "create_task", "create_project", "get_task", "update_task":
		var res struct {
			Data struct {
				GID       string `json:"gid"`
				Name      string `json:"name"`
				Notes     string `json:"notes,omitempty"`
				Completed bool   `json:"completed,omitempty"`
			} `json:"data"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res.Data)
			if err == nil {
				return string(resBytes)
			}
			return res.Data
		}
	case "get_project_tasks":
		var res struct {
			Data []struct {
				GID  string `json:"gid"`
				Name string `json:"name"`
			} `json:"data"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res.Data)
			if err == nil {
				return string(resBytes)
			}
			return res.Data
		}
	}

	return rawResponse
}
