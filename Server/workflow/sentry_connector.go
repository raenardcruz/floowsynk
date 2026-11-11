package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckSentryConnection verifies the Sentry authentication token.
func CheckSentryConnection(creds map[string]string) (bool, string) {
	authToken := creds["auth_token"]
	if authToken == "" {
		return false, "Missing Sentry auth token"
	}

	req, err := http.NewRequest("GET", "https://sentry.io/api/0/users/me/", nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.Header.Set("Authorization", "Bearer "+authToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Sentry connection request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		return true, ""
	}
	return false, fmt.Sprintf("Sentry returned HTTP %d: %s", resp.StatusCode, resp.Status)
}

// TransformSentryResponse formats Sentry issue data
func TransformSentryResponse(actionID string, rawResponse interface{}) interface{} {
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

	var parsed interface{}
	if err := json.Unmarshal(data, &parsed); err == nil {
		return parsed
	}
	return rawResponse
}
