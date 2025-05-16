package workflow

import (
	"errors"
	"log"
	"time"

	"github.com/raenardcruz/floowsynk/Server/proto"
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

func (wp *WorkflowProcessor) StartWorkflow() (err error) {
	start := time.Now()
	wp.ProcessVariables = make(map[string]interface{})
	wp.ProcessVariables[INPUT] = ""
	wp.ProcessVariables[OUTPUT] = ""
	wp.Process("0")
	duration := time.Since(start)
	log.Default().Printf("Workflow %s completed in %s", wp.Workflow.Id, duration)
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

	nodeProcessors := map[string]func(*proto.Node) (string, error){
		defaultnodeType: wp.DefaultNodeProcess,
		intervalType:    wp.DefaultNodeProcess,
		webhookType:     wp.DefaultNodeProcess,
		eventsType:      wp.DefaultNodeProcess,
		setVariabletype: wp.SetVariableNodeProcess,
		textType:        wp.TextNodeProcess,
		conditionType:   wp.ConditionNodeProcessWrapper,
		listType:        wp.ListNodeProcess,
		loopType:        wp.LoopNodeProcess,
		forEachType:     wp.ForEachNodeProcess,
		whileType:       wp.WhileNodeProcess,
		apiType:         wp.ApiNodeProcess,
		logType:         wp.LogNodeProcess,
		guidType:        wp.GuidNodeProcess,
		mathType:        wp.MathNodeProcess,
		countType:       wp.CountNodeProcess,
		mapType:         wp.MapNodeProcess,
		replaceType:     wp.ReplaceNodeProcess,
		findAllType:     wp.FindAllNodeProcess,
		subprocessType:  wp.SubProcessNodeProcess,
	}

	processFunc, ok := nodeProcessors[node.Nodetype]
	if !ok {
		return errors.New("unknown node type")
	}

	if node.Nodetype == conditionType {
		if sourceHandle, err = processFunc(node); err != nil {
			return err
		}
	} else {
		if sourceHandle, err = processFunc(node); err != nil {
			return err
		}
	}

	wp.nextProcess(nodeId, sourceHandle)
	return nil
}

func (wp *WorkflowProcessor) ConditionNodeProcessWrapper(node *proto.Node) (string, error) {
	return wp.ConditionNodeProcess(node)
}
