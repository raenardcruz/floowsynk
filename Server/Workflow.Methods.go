package main

import (
	"errors"
	"fmt"
	"strings"

	m "github.com/raenardcruz/floowsynk/matheval"
)

func (wp *WorkflowProcessor) nextProcess(nodeId string, sourceHandle string) error {
	targets, ok := wp.GetNextNodes(nodeId, sourceHandle)
	if !ok {
		return nil
	}
	for _, target := range targets {
		if err := wp.Process(target.Id); err != nil {
			return err
		}
	}
	return nil
}

func (n NodeList) getNodeById(id string) (Node, bool) {
	for _, node := range n {
		if node.Id == id {
			return node, true
		}
	}
	return Node{}, false
}

func (wp *WorkflowProcessor) GetNextNodes(nodeId string, sourceHandle string) (NodeList, bool) {
	edges := wp.Workflow.Edges
	targets := make(NodeList, 0)
	for _, edge := range edges {
		if edge.Source == nodeId && (sourceHandle == "" || edge.SourceHandle == sourceHandle) {
			node, ok := wp.Workflow.Nodes.getNodeById(edge.Target)
			if !ok {
				return nil, false
			}
			targets = append(targets, node)
		}
	}
	return targets, len(targets) > 0
}

func (wp *WorkflowProcessor) SetVariable(node Node) error {
	name := node.Data["name"]
	value := node.Data["value"]
	if value != "" {
		processVariables[name.(string)] = value
	}

	return nil
}

func (wp *WorkflowProcessor) Condition(node Node) (string, error) {
	expression := replacePlaceholders(node.Data["expression"].(string))
	if expression == "" {
		return "False", errors.New("condition not found")
	}
	if res, _ := m.EvaluateBoolean(expression); res {
		return "True", nil
	} else {
		return "False", nil
	}
}

func (wp *WorkflowProcessor) Text(node Node) error {
	text := replacePlaceholders(node.Data["message"].(string))
	varName := node.Data["variable"].(string)
	if varName != "" {
		processVariables[varName] = text
	}
	return nil
}

func (wp *WorkflowProcessor) Loop(node Node) error {
	iteration := node.Data["iteration"].(int)
	for i := 0; i < iteration; i++ {
		if err := wp.nextProcess(node.Id, ""); err != nil {
			return err
		}
	}
	return nil
}

func (wp *WorkflowProcessor) ForEach(node Node) error {
	listvar := node.Data["listvar"].(string)
	listitems := processVariables[listvar].([]interface{})
	for _, item := range listitems {
		processVariables[fmt.Sprintf("%s.item", listvar)] = item
		if err := wp.nextProcess(node.Id, ""); err != nil {
			return err
		}
	}
	return nil
}

func (wp *WorkflowProcessor) ListVariables(node Node) error {
	listitems := node.Data["list"].([]interface{})
	varName := node.Data["variable"].(string)
	if varName != "" {
		processVariables[varName] = listitems
	}
	return nil
}

//Helper function

func replacePlaceholders(text string) string {
	for key, value := range processVariables {
		placeholder := "{{" + key + "}}"
		text = strings.ReplaceAll(text, placeholder, fmt.Sprintf("%v", value))
	}
	return text
}
