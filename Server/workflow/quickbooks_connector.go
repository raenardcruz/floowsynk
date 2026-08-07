package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// CheckQuickBooksConnection verifies stored OAuth token / realm ID against QuickBooks API user info / company info.
func CheckQuickBooksConnection(creds map[string]string) (bool, string) {
	token := creds["access_token"]
	realmID := creds["realm_id"]
	env := strings.ToLower(creds["environment"])

	if token == "" {
		return false, "Missing QuickBooks access token"
	}
	if realmID == "" {
		return false, "Missing QuickBooks Company ID (Realm ID)"
	}

	host := "quickbooks.api.intuit.com"
	if env == "sandbox" {
		host = "sandbox-quickbooks.api.intuit.com"
	}

	url := fmt.Sprintf("https://%s/v3/company/%s/companyinfo/%s?minorversion=65", host, realmID, realmID)
	req, err := http.NewRequest("GET", url, nil)
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
		return false, fmt.Sprintf("QuickBooks API returned status code %d", resp.StatusCode)
	}

	return true, ""
}

// TransformQuickBooksResponse formats raw JSON responses from Intuit QuickBooks API.
func TransformQuickBooksResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "create_invoice", "get_customer", "execute_query":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	}

	return rawResponse
}
