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
	mapType         = "map"
	replaceType     = "replace"
	findAllType     = "findAll"
	subprocessType  = "subprocess"
)

func (wp *WorkflowProcessor) Process(nodeId string) (err error) {
	sourceHandle := ""
	if node, exist := wp.Workflow.Nodes.getNodeById(nodeId); exist {
		switch node.Type {
		case defaultnodeType, intervalType, webhookType, eventsType:
			break
		case setVariabletype:
			if err := wp.SetVariableNodeProcess(node); err != nil {
				return err
			}
			break
		case textType:
			if err := wp.TextNodeProcess(node); err != nil {
				return err
			}
			break
		case conditionType:
			if sourceHandle, err = wp.ConditionNodeProcess(node); err != nil {
				return err
			}
			break
		case listType:
			if err := wp.ListNodeProcess(node); err != nil {
				return err
			}
			break
		case loopType:
			if err := wp.LoopNodeProcess(node); err != nil {
				return err
			}
			break
		case forEachType:
			if err := wp.ForEachNodeProcess(node); err != nil {
				return err
			}
			break
		case whileType:
			if err := wp.WhileNodeProcess(node); err != nil {
				return err
			}
			break
		case apiType:
			if err := wp.ApiNodeProcess(node); err != nil {
				return err
			}

		case logType:
			if err := wp.LogNodeProcess(node); err != nil {
				return err
			}
			break
		case guidType:
			if err := wp.GuidNodeProcess(node); err != nil {
				return err
			}
			break
		case mathType:
			if err := wp.MathNodeProcess(node); err != nil {
				return err
			}
			break
		case countType:
			if err := wp.CountNodeProcess(node); err != nil {
				return err
			}
			break
		case mapType:
			if err := wp.MapNodeProcess(node); err != nil {
				return err
			}
			break
		case replaceType:
			if err := wp.ReplaceNodeProcess(node); err != nil {
				return err
			}
			break
		case findAllType:
			if err := wp.FindAllNodeProcess(node); err != nil {
				return err
			}
			break
		case subprocessType:
			if err := wp.SubProcessNodeProcess(node); err != nil {
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
