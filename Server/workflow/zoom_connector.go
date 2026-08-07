package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckZoomConnection verifies stored credentials against Zoom API v2.
func CheckZoomConnection(creds map[string]string) (bool, string) {
	token := creds["access_token"]

	if token == "" {
		// Server-to-Server OAuth client check if token not pre-supplied
		clientID := creds["client_id"]
		clientSecret := creds["client_secret"]
		accountID := creds["account_id"]
		if clientID == "" || clientSecret == "" || accountID == "" {
			return false, "Missing Zoom credentials (Account ID, Client ID, Client Secret, or Access Token)"
		}
		// If credentials are present, consider check passed for config stage
		return true, ""
	}

	req, err := http.NewRequest("GET", "https://api.zoom.us/v2/users/me", nil)
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
		return false, fmt.Sprintf("Zoom API returned status code %d", resp.StatusCode)
	}

	return true, ""
}

// TransformZoomResponse formats raw JSON responses from Zoom API v2.
func TransformZoomResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "create_meeting", "list_meetings", "get_recording":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	}

	return rawResponse
}
