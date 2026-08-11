package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckGoogleSheetsConnection verifies access credentials against the Google Sheets API.
func CheckGoogleSheetsConnection(creds map[string]string) (bool, string) {
	accessToken := creds["access_token"]
	if accessToken == "" && creds["private_key"] == "" {
		return false, "Missing access token or service account key"
	}

	if accessToken != "" {
		req, err := http.NewRequest("GET", "https://sheets.googleapis.com/$discovery/rest?version=v4", nil)
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

	return true, ""
}

// TransformGoogleSheetsResponse formats Google Sheets API responses.
func TransformGoogleSheetsResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "read_values":
		var res struct {
			Range          string          `json:"range"`
			MajorDimension string          `json:"majorDimension"`
			Values         [][]interface{} `json:"values"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res)
			if err == nil {
				return string(resBytes)
			}
			return res
		}
	case "append_rows", "update_values":
		var res struct {
			SpreadsheetID string `json:"spreadsheetId"`
			UpdatedRange  string `json:"updatedRange"`
			UpdatedRows   int    `json:"updatedRows"`
			UpdatedCells  int    `json:"updatedCells"`
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
