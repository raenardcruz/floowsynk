package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// CheckSalesforceConnection verifies stored credentials against Salesforce userinfo / query endpoint.
func CheckSalesforceConnection(creds map[string]string) (bool, string) {
	token := creds["access_token"]
	instanceURL := creds["instance_url"]

	if token == "" {
		return false, "Missing Salesforce access token"
	}
	if instanceURL == "" {
		return false, "Missing Salesforce instance URL"
	}

	if !strings.HasPrefix(instanceURL, "http://") && !strings.HasPrefix(instanceURL, "https://") {
		instanceURL = "https://" + instanceURL
	}

	url := fmt.Sprintf("%s/services/data/v58.0/limits", instanceURL)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("Salesforce API returned status code %d", resp.StatusCode)
	}

	return true, ""
}

// TransformSalesforceResponse formats raw JSON responses from Salesforce API.
func TransformSalesforceResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "soql_query", "create_lead", "update_account":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	}

	return rawResponse
}
