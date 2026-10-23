package workflow

import (
	"errors"
	"fmt"
	"log"
	"time"

	proto "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
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
	responseType    = "response"
	connectorType   = "connector"
	ragType         = "rag"
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
	if wp.ProcessVariables == nil {
		wp.ProcessVariables = make(map[string]interface{})
	}
	if wp.ExecutedEdges == nil {
		wp.ExecutedEdges = make(map[string]bool)
	}
	if wp.NodeVisitCount == nil {
		wp.NodeVisitCount = make(map[string]int)
	}
	if wp.MaxStepLimit <= 0 {
		wp.MaxStepLimit = 10000
	}
	if _, ok := wp.ProcessVariables[INPUT]; !ok {
		wp.ProcessVariables[INPUT] = ""
	}
	if _, ok := wp.ProcessVariables[OUTPUT]; !ok {
		if inVal, exists := wp.ProcessVariables[INPUT]; exists && inVal != "" {
			wp.ProcessVariables[OUTPUT] = inVal
		} else {
			wp.ProcessVariables[OUTPUT] = ""
		}
	}

	if wp.Workflow == nil || len(wp.Workflow.Nodes) == 0 {
		return nil
	}

	startNodeId := "0"
	if _, exist := getNodeById(wp.Workflow.Nodes, "0"); !exist {
		targetMap := make(map[string]bool)
		for _, edge := range wp.Workflow.Edges {
			targetMap[edge.Target] = true
		}
		found := false
		for _, node := range wp.Workflow.Nodes {
			if !targetMap[node.Id] {
				startNodeId = node.Id
				found = true
				break
			}
		}
		if !found {
			startNodeId = wp.Workflow.Nodes[0].Id
		}
	}

	err = wp.Process(startNodeId)
	duration := time.Since(start)
	log.Default().Printf("Workflow %s completed in %s", wp.Workflow.Id, duration)
	return err
}

func (wp *WorkflowProcessor) hasLoopOrDoneEdges(nodeId string) bool {
	if wp.Workflow == nil {
		return false
	}
	for _, edge := range wp.Workflow.Edges {
		if edge.Source == nodeId && (edge.Sourcehandle == "loop" || edge.Sourcehandle == "done") {
			return true
		}
	}
	return false
}

func (wp *WorkflowProcessor) Process(nodeId string) (err error) {
	if !wp.isJoinReady(nodeId) {
		return nil
	}

	if wp.NodeVisitCount == nil {
		wp.NodeVisitCount = make(map[string]int)
	}
	wp.NodeVisitCount[nodeId]++
	if wp.MaxStepLimit > 0 && wp.NodeVisitCount[nodeId] > wp.MaxStepLimit {
		return fmt.Errorf("node %s exceeded max execution limit of %d (cycle detected)", nodeId, wp.MaxStepLimit)
	}

	nonLoopIncoming := wp.getNonLoopIncomingEdges(nodeId)
	if len(nonLoopIncoming) > 1 {
		for _, inEdge := range nonLoopIncoming {
			delete(wp.ExecutedEdges, getEdgeKey(inEdge))
		}
	}

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
		responseType:    wp.ResponseNodeProcess,
		connectorType:   wp.ConnectorNodeProcess,
		ragType:         wp.RagNodeProcess,
	}

	processFunc, ok := nodeProcessors[node.Nodetype]
	if !ok {
		return errors.New("unknown node type")
	}

	if sourceHandle, err = processFunc(node); err != nil {
		return err
	}

	isLoop := node.Nodetype == loopType || node.Nodetype == forEachType || node.Nodetype == whileType
	if isLoop && sourceHandle == "" {
		return nil
	}

	return wp.nextProcess(nodeId, sourceHandle)
}

func (wp *WorkflowProcessor) ConditionNodeProcessWrapper(node *proto.Node) (string, error) {
	return wp.ConditionNodeProcess(node)
}
