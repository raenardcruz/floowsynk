package main

import (
	"github.com/gin-gonic/gin"
	"github.com/raenardcruz/floowsynk/db"
)

var dbcon *db.DB

func main() {
	r := gin.Default()

	dbobj, err := db.NewDB()
	dbcon = dbobj
	if err != nil {
		panic(err)
	}
	defer dbobj.Close()
	dbobj.InitDB()

	r.POST("/api/login", Login)
	r.POST("/session/extend", ExtendToken)
	r.GET("/api/workflow/:id", GetWorkflow)
	r.GET("/api/workflows", listWorkflows)
	r.POST("/api/workflow", PostWorkflow)
	r.PUT("/api/workflow/:id", UpdateWorkflow)
	r.DELETE("/api/workflow/:id", DeleteWorkflow)

	r.Run(":8080")
}
