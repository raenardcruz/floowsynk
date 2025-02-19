package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/raenardcruz/floowsynk/db"
)

var eventStream *EventStream

func main() {
	r := gin.Default()

	dbobj, err := db.NewDB()
	dbcon := DBConnection{dbobj}
	eventStream = newEventStream()
	if err != nil {
		panic(err)
	}
	defer dbobj.Close()
	dbobj.InitDB()

	r.POST("/api/login", dbcon.Login)
	r.POST("/session/extend", ExtendToken)
	r.GET("/api/workflow/:id", dbcon.GetWorkflow)
	r.GET("/api/workflows", dbcon.ListWorkflows)
	r.POST("/api/workflow", dbcon.PostWorkflow)
	r.PUT("/api/workflow/:id", dbcon.UpdateWorkflow)
	r.DELETE("/api/workflow/:id", dbcon.DeleteWorkflow)
	r.GET("/api/workflow/:id/events", SseHandler)
	r.POST("/api/workflow/:id/run", dbcon.RunWorkflow)

	log.Fatal(r.Run(":8080"))
}
