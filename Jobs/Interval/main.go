package main

import (
	"context"
	"io"
	"log"
	"time"

	wf "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
	db "github.com/raenardcruz/floowsynk/Database"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

const JobToken = "6c9e5318-6e7b-452d-9e22-9f35a755bcbd"

type IntervalJob struct{}

var DBCon *db.DatabaseConnection

func (job *IntervalJob) ProcessIntervalWorkflows() {
	for {
		workflows, err := DBCon.GetIntervalWorkflows()
		if err != nil {
			log.Printf("Error fetching workflows from database: %v", err)
			continue
		}

		for _, workflow := range workflows.Workflows {
			go job.processNode(workflow)
		}
	}
}

func (job *IntervalJob) processNode(workflow *wf.Workflow) {
	ctx := metadata.AppendToOutgoingContext(context.Background(), "Authorization", JobToken)
	node := workflow.Nodes[0]
	interval := node.Data.GetInterval()
	intervalType := node.Data.GetType()
	weeks := node.Data.GetWeeks()

	currentDay := time.Now().Weekday()
	if !weeks.BoolItems[int(currentDay)] {
		return
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

	cacheKey := "workflow:interval:" + workflow.Id
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
		log.Printf("Error setting Redis cache for workflow %v: %v", workflow.Id, err)
		return
	}

	log.Printf("Processing workflow %v", workflow.Id)
	// Add logic to execute the node's workflow
	conn, err := grpc.NewClient("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("Error connecting to gRPC server: %v", err)
		return
	}
	defer conn.Close()

	client := wf.NewWorkflowServiceClient(conn)

	log.Printf("Executing workflow %s", workflow.Id)
	stream, err := client.RunWorkflowId(ctx, &wf.RunWorkflowIdRequest{
		Id: workflow.Id,
	})
	if err != nil {
		log.Printf("Error running workflow %v: %v", workflow.Id, err)
		return
	}

	for {
		resp, err := stream.Recv()
		if err != nil {
			if err == io.EOF {
				log.Printf("Stream closed for workflow %v", workflow.Id)
				break
			}
			log.Printf("Error receiving workflow response for id %v: %v", workflow.Id, err)
			break
		}
		log.Printf("Received response for workflow %v: %v", workflow.Id, resp)
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
