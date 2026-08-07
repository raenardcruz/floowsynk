package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckRedditConnection verifies the credentials against Reddit API.
func CheckRedditConnection(creds map[string]string) (bool, string) {
	clientID := creds["client_id"]
	clientSecret := creds["client_secret"]
	token := creds["access_token"]
	userAgent := creds["user_agent"]

	if userAgent == "" {
		userAgent = "floowsynk:v1.0 (by /u/floowsynk)"
	}

	if token == "" && (clientID == "" || clientSecret == "") {
		return false, "Missing Reddit OAuth access token or client credentials"
	}

	req, err := http.NewRequest("GET", "https://oauth.reddit.com/api/v1/me", nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}

	if token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	}
	req.Header.Set("User-Agent", userAgent)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("Reddit API returned status code %d", resp.StatusCode)
	}

	return true, ""
}

// TransformRedditResponse transforms raw Reddit API response.
func TransformRedditResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "submit_post", "get_hot_posts", "get_me", "add_comment":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	}

	return rawResponse
}
