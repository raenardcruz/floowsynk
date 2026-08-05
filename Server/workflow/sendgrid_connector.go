package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckSendGridConnection checks SendGrid API key validity.
func CheckSendGridConnection(creds map[string]string) bool {
	apiKey := creds["api_key"]
	if apiKey == "" {
		return false
	}
	req, err := http.NewRequest("GET", "https://api.sendgrid.com/v3/scopes", nil)
	if err != nil {
		return false
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

// TransformSendGridResponse formats raw SendGrid API responses.
func TransformSendGridResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "send_email":
		var result struct {
			Status  string `json:"status"`
			Message string `json:"message"`
		}
		if len(data) == 0 {
			result.Status = "success"
			result.Message = "Email sent successfully"
			resBytes, _ := json.Marshal(result)
			return string(resBytes)
		}
		if err := json.Unmarshal(data, &result); err == nil {
			resBytes, err := json.Marshal(result)
			if err == nil {
				return string(resBytes)
			}
			return result
		}
	}

	return rawResponse
}
