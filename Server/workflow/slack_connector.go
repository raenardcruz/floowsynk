package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckSlackConnection verifies the stored access token using Slack's auth.test method.
func CheckSlackConnection(creds map[string]string) bool {
	token := creds["access_token"]
	if token == "" {
		return false
	}
	req, err := http.NewRequest("GET", "https://slack.com/api/auth.test", nil)
	if err != nil {
		return false
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return false
	}
	var result struct {
		OK bool `json:"ok"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false
	}
	return result.OK
}



// TransformSlackResponse transforms raw Slack API response into a simplified structure
func TransformSlackResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "post_message":
		var result struct {
			OK      bool   `json:"ok"`
			Channel string `json:"channel"`
			TS      string `json:"ts"`
			Error   string `json:"error,omitempty"`
		}
		if err := json.Unmarshal(data, &result); err == nil {
			resultBytes, err := json.Marshal(result)
			if err == nil {
				return string(resultBytes)
			}
			return result
		}
	}

	return rawResponse
}
