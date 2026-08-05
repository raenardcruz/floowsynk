package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckTrelloConnection verifies Trello OAuth token / key credentials.
func CheckTrelloConnection(creds map[string]string) bool {
	key := creds["api_key"]
	token := creds["access_token"]
	if key == "" || token == "" {
		return false
	}
	url := fmt.Sprintf("https://api.trello.com/1/members/me?key=%s&token=%s", key, token)
	resp, err := http.Get(url)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

// TransformTrelloResponse formats raw Trello API responses.
func TransformTrelloResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "create_card", "update_card":
		var card struct {
			ID     string `json:"id"`
			Name   string `json:"name"`
			URL    string `json:"url"`
			IDList string `json:"idList"`
		}
		if err := json.Unmarshal(data, &card); err == nil {
			cardBytes, err := json.Marshal(card)
			if err == nil {
				return string(cardBytes)
			}
			return card
		}
	case "get_board_cards":
		var cards []struct {
			ID     string `json:"id"`
			Name   string `json:"name"`
			IDList string `json:"idList"`
		}
		if err := json.Unmarshal(data, &cards); err == nil {
			cardsBytes, err := json.Marshal(cards)
			if err == nil {
				return string(cardsBytes)
			}
			return cards
		}
	case "get_board_lists":
		var lists []struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		}
		if err := json.Unmarshal(data, &lists); err == nil {
			listsBytes, err := json.Marshal(lists)
			if err == nil {
				return string(listsBytes)
			}
			return lists
		}
	}

	return rawResponse
}
