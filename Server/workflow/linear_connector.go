package workflow

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckLinearConnection verifies the provided Linear API key.
func CheckLinearConnection(creds map[string]string) (bool, string) {
	apiKey := creds["api_key"]
	if apiKey == "" {
		return false, "Missing Linear API key"
	}

	query := `{"query": "query { viewer { id name email } }"}`
	req, err := http.NewRequest("POST", "https://api.linear.app/graphql", bytes.NewBufferString(query))
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Linear connection request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("Linear returned HTTP %d: %s", resp.StatusCode, resp.Status)
	}

	var res struct {
		Data struct {
			Viewer struct {
				ID string `json:"id"`
			} `json:"viewer"`
		} `json:"data"`
		Errors []interface{} `json:"errors"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return false, "Failed to parse Linear response"
	}
	if len(res.Errors) > 0 {
		return false, "Linear authentication error in GraphQL response"
	}
	return true, ""
}

// TransformLinearResponse cleans up raw GraphQL response into intuitive JSON objects.
func TransformLinearResponse(actionID string, rawResponse interface{}) interface{} {
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
		var res struct {
			Data struct {
				IssueCreate struct {
					Success bool `json:"success"`
					Issue   struct {
						ID         string `json:"id"`
						Identifier string `json:"identifier"`
						Title      string `json:"title"`
						URL        string `json:"url"`
						State      struct {
							Name string `json:"name"`
						} `json:"state"`
					} `json:"issue"`
				} `json:"issueCreate"`
			} `json:"data"`
		}
		if err := json.Unmarshal(data, &res); err == nil && res.Data.IssueCreate.Issue.ID != "" {
			return map[string]interface{}{
				"success":    res.Data.IssueCreate.Success,
				"id":         res.Data.IssueCreate.Issue.ID,
				"identifier": res.Data.IssueCreate.Issue.Identifier,
				"title":      res.Data.IssueCreate.Issue.Title,
				"url":        res.Data.IssueCreate.Issue.URL,
				"state":      res.Data.IssueCreate.Issue.State.Name,
			}
		}

	case "list_issues":
		var res struct {
			Data struct {
				Issues struct {
					Nodes []struct {
						ID         string `json:"id"`
						Identifier string `json:"identifier"`
						Title      string `json:"title"`
						Priority   int    `json:"priority"`
						State      struct {
							Name string `json:"name"`
						} `json:"state"`
					} `json:"nodes"`
				} `json:"issues"`
			} `json:"data"`
		}
		if err := json.Unmarshal(data, &res); err == nil && len(res.Data.Issues.Nodes) > 0 {
			var simplified []map[string]interface{}
			for _, n := range res.Data.Issues.Nodes {
				simplified = append(simplified, map[string]interface{}{
					"id":         n.ID,
					"identifier": n.Identifier,
					"title":      n.Title,
					"priority":   n.Priority,
					"state":      n.State.Name,
				})
			}
			return simplified
		}

	case "get_issue":
		var res struct {
			Data struct {
				Issue struct {
					ID          string `json:"id"`
					Identifier  string `json:"identifier"`
					Title       string `json:"title"`
					Description string `json:"description"`
					URL         string `json:"url"`
					State       struct {
						Name string `json:"name"`
					} `json:"state"`
				} `json:"issue"`
			} `json:"data"`
		}
		if err := json.Unmarshal(data, &res); err == nil && res.Data.Issue.ID != "" {
			return map[string]interface{}{
				"id":          res.Data.Issue.ID,
				"identifier":  res.Data.Issue.Identifier,
				"title":       res.Data.Issue.Title,
				"description": res.Data.Issue.Description,
				"url":         res.Data.Issue.URL,
				"state":       res.Data.Issue.State.Name,
			}
		}
	}

	return rawResponse
}
