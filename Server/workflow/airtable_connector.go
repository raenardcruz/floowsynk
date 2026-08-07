package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckAirtableConnection verifies Personal Access Token against Airtable API.
func CheckAirtableConnection(creds map[string]string) (bool, string) {
	token := creds["access_token"]
	baseID := creds["base_id"]
	if token == "" || baseID == "" {
		return false, "Missing access token or base ID"
	}

	req, err := http.NewRequest("GET", fmt.Sprintf("https://api.airtable.com/v0/meta/bases/%s/tables", baseID), nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

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

// TransformAirtableResponse formats Airtable API responses.
func TransformAirtableResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "create_record", "update_record":
		var res struct {
			ID          string                 `json:"id"`
			CreatedTime string                 `json:"createdTime"`
			Fields      map[string]interface{} `json:"fields"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res)
			if err == nil {
				return string(resBytes)
			}
			return res
		}
	case "list_records":
		var res struct {
			Records []struct {
				ID     string                 `json:"id"`
				Fields map[string]interface{} `json:"fields"`
			} `json:"records"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res.Records)
			if err == nil {
				return string(resBytes)
			}
			return res.Records
		}
	}

	return rawResponse
}
