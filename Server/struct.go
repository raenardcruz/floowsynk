package main

import (
	"sync"
)

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

type WorkflowRunPayload struct {
	Nodes []Node `json:"nodes"`
	Edges []Edge `json:"edges"`
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
