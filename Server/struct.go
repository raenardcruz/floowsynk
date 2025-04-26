package main

type NodeList []Node
type EdgeList []Edge

var jwtKey = []byte("secret_key")

type ValidateResults struct {
	id       string
	username string
	role     string
	message  string
	status   int
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
