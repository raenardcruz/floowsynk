package workflow

import (
	"strings"
	"testing"

	proto "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
)

func TestWorkflow_DiamondFanIn(t *testing.T) {
	// A -> B -> D
	// A -> C -> D
	nodes := []*proto.Node{
		{Id: "0", Nodetype: defaultnodeType},
		{Id: "B", Nodetype: defaultnodeType},
		{Id: "C", Nodetype: defaultnodeType},
		{Id: "D", Nodetype: defaultnodeType},
	}
	edges := []*proto.Edge{
		{Id: "e1", Source: "0", Target: "B"},
		{Id: "e2", Source: "0", Target: "C"},
		{Id: "e3", Source: "B", Target: "D"},
		{Id: "e4", Source: "C", Target: "D"},
	}

	wf := &proto.Workflow{
		Id:    "test-diamond-wf",
		Nodes: nodes,
		Edges: edges,
	}

	wp := &WorkflowProcessor{
		Workflow: wf,
	}

	err := wp.StartWorkflow()
	if err != nil {
		t.Fatalf("StartWorkflow failed: %v", err)
	}

	// Verify visit counts:
	// 0: 1
	// B: 1
	// C: 1
	// D: MUST BE 1 (not 2!)
	if wp.NodeVisitCount["0"] != 1 {
		t.Errorf("expected node 0 to be visited 1 time, got %d", wp.NodeVisitCount["0"])
	}
	if wp.NodeVisitCount["B"] != 1 {
		t.Errorf("expected node B to be visited 1 time, got %d", wp.NodeVisitCount["B"])
	}
	if wp.NodeVisitCount["C"] != 1 {
		t.Errorf("expected node C to be visited 1 time, got %d", wp.NodeVisitCount["C"])
	}
	if wp.NodeVisitCount["D"] != 1 {
		t.Errorf("expected node D to be visited 1 time (fan-in joined), got %d", wp.NodeVisitCount["D"])
	}
}

func TestWorkflow_ConditionDiamondFanIn(t *testing.T) {
	// Cond -> "True" -> B -> D
	// Cond -> "False" -> C -> D
	// Expression: "1 == 1" -> True
	expr := "1 == 1"
	nodes := []*proto.Node{
		{
			Id:       "0",
			Nodetype: conditionType,
			Data: &proto.NodeData{
				Expression: &expr,
			},
		},
		{Id: "B", Nodetype: defaultnodeType},
		{Id: "C", Nodetype: defaultnodeType},
		{Id: "D", Nodetype: defaultnodeType},
	}
	edges := []*proto.Edge{
		{Id: "e1", Source: "0", Target: "B", Sourcehandle: "True"},
		{Id: "e2", Source: "0", Target: "C", Sourcehandle: "False"},
		{Id: "e3", Source: "B", Target: "D"},
		{Id: "e4", Source: "C", Target: "D"},
	}

	wf := &proto.Workflow{
		Id:    "test-cond-diamond-wf",
		Nodes: nodes,
		Edges: edges,
	}

	wp := &WorkflowProcessor{
		Workflow: wf,
	}

	err := wp.StartWorkflow()
	if err != nil {
		t.Fatalf("StartWorkflow failed: %v", err)
	}

	// Verify:
	// Cond: 1
	// B: 1
	// C: 0 (False branch not taken)
	// D: 1 (should not hang or fail waiting for dead branch C!)
	if wp.NodeVisitCount["0"] != 1 {
		t.Errorf("expected node 0 to be visited 1 time, got %d", wp.NodeVisitCount["0"])
	}
	if wp.NodeVisitCount["B"] != 1 {
		t.Errorf("expected node B to be visited 1 time, got %d", wp.NodeVisitCount["B"])
	}
	if wp.NodeVisitCount["C"] != 0 {
		t.Errorf("expected node C to be visited 0 times, got %d", wp.NodeVisitCount["C"])
	}
	if wp.NodeVisitCount["D"] != 1 {
		t.Errorf("expected node D to be visited 1 time, got %d", wp.NodeVisitCount["D"])
	}
}

func TestWorkflow_CycleProtectionMaxStepLimit(t *testing.T) {
	// Infinite cycle: A -> B -> A
	nodes := []*proto.Node{
		{Id: "0", Nodetype: defaultnodeType},
		{Id: "B", Nodetype: defaultnodeType},
	}
	edges := []*proto.Edge{
		{Id: "e1", Source: "0", Target: "B"},
		{Id: "e2", Source: "B", Target: "0"},
	}

	wf := &proto.Workflow{
		Id:    "test-cycle-wf",
		Nodes: nodes,
		Edges: edges,
	}

	wp := &WorkflowProcessor{
		Workflow:     wf,
		MaxStepLimit: 50,
	}

	err := wp.StartWorkflow()
	if err == nil {
		t.Fatal("expected error due to cycle/max step limit, got nil")
	}
	if !strings.Contains(err.Error(), "exceeded max") {
		t.Errorf("expected max limit error message, got %v", err)
	}
}
