package workflow

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"regexp"
	"strings"

	"github.com/raenardcruz/floowsynk/proto"
)

func (wp *WorkflowProcessor) UpdateStatus(node *proto.Node, status proto.NodeStatus, nodeData *proto.NodeData, message string, includeReplayData bool) {
	res := &proto.RunWorkflowResponse{
		NodeId: node.Id,
		Status: status,
	}
	if includeReplayData {
		res.Data = &proto.ReplayData{
			NodeId:    node.Id,
			Variables: wp.getVariableMapString(),
			Data:      nodeData,
			Status:    getStatusString(status),
			Message:   message,
		}
	}
	wp.Stream.Send(res)
}

func (wp *WorkflowProcessor) getVariableMapString() map[string]string {
	variableMap := make(map[string]string)
	for k, v := range wp.ProcessVariables {
		variableMap[k] = fmt.Sprintf("%v", v)
	}
	return variableMap
}

func (wp *WorkflowProcessor) updateNodeCurrentValue(node *proto.Node, newValue interface{}) {
	oldValue := wp.ProcessVariables[CURRENT]
	wp.ProcessVariables[CURRENT] = newValue
	// Store Input
	if strValue, ok := oldValue.(string); ok {
		node.Input = &strValue
	} else {
		strValue := fmt.Sprintf("%v", newValue)
		node.Input = &strValue
	}
	// Store Output
	if strValue, ok := newValue.(string); ok {
		node.Output = &strValue
	} else {
		strValue := fmt.Sprintf("%v", newValue)
		node.Output = &strValue
	}
}

func (wp *WorkflowProcessor) setVariable(varName string, value interface{}) error {
	if varName == "" {
		return fmt.Errorf("variable name is empty")
	}
	wp.ProcessVariables[varName] = value
	return nil
}

func (wp *WorkflowProcessor) nextProcess(nodeId string, sourceHandle string) error {
	targets, ok := wp.GetNextNodes(nodeId, sourceHandle)
	if !ok {
		return nil
	}
	for _, target := range targets {
		if err := wp.Process(target.Id); err != nil {
			return err
		}
	}
	return nil
}

func getStatusString(status proto.NodeStatus) string {
	switch status {
	case proto.NodeStatus_RUNNING:
		return "Running"
	case proto.NodeStatus_COMPLETED:
		return "Success"
	case proto.NodeStatus_FAILED:
		return "Failed"
	default:
		return "Unknown"
	}
}

func getNodeById(n []*proto.Node, id string) (*proto.Node, bool) {
	for _, node := range n {
		if node.Id == id {
			return node, true
		}
	}
	return nil, false
}

func (wp *WorkflowProcessor) GetNextNodes(nodeId string, sourceHandle string) ([]*proto.Node, bool) {
	edges := wp.Workflow.Edges
	targets := make([]*proto.Node, 0)
	for _, edge := range edges {
		if edge.Source == nodeId && (sourceHandle == "" || edge.Sourcehandle == sourceHandle) {
			node, ok := getNodeById(wp.Workflow.Nodes, edge.Target)
			if !ok {
				return nil, false
			}
			targets = append(targets, node)
		}
	}
	return targets, len(targets) > 0
}

func (wp *WorkflowProcessor) populateTemplate(text string, data map[string]interface{}) string {
	joinedMap := make(map[string]interface{})
	for k, v := range wp.ProcessVariables {
		joinedMap[k] = v
	}
	for k, v := range data {
		joinedMap[k] = v
	}
	tmpl, err := template.New("template").Parse(text)
	if err != nil {
		return text
	}
	var builder strings.Builder
	tmpl.Execute(&builder, joinedMap)
	text = builder.String()
	return text
}

func generateGUID() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "00000000-0000-0000-0000-000000000000"
	}
	return hex.EncodeToString(bytes)
}

func (wp *WorkflowProcessor) makeRequest(url string, method string, headers []*proto.KeyValue, payload interface{}) (body interface{}, err error) {
	client := &http.Client{}
	var req *http.Request

	if payload != nil {
		payloadBytes, err := json.Marshal(payload)
		if err != nil {
			return nil, err
		}
		req, err = http.NewRequest(method, url, strings.NewReader(string(payloadBytes)))
		if err != nil {
			return nil, err
		}
		req.Header.Set("Content-Type", "application/json")
	} else {
		req, err = http.NewRequest(method, url, nil)
		if err != nil {
			return nil, err
		}
	}

	for _, header := range headers {
		req.Header.Add(header.Key, header.Value)
	}

	resp, err := client.Do(req)
	wp.setVariable("api.status", resp.StatusCode)
	wp.setVariable("api.headers", resp.Header)
	wp.setVariable("api.length", resp.ContentLength)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	err = json.NewDecoder(resp.Body).Decode(&body)
	if err != nil {
		return nil, err
	}
	wp.setVariable("api.body", body)

	return body, nil
}

func getAllJSONPaths(jsonObj interface{}) ([]string, error) {
	jsonStr := fmt.Sprintf("%v", jsonObj)
	var data map[string]interface{}
	err := json.Unmarshal([]byte(jsonStr), &data)
	if err != nil {
		return nil, fmt.Errorf("error unmarshaling JSON: %w", err)
	}

	paths := []string{}
	var explore func(interface{}, string)

	explore = func(current interface{}, currentPath string) {
		switch v := current.(type) {
		case map[string]interface{}:
			for key, value := range v {
				newPath := key
				if currentPath != "" {
					newPath = currentPath + "." + key
				}
				paths = append(paths, newPath)

				explore(value, newPath)
			}
		case []interface{}:
			for i, value := range v {
				newPath := fmt.Sprintf("%d", i)
				if currentPath != "" {
					newPath = currentPath + "." + fmt.Sprintf("%d", i)
				}
				paths = append(paths, newPath)
				explore(value, newPath)
			}
		}
	}

	explore(data, "")
	return paths, nil
}

func RegexReplaceAll(text, pattern, replaceText string) string {
	re := regexp.MustCompile(pattern)
	return re.ReplaceAllString(text, replaceText)
}
