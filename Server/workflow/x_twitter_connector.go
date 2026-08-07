package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckXTwitterConnection verifies stored access token / bearer token against X API v2.
func CheckXTwitterConnection(creds map[string]string) (bool, string) {
	token := creds["bearer_token"]
	if token == "" {
		token = creds["access_token"]
	}

	if token == "" {
		return false, "Missing X (Twitter) Bearer or Access Token"
	}

	req, err := http.NewRequest("GET", "https://api.twitter.com/2/users/me", nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("X (Twitter) API returned status code %d", resp.StatusCode)
	}

	return true, ""
}

// TransformXTwitterResponse formats raw JSON responses from X (Twitter) API v2.
func TransformXTwitterResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "post_tweet", "delete_tweet", "get_user_tweets", "search_recent_tweets":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	}

	return rawResponse
}
