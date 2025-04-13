package workflow

import (
	"encoding/json"
	"errors"
	"fmt"
	"regexp"

	m "github.com/raenardcruz/floowsynk/Server/matheval"
	"github.com/raenardcruz/floowsynk/Server/proto"
)

const (
	Info  = "info"
	Error = "error"
	Debug = "debug"
)

func (wp *WorkflowProcessor) DefaultNodeProcess(node *proto.Node) (string, error) {
	return "", nil
}

func (wp *WorkflowProcessor) SetVariableNodeProcess(node *proto.Node) (string, error) {
	name := node.Data.Name
	value := node.Data.Value
	defer func() {
		replayNode := CopyNode(node)
		replayNode.Data.Name = name
		replayNode.Data.Value = value
		wp.setVariable(*name, *value)
		wp.UpdateStatus(&replayNode, proto.NodeStatus_COMPLETED, *value, fmt.Sprintf("Variable %s set to %v", *name, *value), true)
	}()
	return "", nil
}

func (wp *WorkflowProcessor) ConditionNodeProcess(node *proto.Node) (retVal string, err error) {
	expression := wp.populateTemplate(*node.Data.Expression, nil)
	defer func() {
		replayNode := CopyNode(node)
		replayNode.Data.Expression = &expression
		if err != nil {
			wp.UpdateStatus(&replayNode, proto.NodeStatus_FAILED, nil, fmt.Sprintf("Condition %s failed: %v", expression, err), true)
		} else {
			wp.UpdateStatus(&replayNode, proto.NodeStatus_COMPLETED, nil, fmt.Sprintf("Condition %s processed: %s", expression, retVal), true)
		}
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

func (wp *WorkflowProcessor) TextNodeProcess(node *proto.Node) (string, error) {
	text := wp.populateTemplate(*node.Data.Message, nil)
	varName := node.Data.Variable
	defer func() {
		replayNode := CopyNode(node)
		replayNode.Data.Message = &text
		replayNode.Data.Variable = varName
		wp.setVariable(*varName, text)
		wp.UpdateStatus(&replayNode, proto.NodeStatus_COMPLETED, text, fmt.Sprintf("Text %s set to %s", *varName, text), true)
	}()
	return "", nil
}

func (wp *WorkflowProcessor) LoopNodeProcess(node *proto.Node) (string, error) {
	iteration := *node.Data.Iteration
	for i := 0; i < int(iteration); i++ {
		replayNode := CopyNode(node)
		tmpIteration := int32(i)
		replayNode.Data.Iteration = &tmpIteration
		wp.UpdateStatus(&replayNode, proto.NodeStatus_INFO, nil, fmt.Sprintf("Running Iteration %d of %d", i, iteration), true)
		if err := wp.nextProcess(node.Id, ""); err != nil {
			wp.UpdateStatus(&replayNode, proto.NodeStatus_FAILED, nil, fmt.Sprintf("Error processing loop iteration %d: %v", i, err), true)
			return "", err
		}
	}
	wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, nil, "Loop processed successfully", true)
	return "", nil
}

func (wp *WorkflowProcessor) ForEachNodeProcess(node *proto.Node) (string, error) {
	listvar := node.Data.Listvar
	listitems := wp.ProcessVariables[*listvar]

	items, ok := listitems.([]interface{})
	if !ok {
		wp.UpdateStatus(node, proto.NodeStatus_FAILED, nil, "List variable is not a valid List", true)
		return "", errors.New("list variable is not a valid List")
	}

	for _, item := range items {
		switch v := item.(type) {
		case string, float64, bool, KeyValue:
			replayNode := CopyNode(node)
			replayNode.Data.Listvar = listvar
			wp.UpdateStatus(&replayNode, proto.NodeStatus_INFO, v, fmt.Sprintf("Processing item %v in Foreach Loop", v), true)
			wp.setVariable(OUTPUT, v)
			if err := wp.nextProcess(node.Id, ""); err != nil {
				wp.UpdateStatus(&replayNode, proto.NodeStatus_FAILED, nil, fmt.Sprintf("Error processing item %v: %v", v, err), true)
				return "", err
			}
		default:
			wp.UpdateStatus(node, proto.NodeStatus_FAILED, nil, "Invalid item type in List", true)
			return "", errors.New("invalid item type in List")
		}
	}

	wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, nil, fmt.Sprintf("Foreach Loop completed for variable %s", *listvar), true)
	return "", nil
}

func (wp *WorkflowProcessor) WhileNodeProcess(node *proto.Node) (string, error) {
	expression := wp.populateTemplate(*node.Data.Expression, nil)
	replayNode := CopyNode(node)
	replayNode.Data.Expression = &expression
	limit := int(*node.Data.Limit)
	cur := 0
	res, err := m.EvaluateBoolean(expression)
	if err != nil {
		wp.UpdateStatus(&replayNode, proto.NodeStatus_FAILED, nil, fmt.Sprintf("Error evaluating while condition '%s': %v", expression, err), true)
		return "", err
	}
	for res && cur < limit {
		iteration := int32(cur)
		replayNode.Data.Iteration = &iteration
		wp.UpdateStatus(&replayNode, proto.NodeStatus_INFO, nil, fmt.Sprintf("While Loop iteration %d with condition '%s'", cur, expression), true)
		if err := wp.nextProcess(node.Id, ""); err != nil {
			wp.UpdateStatus(&replayNode, proto.NodeStatus_FAILED, nil, fmt.Sprintf("Error during While Loop iteration %d: %v", cur, err), true)
			return "", err
		}
		expression = wp.populateTemplate(*node.Data.Expression, nil)
		res, err = m.EvaluateBoolean(expression)
		if err != nil {
			wp.UpdateStatus(&replayNode, proto.NodeStatus_FAILED, nil, fmt.Sprintf("Error re-evaluating while condition '%s': %v", expression, err), true)
			return "", err
		}
		cur++
	}
	wp.UpdateStatus(&replayNode, proto.NodeStatus_COMPLETED, nil, "While Loop completed successfully", true)
	return "", nil
}

func (wp *WorkflowProcessor) ListNodeProcess(node *proto.Node) (string, error) {
	nodeDataArray := node.Data.List
	varName := *node.Data.Variable
	listItems := make([]interface{}, 0)
	defer func() {
		wp.setVariable(varName, listItems)
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, listItems, fmt.Sprintf("List %s was populated", varName), true)
	}()
	switch nodeDataArray.Type {
	case proto.ArrayDataType_KEYVALUE:
		for _, item := range nodeDataArray.KeyValueItems {
			listItems = append(listItems, KeyValue{Key: item.Key, Value: item.Value})
		}
	case proto.ArrayDataType_STRING:
		for _, item := range nodeDataArray.StringItems {
			listItems = append(listItems, item)
		}
	case proto.ArrayDataType_INT:
		for _, item := range nodeDataArray.IntItems {
			listItems = append(listItems, item)
		}
	case proto.ArrayDataType_BOOL:
		for _, item := range nodeDataArray.BoolItems {
			listItems = append(listItems, item)
		}
	default:
		listItems = make([]interface{}, 0)
	}
	return "", nil
}

func (wp *WorkflowProcessor) ApiNodeProcess(node *proto.Node) (string, error) {
	url := wp.populateTemplate(*node.Data.Url, nil)
	method := *node.Data.Method
	nodeDataArray := node.Data.Headers
	headers := make([]*proto.KeyValue, 0)
	headers = append(headers, nodeDataArray.KeyValueItems...)
	payloadStr := wp.populateTemplate(*node.Data.Payload, nil)
	variable := *node.Data.Variable
	var payload interface{}
	json.Unmarshal([]byte(payloadStr), &payload)
	response, err := wp.makeRequest(url, method, headers, payload)
	replayNode := CopyNode(node)
	replayNode.Data.Url = &url
	replayNode.Data.Payload = &payloadStr
	if err != nil {
		wp.UpdateStatus(&replayNode, proto.NodeStatus_FAILED, nil, fmt.Sprintf("Error processing API %s: %v", url, err), true)
		return "", err
	}
	defer func() {
		wp.UpdateStatus(&replayNode, proto.NodeStatus_COMPLETED, response, fmt.Sprintf("API %s processed successfully", url), true)
	}()
	wp.setVariable(variable, response)
	return "", nil
}

func (wp *WorkflowProcessor) LogNodeProcess(node *proto.Node) (string, error) {
	message := wp.populateTemplate(*node.Data.Message, nil)
	defer func() {
		replayNode := CopyNode(node)
		replayNode.Data.Message = &message
		wp.UpdateStatus(&replayNode, proto.NodeStatus_COMPLETED, nil, message, true)
	}()
	return "", nil
}

func (wp *WorkflowProcessor) GuidNodeProcess(node *proto.Node) (string, error) {
	varName := node.Data.Variable
	newGuid := generateGUID()
	defer func() {
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, newGuid, fmt.Sprintf("GUID %s generated", newGuid), true)
	}()
	wp.setVariable(*varName, newGuid)
	return "", nil
}

func (wp *WorkflowProcessor) MathNodeProcess(node *proto.Node) (string, error) {
	expression := wp.populateTemplate(*node.Data.Expression, nil)
	varName := node.Data.Variable
	res, err := m.EvaluateNumeric(expression)
	replayNode := CopyNode(node)
	replayNode.Data.Expression = &expression
	if err != nil {
		wp.UpdateStatus(&replayNode, proto.NodeStatus_FAILED, nil, fmt.Sprintf("Error processing Math %s: %v", expression, err), true)
		return "", err
	}
	wp.setVariable(*varName, res)
	wp.UpdateStatus(&replayNode, proto.NodeStatus_COMPLETED, res, fmt.Sprintf("Math %s processed successfully with a value of %f", expression, res), true)
	return "", nil
}

func (wp *WorkflowProcessor) CountNodeProcess(node *proto.Node) (string, error) {
	varName := node.Data.Variable
	listVar := node.Data.ListVariable
	count := 0
	if listVarValue, ok := wp.ProcessVariables[*listVar].([]interface{}); ok {
		count = count + len(listVarValue)
	} else {
		wp.UpdateStatus(node, proto.NodeStatus_FAILED, nil, "List variable not found or is not a valid List", true)
		return "", errors.New("list variable not found or is not a valid List")
	}
	wp.setVariable(*varName, count)
	wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, count, fmt.Sprintf("Count %s processed successfully with a value of %d", *varName, count), true)
	return "", nil
}

func (wp *WorkflowProcessor) MapNodeProcess(node *proto.Node) (string, error) {
	mappedList := make([]any, 0)
	listVar := node.Data.ListVariable
	variable := node.Data.Variable
	templateStr := node.Data.Template
	listVarValue, ok := wp.ProcessVariables[*listVar]

	if !ok {
		wp.UpdateStatus(node, proto.NodeStatus_FAILED, nil, "List variable not found or is not a valid List", true)
		return "", errors.New("list variable not found or is not a valid List")
	}

	switch items := listVarValue.(type) {
	case []any:
		for _, item := range items {
			var itemMap map[string]any
			switch v := item.(type) {
			case string:
				if err := json.Unmarshal([]byte(v), &itemMap); err != nil {
					itemMap = map[string]any{"value": v}
				}
			case map[string]any:
				itemMap = v
			case float64, bool:
				itemMap = map[string]any{"value": v}
			case KeyValue:
				itemMap = map[string]any{"key": v.Key, "value": v.Value}
			default:
				wp.UpdateStatus(node, proto.NodeStatus_FAILED, nil, "invalid item type", true)
				return "", fmt.Errorf("invalid item type")
			}
			mappedItemStr := wp.populateTemplate(*templateStr, itemMap)
			var mappedItem any
			if err := json.Unmarshal([]byte(mappedItemStr), &mappedItem); err != nil {
				mappedItem = mappedItemStr
			}
			mappedList = append(mappedList, mappedItem)
		}
	default:
		wp.UpdateStatus(node, proto.NodeStatus_FAILED, nil, "List variable is not a valid List", true)
		return "", errors.New("list variable is not a valid List")
	}

	wp.setVariable(*variable, mappedList)
	replayNode := CopyNode(node)
	replayNode.Data.ListVariable = listVar
	replayNode.Data.Variable = variable
	replayNode.Data.Template = templateStr
	mappedListJSON, _ := json.MarshalIndent(mappedList, "", "  ")
	mappedListStr := string(mappedListJSON)
	replayNode.Data.Text = &mappedListStr
	wp.UpdateStatus(&replayNode, proto.NodeStatus_COMPLETED, mappedList, fmt.Sprintf("Map %s processed successfully with a value of %v", *variable, mappedList), true)
	return "", nil
}

func (wp *WorkflowProcessor) ReplaceNodeProcess(node *proto.Node) (string, error) {
	text := wp.populateTemplate(*node.Data.Text, nil)
	pattern := wp.populateTemplate(*node.Data.Pattern, nil)
	replaceText := wp.populateTemplate(*node.Data.ReplaceText, nil)
	varName := node.Data.Variable
	newText := RegexReplaceAll(text, pattern, replaceText)
	defer func() {
		replayNode := CopyNode(node)
		replayNode.Data.Text = &text
		replayNode.Data.Pattern = &pattern
		replayNode.Data.ReplaceText = &replaceText
		wp.UpdateStatus(&replayNode, proto.NodeStatus_COMPLETED, newText, fmt.Sprintf("Replace %s processed successfully with a value of %s", *varName, newText), true)
	}()
	wp.setVariable(*varName, newText)
	return "", nil
}

func (wp *WorkflowProcessor) FindAllNodeProcess(node *proto.Node) (string, error) {
	text := wp.populateTemplate(*node.Data.Text, nil)
	pattern := wp.populateTemplate(*node.Data.Pattern, nil)
	varName := node.Data.Variable
	re := regexp.MustCompile(pattern)
	matches := re.FindAllString(text, -1)
	defer func() {
		replayNode := CopyNode(node)
		replayNode.Data.Text = &text
		replayNode.Data.Pattern = &pattern
		wp.UpdateStatus(&replayNode, proto.NodeStatus_COMPLETED, matches, fmt.Sprintf("FindAll %s processed successfully with a value of %v", *varName, matches), true)
	}()
	wp.setVariable(*varName, matches)
	return "", nil
}

func (wp *WorkflowProcessor) SubProcessNodeProcess(node *proto.Node) (string, error) {
	subProcessId := node.Data.SubProcessId
	defer func() {
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, nil, fmt.Sprintf("SubProcess %s completed successfully", *subProcessId), true)
	}()
	workflow, err := wp.DBcon.GetWorkflow(*subProcessId)
	if err != nil {
		wp.UpdateStatus(node, proto.NodeStatus_FAILED, nil, fmt.Sprintf("Error retrieving SubProcess %s: %v", *subProcessId, err), true)
		return "", err
	}
	subProcessor := &WorkflowProcessor{
		Stream:           wp.Stream,
		Workflow:         workflow,
		ProcessVariables: wp.ProcessVariables,
		DBcon:            wp.DBcon,
	}
	wp.UpdateStatus(node, proto.NodeStatus_INFO, nil, fmt.Sprintf("SubProcess %s is running", *subProcessId), true)
	subProcessor.Process("0")
	for key, value := range subProcessor.ProcessVariables {
		wp.ProcessVariables[key] = value
	}
	return "", nil
}
