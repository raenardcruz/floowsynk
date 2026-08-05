package workflow

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
)

type OAuthConfig struct {
	AuthorizeURL  string   `json:"authorizeUrl"`
	TokenURL      string   `json:"tokenUrl"`
	DefaultScopes []string `json:"defaultScopes"`
}

type ActionTemplate struct {
	ID              string            `json:"id"`
	Name            string            `json:"name"`
	Description     string            `json:"description"`
	Path            string            `json:"path"`
	Method          string            `json:"method"`
	Headers         map[string]string `json:"headers"`
	QueryParams     []string          `json:"queryParams"`
	PayloadTemplate string            `json:"payloadTemplate"`
}

type AuthField struct {
	Key         string `json:"key"`
	Label       string `json:"label"`
	Type        string `json:"type"` // "text", "password"
	Required    bool   `json:"required"`
	Placeholder string `json:"placeholder"`
}

type ConnectorTemplate struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	Description string           `json:"description"`
	Icon        string           `json:"icon"`
	BaseURL     string           `json:"baseUrl"`
	AuthType    string           `json:"authType"` // "oauth2", "api_key", "basic"
	Fields      []AuthField      `json:"fields"`
	OAuthConfig *OAuthConfig     `json:"oauthConfig,omitempty"`
	Actions     []ActionTemplate `json:"actions"`
}

var templatesMap = make(map[string]ConnectorTemplate)

func LoadConnectorTemplates(dirPath string) error {
	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		err := os.MkdirAll(dirPath, 0755)
		if err != nil {
			return err
		}
	}

	files, err := filepath.Glob(filepath.Join(dirPath, "*.json"))
	if err != nil {
		return err
	}

	newTemplates := make(map[string]ConnectorTemplate)
	for _, file := range files {
		bytes, err := ioutil.ReadFile(file)
		if err != nil {
			continue
		}
		var template ConnectorTemplate
		if err := json.Unmarshal(bytes, &template); err != nil {
			continue
		}
		if template.ID != "" {
			newTemplates[template.ID] = template
		}
	}
	templatesMap = newTemplates
	return nil
}

func GetConnectorTemplate(id string) (ConnectorTemplate, bool) {
	t, ok := templatesMap[id]
	return t, ok
}

func ListConnectorTemplates() []ConnectorTemplate {
	list := make([]ConnectorTemplate, 0, len(templatesMap))
	for _, t := range templatesMap {
		list = append(list, t)
	}
	return list
}
