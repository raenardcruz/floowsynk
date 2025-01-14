package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Protected(c *gin.Context) {
	validateResults := validateToken(c)
	if validateResults.status != http.StatusOK {
		c.JSON(validateResults.status, gin.H{"error": validateResults.message})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Hello, " + validateResults.username + ", your role is " + validateResults.role})
}
