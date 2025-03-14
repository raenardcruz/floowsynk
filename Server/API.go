package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/raenardcruz/floowsynk/proto"
)

var jwtKey = []byte("secret_key")
var dbcon DBConnection

func (s *LoginServer) Login(ctx context.Context, in *proto.Credential) (*proto.Token, error) {
	token, err := Login(in.Username, in.Password)
	if err != nil {
		return nil, err
	}
	return &proto.Token{
		Token: token,
	}, nil
}

func (s *LoginServer) ExtendToken(ctx context.Context, _ *proto.Empty) (token *proto.Token, err error) {
	oldToken, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	newToken, err := ExtendToken(oldToken)
	if err != nil {
		return nil, err
	}
	token = &proto.Token{Token: newToken}
	return token, nil
}

func (s *WorkflowServer) GetWorkflow(ctx context.Context, req *proto.GetWorkflowRequest) (workflow *proto.Workflow, err error) {
	token, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	validateResults := validateToken(token)
	if validateResults.status != http.StatusOK {
		return nil, fmt.Errorf(validateResults.message)
	}
	workflow, err = GetWorkflow(req.Id)
	if err != nil {
		return nil, err
	}
	return workflow, nil
}

func (s *WorkflowServer) ListWorkflows(ctx context.Context, req *proto.PageRequest) (wl *proto.WorkflowList, err error) {
	token, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	validateResults := validateToken(token)
	if validateResults.status != http.StatusOK {
		return nil, fmt.Errorf(validateResults.message)
	}
	wl, err = ListWorkflows(req.Offset, req.Limit)
	if err != nil {
		return nil, err
	}
	return wl, nil
}

// API Methods --------------------------------------------------------------------------------------------------------

// func (dbcon *DBConnection) PostWorkflow(c *gin.Context) {
// 	ValidateResults := validateToken("'")
// 	if ValidateResults.status != http.StatusOK {
// 		c.JSON(ValidateResults.status, gin.H{"error": ValidateResults.message})
// 		return
// 	}
// 	var workflow db.WorkflowModel
// 	if err := c.ShouldBindJSON(&workflow); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}
// 	workflow.CreatedBy = ValidateResults.id
// 	workflow.UpdatedBy = ValidateResults.id

// 	if _, err := dbcon.DB.CreateWorkflow(workflow); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusCreated, workflow)
// }

// func (dbcon *DBConnection) UpdateWorkflow(c *gin.Context) {
// 	ValidateResults := validateToken("")
// 	if ValidateResults.status != http.StatusOK {
// 		c.JSON(ValidateResults.status, gin.H{"error": ValidateResults.message})
// 		return
// 	}
// 	id := c.Params.ByName("id")

// 	var workflow db.WorkflowModel
// 	if err := c.ShouldBindJSON(&workflow); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}
// 	workflow.ID = id
// 	workflow.UpdatedBy = ValidateResults.id

// 	if err := dbcon.DB.UpdateWorkflow(workflow); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}
// 	c.JSON(http.StatusOK, workflow)
// }

// func (dbcon *DBConnection) DeleteWorkflow(c *gin.Context) {
// 	ValidateResults := validateToken("")
// 	if ValidateResults.status != http.StatusOK {
// 		c.JSON(ValidateResults.status, gin.H{"error": ValidateResults.message})
// 		return
// 	}
// 	id := c.Params.ByName("id")

// 	if err := dbcon.DB.DeleteWorkflow(id); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}
// 	c.JSON(http.StatusOK, gin.H{"message": "Workflow deleted"})
// }

// func SseHandler(c *gin.Context) {
// 	id := c.Params.ByName("id")

// 	eventStream.mu.Lock()
// 	_, ok := eventStream.clients[id]
// 	eventStream.mu.Unlock()

// 	if !ok {
// 		eventStream.addClient(id)
// 	}

// 	c.Writer.Header().Set("Content-Type", "text/event-stream")
// 	c.Writer.Header().Set("Cache-Control", "no-cache")
// 	c.Writer.Header().Set("Connection", "keep-alive")
// 	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

// 	clientChan := eventStream.clients[id]
// 	for {
// 		select {
// 		case msg := <-clientChan:
// 			c.Writer.Write([]byte("event: " + msg.Event + "\n"))
// 			c.Writer.Write([]byte("data: " + msg.Data.Obj + "\n\n"))
// 			c.Writer.Flush()
// 		case <-c.Writer.CloseNotify():
// 			eventStream.removeClient(id)
// 			return
// 		case <-c.Request.Context().Done():
// 			eventStream.removeClient(id)
// 			return
// 		}
// 	}
// }

// func (dbcon *DBConnection) RunWorkflow(c *gin.Context) {
// 	ValidateResults := validateToken("")
// 	if ValidateResults.status != http.StatusOK {
// 		c.JSON(ValidateResults.status, gin.H{"error": ValidateResults.message})
// 		return
// 	}
// 	id := c.Params.ByName("id")

// 	var payload Workflow
// 	if err := c.ShouldBindJSON(&payload); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}
// 	workflowProcessor := WorkflowProcessor{
// 		ProcessID:        id,
// 		Workflow:         &payload,
// 		Dbcon:            dbcon,
// 		ProcessVariables: make(map[string]interface{}),
// 		ProcessResults:   make(map[string]interface{}),
// 		LoggingData:      make([]LogData, 0),
// 	}
// 	go func() {
// 		workflowProcessor.StartWorkflow()
// 	}()

// 	c.JSON(http.StatusOK, gin.H{"message": "Workflow run started"})
// }
