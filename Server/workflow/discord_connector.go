package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckDiscordConnection verifies the stored bot or user access token against Discord API.
func CheckDiscordConnection(creds map[string]string) (bool, string) {
	token := creds["access_token"]
	if token == "" {
		token = creds["bot_token"]
	}
	if token == "" {
		return false, "Missing access token or bot token"
	}

	authHeader := fmt.Sprintf("Bearer %s", token)
	if creds["bot_token"] != "" {
		authHeader = fmt.Sprintf("Bot %s", token)
	}

	req, err := http.NewRequest("GET", "https://discord.com/api/v10/users/@me", nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.Header.Set("Authorization", authHeader)
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

// TransformDiscordResponse formats raw Discord API responses.
func TransformDiscordResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "create_message":
		var msg struct {
			ID        string `json:"id"`
			ChannelID string `json:"channel_id"`
			Content   string `json:"content"`
		}
		if err := json.Unmarshal(data, &msg); err == nil {
			msgBytes, err := json.Marshal(msg)
			if err == nil {
				return string(msgBytes)
			}
			return msg
		}
	case "list_messages":
		var msgs []struct {
			ID        string `json:"id"`
			ChannelID string `json:"channel_id"`
			Content   string `json:"content"`
		}
		if err := json.Unmarshal(data, &msgs); err == nil {
			msgsBytes, err := json.Marshal(msgs)
			if err == nil {
				return string(msgsBytes)
			}
			return msgs
		}
	}

	return rawResponse
}
