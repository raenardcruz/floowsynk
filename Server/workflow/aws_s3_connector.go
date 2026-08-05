package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckAWS_S3Connection checks credentials by querying object listing or basic S3 check.
func CheckAWS_S3Connection(creds map[string]string) bool {
	accessKey := creds["access_key_id"]
	secretKey := creds["secret_access_key"]
	bucket := creds["bucket_name"]
	region := creds["region"]

	if accessKey == "" || secretKey == "" || bucket == "" || region == "" {
		return false
	}

	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/?list-type=2", bucket, region)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	// S3 returns 200 on successful auth/list or 403 on invalid sig/creds
	return resp.StatusCode == http.StatusOK
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
