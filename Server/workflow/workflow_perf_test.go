package workflow

import (
	"strings"
	"sync"
	"testing"
	"time"

	proto "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
)

func TestPopulateTemplate_FastPathNoTemplate(t *testing.T) {
	wp := &WorkflowProcessor{
		ProcessVariables: map[string]interface{}{
			"foo": "bar",
		},
	}
	raw := "This is a plain string with no templates"
	result := wp.populateTemplate(raw, nil)
	if result != raw {
		t.Fatalf("expected %q, got %q", raw, result)
	}
}

func TestPopulateTemplate_CachingAndFunctions(t *testing.T) {
	wp := &WorkflowProcessor{
		ProcessVariables: map[string]interface{}{
			"user": "Alice",
			"items": []interface{}{
				map[string]interface{}{"id": 1, "name": "Apple"},
				map[string]interface{}{"id": 2, "name": "Banana"},
			},
		},
	}

	tmplStr := "Hello {{.user}}! Items: {{toJSON .items}}"
	for i := 0; i < 10; i++ {
		res := wp.populateTemplate(tmplStr, nil)
		if !strings.Contains(res, "Hello Alice!") {
			t.Fatalf("iteration %d: expected Alice in result, got: %s", i, res)
		}
		if !strings.Contains(res, `"Apple"`) {
			t.Fatalf("iteration %d: expected JSON Apple in result, got: %s", i, res)
		}
	}
}

func TestPopulateTemplate_ConcurrentExecution(t *testing.T) {
	wp := &WorkflowProcessor{
		ProcessVariables: map[string]interface{}{
			"count": 42,
		},
	}

	tmplStr := "Value is {{.count}}"
	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			res := wp.populateTemplate(tmplStr, nil)
			if res != "Value is 42" {
				t.Errorf("expected 'Value is 42', got %q", res)
			}
		}()
	}
	wg.Wait()
}

func TestProcessVariables_PayloadTruncation(t *testing.T) {
	wp := &WorkflowProcessor{
		ProcessVariables: make(map[string]interface{}),
	}

	node := &proto.Node{
		Id: "node_trunc",
	}

	// Create a string that exceeds DefaultMaxReplayVariableBytes
	hugeString := strings.Repeat("A", DefaultMaxReplayVariableBytes+1000)
	wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, hugeString, "completed", true)

	replayMap := wp.getVariableMapString()
	storedReplayVal := replayMap["output"]
	if !strings.Contains(storedReplayVal, "... [truncated:") {
		t.Fatalf("expected replay variable to be truncated, got length %d", len(storedReplayVal))
	}
	if len(storedReplayVal) > DefaultMaxReplayVariableBytes+200 {
		t.Fatalf("replay variable string is too long: %d bytes", len(storedReplayVal))
	}
}

func BenchmarkPopulateTemplate_Cached(b *testing.B) {
	wp := &WorkflowProcessor{
		ProcessVariables: map[string]interface{}{
			"name":  "FlowSynk",
			"count": 100,
			"tags":  []interface{}{"fast", "reliable"},
		},
	}
	tmpl := "Workflow {{.name}} has {{.count}} runs: {{toJSON .tags}}"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = wp.populateTemplate(tmpl, nil)
	}
}

func BenchmarkPopulateTemplate_PlainString(b *testing.B) {
	wp := &WorkflowProcessor{
		ProcessVariables: map[string]interface{}{
			"name": "FlowSynk",
		},
	}
	raw := "Static API endpoint https://api.example.com/v1/orders"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = wp.populateTemplate(raw, nil)
	}
}

func TestNode_PinnedDataBypass(t *testing.T) {
	pinnedJSON := `{"mockUser": "alice", "roles": ["admin"]}`
	pinnedStyle := "__PINNED__:" + pinnedJSON
	nodeID := "node-pinned-1"

	node := &proto.Node{
		Id:        nodeID,
		Nodetype:  "api", // normally would execute HTTP request
		Nodestyle: &pinnedStyle,
	}

	if !isNodePinned(node) {
		t.Fatalf("expected node to be recognized as pinned")
	}

	pinnedData := getPinnedData(node)
	mockMap, ok := pinnedData.(map[string]interface{})
	if !ok {
		t.Fatalf("expected pinned data to unmarshal into map, got %T", pinnedData)
	}
	if mockMap["mockUser"] != "alice" {
		t.Fatalf("expected mockUser 'alice', got %v", mockMap["mockUser"])
	}

	// Test in workflow execution: when pinned, it should immediately complete with pinned data and NOT call HTTP
	wp := &WorkflowProcessor{
		Workflow: &proto.Workflow{
			Id:    "pinned-wf-test",
			Nodes: []*proto.Node{node},
			Edges: []*proto.Edge{},
		},
		ProcessVariables: make(map[string]interface{}),
		ExecutedEdges:    make(map[string]bool),
		NodeVisitCount:   make(map[string]int),
	}

	err := wp.Process(nodeID)
	if err != nil {
		t.Fatalf("Process failed: %v", err)
	}

	// Verify OUTPUT variable is set to the pinned mock data
	out, exists := wp.ProcessVariables[OUTPUT]
	if !exists {
		t.Fatalf("expected OUTPUT variable to be set from pinned data")
	}
	outMap, ok := out.(map[string]interface{})
	if !ok || outMap["mockUser"] != "alice" {
		t.Fatalf("expected OUTPUT to match pinned mockUser, got %v", out)
	}
}

func TestCanvasNodes_StickyNoteAndVisualGroup(t *testing.T) {
	stickyNode := &proto.Node{
		Id:       "sticky-1",
		Nodetype: "stickyNote",
	}
	groupNode := &proto.Node{
		Id:       "group-1",
		Nodetype: "visualGroup",
	}

	wp := &WorkflowProcessor{
		Workflow: &proto.Workflow{
			Id:    "canvas-nodes-wf",
			Nodes: []*proto.Node{stickyNode, groupNode},
			Edges: []*proto.Edge{},
		},
		ProcessVariables: make(map[string]interface{}),
		ExecutedEdges:    make(map[string]bool),
		NodeVisitCount:   make(map[string]int),
	}

	if err := wp.Process("sticky-1"); err != nil {
		t.Fatalf("sticky note process failed: %v", err)
	}
	if err := wp.Process("group-1"); err != nil {
		t.Fatalf("visual group process failed: %v", err)
	}
}

func TestCodeNode_Execution(t *testing.T) {
	script := `
		console.log("Processing user data");
		const greeting = "Hello, " + $input.name + "!";
		return {
			greeting: greeting,
			doubled: $input.count * 2,
			active: true
		};
	`
	outVar := "custom_calc"
	codeNode := &proto.Node{
		Id:       "code-1",
		Nodetype: "code",
		Data: &proto.NodeData{
			Value:    &script,
			Variable: &outVar,
		},
	}

	wp := &WorkflowProcessor{
		Workflow: &proto.Workflow{
			Id:    "code-wf-test",
			Nodes: []*proto.Node{codeNode},
			Edges: []*proto.Edge{},
		},
		ProcessVariables: map[string]interface{}{
			OUTPUT: map[string]interface{}{
				"name":  "Alice",
				"count": 21,
			},
		},
		ExecutedEdges:  make(map[string]bool),
		NodeVisitCount: make(map[string]int),
	}

	err := wp.Process("code-1")
	if err != nil {
		t.Fatalf("CodeNodeProcess failed: %v", err)
	}

	out, exists := wp.ProcessVariables[OUTPUT]
	if !exists {
		t.Fatalf("expected OUTPUT to be set")
	}
	resMap, ok := out.(map[string]interface{})
	if !ok {
		t.Fatalf("expected map[string]interface{}, got %T", out)
	}
	if resMap["greeting"] != "Hello, Alice!" {
		t.Fatalf("unexpected greeting: %v", resMap["greeting"])
	}
	if resMap["doubled"] != int64(42) && resMap["doubled"] != float64(42) {
		t.Fatalf("unexpected doubled: %v", resMap["doubled"])
	}

	// Verify custom variable was also set
	if customOut, exists := wp.ProcessVariables["custom_calc"]; !exists || customOut == nil {
		t.Fatalf("expected custom_calc variable to be set")
	}
}

func TestCodeNode_TimeoutProtection(t *testing.T) {
	// Temporarily shorten default timeout for the unit test
	oldTimeout := DefaultCodeTimeout
	DefaultCodeTimeout = 50 * time.Millisecond
	defer func() { DefaultCodeTimeout = oldTimeout }()

	infiniteLoopScript := `
		let count = 0;
		while (true) {
			count++;
		}
	`
	codeNode := &proto.Node{
		Id:       "code-infinite",
		Nodetype: "code",
		Data: &proto.NodeData{
			Value: &infiniteLoopScript,
		},
	}

	wp := &WorkflowProcessor{
		Workflow: &proto.Workflow{
			Id:    "code-timeout-wf",
			Nodes: []*proto.Node{codeNode},
			Edges: []*proto.Edge{},
		},
		ProcessVariables: make(map[string]interface{}),
		ExecutedEdges:    make(map[string]bool),
		NodeVisitCount:   make(map[string]int),
	}

	err := wp.Process("code-infinite")
	if err == nil {
		t.Fatalf("expected infinite loop to fail with timeout error, but got nil")
	}
	if !strings.Contains(err.Error(), "timeout") && !strings.Contains(err.Error(), "interrupted") {
		t.Fatalf("expected error mentioning timeout/interrupted, got: %v", err)
	}
}


