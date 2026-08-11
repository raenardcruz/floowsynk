package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckGoogleCalendarConnection verifies access token against Google Calendar API.
func CheckGoogleCalendarConnection(creds map[string]string) (bool, string) {
	accessToken := creds["access_token"]
	if accessToken == "" {
		return false, "Missing access token"
	}

	req, err := http.NewRequest("GET", "https://www.googleapis.com/calendar/v3/users/me/calendarList", nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", accessToken))

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

// TransformGoogleCalendarResponse formats Google Calendar API responses.
func TransformGoogleCalendarResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "create_event", "update_event":
		var res struct {
			ID       string `json:"id"`
			Status   string `json:"status"`
			HTMLLink string `json:"htmlLink"`
			Summary  string `json:"summary"`
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
