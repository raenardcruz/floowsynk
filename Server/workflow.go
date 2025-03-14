package main

import (
	"errors"
)

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

func (wp *WorkflowProcessor) StartWorkflow() (err error) {
	//start := time.Now()
	wp.Process("0")
	//elapsed := time.Since(start)
	//eventStream.SendEvent(wp.ProcessID, "Complete", fmt.Sprintf("Elapsed Time: %s", elapsed))
	return nil
}

func (wp *WorkflowProcessor) Process(nodeId string) (err error) {
	wp.NodeInProgress(nodeId)
	sourceHandle := ""

	node, exist := wp.Workflow.Nodes.getNodeById(nodeId)
	if !exist {
		return nil
	}

	var processErr error
	switch node.Type {
	case defaultnodeType, intervalType, webhookType, eventsType:
		wp.NodeSuccess(nodeId)

	case setVariabletype:
		if processErr = wp.SetVariableNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case textType:
		if processErr = wp.TextNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case conditionType:
		if sourceHandle, processErr = wp.ConditionNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case listType:
		if processErr = wp.ListNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case loopType:
		if processErr = wp.LoopNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case forEachType:
		if processErr = wp.ForEachNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case whileType:
		if processErr = wp.WhileNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case apiType:
		if processErr = wp.ApiNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case logType:
		if processErr = wp.LogNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case guidType:
		if processErr = wp.GuidNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case mathType:
		if processErr = wp.MathNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case countType:
		if processErr = wp.CountNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case mapType:
		if processErr = wp.MapNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case replaceType:
		if processErr = wp.ReplaceNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case findAllType:
		if processErr = wp.FindAllNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	case subprocessType:
		if processErr = wp.SubProcessNodeProcess(node); processErr != nil {
			wp.NodeFailed(nodeId)
			return processErr
		}
		wp.NodeSuccess(nodeId)

	default:
		processErr = errors.New("unknown node type")
		wp.NodeFailed(nodeId)
		return processErr
	}

	wp.nextProcess(nodeId, sourceHandle)
	return nil
}
