package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"text/template"

	m "github.com/raenardcruz/floowsynk/matheval"
)

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

func (n NodeList) getNodeById(id string) (Node, bool) {
	for _, node := range n {
		if node.Id == id {
			return node, true
		}
	}
	return Node{}, false
}

func (wp *WorkflowProcessor) GetNextNodes(nodeId string, sourceHandle string) (NodeList, bool) {
	edges := wp.Workflow.Edges
	targets := make(NodeList, 0)
	for _, edge := range edges {
		if edge.Source == nodeId && (sourceHandle == "" || edge.SourceHandle == sourceHandle) {
			node, ok := wp.Workflow.Nodes.getNodeById(edge.Target)
			if !ok {
				return nil, false
			}
			targets = append(targets, node)
		}
	}
	return targets, len(targets) > 0
}

func (wp *WorkflowProcessor) SetVariable(node Node) error {
	name := node.Data["name"]
	value := node.Data["value"]
	if value != "" {
		processVariables[name.(string)] = value
	}

	return nil
}

func (wp *WorkflowProcessor) Condition(node Node) (string, error) {
	expression := populateTemplate(node.Data["expression"].(string), nil)
	if expression == "" {
		return "False", errors.New("condition not found")
	}
	if res, _ := m.EvaluateBoolean(expression); res {
		return "True", nil
	} else {
		return "False", nil
	}
}

func (wp *WorkflowProcessor) Text(node Node) error {
	text := populateTemplate(node.Data["message"].(string), nil)
	varName := node.Data["variable"].(string)
	if varName != "" {
		processVariables[varName] = text
	}
	return nil
}

func (wp *WorkflowProcessor) Loop(node Node) error {
	iteration := node.Data["iteration"].(int)
	for i := 0; i < iteration; i++ {
		if err := wp.nextProcess(node.Id, ""); err != nil {
			return err
		}
	}
	return nil
}

func (wp *WorkflowProcessor) ForEach(node Node) error {
	listvar := node.Data["listVariable"].(string)
	listitems := processVariables[listvar].([]interface{})
	for _, item := range listitems {
		processVariables[fmt.Sprintf("%s.item", listvar)] = item
		if err := wp.nextProcess(node.Id, ""); err != nil {
			return err
		}
	}
	return nil
}

func (wp *WorkflowProcessor) WhileProcess(node Node) error {
	expression := populateTemplate(node.Data["expression"].(string), nil)
	limit := node.Data["limit"].(int)
	cur := 0
	res, err := m.EvaluateBoolean(expression)
	if err != nil {
		return err
	}
	for res && cur < limit {
		if err := wp.nextProcess(node.Id, ""); err != nil {
			return err
		}
		cur++
	}
	return nil
}

func (wp *WorkflowProcessor) ListVariables(node Node) error {
	listitems, ok := node.Data["list"].([]interface{})
	if !ok {
		return errors.New("list data not found or is not a valid List")
	}
	varName := node.Data["variable"].(string)
	if varName != "" {
		processVariables[varName] = listitems
	}
	return nil
}

func (wp *WorkflowProcessor) ApiProcess(node Node) error {
	url := populateTemplate(node.Data["url"].(string), nil)
	method := node.Data["method"].(string)
	headers := node.Data["headers"].(KeyValueList)
	payloadStr := populateTemplate(node.Data["payload"].(string), nil)
	variable := node.Data["variable"].(string)
	var payload Body
	json.Unmarshal([]byte(payloadStr), &payload)
	response, err := makeRequest(url, method, headers, payload)
	if err != nil {
		return err
	}
	processVariables[variable] = response
	return nil
}

func (wp *WorkflowProcessor) LogProcess(node Node) error {
	message := populateTemplate(node.Data["message"].(string), nil)
	loggingData = append(loggingData, message)
	return nil
}

func (wp *WorkflowProcessor) GuidProcess(node Node) error {
	varName := node.Data["variable"].(string)
	processVariables[varName] = generateGUID()
	return nil
}

func (wp *WorkflowProcessor) MathProcess(node Node) error {
	expression := populateTemplate(node.Data["expression"].(string), nil)
	varName := node.Data["variable"].(string)
	res, err := m.EvaluateNumeric(expression)
	if err != nil {
		return err
	}
	processVariables[varName] = res
	return nil
}

func (wp *WorkflowProcessor) CountProcess(node Node) error {
	varName := node.Data["variable"].(string)
	listVar := node.Data["listVariable"].(string)
	count := 0
	if listVarValue, ok := processVariables[listVar].([]interface{}); ok {
		count = count + len(listVarValue)
	} else {
		return errors.New("list variable not found or is not a valid List")
	}
	processVariables[varName] = count
	return nil
}

func (wp *WorkflowProcessor) MapProcess(node Node) error {
	mappedList := make([]interface{}, 0)
	listVar := node.Data["listVariable"].(string)
	variable := node.Data["variable"].(string)
	templateStr := node.Data["template"].(string)
	listVarValue, ok := processVariables[listVar].([]interface{})
	if !ok {
		return errors.New("list variable not found or is not a valid List")
	}
	for _, item := range listVarValue {
		mappedItemStr := populateTemplate(templateStr, item.(map[string]interface{}))
		var mappedItem interface{}
		if err := json.Unmarshal([]byte(mappedItemStr), &mappedItem); err != nil {
			mappedItem = mappedItemStr
		}
		mappedList = append(mappedList, mappedItem)
	}
	if len(mappedList) > 0 && variable != "" {
		processVariables[variable] = mappedList
	}

	return nil
}

// Helper function
func generateGUID() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "00000000-0000-0000-0000-000000000000"
	}
	return hex.EncodeToString(bytes)
}

func makeRequest(url string, method string, headers KeyValueList, payload Body) (body Body, err error) {
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
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	err = json.NewDecoder(resp.Body).Decode(&body)
	if err != nil {
		return nil, err
	}

	return body, nil
}

func populateTemplate(text string, data map[string]interface{}) string {
	joinedMap := make(map[string]interface{})
	for k, v := range processVariables {
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
