package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/raenardcruz/floowsynk/db"
)

func GetWorkflow(c *gin.Context) {
	ValidateResults := validateToken(c)
	if ValidateResults.status != http.StatusOK {
		c.JSON(ValidateResults.status, gin.H{"error": ValidateResults.message})
		return
	}
	id := c.Request.PathValue("id")

	w, err := dbcon.GetWorkflow(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, w)
}

func PostWorkflow(c *gin.Context) {
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

	if _, err := dbcon.CreateWorkflow(workflow); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, workflow)
}

func listWorkflows(c *gin.Context) {
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

	workflows, err := dbcon.GetWorkflows(limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": workflows})
}

func UpdateWorkflow(c *gin.Context) {
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

	if err := dbcon.UpdateWorkflow(workflow); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, workflow)
}

func DeleteWorkflow(c *gin.Context) {
	ValidateResults := validateToken(c)
	if ValidateResults.status != http.StatusOK {
		c.JSON(ValidateResults.status, gin.H{"error": ValidateResults.message})
		return
	}
	id := c.Params.ByName("id")

	if err := dbcon.DeleteWorkflow(id); err != nil {
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

func RunWorkflow(c *gin.Context) {
	ValidateResults := validateToken(c)
	if ValidateResults.status != http.StatusOK {
		c.JSON(ValidateResults.status, gin.H{"error": ValidateResults.message})
		return
	}
	//id := c.Params.ByName("id")

	var payload WorkflowRunPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stepObj := BuildJsonSteps(payload.Nodes, payload.Edges, "0", nil, "output")
	jsonData, err := json.Marshal(stepObj)
	if err != nil {
		log.Printf("Error: failed to marshal JSON data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("StepObj: %s", jsonData)

	c.JSON(http.StatusOK, gin.H{"message": "Workflow run started"})
}

// func test(id string) {
// 	for i := 0; i < 100; i++ {
// 		eventStream.SendEvent(id, "Event "+strconv.Itoa(i))
// 		time.Sleep(time.Second / 10)
// 	}
// }
