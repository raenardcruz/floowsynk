package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckClickUpConnection verifies Personal API Token with ClickUp.
func CheckClickUpConnection(creds map[string]string) (bool, string) {
	token := creds["api_token"]
	if token == "" {
		return false, "Missing API token"
	}

	req, err := http.NewRequest("GET", "https://api.clickup.com/api/v2/user", nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.Header.Set("Authorization", token)

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

// TransformClickUpResponse formats ClickUp API responses.
func TransformClickUpResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "create_task", "update_task":
		var task struct {
			ID          string `json:"id"`
			Name        string `json:"name"`
			TextContent string `json:"text_content,omitempty"`
			Status      struct {
				Status string `json:"status"`
			} `json:"status"`
			URL string `json:"url"`
		}
		if err := json.Unmarshal(data, &task); err == nil {
			taskBytes, err := json.Marshal(task)
			if err == nil {
				return string(taskBytes)
			}
			return task
		}
	case "get_tasks":
		var res struct {
			Tasks []struct {
				ID     string `json:"id"`
				Name   string `json:"name"`
				Status struct {
					Status string `json:"status"`
				} `json:"status"`
				URL string `json:"url"`
			} `json:"tasks"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res.Tasks)
			if err == nil {
				return string(resBytes)
			}
			return res.Tasks
		}
	case "get_teams":
		var res struct {
			Teams []struct {
				ID   string `json:"id"`
				Name string `json:"name"`
			} `json:"teams"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res.Teams)
			if err == nil {
				return string(resBytes)
			}
			return res.Teams
		}
	}

	return rawResponse
}
