package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckJiraConnection verifies Jira OAuth access token.
func CheckJiraConnection(creds map[string]string) (bool, string) {
	token := creds["access_token"]
	if token == "" {
		return false, "Missing access token"
	}
	req, err := http.NewRequest("GET", "https://api.atlassian.com/oauth/token/accessible-resources", nil)
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

// TransformJiraResponse formats raw Jira API responses.
func TransformJiraResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "create_issue", "get_issue":
		var issue struct {
			ID   string `json:"id"`
			Key  string `json:"key"`
			Self string `json:"self"`
		}
		if err := json.Unmarshal(data, &issue); err == nil {
			issueBytes, err := json.Marshal(issue)
			if err == nil {
				return string(issueBytes)
			}
			return issue
		}
	}

	return rawResponse
}
