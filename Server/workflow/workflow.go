package workflow

import (
	"errors"
	"time"

	"github.com/raenardcruz/floowsynk/db"
	"github.com/raenardcruz/floowsynk/proto"
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

const (
	CURRENT = "current"
	TRUE    = "true"
	FALSE   = "false"
)

type WorkflowProcessor struct {
	Stream           proto.WorkflowService_RunWorkflowServer
	Workflow         *proto.Workflow
	ProcessVariables map[string]interface{}
	DBcon            db.DB
}

func (wp *WorkflowProcessor) StartWorkflow() (err error) {
	start := time.Now()
	wp.Process("0")
	time.Since(start)
	return nil
}

func (wp *WorkflowProcessor) Process(nodeId string) (err error) {
	sourceHandle := ""
	wp.UpdateStatus(nodeId, proto.NodeStatus_RUNNING)
	node, exist := getNodeById(wp.Workflow.Nodes, nodeId)
	if !exist {
		return nil
	}

	var processErr error
	switch node.Nodetype {
	case defaultnodeType, intervalType, webhookType, eventsType:
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case setVariabletype:
		if processErr = wp.SetVariableNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case textType:
		if processErr = wp.TextNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case conditionType:
		if sourceHandle, processErr = wp.ConditionNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case listType:
		if processErr = wp.ListNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case loopType:
		if processErr = wp.LoopNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case forEachType:
		if processErr = wp.ForEachNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case whileType:
		if processErr = wp.WhileNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case apiType:
		if processErr = wp.ApiNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case logType:
		if processErr = wp.LogNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case guidType:
		if processErr = wp.GuidNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case mathType:
		if processErr = wp.MathNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case countType:
		if processErr = wp.CountNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case mapType:
		if processErr = wp.MapNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case replaceType:
		if processErr = wp.ReplaceNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case findAllType:
		if processErr = wp.FindAllNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	case subprocessType:
		if processErr = wp.SubProcessNodeProcess(node); processErr != nil {
			wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
			return processErr
		}
		wp.UpdateStatus(nodeId, proto.NodeStatus_COMPLETED)

	default:
		processErr = errors.New("unknown node type")
		wp.UpdateStatus(nodeId, proto.NodeStatus_FAILED)
		return processErr
	}

	wp.nextProcess(nodeId, sourceHandle)
	return nil
}
