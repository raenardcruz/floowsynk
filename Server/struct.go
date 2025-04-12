package main

import (
	db "github.com/raenardcruz/floowsynk/Database"
)

type NodeList []Node
type EdgeList []Edge
type KeyValueList []KeyValue
type Body map[string]interface{}

var jwtKey = []byte("secret_key")

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"` // Added role field
}

type Token struct {
	Token string `json:"token"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

type ValidateResults struct {
	id       string
	username string
	role     string
	message  string
	status   int
}

type StreamMessage struct {
	Event string     `json:"event"`
	Data  StreamData `json:"data"`
}

type StreamData struct {
	Obj string `json:"obj"`
}

type Workflow struct {
	Nodes NodeList `json:"nodes"`
	Edges EdgeList `json:"edges"`
}

type LogData struct {
	ProcessID string `json:"processId"`
	NodeID    string `json:"nodeId"`
	Message   string `json:"message"`
	Type      string `json:"type"`
}

type WorkflowProcessor struct {
	ProcessID        string
	Workflow         *Workflow
	Dbcon            *db.DatabaseConnection
	ProcessVariables map[string]interface{}
	ProcessResults   map[string]interface{}
	LoggingData      []LogData
}

type Node struct {
	Id    string                 `json:"id"`
	Type  string                 `json:"nodeType"`
	Label string                 `json:"label"`
	Data  map[string]interface{} `json:"data"`
}

type Edge struct {
	Id           string `json:"id"`
	Source       string `json:"source"`
	SourceHandle string `json:"sourceHandle"`
	Target       string `json:"target"`
}

type KeyValue struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type CurrentNode struct {
	Id string `json:"id"`
}

type ReplayData struct {
	NodeID string                 `json:"nodeId"`
	Data   map[string]interface{} `json:"data"`
}

const (
	Success    = "success"
	Failed     = "failed"
	InProgress = "inProgress"
)
