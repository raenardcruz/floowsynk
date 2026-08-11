package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckConvertKitConnection verifies API Key / Secret with ConvertKit API.
func CheckConvertKitConnection(creds map[string]string) (bool, string) {
	apiKey := creds["api_key"]
	apiSecret := creds["api_secret"]
	if apiKey == "" && apiSecret == "" {
		return false, "Missing API key or API secret"
	}

	url := "https://api.convertkit.com/v3/forms?api_key=" + apiKey
	if apiSecret != "" {
		url = "https://api.convertkit.com/v3/subscribers?api_secret=" + apiSecret
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}

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

// TransformConvertKitResponse formats ConvertKit API responses.
func TransformConvertKitResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "list_forms":
		var res struct {
			Forms []struct {
				ID        int    `json:"id"`
				Name      string `json:"name"`
				CreatedAt string `json:"created_at"`
			} `json:"forms"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res)
			if err == nil {
				return string(resBytes)
			}
			return res
		}
	case "subscribe_to_form", "add_tag_to_subscriber":
		var res struct {
			Subscription struct {
				ID             int `json:"id"`
				State          string `json:"state"`
				SubscribableID int `json:"subscribable_id"`
				Subscriber     struct {
					ID int `json:"id"`
				} `json:"subscriber"`
			} `json:"subscription"`
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
