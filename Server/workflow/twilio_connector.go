package workflow

import (
	"encoding/json"
	"net/http"
)

// CheckTwilioConnection checks Twilio credentials validity.
func CheckTwilioConnection(creds map[string]string) bool {
	accountSid := creds["account_sid"]
	authToken := creds["auth_token"]
	if accountSid == "" || authToken == "" {
		return false
	}
	url := "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + ".json"
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false
	}
	req.SetBasicAuth(accountSid, authToken)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

// TransformTwilioResponse formats raw Twilio API responses.
func TransformTwilioResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "send_sms", "make_call":
		var twResponse struct {
			SID    string `json:"sid"`
			Status string `json:"status"`
			To     string `json:"to"`
			From   string `json:"from"`
		}
		if err := json.Unmarshal(data, &twResponse); err == nil {
			twBytes, err := json.Marshal(twResponse)
			if err == nil {
				return string(twBytes)
			}
			return twResponse
		}
	case "list_messages":
		var listRes struct {
			Messages []struct {
				SID    string `json:"sid"`
				Status string `json:"status"`
				To     string `json:"to"`
				From   string `json:"from"`
				Body   string `json:"body"`
			} `json:"messages"`
		}
		if err := json.Unmarshal(data, &listRes); err == nil {
			listBytes, err := json.Marshal(listRes.Messages)
			if err == nil {
				return string(listBytes)
			}
			return listRes.Messages
		}
	}

	return rawResponse
}
