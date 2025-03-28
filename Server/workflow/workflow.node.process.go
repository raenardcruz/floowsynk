package workflow

import (
	"encoding/json"
	"errors"
	"fmt"
	"regexp"

	m "github.com/raenardcruz/floowsynk/matheval"
	"github.com/raenardcruz/floowsynk/proto"
)

const (
	Info  = "info"
	Error = "error"
	Debug = "debug"
)

func (wp *WorkflowProcessor) SetVariableNodeProcess(node *proto.Node) error {
	name := node.Data.Name
	value := node.Data.Value
	defer func() {
		replayNode := node
		replayNode.Data.Name = name
		replayNode.Data.Value = value
		wp.updateNodeCurrentValue(replayNode, *value)
		wp.setVariable(*name, *value)
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, replayNode.Data, fmt.Sprintf("Variable %s set to %v", *name, *value), true)
	}()
	return nil
}

func (wp *WorkflowProcessor) ConditionNodeProcess(node *proto.Node) (retVal string, err error) {
	expression := wp.populateTemplate(*node.Data.Expression, nil)
	defer func() {
		replayNode := node
		replayNode.Data.Expression = &expression
		if err != nil {
			wp.UpdateStatus(node, proto.NodeStatus_FAILED, replayNode.Data, fmt.Sprintf("Condition %s failed: %v", expression, err), true)
		} else {
			wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, replayNode.Data, fmt.Sprintf("Condition %s processed: %s", expression, retVal), true)
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

func (wp *WorkflowProcessor) TextNodeProcess(node *proto.Node) error {
	text := wp.populateTemplate(*node.Data.Message, nil)
	varName := node.Data.Variable
	defer func() {
		replayNode := node
		replayNode.Data.Message = &text
		replayNode.Data.Variable = varName
		wp.updateNodeCurrentValue(replayNode, text)
		wp.setVariable(*varName, text)
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, replayNode.Data, fmt.Sprintf("Text %s set to %s", *varName, text), true)
	}()
	return nil
}

func (wp *WorkflowProcessor) LoopNodeProcess(node *proto.Node) error {
	iteration := *node.Data.Iteration
	for i := 0; i < int(iteration); i++ {
		replayNode := node
		replayNode.Data.Iteration = &iteration
		wp.UpdateStatus(node, proto.NodeStatus_RUNNING, replayNode.Data, fmt.Sprintf("Running Iteration %d", iteration), true)
		if err := wp.nextProcess(node.Id, ""); err != nil {
			wp.UpdateStatus(node, proto.NodeStatus_FAILED, replayNode.Data, fmt.Sprintf("Error processing loop iteration %d: %v", i, err), true)
			return err
		}
	}
	wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, node.Data, "Loop processed successfully", true)
	return nil
}

func (wp *WorkflowProcessor) ForEachNodeProcess(node *proto.Node) error {
	listvar := node.Data.ListVariable
	listitems := wp.ProcessVariables[*listvar].([]interface{})
	for _, item := range listitems {
		replayNode := node
		replayNode.Data.ListVariable = listvar
		wp.UpdateStatus(node, proto.NodeStatus_RUNNING, replayNode.Data, "Running Foreach Loop", true)
		wp.updateNodeCurrentValue(replayNode, item.(string))
		wp.ProcessVariables[fmt.Sprintf("%s.item", *listvar)] = item
		if err := wp.nextProcess(node.Id, ""); err != nil {
			wp.UpdateStatus(node, proto.NodeStatus_FAILED, replayNode.Data, fmt.Sprintf("Error processing item %v: %v", item, err), true)
			return err
		}
	}
	wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, node.Data, "ForEach processed successfully", true)
	return nil
}

func (wp *WorkflowProcessor) WhileNodeProcess(node *proto.Node) error {
	expression := wp.populateTemplate(*node.Data.Expression, nil)
	replayNode := node
	replayNode.Data.Expression = &expression
	limit := int(*node.Data.Limit)
	cur := 0
	res, err := m.EvaluateBoolean(expression)
	if err != nil {
		wp.UpdateStatus(node, proto.NodeStatus_FAILED, replayNode.Data, fmt.Sprintf("Error evaluating while %s: %v", expression, err), true)
		return err
	}
	for res && cur < limit {
		iteration := int32(cur)
		replayNode.Data.Iteration = &iteration
		wp.UpdateStatus(node, proto.NodeStatus_RUNNING, replayNode.Data, fmt.Sprintf("Running while %s", expression), true)
		if err := wp.nextProcess(node.Id, ""); err != nil {
			wp.UpdateStatus(node, proto.NodeStatus_FAILED, replayNode.Data, fmt.Sprintf("Error processing while %s: %v", expression, err), true)
			return err
		}
		res, err = m.EvaluateBoolean(expression)
		if err != nil {
			wp.UpdateStatus(node, proto.NodeStatus_FAILED, replayNode.Data, fmt.Sprintf("Error evaluating while %s: %v", expression, err), true)
			return err
		}
		expression = wp.populateTemplate(*node.Data.Expression, nil)
		cur++
	}
	wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, replayNode.Data, "While processed successfully", true)
	return nil
}

func (wp *WorkflowProcessor) ListNodeProcess(node *proto.Node) error {
	nodeDataArray := node.Data.List
	varName := *node.Data.Variable
	listItems := make([]interface{}, 0)
	defer func() {
		wp.updateNodeCurrentValue(node, listItems)
		wp.setVariable(varName, listItems)
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, node.Data, fmt.Sprintf("List %s was populated", varName), true)
	}()
	switch nodeDataArray.Type {
	case proto.ArrayDataType_KEYVALUE:
		for _, item := range nodeDataArray.KeyValueItems {
			listItems = append(listItems, item)
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
	return nil
}

func (wp *WorkflowProcessor) ApiNodeProcess(node *proto.Node) error {
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
	replayNode := node
	replayNode.Data.Url = &url
	replayNode.Data.Payload = &payloadStr
	if err != nil {
		wp.UpdateStatus(node, proto.NodeStatus_FAILED, replayNode.Data, fmt.Sprintf("Error processing API %s: %v", url, err), true)
		return err
	}
	defer func() {
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, replayNode.Data, fmt.Sprintf("API %s processed successfully", url), true)
	}()
	wp.setVariable(variable, response)
	return nil
}

func (wp *WorkflowProcessor) LogNodeProcess(node *proto.Node) error {
	message := wp.populateTemplate(*node.Data.Message, nil)
	defer func() {
		replayNode := node
		replayNode.Data.Message = &message
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, replayNode.Data, message, true)
	}()
	return nil
}

func (wp *WorkflowProcessor) GuidNodeProcess(node *proto.Node) error {
	varName := node.Data.Variable
	newGuid := generateGUID()
	defer func() {
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, node.Data, fmt.Sprintf("GUID %s generated", newGuid), true)
	}()
	wp.setVariable(*varName, newGuid)
	return nil
}

func (wp *WorkflowProcessor) MathNodeProcess(node *proto.Node) error {
	expression := wp.populateTemplate(*node.Data.Expression, nil)
	varName := node.Data.Variable
	res, err := m.EvaluateNumeric(expression)
	replayNode := node
	replayNode.Data.Expression = &expression
	if err != nil {
		wp.UpdateStatus(node, proto.NodeStatus_FAILED, replayNode.Data, fmt.Sprintf("Error processing Math %s: %v", expression, err), true)
		return err
	}
	wp.setVariable(*varName, res)
	wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, replayNode.Data, fmt.Sprintf("Math %s processed successfully with a value of %f", expression, res), true)
	return nil
}

func (wp *WorkflowProcessor) CountNodeProcess(node *proto.Node) error {
	varName := node.Data.Variable
	listVar := node.Data.ListVariable
	count := 0
	if listVarValue, ok := wp.ProcessVariables[*listVar].([]interface{}); ok {
		count = count + len(listVarValue)
	} else {
		wp.UpdateStatus(node, proto.NodeStatus_FAILED, node.Data, "List variable not found or is not a valid List", true)
		return errors.New("list variable not found or is not a valid List")
	}
	wp.setVariable(*varName, count)
	wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, node.Data, fmt.Sprintf("Count %s processed successfully with a value of %d", *varName, count), true)
	return nil
}

func (wp *WorkflowProcessor) MapNodeProcess(node *proto.Node) error {
	mappedList := make([]interface{}, 0)
	listVar := node.Data.ListVariable
	variable := node.Data.Variable
	templateStr := node.Data.Template
	listVarValue, ok := wp.ProcessVariables[*listVar].([]interface{})
	if !ok {
		wp.UpdateStatus(node, proto.NodeStatus_FAILED, node.Data, "List variable not found or is not a valid List", true)
		return errors.New("list variable not found or is not a valid List")
	}
	for _, item := range listVarValue {
		mappedItemStr := wp.populateTemplate(*templateStr, item.(map[string]interface{}))
		var mappedItem interface{}
		if err := json.Unmarshal([]byte(mappedItemStr), &mappedItem); err != nil {
			mappedItem = mappedItemStr
		}
		mappedList = append(mappedList, mappedItem)
	}
	wp.setVariable(*variable, mappedList)
	wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, node.Data, fmt.Sprintf("Map %s processed successfully with a value of %v", *variable, mappedList), true)
	return nil
}

func (wp *WorkflowProcessor) ReplaceNodeProcess(node *proto.Node) error {
	text := wp.populateTemplate(*node.Data.Text, nil)
	pattern := wp.populateTemplate(*node.Data.Pattern, nil)
	replaceText := wp.populateTemplate(*node.Data.ReplaceText, nil)
	varName := node.Data.Variable
	newText := RegexReplaceAll(text, pattern, replaceText)
	defer func() {
		replayNode := node
		replayNode.Data.Text = &text
		replayNode.Data.Pattern = &pattern
		replayNode.Data.ReplaceText = &replaceText
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, replayNode.Data, fmt.Sprintf("Replace %s processed successfully with a value of %s", *varName, newText), true)
	}()
	wp.setVariable(*varName, newText)
	return nil
}

func (wp *WorkflowProcessor) FindAllNodeProcess(node *proto.Node) error {
	text := wp.populateTemplate(*node.Data.Text, nil)
	pattern := wp.populateTemplate(*node.Data.Pattern, nil)
	varName := node.Data.Variable
	re := regexp.MustCompile(pattern)
	matches := re.FindAllString(text, -1)
	defer func() {
		replayNode := node
		replayNode.Data.Text = &text
		replayNode.Data.Pattern = &pattern
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, replayNode.Data, fmt.Sprintf("FindAll %s processed successfully with a value of %v", *varName, matches), true)
	}()
	wp.setVariable(*varName, matches)
	return nil
}

func (wp *WorkflowProcessor) SubProcessNodeProcess(node *proto.Node) error {
	subProcessId := node.Data.SubProcessId
	defer func() {
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, node.Data, "SubProcess processed successfully", true)
	}()
	workflow, err := wp.DBcon.GetWorkflow(*subProcessId)
	if err != nil {
		wp.UpdateStatus(node, proto.NodeStatus_FAILED, node.Data, fmt.Sprintf("Error getting SubProcess %s: %v", *subProcessId, err), true)
		return err
	}
	subProcessor := &WorkflowProcessor{
		Stream:           wp.Stream,
		Workflow:         workflow,
		ProcessVariables: wp.ProcessVariables,
		DBcon:            wp.DBcon,
	}
	subProcessor.Process("0")
	for key, value := range subProcessor.ProcessVariables {
		wp.ProcessVariables[key] = value
	}
	return nil
}
