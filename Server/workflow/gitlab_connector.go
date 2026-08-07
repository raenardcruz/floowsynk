package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckGitLabConnection verifies stored access token against GitLab user API.
func CheckGitLabConnection(creds map[string]string) (bool, string) {
	token := creds["access_token"]
	if token == "" {
		return false, "Missing access token"
	}
	req, err := http.NewRequest("GET", "https://gitlab.com/api/v4/user", nil)
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

// TransformGitLabResponse formats raw GitLab API responses.
func TransformGitLabResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "create_issue":
		var issue struct {
			ID        int64  `json:"id"`
			IID       int    `json:"iid"`
			ProjectID int64  `json:"project_id"`
			Title     string `json:"title"`
			WebURL    string `json:"web_url"`
		}
		if err := json.Unmarshal(data, &issue); err == nil {
			issueBytes, err := json.Marshal(issue)
			if err == nil {
				return string(issueBytes)
			}
			return issue
		}
	case "create_merge_request":
		var mr struct {
			ID           int64  `json:"id"`
			IID          int    `json:"iid"`
			ProjectID    int64  `json:"project_id"`
			Title        string `json:"title"`
			SourceBranch string `json:"source_branch"`
			TargetBranch string `json:"target_branch"`
			WebURL       string `json:"web_url"`
		}
		if err := json.Unmarshal(data, &mr); err == nil {
			mrBytes, err := json.Marshal(mr)
			if err == nil {
				return string(mrBytes)
			}
			return mr
		}
	case "trigger_pipeline":
		var pipe struct {
			ID     int64  `json:"id"`
			Status string `json:"status"`
			Ref    string `json:"ref"`
			WebURL string `json:"web_url"`
		}
		if err := json.Unmarshal(data, &pipe); err == nil {
			pipeBytes, err := json.Marshal(pipe)
			if err == nil {
				return string(pipeBytes)
			}
			return pipe
		}
	}

	return rawResponse
}
