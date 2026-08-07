package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckGitHubConnection verifies the stored access token against the GitHub API.
func CheckGitHubConnection(creds map[string]string) (bool, string) {
	token := creds["access_token"]
	if token == "" {
		return false, "Missing access token"
	}
	req, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Accept", "application/vnd.github+json")
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



// TransformGitHubResponse transforms raw GitHub API response into a simplified structure
func TransformGitHubResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "create_issue":
		var issue struct {
			ID      int64  `json:"id"`
			Number  int    `json:"number"`
			HTMLURL string `json:"html_url"`
			State   string `json:"state"`
			Title   string `json:"title"`
		}
		if err := json.Unmarshal(data, &issue); err == nil {
			issueBytes, err := json.Marshal(issue)
			if err == nil {
				return string(issueBytes)
			}
			return issue
		}

	case "list_repos":
		var repos []struct {
			ID      int64  `json:"id"`
			Name    string `json:"name"`
			HTMLURL string `json:"html_url"`
		}
		if err := json.Unmarshal(data, &repos); err == nil {
			type CleanRepo struct {
				ID   int64  `json:"id"`
				Name string `json:"name"`
				URL  string `json:"url"`
			}
			var clean []CleanRepo
			for _, r := range repos {
				clean = append(clean, CleanRepo{
					ID:   r.ID,
					Name: r.Name,
					URL:  r.HTMLURL,
				})
			}
			cleanBytes, err := json.Marshal(clean)
			if err == nil {
				return string(cleanBytes)
			}
			return clean
		}
	case "get_user_profile":
		var profile struct {
			ID        int64  `json:"id"`
			Login     string `json:"login"`
			Name      string `json:"name"`
			HTMLURL   string `json:"html_url"`
			AvatarURL string `json:"avatar_url"`
		}
		if err := json.Unmarshal(data, &profile); err == nil {
			profileBytes, err := json.Marshal(profile)
			if err == nil {
				return string(profileBytes)
			}
			return profile
		}
	}

	return rawResponse
}
