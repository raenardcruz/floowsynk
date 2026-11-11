package workflow

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// CheckPineconeConnection verifies Pinecone API Key and index host via describe_index_stats
func CheckPineconeConnection(creds map[string]string) (bool, string) {
	apiKey := creds["api_key"]
	indexHost := strings.TrimRight(strings.TrimPrefix(creds["index_host"], "https://"), "/")
	if apiKey == "" || indexHost == "" {
		return false, "Missing Pinecone API Key or Index Host"
	}

	url := "https://" + indexHost + "/describe_index_stats"
	req, err := http.NewRequest("POST", url, bytes.NewBufferString("{}"))
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.Header.Set("Api-Key", apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Pinecone connection request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		return true, ""
	}
	return false, fmt.Sprintf("Pinecone returned HTTP %d: %s", resp.StatusCode, resp.Status)
}

// TransformPineconeResponse formats Pinecone vector responses
func TransformPineconeResponse(actionID string, rawResponse interface{}) interface{} {
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

	var parsed interface{}
	if err := json.Unmarshal(data, &parsed); err == nil {
		return parsed
	}
	return rawResponse
}
