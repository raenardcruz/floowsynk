package workflow

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/dop251/goja"
	proto "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
)

// DefaultCodeTimeout is the maximum execution duration for sandboxed JavaScript
var DefaultCodeTimeout = 5 * time.Second

// CodeNodeProcess executes user-defined JavaScript in a secure Goja sandbox.
// Inside the JS script, the following globals are accessible:
//   - $input / input: current node input data
//   - $vars / variables: map of workflow process variables
//   - $node: node metadata (id, type)
//   - console.log(...): logs to execution status
// Top-level 'return' is supported (automatically wrapped in an IIFE).
func (wp *WorkflowProcessor) CodeNodeProcess(node *proto.Node) (string, error) {
	var script string
	if node.Data != nil {
		if node.Data.Value != nil && *node.Data.Value != "" {
			script = *node.Data.Value
		} else if node.Data.Payload != nil && *node.Data.Payload != "" {
			script = *node.Data.Payload
		} else if node.Data.Template != nil && *node.Data.Template != "" {
			script = *node.Data.Template
		}
	}

	trimmedScript := strings.TrimSpace(script)
	if trimmedScript == "" {
		wp.UpdateStatus(node, proto.NodeStatus_COMPLETED, nil, "Empty script, skipping", true)
		return "", nil
	}

	vm := goja.New()

	// Capture console.log output
	var logs []string
	consoleObj := vm.NewObject()
	_ = consoleObj.Set("log", func(call goja.FunctionCall) goja.Value {
		var parts []string
		for _, arg := range call.Arguments {
			parts = append(parts, fmt.Sprint(arg.Export()))
		}
		logs = append(logs, strings.Join(parts, " "))
		return goja.Undefined()
	})
	_ = consoleObj.Set("warn", func(call goja.FunctionCall) goja.Value {
		var parts []string
		for _, arg := range call.Arguments {
			parts = append(parts, fmt.Sprint(arg.Export()))
		}
		logs = append(logs, "[WARN] "+strings.Join(parts, " "))
		return goja.Undefined()
	})
	_ = consoleObj.Set("error", func(call goja.FunctionCall) goja.Value {
		var parts []string
		for _, arg := range call.Arguments {
			parts = append(parts, fmt.Sprint(arg.Export()))
		}
		logs = append(logs, "[ERROR] "+strings.Join(parts, " "))
		return goja.Undefined()
	})
	_ = vm.Set("console", consoleObj)

	// Bind input
	wp.VariablesMu.RLock()
	inputVal := wp.ProcessVariables[INPUT]
	// Make a shallow copy of process variables to avoid concurrent map read/write in JS
	varsSnapshot := make(map[string]interface{}, len(wp.ProcessVariables))
	for k, v := range wp.ProcessVariables {
		varsSnapshot[k] = v
	}
	wp.VariablesMu.RUnlock()

	// Parse JSON string input if possible for easier manipulation in JS
	var parsedInput interface{} = inputVal
	if strInput, ok := inputVal.(string); ok && (strings.HasPrefix(strings.TrimSpace(strInput), "{") || strings.HasPrefix(strings.TrimSpace(strInput), "[")) {
		var j interface{}
		if err := json.Unmarshal([]byte(strInput), &j); err == nil {
			parsedInput = j
		}
	}

	_ = vm.Set("$input", parsedInput)
	_ = vm.Set("input", parsedInput)
	_ = vm.Set("$vars", varsSnapshot)
	_ = vm.Set("variables", varsSnapshot)
	_ = vm.Set("$node", map[string]interface{}{
		"id":       node.Id,
		"nodetype": node.Nodetype,
	})

	// Wrap in an IIFE if script contains 'return' and is not already wrapped in a function
	codeToRun := trimmedScript
	if strings.Contains(trimmedScript, "return") && !strings.HasPrefix(trimmedScript, "(") && !strings.HasPrefix(trimmedScript, "function") {
		codeToRun = fmt.Sprintf("(function() {\n%s\n})()", trimmedScript)
	}

	// Execution timeout protection
	timeLimit := DefaultCodeTimeout
	timer := time.AfterFunc(timeLimit, func() {
		vm.Interrupt(errors.New("execution timeout: script exceeded maximum allowed execution time"))
	})
	defer timer.Stop()

	val, err := vm.RunString(codeToRun)
	replayNode := CopyNode(node)

	if err != nil {
		errMsg := fmt.Sprintf("JavaScript execution error: %v", err)
		if len(logs) > 0 {
			errMsg += fmt.Sprintf(" (Logs: %s)", strings.Join(logs, "; "))
		}
		wp.UpdateStatus(&replayNode, proto.NodeStatus_FAILED, nil, errMsg, true)
		return "", errors.New(errMsg)
	}

	var output interface{}
	if val != nil && val != goja.Undefined() && val != goja.Null() {
		output = val.Export()
	}

	// Set output variables
	wp.setVariable(OUTPUT, output)
	if node.Data != nil && node.Data.Variable != nil && *node.Data.Variable != "" {
		wp.setVariable(*node.Data.Variable, output)
	}

	successMsg := "Code executed successfully"
	if len(logs) > 0 {
		successMsg += fmt.Sprintf(" [Logs: %s]", strings.Join(logs, "; "))
	}
	wp.UpdateStatus(&replayNode, proto.NodeStatus_COMPLETED, output, successMsg, true)
	return "", nil
}
