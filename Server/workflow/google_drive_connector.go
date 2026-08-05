package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckGoogleDriveConnection checks Google Drive OAuth token validity.
func CheckGoogleDriveConnection(creds map[string]string) bool {
	token := creds["access_token"]
	if token == "" {
		return false
	}
	req, err := http.NewRequest("GET", "https://www.googleapis.com/drive/v3/about?fields=user", nil)
	if err != nil {
		return false
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

// TransformGoogleDriveResponse formats raw Google Drive API responses.
func TransformGoogleDriveResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "upload_file", "create_folder":
		var file struct {
			ID       string `json:"id"`
			Name     string `json:"name"`
			MimeType string `json:"mimeType"`
		}
		if err := json.Unmarshal(data, &file); err == nil {
			fileBytes, err := json.Marshal(file)
			if err == nil {
				return string(fileBytes)
			}
			return file
		}
	case "list_files":
		var listRes struct {
			Files []struct {
				ID       string `json:"id"`
				Name     string `json:"name"`
				MimeType string `json:"mimeType"`
			} `json:"files"`
		}
		if err := json.Unmarshal(data, &listRes); err == nil {
			listBytes, err := json.Marshal(listRes.Files)
			if err == nil {
				return string(listBytes)
			}
			return listRes.Files
		}
	}

	return rawResponse
}
