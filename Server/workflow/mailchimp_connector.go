package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckMailchimpConnection verifies API Key credentials against Mailchimp ping endpoint.
func CheckMailchimpConnection(creds map[string]string) (bool, string) {
	apiKey := creds["api_key"]
	prefix := creds["server_prefix"]

	if apiKey == "" || prefix == "" {
		return false, "Missing API key or server prefix"
	}

	url := fmt.Sprintf("https://%s.api.mailchimp.com/3.0/ping", prefix)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.SetBasicAuth("anystring", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("HTTP %d: %s", resp.StatusCode, resp.Status)
	}
	return true, ""
}

// TransformMailchimpResponse formats Mailchimp API responses.
func TransformMailchimpResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "add_or_update_member":
		var res struct {
			ID           string `json:"id"`
			EmailAddress string `json:"email_address"`
			Status       string `json:"status"`
			ListID       string `json:"list_id"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res)
			if err == nil {
				return string(resBytes)
			}
			return res
		}
	case "create_campaign":
		var res struct {
			ID         string `json:"id"`
			Type       string `json:"type"`
			Status     string `json:"status"`
			ArchiveURL string `json:"archive_url"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res)
			if err == nil {
				return string(resBytes)
			}
			return res
		}
	}

	return rawResponse
}
