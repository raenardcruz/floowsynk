package main

import (
	"sync"

	"github.com/raenardcruz/floowsynk/db"
)

type NodeList []Node
type EdgeList []Edge
type KeyValueList []KeyValue
type Body map[string]interface{}

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

type EventStream struct {
	clients map[string]chan string
	mu      sync.Mutex
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
	Dbcon            *DBConnection
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

type DBConnection struct {
	*db.DB
}
