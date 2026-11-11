package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckResendConnection verifies the Resend API key by listing domains or api-keys.
func CheckResendConnection(creds map[string]string) (bool, string) {
	apiKey := creds["api_key"]
	if apiKey == "" {
		return false, "Missing Resend API key"
	}

	req, err := http.NewRequest("GET", "https://api.resend.com/api-keys", nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Resend connection request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		return true, ""
	}
	return false, fmt.Sprintf("Resend returned HTTP %d: %s", resp.StatusCode, resp.Status)
}

// TransformResendResponse formats the response from Resend
func TransformResendResponse(actionID string, rawResponse interface{}) interface{} {
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
