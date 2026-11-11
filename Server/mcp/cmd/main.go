package main

import (
	"log"

	db "github.com/raenardcruz/floowsynk/Database"
	"github.com/raenardcruz/floowsynk/Server/mcp"
	"github.com/raenardcruz/floowsynk/Server/workflow"
)

func main() {
	dbConn, err := db.ConnectToDatabase()
	if err != nil {
		log.Printf("Warning: database connection not available: %v", err)
	}
	_ = workflow.LoadConnectorTemplates("connectors/templates")

	server := mcp.NewServer(dbConn, nil)
	server.RunStdio()
}
