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
	wp.Log(node.Id, "Setting variable", proto.LogStatus_INFO)
	name := node.Data.Name
	value := node.Data.Value
	defer func() {
		replayNode := node
		replayNode.Data.Name = name
		replayNode.Data.Value = value
		wp.updateNodeCurrentValue(replayNode, *value)
		wp.setVariable(*name, *value)
		wp.SendReplay(replayNode)
		wp.Log(node.Id, fmt.Sprintf("Variable %s set to %v", *name, *value), proto.LogStatus_INFO)
	}()
	return nil
}

func (wp *WorkflowProcessor) ConditionNodeProcess(node *proto.Node) (retVal string, err error) {
	wp.Log(node.Id, "Processing condition", proto.LogStatus_INFO)
	expression := wp.populateTemplate(*node.Data.Expression, nil)
	defer func() {
		replayNode := node
		replayNode.Data.Expression = &expression
		wp.SendReplay(replayNode)
		wp.Log(node.Id, fmt.Sprintf("Condition %s processed: %s", expression, retVal), proto.LogStatus_INFO)
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
	wp.Log(node.Id, "Processing text", proto.LogStatus_INFO)
	text := wp.populateTemplate(*node.Data.Message, nil)
	varName := node.Data.Variable
	defer func() {
		replayNode := node
		replayNode.Data.Message = &text
		replayNode.Data.Variable = varName
		wp.updateNodeCurrentValue(replayNode, text)
		wp.setVariable(*varName, text)
		wp.SendReplay(replayNode)
		wp.Log(node.Id, fmt.Sprintf("Text %s set to %s", *varName, text), proto.LogStatus_INFO)
	}()
	return nil
}

func (wp *WorkflowProcessor) LoopNodeProcess(node *proto.Node) error {
	iteration := *node.Data.Iteration
	for i := 0; i < int(iteration); i++ {
		wp.Log(node.Id, fmt.Sprintf("[%s] Loop iteration %d", node.Label, i), proto.LogStatus_INFO)
		replayNode := node
		replayNode.Data.Iteration = &iteration
		wp.SendReplay(replayNode)
		if err := wp.nextProcess(node.Id, ""); err != nil {
			wp.Log(node.Id, fmt.Sprintf("Error processing loop iteration %d:%v", i, err), proto.LogStatus_ERROR)
			return err
		}
	}
	return nil
}

func (wp *WorkflowProcessor) ForEachNodeProcess(node *proto.Node) error {
	listvar := node.Data.ListVariable
	listitems := wp.ProcessVariables[*listvar].([]interface{})
	for _, item := range listitems {
		wp.Log(node.Id, fmt.Sprintf("[%s] Processing item %v", node.Label, item), proto.LogStatus_INFO)
		replayNode := node
		replayNode.Data.ListVariable = listvar
		wp.updateNodeCurrentValue(replayNode, item.(string))
		wp.SendReplay(replayNode)
		wp.ProcessVariables[fmt.Sprintf("%s.item", *listvar)] = item
		if err := wp.nextProcess(node.Id, ""); err != nil {
			wp.Log(node.Id, fmt.Sprintf("Error processing item %v: %v", item, err), proto.LogStatus_ERROR)
			return err
		}
	}
	return nil
}

func (wp *WorkflowProcessor) WhileNodeProcess(node *proto.Node) error {
	expression := wp.populateTemplate(*node.Data.Expression, nil)
	limit := int(*node.Data.Limit)
	cur := 0
	res, err := m.EvaluateBoolean(expression)
	if err != nil {
		wp.Log(node.Id, fmt.Sprintf("Error evaluating while %s: %v", expression, err), proto.LogStatus_ERROR)
		return err
	}
	for res && cur < limit {
		replayNode := node
		replayNode.Data.Expression = &expression
		iteration := int32(cur)
		replayNode.Data.Iteration = &iteration
		wp.SendReplay(replayNode)
		wp.Log(node.Id, fmt.Sprintf("While %s is %t", expression, res), proto.LogStatus_INFO)
		if err := wp.nextProcess(node.Id, ""); err != nil {
			wp.Log(node.Id, fmt.Sprintf("Error processing while %s: %v", expression, err), proto.LogStatus_ERROR)
			return err
		}
		res, err = m.EvaluateBoolean(expression)
		if err != nil {
			wp.Log(node.Id, fmt.Sprintf("Error evaluating while %s: %v", expression, err), proto.LogStatus_ERROR)
			return err
		}
		expression = wp.populateTemplate(*node.Data.Expression, nil)
		cur++
	}
	return nil
}

func (wp *WorkflowProcessor) ListNodeProcess(node *proto.Node) error {
	wp.Log(node.Id, "Processing list", proto.LogStatus_INFO)
	nodeDataArray := node.Data.List
	varName := *node.Data.Variable
	listItems := make([]interface{}, 0)
	defer func() {
		wp.updateNodeCurrentValue(node, listItems)
		wp.setVariable(varName, listItems)
		wp.SendReplay(node)
		wp.Log(node.Id, fmt.Sprintf("List %s set to %v", varName, listItems), proto.LogStatus_INFO)
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
	wp.Log(node.Id, "Processing API", proto.LogStatus_INFO)
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
	if err != nil {
		wp.Log(node.Id, fmt.Sprintf("Error processing API %s: %v", url, err), proto.LogStatus_ERROR)
		return err
	}
	defer func() {
		wp.SendReplay(node)
		wp.Log(node.Id, fmt.Sprintf("API %s processed successfully", url), proto.LogStatus_INFO)
	}()
	wp.setVariable(variable, response)
	return nil
}

func (wp *WorkflowProcessor) LogNodeProcess(node *proto.Node) error {
	message := wp.populateTemplate(*node.Data.Message, nil)
	defer func() {
		wp.SendReplay(node)
		wp.Log(node.Id, message, proto.LogStatus_INFO)
	}()
	return nil
}

func (wp *WorkflowProcessor) GuidNodeProcess(node *proto.Node) error {
	wp.Log(node.Id, "Generating GUID", proto.LogStatus_INFO)
	varName := node.Data.Variable
	newGuid := generateGUID()
	defer func() {
		wp.SendReplay(node)
		wp.Log(node.Id, fmt.Sprintf("GUID %s generated", newGuid), proto.LogStatus_INFO)
	}()
	wp.setVariable(*varName, newGuid)
	return nil
}

func (wp *WorkflowProcessor) MathNodeProcess(node *proto.Node) error {
	wp.Log(node.Id, "Processing Math", proto.LogStatus_INFO)
	expression := wp.populateTemplate(*node.Data.Expression, nil)
	varName := node.Data.Variable
	res, err := m.EvaluateNumeric(expression)
	if err != nil {
		wp.Log(node.Id, fmt.Sprintf("Error processing Math %s: %v", expression, err), proto.LogStatus_ERROR)
		return err
	}
	defer func() {
		wp.SendReplay(node)
		wp.Log(node.Id, fmt.Sprintf("Math %s processed successfully with a value of %f", expression, res), proto.LogStatus_INFO)
	}()
	wp.setVariable(*varName, res)
	return nil
}

func (wp *WorkflowProcessor) CountNodeProcess(node *proto.Node) error {
	wp.Log(node.Id, "Processing Count", proto.LogStatus_INFO)
	varName := node.Data.Variable
	listVar := node.Data.ListVariable
	count := 0
	defer func() {
		wp.SendReplay(node)
		wp.Log(node.Id, fmt.Sprintf("Count %s processed successfully with a value of %d", *varName, count), proto.LogStatus_INFO)
	}()
	if listVarValue, ok := wp.ProcessVariables[*listVar].([]interface{}); ok {
		count = count + len(listVarValue)
	} else {
		wp.Log(node.Id, "List variable not found or is not a valid List", proto.LogStatus_ERROR)
		return errors.New("list variable not found or is not a valid List")
	}
	wp.setVariable(*varName, count)
	return nil
}

func (wp *WorkflowProcessor) MapNodeProcess(node *proto.Node) error {
	wp.Log(node.Id, "Processing Map", proto.LogStatus_INFO)
	mappedList := make([]interface{}, 0)
	listVar := node.Data.ListVariable
	variable := node.Data.Variable
	templateStr := node.Data.Template
	listVarValue, ok := wp.ProcessVariables[*listVar].([]interface{})
	if !ok {
		wp.Log(node.Id, "List variable not found or is not a valid List", proto.LogStatus_ERROR)
		return errors.New("list variable not found or is not a valid List")
	}
	defer func() {
		wp.SendReplay(node)
		wp.Log(node.Id, fmt.Sprintf("Map %s processed successfully with a value of %v", *variable, mappedList), proto.LogStatus_INFO)
	}()
	for _, item := range listVarValue {
		mappedItemStr := wp.populateTemplate(*templateStr, item.(map[string]interface{}))
		var mappedItem interface{}
		if err := json.Unmarshal([]byte(mappedItemStr), &mappedItem); err != nil {
			mappedItem = mappedItemStr
		}
		mappedList = append(mappedList, mappedItem)
	}
	wp.setVariable(*variable, mappedList)
	return nil
}

func (wp *WorkflowProcessor) ReplaceNodeProcess(node *proto.Node) error {
	wp.Log(node.Id, "Processing Replace", proto.LogStatus_INFO)
	text := wp.populateTemplate(*node.Data.Text, nil)
	pattern := wp.populateTemplate(*node.Data.Pattern, nil)
	replaceText := wp.populateTemplate(*node.Data.ReplaceText, nil)
	varName := node.Data.Variable
	newText := RegexReplaceAll(text, pattern, replaceText)
	defer func() {
		wp.SendReplay(node)
		wp.Log(node.Id, fmt.Sprintf("Replace %s processed successfully with a value of %s", *varName, newText), proto.LogStatus_INFO)
	}()
	wp.setVariable(*varName, newText)
	return nil
}

func (wp *WorkflowProcessor) FindAllNodeProcess(node *proto.Node) error {
	wp.Log(node.Id, "Processing FindAll", proto.LogStatus_INFO)
	text := wp.populateTemplate(*node.Data.Text, nil)
	pattern := wp.populateTemplate(*node.Data.Pattern, nil)
	varName := node.Data.Variable
	re := regexp.MustCompile(pattern)
	matches := re.FindAllString(text, -1)
	defer func() {
		wp.SendReplay(node)
		wp.Log(node.Id, fmt.Sprintf("FindAll %s processed successfully with a value of %v", *varName, matches), proto.LogStatus_INFO)
	}()
	wp.setVariable(*varName, matches)
	return nil
}

func (wp *WorkflowProcessor) SubProcessNodeProcess(node *proto.Node) error {
	subProcessId := node.Data.SubProcessId
	defer func() {
		wp.SendReplay(node)
		wp.Log(node.Id, "SubProcess processed successfully", proto.LogStatus_INFO)
	}()
	wp.Log(node.Id, fmt.Sprintf("Processing SubProcess %s", *subProcessId), proto.LogStatus_INFO)
	workflow, err := wp.DBcon.GetWorkflow(*subProcessId)
	if err != nil {
		wp.Log(node.Id, fmt.Sprintf("Error getting SubProcess %s: %v", *subProcessId, err), proto.LogStatus_ERROR)
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
