package workflow

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"regexp"
	"strings"
	"text/template"
	"time"

	"github.com/google/uuid"
	"github.com/raenardcruz/floowsynk/Broker"
	"github.com/raenardcruz/floowsynk/Broker/kafka"
	proto "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
	DB "github.com/raenardcruz/floowsynk/Database"
)

func (wp *WorkflowProcessor) UpdateStatus(node *proto.Node, status proto.NodeStatus, output interface{}, message string, includeReplayData bool) {
	if (output != nil) && (status == proto.NodeStatus_COMPLETED || status == proto.NodeStatus_FAILED) {
		wp.VariablesMu.Lock()
		if wp.ProcessVariables == nil {
			wp.ProcessVariables = make(map[string]interface{})
		}
		switch v := output.(type) {
		case string:
			wp.ProcessVariables[OUTPUT] = v
		case []interface{}:
			wp.ProcessVariables[OUTPUT] = v
		case map[string]interface{}:
			wp.ProcessVariables[OUTPUT] = v
		case float64, int, int32, int64, bool:
			wp.ProcessVariables[OUTPUT] = fmt.Sprintf("%v", v)
		default:
			outputBytes, err := json.MarshalIndent(output, "", "  ")
			if err != nil {
				wp.ProcessVariables[OUTPUT] = fmt.Sprintf("error marshaling output: %v", err)
			} else {
				wp.ProcessVariables[OUTPUT] = string(outputBytes)
			}
		}
		if node != nil && node.Id != "" {
			wp.ProcessVariables[fmt.Sprintf("node_%s", node.Id)] = output
		}
		wp.VariablesMu.Unlock()
	}

	res := &proto.ReplayData{
		NodeId:  node.Id,
		Status:  status,
		Message: message,
	}
	if includeReplayData {
		res.Variables = wp.getVariableMapString()
		res.Data = node.Data
	}

	if wp.Stream != nil {
		wp.Stream.SendMsg(res)
	}

	// DB Record format - save step to DB if it has replay data / message or is completed/failed/info
	if includeReplayData || message != "" || status != proto.NodeStatus_RUNNING {
		data, err := json.Marshal(res.Data)
		if err != nil {
			fmt.Printf("Error marshaling RunWorkflowResponse: %v\n", err)
			return
		}
		variables, err := json.Marshal(res.Variables)
		if err != nil {
			fmt.Printf("Error marshaling RunWorkflowResponse: %v\n", err)
			return
		}
		env := DB.ResolveEnvName(wp.Workflow.Environment)
		dbRD := DB.ReplayData{
			ID:              uuid.NewString(),
			ProcessID:       wp.ID,
			WorkflowID:      wp.Workflow.Id,
			NodeID:          res.NodeId,
			Data:            data,
			Variables:       variables,
			Status:          int32(res.Status),
			Message:         res.Message,
			ProcessSequence: int(wp.Step),
			CreatedAt:       time.Now().UTC().Unix(),
			Environment:     env,
		}
		rdBytes, err := json.Marshal(dbRD)
		if err == nil {
			if wp.Producer != nil && *wp.Producer != nil {
				kafka.SendMessage(*wp.Producer, Broker.WORKFLOW_REPLAY_DATA, wp.ID, string(rdBytes))
			}
			if _, err := wp.DBcon.CreateReplayDataEnv(&dbRD, env); err != nil {
				fmt.Printf("Error saving replay data to DB (%s): %v\n", env, err)
			}
		}
	}
}

func (wp *WorkflowProcessor) getVariableMapString() map[string]string {
	wp.VariablesMu.RLock()
	defer wp.VariablesMu.RUnlock()
	variableMap := make(map[string]string)
	for k, v := range wp.ProcessVariables {
		switch value := v.(type) {
		case string:
			variableMap[k] = value
		case float64, int, int32, int64, bool:
			variableMap[k] = fmt.Sprintf("%v", value)
		default:
			outputBytes, err := json.Marshal(value)
			if err != nil {
				variableMap[k] = fmt.Sprintf("error marshaling value: %v", err)
			} else {
				variableMap[k] = string(outputBytes)
			}
		}
	}
	return variableMap
}

func (wp *WorkflowProcessor) getVariable(key string) (interface{}, bool) {
	wp.VariablesMu.RLock()
	defer wp.VariablesMu.RUnlock()
	if wp.ProcessVariables == nil {
		return nil, false
	}
	val, ok := wp.ProcessVariables[key]
	return val, ok
}

func (wp *WorkflowProcessor) setVariable(varName string, value interface{}) error {
	if varName == "" {
		return fmt.Errorf("variable name is empty")
	}
	wp.VariablesMu.Lock()
	defer wp.VariablesMu.Unlock()
	if wp.ProcessVariables == nil {
		wp.ProcessVariables = make(map[string]interface{})
	}
	wp.ProcessVariables[varName] = value
	return nil
}

func getEdgeKey(edge *proto.Edge) string {
	if edge.Id != "" {
		return edge.Id
	}
	return fmt.Sprintf("%s:%s->%s", edge.Source, edge.Sourcehandle, edge.Target)
}

func (wp *WorkflowProcessor) canReach(fromId, toId string) bool {
	if wp.Workflow == nil || fromId == toId {
		return true
	}
	visited := make(map[string]bool)
	queue := []string{fromId}
	visited[fromId] = true

	for len(queue) > 0 {
		curr := queue[0]
		queue = queue[1:]
		for _, edge := range wp.Workflow.Edges {
			if edge.Source == curr {
				if edge.Target == toId {
					return true
				}
				if !visited[edge.Target] {
					visited[edge.Target] = true
					queue = append(queue, edge.Target)
				}
			}
		}
	}
	return false
}

func (wp *WorkflowProcessor) getNonLoopIncomingEdges(targetId string) []*proto.Edge {
	var incoming []*proto.Edge
	if wp.Workflow == nil {
		return incoming
	}
	for _, edge := range wp.Workflow.Edges {
		if edge.Target == targetId {
			// If target can reach edge.Source, this is a loop/cycle back-edge
			if edge.Source == targetId || wp.canReach(targetId, edge.Source) {
				continue
			}
			incoming = append(incoming, edge)
		}
	}
	return incoming
}

func (wp *WorkflowProcessor) isEdgeActiveOrPending(edge *proto.Edge, visited map[string]bool) bool {
	edgeKey := getEdgeKey(edge)
	if wp.ExecutedEdges != nil && wp.ExecutedEdges[edgeKey] {
		return true
	}
	src := edge.Source
	if wp.NodeVisitCount != nil && wp.NodeVisitCount[src] > 0 {
		return false
	}
	if visited[src] {
		return false
	}
	visited[src] = true

	if wp.Workflow == nil {
		return false
	}

	for _, inEdge := range wp.Workflow.Edges {
		if inEdge.Target == src {
			// Don't trace back through cycles
			if inEdge.Source == src || wp.canReach(src, inEdge.Source) {
				continue
			}
			if wp.isEdgeActiveOrPending(inEdge, visited) {
				return true
			}
		}
	}
	return false
}

func (wp *WorkflowProcessor) isJoinReady(targetId string) bool {
	nonLoopIncoming := wp.getNonLoopIncomingEdges(targetId)
	if len(nonLoopIncoming) <= 1 {
		return true
	}

	activeCount := 0
	arrivedCount := 0

	for _, inEdge := range nonLoopIncoming {
		edgeKey := getEdgeKey(inEdge)
		arrived := wp.ExecutedEdges != nil && wp.ExecutedEdges[edgeKey]
		if arrived {
			arrivedCount++
			activeCount++
		} else {
			visited := make(map[string]bool)
			if wp.isEdgeActiveOrPending(inEdge, visited) {
				activeCount++
			}
		}
	}

	return activeCount > 0 && arrivedCount >= activeCount
}

func (wp *WorkflowProcessor) nextProcess(nodeId string, sourceHandle string) error {
	wp.Step = wp.Step + 1
	if wp.MaxStepLimit > 0 && int(wp.Step) > wp.MaxStepLimit {
		return fmt.Errorf("workflow execution exceeded max step limit of %d", wp.MaxStepLimit)
	}
	if wp.ExecutedEdges == nil {
		wp.ExecutedEdges = make(map[string]bool)
	}

	if wp.Workflow != nil {
		for _, edge := range wp.Workflow.Edges {
			if edge.Source == nodeId && (sourceHandle == "" || edge.Sourcehandle == sourceHandle) {
				edgeKey := getEdgeKey(edge)
				wp.ExecutedEdges[edgeKey] = true
			}
		}
	}

	targets, ok := wp.GetNextNodes(nodeId, sourceHandle)
	if !ok {
		return nil
	}
	seenTargets := make(map[string]bool)
	for _, target := range targets {
		if seenTargets[target.Id] {
			continue
		}
		seenTargets[target.Id] = true
		if err := wp.Process(target.Id); err != nil {
			return err
		}
	}
	return nil
}

func getNodeById(n []*proto.Node, id string) (*proto.Node, bool) {
	for _, node := range n {
		if node.Id == id {
			return node, true
		}
	}
	return nil, false
}

func (wp *WorkflowProcessor) GetNextNodes(nodeId string, sourceHandle string) ([]*proto.Node, bool) {
	edges := wp.Workflow.Edges
	targets := make([]*proto.Node, 0)
	for _, edge := range edges {
		if edge.Source == nodeId && (sourceHandle == "" || edge.Sourcehandle == sourceHandle) {
			node, ok := getNodeById(wp.Workflow.Nodes, edge.Target)
			if !ok {
				return nil, false
			}
			targets = append(targets, node)
		}
	}
	return targets, len(targets) > 0
}

func (wp *WorkflowProcessor) populateTemplate(text string, data map[string]interface{}) string {
	joinedMap := make(map[string]interface{})
	wp.VariablesMu.RLock()
	for k, v := range wp.ProcessVariables {
		joinedMap[k] = v
	}
	wp.VariablesMu.RUnlock()
	for k, v := range data {
		joinedMap[k] = v
	}

	funcMap := template.FuncMap{
		"toJSON": func(v interface{}) (string, error) {
			if str, ok := v.(string); ok {
				var js json.RawMessage
				if err := json.Unmarshal([]byte(str), &js); err == nil {
					return str, nil
				}
			}
			b, err := json.Marshal(v)
			if err != nil {
				return "", err
			}
			return string(b), nil
		},
		"toJson": func(v interface{}) (string, error) {
			if str, ok := v.(string); ok {
				var js json.RawMessage
				if err := json.Unmarshal([]byte(str), &js); err == nil {
					return str, nil
				}
			}
			b, err := json.Marshal(v)
			if err != nil {
				return "", err
			}
			return string(b), nil
		},
	}

	tmpl, err := template.New("template").Funcs(funcMap).Option("missingkey=zero").Parse(text)
	if err != nil {
		return text
	}
	var builder strings.Builder
	if err := tmpl.Execute(&builder, joinedMap); err != nil {
		return text
	}
	return builder.String()
}

func generateGUID() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "00000000-0000-0000-0000-000000000000"
	}
	return hex.EncodeToString(bytes)
}

func isSSRFBlockedIP(ip net.IP) bool {
	if os.Getenv("ALLOW_PRIVATE_NETWORKS") == "true" {
		return false
	}
	if ip4 := ip.To4(); ip4 != nil {
		ip = ip4
	}
	if ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsPrivate() || ip.IsUnspecified() {
		return true
	}
	return false
}

func NewSafeHTTPClient(timeout time.Duration) *http.Client {
	if timeout <= 0 {
		timeout = 30 * time.Second
	}

	dialer := &net.Dialer{
		Timeout:   timeout,
		KeepAlive: 30 * time.Second,
	}

	transport := &http.Transport{
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			host, _, err := net.SplitHostPort(addr)
			if err != nil {
				host = addr
			}

			var ips []net.IP
			if ip := net.ParseIP(host); ip != nil {
				ips = []net.IP{ip}
			} else {
				addrs, err := net.DefaultResolver.LookupIPAddr(ctx, host)
				if err != nil {
					return nil, err
				}
				for _, a := range addrs {
					ips = append(ips, a.IP)
				}
			}

			if len(ips) == 0 {
				return nil, fmt.Errorf("SSRF protection: no IP addresses found for host %s", host)
			}

			for _, ip := range ips {
				if isSSRFBlockedIP(ip) {
					return nil, fmt.Errorf("SSRF protection: access to blocked IP %s (%s) is prohibited", ip.String(), host)
				}
			}

			return dialer.DialContext(ctx, network, addr)
		},
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          100,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}

	return &http.Client{
		Transport: transport,
		Timeout:   timeout,
	}
}

func (wp *WorkflowProcessor) makeRequest(url string, method string, headers []*proto.KeyValue, payload interface{}) (body interface{}, err error) {
	client := NewSafeHTTPClient(30 * time.Second)
	var req *http.Request

	if payload != nil {
		var payloadBytes []byte
		if str, ok := payload.(string); ok {
			payloadBytes = []byte(str)
		} else {
			var err error
			payloadBytes, err = json.Marshal(payload)
			if err != nil {
				return nil, err
			}
		}
		req, err = http.NewRequest(method, url, strings.NewReader(string(payloadBytes)))
		if err != nil {
			return nil, err
		}
		req.Header.Set("Content-Type", "application/json")
	} else {
		req, err = http.NewRequest(method, url, nil)
		if err != nil {
			return nil, err
		}
	}

	for _, header := range headers {
		req.Header.Add(header.Key, header.Value)
	}

	if req.Header.Get("User-Agent") == "" {
		req.Header.Set("User-Agent", "Floowsynk-App")
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	wp.setVariable("api.status", resp.StatusCode)
	wp.setVariable("api.headers", resp.Header)
	wp.setVariable("api.length", resp.ContentLength)

	bodyBytes, err := io.ReadAll(io.LimitReader(resp.Body, 25*1024*1024))
	if err != nil {
		return nil, err
	}

	var jsonBody interface{}
	if err := json.Unmarshal(bodyBytes, &jsonBody); err == nil {
		wp.setVariable("api.body", jsonBody)
		if resp.StatusCode >= 400 {
			return jsonBody, fmt.Errorf("HTTP request failed with status code %d", resp.StatusCode)
		}
		return jsonBody, nil
	}

	strBody := string(bodyBytes)
	wp.setVariable("api.body", strBody)
	if resp.StatusCode >= 400 {
		return strBody, fmt.Errorf("HTTP request failed with status code %d: %s", resp.StatusCode, strBody)
	}
	return strBody, nil
}

func RegexReplaceAll(text, pattern, replaceText string) (string, error) {
	re, err := regexp.Compile(pattern)
	if err != nil {
		return "", err
	}
	return re.ReplaceAllString(text, replaceText), nil
}

func CopyNode(n *proto.Node) proto.Node {
	data, err := json.Marshal(n)
	if err != nil {
		return proto.Node{}
	}
	var newNode proto.Node
	err = json.Unmarshal(data, &newNode)
	if err != nil {
		return proto.Node{}
	}
	return newNode
}
