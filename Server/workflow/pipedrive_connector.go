package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckPipedriveConnection checks the API token or OAuth access token against Pipedrive /users/me endpoint.
func CheckPipedriveConnection(creds map[string]string) (bool, string) {
	apiToken := creds["api_token"]
	accessToken := creds["access_token"]
	companyDomain := creds["company_domain"]

	if apiToken == "" && accessToken == "" {
		return false, "Missing Pipedrive API token or access token"
	}
	if companyDomain == "" {
		companyDomain = "api"
	}

	url := fmt.Sprintf("https://%s.pipedrive.com/v1/users/me", companyDomain)
	if apiToken != "" {
		url = fmt.Sprintf("%s?api_token=%s", url, apiToken)
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}

	if apiToken == "" && accessToken != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	}
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("Pipedrive API returned status code %d", resp.StatusCode)
	}

	return true, ""
}

// TransformPipedriveResponse formats raw responses from Pipedrive API.
func TransformPipedriveResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "list_deals", "create_deal", "list_persons", "create_organization":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	}

	return rawResponse
}
