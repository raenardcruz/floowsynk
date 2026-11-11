package workflow

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"
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
	stickyNoteType  = "stickyNote"
	visualGroupType = "visualGroup"
	codeType        = "code"
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

func isNodePinned(node *proto.Node) bool {
	if node == nil {
		return false
	}
	if node.Nodestyle != nil && strings.Contains(*node.Nodestyle, "__PINNED__:") {
		return true
	}
	if node.Data != nil {
		if node.Data.Value != nil && strings.HasPrefix(*node.Data.Value, "__PINNED__:") {
			return true
		}
		if node.Data.Payload != nil && strings.HasPrefix(*node.Data.Payload, "__PINNED__:") {
			return true
		}
		if node.Data.Template != nil && strings.HasPrefix(*node.Data.Template, "__PINNED__:") {
			return true
		}
	}
	return false
}

func getPinnedData(node *proto.Node) interface{} {
	var raw string
	if node.Nodestyle != nil && strings.Contains(*node.Nodestyle, "__PINNED__:") {
		idx := strings.Index(*node.Nodestyle, "__PINNED__:")
		raw = (*node.Nodestyle)[idx+len("__PINNED__:"):]
	} else if node.Data != nil {
		if node.Data.Value != nil && strings.HasPrefix(*node.Data.Value, "__PINNED__:") {
			raw = strings.TrimPrefix(*node.Data.Value, "__PINNED__:")
		} else if node.Data.Payload != nil && strings.HasPrefix(*node.Data.Payload, "__PINNED__:") {
			raw = strings.TrimPrefix(*node.Data.Payload, "__PINNED__:")
		} else if node.Data.Template != nil && strings.HasPrefix(*node.Data.Template, "__PINNED__:") {
			raw = strings.TrimPrefix(*node.Data.Template, "__PINNED__:")
		}
	}
	raw = strings.TrimSpace(raw)
	var parsed interface{}
	if err := json.Unmarshal([]byte(raw), &parsed); err == nil {
		return parsed
	}
	return raw
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

	// Pinned data check: if the node has pinned mock output, bypass execution
	if isNodePinned(node) {
		pinnedVal := getPinnedData(node)
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, pinnedVal, "Using pinned mock output", true)
		return wp.nextProcess(nodeId, "")
	}

	nodeProcessors := map[string]func(*proto.Node) (string, error){
		defaultnodeType: wp.DefaultNodeProcess,
		intervalType:    wp.DefaultNodeProcess,
		webhookType:     wp.DefaultNodeProcess,
		eventsType:      wp.DefaultNodeProcess,
		stickyNoteType:  wp.DefaultNodeProcess,
		visualGroupType: wp.DefaultNodeProcess,
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
		codeType:        wp.CodeNodeProcess,
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
