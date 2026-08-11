package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckTelegramConnection verifies stored Bot Access Token against getMe endpoint.
func CheckTelegramConnection(creds map[string]string) (bool, string) {
	token := creds["access_token"]

	if token == "" {
		return false, "Missing Telegram Bot Access Token"
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/getMe", token)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("Telegram API returned status code %d", resp.StatusCode)
	}

	return true, ""
}

// TransformTelegramResponse formats raw JSON responses from Telegram Bot API.
func TransformTelegramResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "send_message", "send_photo", "send_document", "set_webhook":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	}

	return rawResponse
}
