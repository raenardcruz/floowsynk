package main

import (
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
