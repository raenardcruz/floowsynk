package main

import (
	"encoding/json"
	"errors"
	"log"
)

var (
	ErrInvalidHeaderData = errors.New("invalid header data format")
	ErrInvalidPayload    = errors.New("invalid payload format")
	ErrInvalidListData   = errors.New("invalid list data format")
	ErrJSONParse         = errors.New("failed to parse JSON data")
)

// BuildJsonSteps converts workflow nodes and edges into a JSON-compatible structure.
// It recursively builds the workflow steps based on node connections.
func BuildJsonSteps(nodes []Node, edges []Edge, source string, transformedObj []interface{}, sourceHandle string) []interface{} {
	return buildJsonStepsWithProcessed(nodes, edges, source, transformedObj, sourceHandle, make(map[string]bool))
}

func buildJsonStepsWithProcessed(nodes []Node, edges []Edge, source string, transformedObj []interface{}, sourceHandle string, processedNodes map[string]bool) []interface{} {
	if transformedObj == nil {
		transformedObj = make([]interface{}, 0)
	}

	targetResult := make([]Edge, 0)
	for _, edge := range edges {
		if edge.Source == source && edge.SourceHandle == sourceHandle {
			targetResult = append(targetResult, edge)
		}
	}

	if len(targetResult) == 0 {
		return transformedObj
	}

	for _, targetObj := range targetResult {
		target := targetObj.Target

		// Skip if node was already processed
		if processedNodes[target] {
			continue
		}

		filteredNodes := make([]Node, 0)
		for _, node := range nodes {
			if node.Id == target {
				filteredNodes = append(filteredNodes, node)
			}
		}

		for _, node := range filteredNodes {
			step, err := buildStepObject(node, nodes, edges, target, processedNodes)
			if err != nil {
				log.Printf("Error: failed to build step object for node %s: %v", node.Id, err)
				break
			}
			transformedObj = append(transformedObj, step)
			processedNodes[target] = true
			transformedObj = buildJsonStepsWithProcessed(nodes, edges, target, transformedObj, targetObj.SourceHandle, processedNodes)
		}
	}

	return transformedObj
}

// buildStepObject creates a map representing a single workflow step
func buildStepObject(node Node, nodes []Node, edges []Edge, target string, processedNodes map[string]bool) (map[string]interface{}, error) {
	stepObj := map[string]interface{}{
		"id":    node.Id,
		"step":  node.Type,
		"label": node.Label,
	}

	switch node.Type {
	case "setVariable":
		stepObj["name"] = node.Data["name"]
		stepObj["value"] = node.Data["value"]
	case "condition":
		stepObj["expression"] = node.Data["expression"]
		stepObj["outputTrue"] = buildJsonStepsWithProcessed(nodes, edges, target, make([]interface{}, 0), "outputTrue", processedNodes)
		stepObj["outputFalse"] = buildJsonStepsWithProcessed(nodes, edges, target, make([]interface{}, 0), "outputFalse", processedNodes)
	case "loop":
		stepObj["times"] = node.Data["times"]
		stepObj["output"] = buildJsonStepsWithProcessed(nodes, edges, target, make([]interface{}, 0), "output", processedNodes)
	case "foreach":
		stepObj["list"] = node.Data["list"]
		stepObj["output"] = buildJsonStepsWithProcessed(nodes, edges, target, make([]interface{}, 0), "output", processedNodes)
	case "while":
		stepObj["limit"] = node.Data["limit"]
		stepObj["expression"] = node.Data["expression"]
		stepObj["output"] = buildJsonStepsWithProcessed(nodes, edges, target, make([]interface{}, 0), "output", processedNodes)
	case "api":
		headers, err := buildHeaderJSON(node.Data["headers"])
		if err != nil {
			return nil, errors.Join(err, errors.New("failed to build headers"))
		}
		stepObj["headers"] = headers

		contentType, ok := extractContentType(node.Data["headers"])
		if !ok {
			log.Printf("Warning: missing content-type header for node %s", node.Id)
			return nil, errors.New("missing content-type header")
		}

		payload, err := buildPayload(node.Data["payload"], contentType)
		if err != nil {
			return nil, errors.Join(err, errors.New("failed to build payload"))
		}
		stepObj["payload"] = payload
		stepObj["url"] = node.Data["url"]
		stepObj["method"] = node.Data["method"]
		stepObj["variable"] = node.Data["variable"]
	case "log":
		stepObj["message"] = node.Data["message"]
	case "getGuid":
		stepObj["variable"] = node.Data["variable"]
	case "text":
		stepObj["message"] = node.Data["message"]
		stepObj["variable"] = node.Data["variable"]
	case "math":
		stepObj["expression"] = node.Data["expression"]
		stepObj["variable"] = node.Data["variable"]
	case "list":
		listObj, err := buildListObject(node.Data["list"], node.Data["type"].(string))
		if err != nil {
			return nil, errors.Join(err, errors.New("failed to build list object"))
		}
		stepObj["list"] = listObj
		stepObj["variable"] = node.Data["variable"]
	case "count":
		stepObj["list"] = node.Data["list"]
		stepObj["variable"] = node.Data["variable"]
	case "map":
		stepObj["list"] = node.Data["list"]
		stepObj["template"] = node.Data["template"]
		stepObj["variable"] = node.Data["variable"]
	case "replace":
		stepObj["text"] = node.Data["text"]
		stepObj["pattern"] = node.Data["pattern"]
		stepObj["replaceText"] = node.Data["replaceText"]
		stepObj["variable"] = node.Data["variable"]
	case "regexfind":
		stepObj["text"] = node.Data["text"]
		stepObj["pattern"] = node.Data["pattern"]
		stepObj["variable"] = node.Data["variable"]
	case "image":
		stepObj["value"] = node.Data["value"]
	case "subprocess":
		stepObj["value"] = node.Data["value"]
	}

	return stepObj, nil
}

func extractContentType(headers interface{}) (string, bool) {
	headerSlice, ok := headers.([]interface{})
	if !ok {
		return "", false
	}

	for _, header := range headerSlice {
		headerMap, ok := header.(map[string]interface{})
		if !ok {
			continue
		}

		key, _ := headerMap["key"].(string)
		if key == "Content-Type" {
			value, ok := headerMap["value"].(string)
			return value, ok
		}
	}

	return "", false
}

func buildHeaderJSON(data interface{}) (map[string]interface{}, error) {
	headers := make(map[string]interface{})

	headerSlice, ok := data.([]interface{})
	if !ok {
		log.Printf("Warning: invalid header data type: %T", data)
		return nil, ErrInvalidHeaderData
	}

	for _, header := range headerSlice {
		headerMap, ok := header.(map[string]interface{})
		if !ok {
			return nil, ErrInvalidHeaderData
		}

		key, ok := headerMap["key"].(string)
		if !ok {
			return nil, ErrInvalidHeaderData
		}
		headers[key] = headerMap["value"]
	}

	return headers, nil
}

func buildPayload(payload interface{}, contentType string) (interface{}, error) {
	if contentType != "application/x-www-form-urlencoded" && contentType != "multipart/form-data" {
		return payload, nil
	}

	payloadSlice, ok := payload.([]interface{})
	if !ok {
		log.Printf("Warning: invalid payload data type: %T", payload)
		return nil, ErrInvalidPayload
	}

	formData := make(map[string]interface{})
	for _, item := range payloadSlice {
		itemMap, ok := item.(map[string]interface{})
		if !ok {
			return nil, ErrInvalidPayload
		}

		key, ok := itemMap["key"].(string)
		if !ok {
			return nil, ErrInvalidPayload
		}
		formData[key] = itemMap["value"]
	}

	return formData, nil
}

func buildListObject(list interface{}, typeStr string) (interface{}, error) {
	listSlice, ok := list.([]interface{})
	if !ok {
		log.Printf("Warning: invalid list data type: %T", list)
		return nil, ErrInvalidListData
	}

	result := make([]interface{}, 0, len(listSlice))

	if typeStr == "object" {
		for i, item := range listSlice {
			itemMap, ok := item.(map[string]interface{})
			if !ok {
				log.Printf("Warning: invalid list item type at index %d: %T", i, item)
				return nil, ErrInvalidListData
			}

			value, ok := itemMap["value"].(string)
			if !ok {
				log.Printf("Warning: invalid value type in list item at index %d", i)
				return nil, ErrInvalidListData
			}

			var parsedObj map[string]interface{}
			if err := json.Unmarshal([]byte(value), &parsedObj); err != nil {
				log.Printf("Warning: failed to parse JSON at index %d: %v", i, err)
				return nil, errors.Join(ErrJSONParse, err)
			}
			result = append(result, parsedObj)
		}
		return result, nil
	}

	for _, item := range listSlice {
		itemMap, ok := item.(map[string]interface{})
		if !ok {
			return nil, ErrInvalidListData
		}
		result = append(result, itemMap["value"])
	}

	return result, nil
}
