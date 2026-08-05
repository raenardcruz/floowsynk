package workflow

import (
	"encoding/json"
	"net/http"
)

// CheckHubSpotConnection checks HubSpot access token / API key validity.
func CheckHubSpotConnection(creds map[string]string) bool {
	token := creds["access_token"]
	if token == "" {
		token = creds["api_key"]
	}
	if token == "" {
		token = creds["pat"]
	}
	if token == "" {
		return false
	}
	req, err := http.NewRequest("GET", "https://api.hubapi.com/crm/v3/objects/contacts?limit=1", nil)
	if err != nil {
		return false
	}
	req.Header.Set("Authorization", "Bearer "+token)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

// TransformHubSpotResponse formats raw HubSpot API responses.
func TransformHubSpotResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "create_contact", "create_deal":
		var obj struct {
			ID         string                 `json:"id"`
			Properties map[string]interface{} `json:"properties"`
			CreatedAt  string                 `json:"createdAt"`
		}
		if err := json.Unmarshal(data, &obj); err == nil {
			objBytes, err := json.Marshal(obj)
			if err == nil {
				return string(objBytes)
			}
			return obj
		}
	case "list_contacts", "search_contacts", "list_deals":
		var listRes struct {
			Results []struct {
				ID         string                 `json:"id"`
				Properties map[string]interface{} `json:"properties"`
				CreatedAt  string                 `json:"createdAt"`
			} `json:"results"`
		}
		if err := json.Unmarshal(data, &listRes); err == nil {
			listBytes, err := json.Marshal(listRes.Results)
			if err == nil {
				return string(listBytes)
			}
			return listRes.Results
		}
	}

	return rawResponse
}
