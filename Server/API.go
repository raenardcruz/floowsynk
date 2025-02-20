package main

import (
	"net/http"
	"strconv"
	"time"

	"github.com/raenardcruz/floowsynk/crypto"
	"github.com/raenardcruz/floowsynk/db"

	"github.com/gin-gonic/gin"
)

var jwtKey = []byte("secret_key")

// API Methods --------------------------------------------------------------------------------------------------------

func (dbcon DBConnection) Login(c *gin.Context) {
	var user User
	if err := c.BindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dbUser, err := dbcon.DB.GetUserByUsername(user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting user"})
		return
	}
	if dbUser.ID == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	ePassword, err := crypto.EncryptPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error encrypting password"})
		return
	}

	if dbUser.Password == ePassword {
		token := generateToken(dbUser.ID, user.Username, dbUser.Role, time.Now().Add(time.Minute*15).UTC().Unix())
		c.JSON(http.StatusOK, LoginResponse{Token: token})
		return
	}

	c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
}

func (dbcon *DBConnection) GetWorkflow(c *gin.Context) {
	ValidateResults := validateToken(c)
	if ValidateResults.status != http.StatusOK {
		c.JSON(ValidateResults.status, gin.H{"error": ValidateResults.message})
		return
	}
	id := c.Request.PathValue("id")

	w, err := dbcon.DB.GetWorkflow(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, w)
}

func (dbcon *DBConnection) PostWorkflow(c *gin.Context) {
	ValidateResults := validateToken(c)
	if ValidateResults.status != http.StatusOK {
		c.JSON(ValidateResults.status, gin.H{"error": ValidateResults.message})
		return
	}
	var workflow db.WorkflowModel
	if err := c.ShouldBindJSON(&workflow); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	workflow.CreatedBy = ValidateResults.id
	workflow.UpdatedBy = ValidateResults.id

	if _, err := dbcon.DB.CreateWorkflow(workflow); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, workflow)
}

func (dbcon *DBConnection) ListWorkflows(c *gin.Context) {
	ValidateResults := validateToken(c)
	if ValidateResults.status != http.StatusOK {
		c.JSON(ValidateResults.status, gin.H{"error": ValidateResults.message})
		return
	}
	offsetStr := c.DefaultQuery("offset", "0")
	limitStr := c.DefaultQuery("limit", "10")

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offset value"})
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit value"})
		return
	}

	workflows, err := dbcon.DB.GetWorkflows(limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": workflows})
}

func (dbcon *DBConnection) UpdateWorkflow(c *gin.Context) {
	ValidateResults := validateToken(c)
	if ValidateResults.status != http.StatusOK {
		c.JSON(ValidateResults.status, gin.H{"error": ValidateResults.message})
		return
	}
	id := c.Params.ByName("id")

	var workflow db.WorkflowModel
	if err := c.ShouldBindJSON(&workflow); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	workflow.ID = id
	workflow.UpdatedBy = ValidateResults.id

	if err := dbcon.DB.UpdateWorkflow(workflow); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, workflow)
}

func (dbcon *DBConnection) DeleteWorkflow(c *gin.Context) {
	ValidateResults := validateToken(c)
	if ValidateResults.status != http.StatusOK {
		c.JSON(ValidateResults.status, gin.H{"error": ValidateResults.message})
		return
	}
	id := c.Params.ByName("id")

	if err := dbcon.DB.DeleteWorkflow(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Workflow deleted"})
}

func SseHandler(c *gin.Context) {
	id := c.Params.ByName("id")

	eventStream.mu.Lock()
	_, ok := eventStream.clients[id]
	eventStream.mu.Unlock()

	if !ok {
		eventStream.addClient(id)
	}

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

	clientChan := eventStream.clients[id]
	for {
		select {
		case msg := <-clientChan:
			c.Writer.Write([]byte("event: message\n"))
			c.Writer.Write([]byte("data: " + msg + "\n\n"))
			c.Writer.Flush()
		case <-c.Writer.CloseNotify():
			eventStream.removeClient(id)
			return
		case <-c.Request.Context().Done():
			eventStream.removeClient(id)
			return
		}
	}
}

func (dbcon *DBConnection) RunWorkflow(c *gin.Context) {
	ValidateResults := validateToken(c)
	if ValidateResults.status != http.StatusOK {
		c.JSON(ValidateResults.status, gin.H{"error": ValidateResults.message})
		return
	}
	id := c.Params.ByName("id")

	var payload Workflow
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	workflowProcessor := WorkflowProcessor{
		ProcessID:        id,
		Workflow:         &payload,
		Dbcon:            dbcon,
		ProcessVariables: make(map[string]interface{}),
		ProcessResults:   make(map[string]interface{}),
		LoggingData:      make([]LogData, 0),
	}
	workflowProcessor.Process("0")

	c.JSON(http.StatusOK, gin.H{"message": "Workflow run started"})
}
