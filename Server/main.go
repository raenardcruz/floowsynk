package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/raenardcruz/floowsynk/db"
)

var dbcon *db.DB
var eventStream *EventStream

func main() {
	r := gin.Default()

	dbobj, err := db.NewDB()
	eventStream = newEventStream()
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
	r.GET("/api/workflow/:id/events", SseHandler)
	r.POST("/api/workflow/:id/run", RunWorkflow)

	log.Fatal(r.Run(":8080"))
}
