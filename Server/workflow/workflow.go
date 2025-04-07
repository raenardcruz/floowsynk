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
	INPUT   = "input"
	OUTPUT  = "output"
	TRUE    = "True"
	FALSE   = "False"
)

type WorkflowProcessor struct {
	Stream           proto.WorkflowService_RunWorkflowServer
	Workflow         *proto.Workflow
	ProcessVariables map[string]interface{}
	DBcon            db.DB
}

func (wp *WorkflowProcessor) StartWorkflow() (err error) {
	start := time.Now()
	wp.ProcessVariables = make(map[string]interface{})
	wp.ProcessVariables[INPUT] = ""
	wp.ProcessVariables[OUTPUT] = ""
	wp.Process("0")
	time.Since(start)
	return nil
}

func (wp *WorkflowProcessor) Process(nodeId string) (err error) {
	wp.ProcessVariables[INPUT] = wp.ProcessVariables[OUTPUT]
	sourceHandle := ""
	node, exist := getNodeById(wp.Workflow.Nodes, nodeId)
	wp.UpdateStatus(node, proto.NodeStatus_RUNNING, nil, "", false)
	if !exist {
		return nil
	}

	var processErr error
	switch node.Nodetype {
	case defaultnodeType, intervalType, webhookType, eventsType:
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, node.Data, "Process Started", true)

	case setVariabletype:
		if processErr = wp.SetVariableNodeProcess(node); processErr != nil {
			return processErr
		}

	case textType:
		if processErr = wp.TextNodeProcess(node); processErr != nil {
			return processErr
		}

	case conditionType:
		if sourceHandle, processErr = wp.ConditionNodeProcess(node); processErr != nil {
			return processErr
		}

	case listType:
		if processErr = wp.ListNodeProcess(node); processErr != nil {
			return processErr
		}

	case loopType:
		if processErr = wp.LoopNodeProcess(node); processErr != nil {
			return processErr
		}

	case forEachType:
		if processErr = wp.ForEachNodeProcess(node); processErr != nil {
			return processErr
		}

	case whileType:
		if processErr = wp.WhileNodeProcess(node); processErr != nil {
			return processErr
		}

	case apiType:
		if processErr = wp.ApiNodeProcess(node); processErr != nil {
			return processErr
		}

	case logType:
		if processErr = wp.LogNodeProcess(node); processErr != nil {
			return processErr
		}

	case guidType:
		if processErr = wp.GuidNodeProcess(node); processErr != nil {
			return processErr
		}

	case mathType:
		if processErr = wp.MathNodeProcess(node); processErr != nil {
			return processErr
		}

	case countType:
		if processErr = wp.CountNodeProcess(node); processErr != nil {
			return processErr
		}

	case mapType:
		if processErr = wp.MapNodeProcess(node); processErr != nil {
			return processErr
		}

	case replaceType:
		if processErr = wp.ReplaceNodeProcess(node); processErr != nil {
			return processErr
		}

	case findAllType:
		if processErr = wp.FindAllNodeProcess(node); processErr != nil {
			return processErr
		}

	case subprocessType:
		if processErr = wp.SubProcessNodeProcess(node); processErr != nil {
			return processErr
		}

	default:
		processErr = errors.New("unknown node type")
		return processErr
	}

	wp.nextProcess(nodeId, sourceHandle)
	return nil
}
