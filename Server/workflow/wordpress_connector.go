package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// CheckWordPressConnection verifies stored site URL and credentials.
func CheckWordPressConnection(creds map[string]string) (bool, string) {
	siteURL := creds["site_url"]
	username := creds["username"]
	password := creds["application_password"]

	if siteURL == "" {
		return false, "Missing WordPress site URL"
	}

	siteURL = strings.TrimSuffix(siteURL, "/")
	reqURL := fmt.Sprintf("%s/wp-json/wp/v2/users/me", siteURL)

	req, err := http.NewRequest("GET", reqURL, nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}

	if username != "" && password != "" {
		req.SetBasicAuth(username, password)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("WordPress API returned status code %d", resp.StatusCode)
	}

	return true, ""
}

// TransformWordPressResponse formats raw JSON responses from WordPress REST API.
func TransformWordPressResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "list_posts", "get_categories":
		var items []map[string]interface{}
		if err := json.Unmarshal(data, &items); err == nil {
			return items
		}
	case "create_post", "update_post", "upload_media":
		var item map[string]interface{}
		if err := json.Unmarshal(data, &item); err == nil {
			return item
		}
	}

	return rawResponse
}
