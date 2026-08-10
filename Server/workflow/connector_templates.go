package workflow

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
)

type OAuthConfig struct {
	AuthorizeURL  string   `json:"authorizeUrl"`
	TokenURL      string   `json:"tokenUrl"`
	DefaultScopes []string `json:"defaultScopes"`
}

type ActionTemplate struct {
	ID              string                 `json:"id"`
	Name            string                 `json:"name"`
	Description     string                 `json:"description"`
	Path            string                 `json:"path"`
	Method          string                 `json:"method"`
	Headers         map[string]string      `json:"headers"`
	QueryParams     []string               `json:"queryParams"`
	PayloadTemplate string                 `json:"payloadTemplate"`
	Fields          []AuthField            `json:"fields,omitempty"`
	InputSchema     map[string]interface{} `json:"inputSchema,omitempty"`
	OutputSchema    interface{}            `json:"outputSchema,omitempty"`
}

type AuthField struct {
	Key          string `json:"key"`
	Label        string `json:"label"`
	Type         string `json:"type"`
	Required     bool   `json:"required"`
	Placeholder  string `json:"placeholder"`
	DefaultValue string `json:"defaultValue,omitempty"`
}

type ConnectorTemplate struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	Category    string           `json:"category"`
	Description string           `json:"description"`
	Icon        string           `json:"icon"`
	AuthType    string           `json:"authType"`
	BaseURL     string           `json:"baseUrl"`
	Fields      []AuthField      `json:"fields"`
	OAuthConfig *OAuthConfig     `json:"oauthConfig,omitempty"`
	Actions     []ActionTemplate `json:"actions"`
}

var templatesMap = make(map[string]ConnectorTemplate)

func LoadConnectorTemplates(dirPath string) error {
	candidatePaths := []string{
		dirPath,
		filepath.Join("Server", dirPath),
	}

	var files []string
	var resolvedPath string

	for _, p := range candidatePaths {
		matched, err := filepath.Glob(filepath.Join(p, "*.json"))
		if err == nil && len(matched) > 0 {
			files = matched
			resolvedPath = p
			break
		}
	}

	if len(files) == 0 {
		resolvedPath = dirPath
		if _, err := os.Stat(dirPath); os.IsNotExist(err) {
			if err := os.MkdirAll(dirPath, 0755); err != nil {
				return err
			}
		}
		var err error
		files, err = filepath.Glob(filepath.Join(dirPath, "*.json"))
		if err != nil {
			return err
		}
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
	log.Printf("Loaded %d connector templates from '%s'", len(templatesMap), resolvedPath)
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
