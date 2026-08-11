package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// CheckActiveCampaignConnection verifies ActiveCampaign API credentials.
func CheckActiveCampaignConnection(creds map[string]string) (bool, string) {
	apiURL := strings.TrimRight(creds["api_url"], "/")
	token := creds["api_token"]

	if apiURL == "" || token == "" {
		return false, "Missing API URL or API token"
	}

	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/3/contacts?limit=1", apiURL), nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.Header.Set("Api-Token", token)
	req.Header.Set("Accept", "application/json")

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

// TransformActiveCampaignResponse formats raw ActiveCampaign responses.
func TransformActiveCampaignResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "create_contact":
		var res struct {
			Contact struct {
				ID        string `json:"id"`
				Email     string `json:"email"`
				FirstName string `json:"firstName"`
				LastName  string `json:"lastName"`
			} `json:"contact"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res.Contact)
			if err == nil {
				return string(resBytes)
			}
			return res.Contact
		}
	case "create_deal":
		var res struct {
			Deal struct {
				ID    string `json:"id"`
				Title string `json:"title"`
				Value string `json:"value"`
				Stage string `json:"stage"`
			} `json:"deal"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res.Deal)
			if err == nil {
				return string(resBytes)
			}
			return res.Deal
		}
	}

	return rawResponse
}
