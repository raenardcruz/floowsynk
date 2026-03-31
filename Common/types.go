package Common

type ArrayDataType int

const (
	STRING   ArrayDataType = 0
	INT      ArrayDataType = 1
	BOOL     ArrayDataType = 2
	KEYVALUE ArrayDataType = 3
)

type NodeStatus int

const (
	RUNNING   NodeStatus = 0
	COMPLETED NodeStatus = 1
	FAILED    NodeStatus = 2
	INFO      NodeStatus = 3
)

type Credential struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type Token struct {
	Token string `json:"token"`
}

type RunWorkflowIdRequest struct {
	Id string `json:"id"`
}

type WorkflowHistory struct {
	Id           string `json:"id"`
	WorkflowId   string `json:"workflowId"`
	WorkflowName string `json:"workflowName"`
	RunDate      string `json:"runDate"`
}

type WorkflowHistoryList struct {
	History []*WorkflowHistory `json:"history"`
}

type WorkflowHistoryRequest struct {
	Id string `json:"id"`
}

type ReplayData struct {
	NodeId    string            `json:"nodeId"`
	Data      *NodeData         `json:"data"`
	Variables map[string]string `json:"variables"`
	Status    NodeStatus        `json:"status"`
	Message   string            `json:"message"`
}

type WorkflowHistoryResponse struct {
	Data []*ReplayData `json:"data"`
}

type PageRequest struct {
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
}

type GetWorkflowRequest struct {
	Id string `json:"id"`
}

type WorkflowList struct {
	Total     int         `json:"total"`
	Workflows []*Workflow `json:"workflows"`
}

type Workflow struct {
	Id          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Nodes       []*Node  `json:"nodes"`
	Edges       []*Edge  `json:"edges"`
	Type        string   `json:"type"`
	CreatedAt   string   `json:"createdAt"`
	UpdatedAt   string   `json:"updatedAt"`
	CreatedBy   string   `json:"createdBy"`
	UpdatedBy   string   `json:"updatedBy"`
	Tags        []string `json:"tags"`
	IsNew       bool     `json:"isNew"`
}

type Edge struct {
	Id           string `json:"id"`
	Type         string `json:"type"`
	Label        string `json:"label"`
	Tabid        string `json:"tabid"`
	Source       string `json:"source"`
	Target       string `json:"target"`
	SourceX      float32 `json:"sourcex"`
	SourceY      float32 `json:"sourcey"`
	TargetX      float32 `json:"targetx"`
	TargetY      float32 `json:"targety"`
	Animated     bool   `json:"animated"`
	SourceNode   *Node  `json:"sourcenode"`
	TargetNode   *Node  `json:"targetnode"`
	SourceHandle string `json:"sourcehandle"`
	TargetHandle string `json:"targethandle"`
}

type Node struct {
	Id               string             `json:"id"`
	Nodetype         string             `json:"nodetype"`
	Label            string             `json:"label"`
	Data             *NodeData          `json:"data"`
	Group            []int32            `json:"group"`
	Nodestyle        string             `json:"nodestyle"`
	Inputs           []string           `json:"inputs"`
	Outputs          []string           `json:"outputs"`
	Draggable        bool               `json:"draggable"`
	Icon             *NodeIcon          `json:"icon"`
	Position         *NodePosition      `json:"position"`
	Nodestatus       string             `json:"nodestatus"`
	Type             string             `json:"type"`
	Dimensions       *NodeDimensions    `json:"dimensions"`
	HandleBounds     *NodeHandleBounds  `json:"handleBounds"`
	ComputedPosition *NodePosition      `json:"computedPosition"`
}

type NodeData struct {
	Name         string         `json:"name,omitempty"`
	Value        string         `json:"value,omitempty"`
	Expression   string         `json:"expression,omitempty"`
	Iteration    int32          `json:"iteration,omitempty"`
	ListVar      string         `json:"listvar,omitempty"`
	Limit        int32          `json:"limit,omitempty"`
	Url          string         `json:"url,omitempty"`
	Method       string         `json:"method,omitempty"`
	Headers      *NodeDataArray `json:"headers,omitempty"`
	Payload      string         `json:"payload,omitempty"`
	Variable     string         `json:"variable,omitempty"`
	Message      string         `json:"message,omitempty"`
	List         *NodeDataArray `json:"list,omitempty"`
	ListVariable string         `json:"listVariable,omitempty"`
	Template     string         `json:"template,omitempty"`
	Text         string         `json:"text,omitempty"`
	Pattern      string         `json:"pattern,omitempty"`
	ReplaceText  string         `json:"replaceText,omitempty"`
	SubProcessId string         `json:"subProcessId,omitempty"`
	Type         string         `json:"type,omitempty"`
	Interval     int32          `json:"interval,omitempty"`
	Weeks        *NodeDataArray `json:"weeks,omitempty"`
}

type NodeDataArray struct {
	Type          ArrayDataType `json:"type"`
	KeyValueItems []*KeyValue   `json:"keyValueItems,omitempty"`
	StringItems   []string      `json:"stringItems,omitempty"`
	IntItems      []int32       `json:"intItems,omitempty"`
	BoolItems     []bool        `json:"boolItems,omitempty"`
}

type NodeIcon struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

type NodeDimensions struct {
	Width  float32 `json:"width"`
	Height float32 `json:"height"`
}

type NodePosition struct {
	X float32 `json:"x"`
	Y float32 `json:"y"`
	Z int32   `json:"z,omitempty"`
}

type KeyValue struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type NodeHandleBounds struct {
	Source []*Handle `json:"source"`
	Target []*Handle `json:"target"`
}

type Handle struct {
	X        float32 `json:"x"`
	Y        float32 `json:"y"`
	Id       string `json:"id"`
	Type     string `json:"type"`
	Width    float32 `json:"width"`
	Height   float32 `json:"height"`
	NodeId   string `json:"nodeId"`
	Position string `json:"position"`
}

type ValidateResults struct {
	Id       string
	Username string
	Role     string
	Status   int
	Message  string
}
