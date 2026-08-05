package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckNotionConnection verifies Notion token against users/me API.
func CheckNotionConnection(creds map[string]string) bool {
	token := creds["access_token"]
	if token == "" {
		return false
	}
	req, err := http.NewRequest("GET", "https://api.notion.com/v1/users/me", nil)
	if err != nil {
		return false
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Notion-Version", "2022-06-28")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

// TransformNotionResponse formats raw Notion API responses.
func TransformNotionResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "create_page", "retrieve_page", "update_page":
		var page struct {
			ID     string `json:"id"`
			Object string `json:"object"`
			URL    string `json:"url"`
		}
		if err := json.Unmarshal(data, &page); err == nil {
			pageBytes, err := json.Marshal(page)
			if err == nil {
				return string(pageBytes)
			}
			return page
		}
	}

	return rawResponse
}
