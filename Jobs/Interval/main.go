package main

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/raenardcruz/floowsynk/Broker"
	"github.com/raenardcruz/floowsynk/Common"
	db "github.com/raenardcruz/floowsynk/Database"
	"github.com/raenardcruz/floowsynk/Server/workflow"
)

const JobToken = "6c9e5318-6e7b-452d-9e22-9f35a755bcbd"

type IntervalJob struct{}

var DBCon *db.DatabaseConnection

func (job *IntervalJob) ProcessIntervalWorkflows() {
	for {
		workflows, err := DBCon.GetIntervalWorkflows()
		if err != nil {
			log.Printf("Error fetching workflows from database: %v", err)
			time.Sleep(10 * time.Second)
			continue
		}

		for _, wf := range workflows.Workflows {
			go job.processNode(wf)
		}
		time.Sleep(1 * time.Minute)
	}
}

func (job *IntervalJob) processNode(wf *Common.Workflow) {
	if len(wf.Nodes) == 0 {
		return
	}
	node := wf.Nodes[0]
	interval := node.Data.Interval
	intervalType := node.Data.Type
	weeks := node.Data.Weeks

	currentDay := time.Now().Weekday()
	if weeks != nil && len(weeks.BoolItems) > int(currentDay) {
		if !weeks.BoolItems[int(currentDay)] {
			return
		}
	}

	duration := time.Duration(interval)
	switch intervalType {
	case "seconds":
		duration *= time.Second
	case "minutes":
		duration *= time.Minute
	case "hours":
		duration *= time.Hour
	case "days":
		duration *= time.Hour * 24
	default:
		log.Printf("Invalid interval type for node %v", node.Id)
		return
	}

	cacheKey := "workflow:interval:" + wf.Id
	ctx := context.Background()
	exists, err := db.CacheExists(ctx, cacheKey)
	if err != nil {
		log.Printf("Error checking Redis cache for node %v: %v", node.Id, err)
		return
	}

	if exists {
		return
	}

	err = db.SetCache(ctx, cacheKey, "running", duration)
	if err != nil {
		log.Printf("Error setting Redis cache for workflow %v: %v", wf.Id, err)
		return
	}

	log.Printf("Executing workflow %s", wf.Id)
	
	producer, err := Broker.Init()
	if err != nil {
		log.Printf("Error initializing broker: %v", err)
		return
	}
	
	wp := workflow.WorkflowProcessor{
		ID:               uuid.NewString(),
		DBcon:            *DBCon,
		Workflow:         wf,
		Stream:           nil, // No streaming for background jobs
		ProcessVariables: make(map[string]interface{}),
		Producer:         producer,
	}

	if err := wp.StartWorkflow(); err != nil {
		log.Printf("Error running workflow %v: %v", wf.Id, err)
	}
}

func main() {
	db.ConnectToRedis()
	var err error
	DBCon, err = db.ConnectToDatabase()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	job := &IntervalJob{}
	log.Println("Starting interval workflow processor...")
	job.ProcessIntervalWorkflows()
}
