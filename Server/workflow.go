package main

import "errors"

const (
	defaultnodeType = "defaultnode"
	intervalType    = "interval"
	webhookType     = "webhook"
	eventsType      = "events"
	setVariabletype = "setVariable"
	textType        = "text"
	conditionType   = "condition"
	listType        = "list"
	loopType        = "loop"
	ForEachType     = "foreach"
)

var processVariables = make(map[string]interface{})
var processResults = make(map[string]interface{})

func (wp *WorkflowProcessor) Process(nodeId string) (err error) {
	sourceHandle := ""
	if node, exist := wp.Workflow.Nodes.getNodeById(nodeId); exist {
		switch node.Type {
		case defaultnodeType, intervalType, webhookType, eventsType:
			break
		case setVariabletype:
			if err := wp.SetVariable(node); err != nil {
				return err
			}
			break
		case textType:
			if err := wp.Text(node); err != nil {
				return err
			}
			break
		case conditionType:
			if sourceHandle, err = wp.Condition(node); err != nil {
				return err
			}
			break
		case listType:
			if err := wp.ListVariables(node); err != nil {
				return err
			}
			break
		case loopType:
			if err := wp.Loop(node); err != nil {
				return err
			}
			break
		case ForEachType:
			if err := wp.ForEach(node); err != nil {
				return err
			}
		default:
			return errors.New("unknown node type")
		}
		wp.nextProcess(nodeId, sourceHandle)
	}
	return nil
}
