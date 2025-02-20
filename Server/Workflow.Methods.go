package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"text/template"

	m "github.com/raenardcruz/floowsynk/matheval"
)

const (
	Info  = "info"
	Error = "error"
	Debug = "debug"
)

func (wp *WorkflowProcessor) SetVariableNodeProcess(node Node) error {
	wp.Log(&node, "Setting variable", Info)
	name := node.Data["name"]
	value := node.Data["value"]
	wp.setVariable(name.(string), value)
	wp.Log(&node, fmt.Sprintf("Variable %s set to %v", name, value), Info)
	return nil
}

func (wp *WorkflowProcessor) ConditionNodeProcess(node Node) (string, error) {
	wp.Log(&node, "Processing condition", Info)
	expression := wp.populateTemplate(node.Data["expression"].(string), nil)
	if expression == "" {
		wp.Log(&node, "Condition not found", Error)
		return "False", errors.New("condition not found")
	}
	if res, _ := m.EvaluateBoolean(expression); res {
		wp.Log(&node, "Condition is True", Info)
		return "True", nil
	} else {
		wp.Log(&node, "Condition is False", Info)
		return "False", nil
	}
}

func (wp *WorkflowProcessor) TextNodeProcess(node Node) error {
	wp.Log(&node, "Processing text", Info)
	text := wp.populateTemplate(node.Data["message"].(string), nil)
	varName := node.Data["variable"].(string)
	wp.setVariable(varName, text)
	wp.Log(&node, fmt.Sprintf("Text %s set to %s", varName, text), Info)
	return nil
}

func (wp *WorkflowProcessor) LoopNodeProcess(node Node) error {
	iteration := node.Data["iteration"].(int)
	for i := 0; i < iteration; i++ {
		wp.Log(&node, fmt.Sprintf("Loop iteration %d", i), Info)
		if err := wp.nextProcess(node.Id, ""); err != nil {
			wp.Log(&node, fmt.Sprintf("Error processing loop iteration %d:%v", i, err), Error)
			return err
		}
	}
	return nil
}

func (wp *WorkflowProcessor) ForEachNodeProcess(node Node) error {
	listvar := node.Data["listVariable"].(string)
	listitems := wp.ProcessVariables[listvar].([]interface{})
	for _, item := range listitems {
		wp.Log(&node, fmt.Sprintf("Processing item %v", item), Info)
		wp.ProcessVariables[fmt.Sprintf("%s.item", listvar)] = item
		if err := wp.nextProcess(node.Id, ""); err != nil {
			wp.Log(&node, fmt.Sprintf("Error processing item %v: %v", item, err), Error)
			return err
		}
	}
	return nil
}

func (wp *WorkflowProcessor) WhileNodeProcess(node Node) error {
	expression := wp.populateTemplate(node.Data["expression"].(string), nil)
	limit := node.Data["limit"].(int)
	cur := 0
	res, err := m.EvaluateBoolean(expression)
	if err != nil {
		wp.Log(&node, fmt.Sprintf("Error evaluating while %s: %v", expression, err), Error)
		return err
	}
	for res && cur < limit {
		wp.Log(&node, fmt.Sprintf("While %s is %b", expression, res), Info)
		if err := wp.nextProcess(node.Id, ""); err != nil {
			wp.Log(&node, fmt.Sprintf("Error processing while %s: %v", expression, err), Error)
			return err
		}
		res, err = m.EvaluateBoolean(expression)
		if err != nil {
			wp.Log(&node, fmt.Sprintf("Error evaluating while %s: %v", expression, err), Error)
			return err
		}
		cur++
	}
	return nil
}

func (wp *WorkflowProcessor) ListNodeProcess(node Node) error {
	wp.Log(&node, "Processing list", Info)
	listitems, ok := node.Data["list"].([]interface{})
	if !ok {
		wp.Log(&node, "List data not found or is not a valid List", Error)
		return errors.New("list data not found or is not a valid List")
	}
	varName := node.Data["variable"].(string)
	wp.setVariable(varName, listitems)
	wp.Log(&node, fmt.Sprintf("List %s set to %v", varName, listitems), Info)
	return nil
}

func (wp *WorkflowProcessor) ApiNodeProcess(node Node) error {
	wp.Log(&node, "Processing API", Info)
	url := wp.populateTemplate(node.Data["url"].(string), nil)
	method := node.Data["method"].(string)
	headers := node.Data["headers"].(KeyValueList)
	payloadStr := wp.populateTemplate(node.Data["payload"].(string), nil)
	variable := node.Data["variable"].(string)
	var payload Body
	json.Unmarshal([]byte(payloadStr), &payload)
	response, err := wp.makeRequest(url, method, headers, payload)
	if err != nil {
		wp.Log(&node, fmt.Sprintf("Error processing API %s: %v", url, err), Error)
		return err
	}
	wp.setVariable(variable, response)
	wp.Log(&node, fmt.Sprintf("API %s processed successfully", url), Info)
	return nil
}

func (wp *WorkflowProcessor) LogNodeProcess(node Node) error {
	message := wp.populateTemplate(node.Data["message"].(string), nil)
	wp.Log(&node, message, Debug)
	return nil
}

func (wp *WorkflowProcessor) GuidNodeProcess(node Node) error {
	wp.Log(&node, "Generating GUID", Info)
	varName := node.Data["variable"].(string)
	newGuid := generateGUID()
	wp.setVariable(varName, newGuid)
	wp.Log(&node, fmt.Sprintf("GUID %s generated", newGuid), Info)
	return nil
}

func (wp *WorkflowProcessor) MathNodeProcess(node Node) error {
	wp.Log(&node, "Processing Math", Info)
	expression := wp.populateTemplate(node.Data["expression"].(string), nil)
	varName := node.Data["variable"].(string)
	res, err := m.EvaluateNumeric(expression)
	if err != nil {
		wp.Log(&node, fmt.Sprintf("Error processing Math %s: %v", expression, err), Error)
		return err
	}
	wp.setVariable(varName, res)
	wp.Log(&node, fmt.Sprintf("Math %s processed successfully witha a value of %f", expression, res), Info)
	return nil
}

func (wp *WorkflowProcessor) CountNodeProcess(node Node) error {
	wp.Log(&node, "Processing Count", Info)
	varName := node.Data["variable"].(string)
	listVar := node.Data["listVariable"].(string)
	count := 0
	if listVarValue, ok := wp.ProcessVariables[listVar].([]interface{}); ok {
		count = count + len(listVarValue)
	} else {
		wp.Log(&node, "List variable not found or is not a valid List", Error)
		return errors.New("list variable not found or is not a valid List")
	}
	wp.setVariable(varName, count)
	wp.Log(&node, fmt.Sprintf("Count %s processed successfully with a value of %d", varName, count), Info)
	return nil
}

func (wp *WorkflowProcessor) MapNodeProcess(node Node) error {
	wp.Log(&node, "Processing Map", Info)
	mappedList := make([]interface{}, 0)
	listVar := node.Data["listVariable"].(string)
	variable := node.Data["variable"].(string)
	templateStr := node.Data["template"].(string)
	listVarValue, ok := wp.ProcessVariables[listVar].([]interface{})
	if !ok {
		wp.Log(&node, "List variable not found or is not a valid List", Error)
		return errors.New("list variable not found or is not a valid List")
	}
	for _, item := range listVarValue {
		mappedItemStr := wp.populateTemplate(templateStr, item.(map[string]interface{}))
		var mappedItem interface{}
		if err := json.Unmarshal([]byte(mappedItemStr), &mappedItem); err != nil {
			mappedItem = mappedItemStr
		}
		mappedList = append(mappedList, mappedItem)
	}
	wp.setVariable(variable, mappedList)
	wp.Log(&node, fmt.Sprintf("Map %s processed successfully with a value of %v", variable, mappedList), Info)
	return nil
}

func (wp *WorkflowProcessor) ReplaceNodeProcess(node Node) error {
	wp.Log(&node, "Processing Replace", Info)
	text := wp.populateTemplate(node.Data["text"].(string), nil)
	pattern := wp.populateTemplate(node.Data["pattern"].(string), nil)
	replaceText := wp.populateTemplate(node.Data["replaceText"].(string), nil)
	varName := node.Data["variable"].(string)
	newText := RegexReplaceAll(text, pattern, replaceText)
	wp.setVariable(varName, newText)
	wp.Log(&node, fmt.Sprintf("Replace %s processed successfully with a value of %s", varName, newText), Info)
	return nil
}

func (wp *WorkflowProcessor) FindAllNodeProcess(node Node) error {
	wp.Log(&node, "Processing FindAll", Info)
	text := wp.populateTemplate(node.Data["text"].(string), nil)
	pattern := wp.populateTemplate(node.Data["pattern"].(string), nil)
	varName := node.Data["variable"].(string)
	re := regexp.MustCompile(pattern)
	matches := re.FindAllString(text, -1)
	wp.setVariable(varName, matches)
	wp.Log(&node, fmt.Sprintf("FindAll %s processed successfully with a value of %v", varName, matches), Info)
	return nil
}

func (wp *WorkflowProcessor) SubProcessNodeProcess(node Node) error {
	subProcessId := node.Data["subProcessId"].(string)
	wp.Log(&node, fmt.Sprintf("Processing SubProcess %s", subProcessId), Info)
	w, err := wp.Dbcon.DB.GetWorkflow(subProcessId)
	if err != nil {
		wp.Log(&node, fmt.Sprintf("Error getting SubProcess %s: %v", subProcessId, err), Error)
		return err
	}
	worklfow := Workflow{
		Nodes: convertToNodeList(w.Nodes),
		Edges: convertToEdgeList(w.Edges),
	}
	subProcessor := &WorkflowProcessor{
		Workflow:         &worklfow,
		Dbcon:            wp.Dbcon,
		ProcessVariables: wp.ProcessVariables,
		LoggingData:      wp.LoggingData,
		ProcessResults:   wp.ProcessResults,
	}
	subProcessor.Process("0")
	wp.Log(&node, "SubProcess processed successfully", Info)
	return nil
}

// Helper function
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

func (wp *WorkflowProcessor) setVariable(name string, value interface{}) {
	if name != "" {
		wp.ProcessVariables[name] = value
	}
	wp.ProcessVariables["current"] = value
}

func (wp *WorkflowProcessor) Log(node *Node, message string, level string) {
	wp.LoggingData = append(wp.LoggingData, LogData{
		ProcessID: wp.ProcessID,
		NodeID:    node.Id,
		Message:   message,
		Type:      level,
	})
}

func generateGUID() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "00000000-0000-0000-0000-000000000000"
	}
	return hex.EncodeToString(bytes)
}

func (wp *WorkflowProcessor) makeRequest(url string, method string, headers KeyValueList, payload Body) (body Body, err error) {
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

func convertToNodeList(nodes []interface{}) NodeList {
	var nodeList NodeList
	for _, node := range nodes {
		var n Node
		nodeStr, err := json.Marshal(node)
		if err != nil {
			continue
		}
		json.Unmarshal(nodeStr, &n)
		nodeList = append(nodeList, n)
	}
	return nodeList
}

func convertToEdgeList(edges []interface{}) EdgeList {
	var edgeList EdgeList
	for _, edge := range edges {
		var e Edge
		edgeStr, err := json.Marshal(edge)
		if err != nil {
			continue
		}
		json.Unmarshal(edgeStr, &e)
		edgeList = append(edgeList, e)
	}
	return edgeList
}
