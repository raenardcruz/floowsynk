package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckAWS_S3Connection checks credentials by querying object listing or basic S3 check.
func CheckAWS_S3Connection(creds map[string]string) (bool, string) {
	accessKey := creds["access_key_id"]
	secretKey := creds["secret_access_key"]
	bucket := creds["bucket_name"]
	region := creds["region"]

	if accessKey == "" || secretKey == "" || bucket == "" || region == "" {
		return false, "Missing AWS credentials, bucket name, or region"
	}

	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/?list-type=2", bucket, region)
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

// TransformAWS_S3Response formats raw S3 response data.
func TransformAWS_S3Response(actionID string, rawResponse interface{}) interface{} {
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

	return string(data)
}
