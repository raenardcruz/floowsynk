package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// CheckZendeskConnection verifies stored credentials against Zendesk API v2.
func CheckZendeskConnection(creds map[string]string) (bool, string) {
	subdomain := creds["subdomain"]
	email := creds["email"]
	token := creds["api_token"]

	if subdomain == "" {
		return false, "Missing Zendesk subdomain"
	}
	if email == "" || token == "" {
		return false, "Missing Zendesk Email or API Token"
	}

	subdomain = strings.TrimSuffix(subdomain, ".zendesk.com")
	reqURL := fmt.Sprintf("https://%s.zendesk.com/api/v2/users/me.json", subdomain)

	req, err := http.NewRequest("GET", reqURL, nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}

	req.SetBasicAuth(email, token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("Zendesk API returned status code %d", resp.StatusCode)
	}

	return true, ""
}

// TransformZendeskResponse formats raw JSON responses from Zendesk API v2.
func TransformZendeskResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "list_tickets", "create_ticket", "update_ticket", "list_users":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	}

	return rawResponse
}
