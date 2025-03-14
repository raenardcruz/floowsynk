package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
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
	name := node.Data[NAME]
	value := node.Data[VALUE]
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:  wp.ProcessVariables[CURRENT],
				OUTPUT: value,
				NAME:   name,
				VALUE:  value,
			},
		})
		wp.Log(&node, fmt.Sprintf("Variable %s set to %v", name, value), Info)
	}()
	wp.setVariable(name.(string), value)
	return nil
}

func (wp *WorkflowProcessor) ConditionNodeProcess(node Node) (retVal string, err error) {
	wp.Log(&node, "Processing condition", Info)
	expression := wp.populateTemplate(node.Data[EXPRESSION].(string), nil)
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:      wp.ProcessVariables[CURRENT],
				OUTPUT:     wp.ProcessVariables[CURRENT],
				EXPRESSION: expression,
			},
		})
		wp.Log(&node, fmt.Sprintf("Condition %s processed: %s", expression, retVal), Info)
	}()
	if expression == "" {
		return FALSE, errors.New("condition not found")
	}
	if res, _ := m.EvaluateBoolean(expression); res {
		return TRUE, nil
	} else {
		return FALSE, nil
	}
}

func (wp *WorkflowProcessor) TextNodeProcess(node Node) error {
	wp.Log(&node, "Processing text", Info)
	text := wp.populateTemplate(node.Data[MESSAGE].(string), nil)
	varName := node.Data[VARIABLE].(string)
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:    wp.ProcessVariables[CURRENT],
				OUTPUT:   text,
				MESSAGE:  text,
				VARIABLE: varName,
			},
		})
		wp.Log(&node, fmt.Sprintf("Text %s set to %s", varName, text), Info)
	}()
	wp.setVariable(varName, text)
	return nil
}

func (wp *WorkflowProcessor) LoopNodeProcess(node Node) error {
	iteration := node.Data[ITERATION].(int)
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:     wp.ProcessVariables[CURRENT],
				OUTPUT:    wp.ProcessVariables[CURRENT],
				ITERATION: iteration,
			},
		})
	}()
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
	listvar := node.Data[LISTVARIABLE].(string)
	listitems := wp.ProcessVariables[listvar].([]interface{})
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:        wp.ProcessVariables[CURRENT],
				OUTPUT:       wp.ProcessVariables[CURRENT],
				LISTVARIABLE: listvar,
				"listItems":  listitems,
			},
		})
	}()
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
	expression := wp.populateTemplate(node.Data[EXPRESSION].(string), nil)
	limit := int(node.Data[LIMIT].(float64))
	cur := 0
	res, err := m.EvaluateBoolean(expression)
	if err != nil {
		wp.Log(&node, fmt.Sprintf("Error evaluating while %s: %v", expression, err), Error)
		return err
	}
	for res && cur < limit {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:       wp.ProcessVariables[CURRENT],
				OUTPUT:      wp.ProcessVariables[CURRENT],
				EXPRESSION:  expression,
				LIMIT:       limit,
				"iteration": cur,
			},
		})
		wp.Log(&node, fmt.Sprintf("While %s is %t", expression, res), Info)
		if err := wp.nextProcess(node.Id, ""); err != nil {
			wp.Log(&node, fmt.Sprintf("Error processing while %s: %v", expression, err), Error)
			return err
		}
		res, err = m.EvaluateBoolean(expression)
		if err != nil {
			wp.Log(&node, fmt.Sprintf("Error evaluating while %s: %v", expression, err), Error)
			return err
		}
		expression = wp.populateTemplate(node.Data["expression"].(string), nil)
		cur++
	}
	return nil
}

func (wp *WorkflowProcessor) ListNodeProcess(node Node) error {
	wp.Log(&node, "Processing list", Info)
	listitems, ok := node.Data[LIST].([]interface{})
	if !ok {
		wp.Log(&node, "List data not found or is not a valid List", Error)
		return errors.New("list data not found or is not a valid List")
	}
	varName := node.Data[VARIABLE].(string)
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:    wp.ProcessVariables[CURRENT],
				OUTPUT:   listitems,
				LIST:     listitems,
				VARIABLE: varName,
			},
		})
		wp.Log(&node, fmt.Sprintf("List %s set to %v", varName, listitems), Info)
	}()
	wp.setVariable(varName, listitems)
	return nil
}

func (wp *WorkflowProcessor) ApiNodeProcess(node Node) error {
	wp.Log(&node, "Processing API", Info)
	url := wp.populateTemplate(node.Data[URL].(string), nil)
	method := node.Data[METHOD].(string)
	headers := node.Data[HEADERS].(KeyValueList)
	payloadStr := wp.populateTemplate(node.Data[PAYLOAD].(string), nil)
	variable := node.Data[VARIABLE].(string)
	var payload Body
	json.Unmarshal([]byte(payloadStr), &payload)
	response, err := wp.makeRequest(url, method, headers, payload)
	if err != nil {
		wp.Log(&node, fmt.Sprintf("Error processing API %s: %v", url, err), Error)
		return err
	}
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:    wp.ProcessVariables[CURRENT],
				OUTPUT:   response,
				URL:      url,
				METHOD:   method,
				HEADERS:  headers,
				PAYLOAD:  payloadStr,
				VARIABLE: variable,
			},
		})
		wp.Log(&node, fmt.Sprintf("API %s processed successfully", url), Info)
	}()
	wp.setVariable(variable, response)
	return nil
}

func (wp *WorkflowProcessor) LogNodeProcess(node Node) error {
	message := wp.populateTemplate(node.Data[MESSAGE].(string), nil)
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:   wp.ProcessVariables[CURRENT],
				OUTPUT:  wp.ProcessVariables[CURRENT],
				MESSAGE: message,
			},
		})
		wp.Log(&node, message, Debug)
	}()
	return nil
}

func (wp *WorkflowProcessor) GuidNodeProcess(node Node) error {
	wp.Log(&node, "Generating GUID", Info)
	varName := node.Data[VARIABLE].(string)
	newGuid := generateGUID()
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:    wp.ProcessVariables[CURRENT],
				OUTPUT:   newGuid,
				VARIABLE: varName,
			},
		})
		wp.Log(&node, fmt.Sprintf("GUID %s generated", newGuid), Info)
	}()
	wp.setVariable(varName, newGuid)
	return nil
}

func (wp *WorkflowProcessor) MathNodeProcess(node Node) error {
	wp.Log(&node, "Processing Math", Info)
	expression := wp.populateTemplate(node.Data[EXPRESSION].(string), nil)
	varName := node.Data[VARIABLE].(string)
	res, err := m.EvaluateNumeric(expression)
	if err != nil {
		wp.Log(&node, fmt.Sprintf("Error processing Math %s: %v", expression, err), Error)
		return err
	}
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:      wp.ProcessVariables[CURRENT],
				OUTPUT:     res,
				EXPRESSION: expression,
				VARIABLE:   varName,
			},
		})
		wp.Log(&node, fmt.Sprintf("Math %s processed successfully witha a value of %f", expression, res), Info)
	}()
	wp.setVariable(varName, res)
	return nil
}

func (wp *WorkflowProcessor) CountNodeProcess(node Node) error {
	wp.Log(&node, "Processing Count", Info)
	varName := node.Data[VARIABLE].(string)
	listVar := node.Data[LISTVARIABLE].(string)
	count := 0
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:        wp.ProcessVariables[CURRENT],
				OUTPUT:       count,
				LISTVARIABLE: listVar,
				VARIABLE:     varName,
			},
		})
		wp.Log(&node, fmt.Sprintf("Count %s processed successfully with a value of %d", varName, count), Info)
	}()
	if listVarValue, ok := wp.ProcessVariables[listVar].([]interface{}); ok {
		count = count + len(listVarValue)
	} else {
		wp.Log(&node, "List variable not found or is not a valid List", Error)
		return errors.New("list variable not found or is not a valid List")
	}
	wp.setVariable(varName, count)
	return nil
}

func (wp *WorkflowProcessor) MapNodeProcess(node Node) error {
	wp.Log(&node, "Processing Map", Info)
	mappedList := make([]interface{}, 0)
	listVar := node.Data[LISTVARIABLE].(string)
	variable := node.Data[VARIABLE].(string)
	templateStr := node.Data[TEMPLATE].(string)
	listVarValue, ok := wp.ProcessVariables[listVar].([]interface{})
	if !ok {
		wp.Log(&node, "List variable not found or is not a valid List", Error)
		return errors.New("list variable not found or is not a valid List")
	}
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:        wp.ProcessVariables[CURRENT],
				OUTPUT:       mappedList,
				LISTVARIABLE: listVar,
				VARIABLE:     variable,
				TEMPLATE:     templateStr,
			},
		})
		wp.Log(&node, fmt.Sprintf("Map %s processed successfully with a value of %v", variable, mappedList), Info)
	}()
	for _, item := range listVarValue {
		mappedItemStr := wp.populateTemplate(templateStr, item.(map[string]interface{}))
		var mappedItem interface{}
		if err := json.Unmarshal([]byte(mappedItemStr), &mappedItem); err != nil {
			mappedItem = mappedItemStr
		}
		mappedList = append(mappedList, mappedItem)
	}
	wp.setVariable(variable, mappedList)
	return nil
}

func (wp *WorkflowProcessor) ReplaceNodeProcess(node Node) error {
	wp.Log(&node, "Processing Replace", Info)
	text := wp.populateTemplate(node.Data[TEXT].(string), nil)
	pattern := wp.populateTemplate(node.Data[PATTERN].(string), nil)
	replaceText := wp.populateTemplate(node.Data[REPLACETEXT].(string), nil)
	varName := node.Data[VARIABLE].(string)
	newText := RegexReplaceAll(text, pattern, replaceText)
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:       wp.ProcessVariables[CURRENT],
				OUTPUT:      newText,
				TEXT:        text,
				PATTERN:     pattern,
				REPLACETEXT: replaceText,
				VARIABLE:    varName,
			},
		})
		wp.Log(&node, fmt.Sprintf("Replace %s processed successfully with a value of %s", varName, newText), Info)
	}()
	wp.setVariable(varName, newText)
	return nil
}

func (wp *WorkflowProcessor) FindAllNodeProcess(node Node) error {
	wp.Log(&node, "Processing FindAll", Info)
	text := wp.populateTemplate(node.Data[TEXT].(string), nil)
	pattern := wp.populateTemplate(node.Data[PATTERN].(string), nil)
	varName := node.Data[VARIABLE].(string)
	re := regexp.MustCompile(pattern)
	matches := re.FindAllString(text, -1)
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:    wp.ProcessVariables[CURRENT],
				OUTPUT:   matches,
				TEXT:     text,
				PATTERN:  pattern,
				VARIABLE: varName,
			},
		})
		wp.Log(&node, fmt.Sprintf("FindAll %s processed successfully with a value of %v", varName, matches), Info)
	}()
	wp.setVariable(varName, matches)
	return nil
}

func (wp *WorkflowProcessor) SubProcessNodeProcess(node Node) error {
	subProcessId := node.Data[SUBPROCESSID].(string)
	defer func() {
		wp.sendRepplayEvent(ReplayData{
			NodeID: node.Id,
			Data: map[string]interface{}{
				INPUT:        wp.ProcessVariables[CURRENT],
				OUTPUT:       wp.ProcessVariables[CURRENT],
				SUBPROCESSID: subProcessId,
			},
		})
		wp.Log(&node, "SubProcess processed successfully", Info)
	}()
	wp.Log(&node, fmt.Sprintf("Processing SubProcess %s", subProcessId), Info)
	_, err := wp.Dbcon.DB.GetWorkflow(subProcessId)
	if err != nil {
		wp.Log(&node, fmt.Sprintf("Error getting SubProcess %s: %v", subProcessId, err), Error)
		return err
	}
	worklfow := Workflow{
		// Nodes: convertToNodeList(w.Nodes),
		// Edges: convertToEdgeList(w.Edges),
	}
	subProcessor := &WorkflowProcessor{
		ProcessID:        wp.ProcessID,
		Workflow:         &worklfow,
		Dbcon:            wp.Dbcon,
		ProcessVariables: wp.ProcessVariables,
		LoggingData:      wp.LoggingData,
		ProcessResults:   wp.ProcessResults,
	}
	subProcessor.Process("0")
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
	logData := LogData{
		ProcessID: wp.ProcessID,
		NodeID:    node.Id,
		Message:   message,
		Type:      level,
	}

	wp.LoggingData = append(wp.LoggingData, logData)
	// logDataStr, err := json.Marshal(logData)
	// if err != nil {
	// 	return
	// }
	//eventStream.SendEvent(wp.ProcessID, "LogEvent", string(logDataStr))
	log.Default().Println(message)
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

func (wp *WorkflowProcessor) NodeInProgress(nodeId string) {
	wp.sendEvent(nodeId, "running")
}

func (wp *WorkflowProcessor) NodeSuccess(nodeId string) {
	wp.sendEvent(nodeId, "success")
}

func (wp *WorkflowProcessor) NodeFailed(nodeId string) {
	wp.sendEvent(nodeId, "error")
}

func (wp *WorkflowProcessor) sendEvent(nodeId string, status string) {
	nodeStatus := make(map[string]string, 0)
	nodeStatus["nodeId"] = nodeId
	nodeStatus["status"] = status
	// nodeStatusStr, err := json.Marshal(nodeStatus)
	// if err != nil {
	// 	return
	// }
	// eventStream.SendEvent(wp.ProcessID, "NodeStatus", string(nodeStatusStr))
}

func (wp *WorkflowProcessor) sendRepplayEvent(replayData ReplayData) {
	// dataStr, err := json.Marshal(replayData)
	// if err != nil {
	// 	return
	// }
	// eventStream.SendEvent(wp.ProcessID, "Replay", string(dataStr))
}
