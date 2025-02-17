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
	forEachType     = "foreach"
	whileType       = "while"
	apiType         = "api"
	logType         = "log"
	guidType        = "getGuid"
	mathType        = "math"
	countType       = "count"
)

var processVariables = make(map[string]interface{})
var processResults = make(map[string]interface{})
var loggingData = make([]string, 0)

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
		case forEachType:
			if err := wp.ForEach(node); err != nil {
				return err
			}
			break
		case whileType:
			if err := wp.WhileProcess(node); err != nil {
				return err
			}
			break
		case apiType:
			if err := wp.ApiProcess(node); err != nil {
				return err
			}

		case logType:
			if err := wp.LogProcess(node); err != nil {
				return err
			}
			break
		case guidType:
			if err := wp.GuidProcess(node); err != nil {
				return err
			}
			break
		case mathType:
			if err := wp.MathProcess(node); err != nil {
				return err
			}
			break
		case countType:
			if err := wp.CountProcess(node); err != nil {
				return err
			}
			break
		default:
			return errors.New("unknown node type")
		}
		wp.nextProcess(nodeId, sourceHandle)
	}
	return nil
}
