package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckOutlookConnection verifies access token against Microsoft Graph /me endpoint.
func CheckOutlookConnection(creds map[string]string) (bool, string) {
	token := creds["access_token"]
	if token == "" {
		return false, "Missing Microsoft Outlook access token"
	}

	req, err := http.NewRequest("GET", "https://graph.microsoft.com/v1.0/me", nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("Microsoft Graph API returned status code %d", resp.StatusCode)
	}

	return true, ""
}

// TransformOutlookResponse formats responses returned by Microsoft Graph API.
func TransformOutlookResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "send_mail", "get_messages", "create_event", "get_events":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	}

	return rawResponse
}
