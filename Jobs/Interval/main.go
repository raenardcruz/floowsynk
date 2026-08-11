package main

import (
	"context"
	"fmt"
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
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	for {
		for _, envName := range []string{"staging", "production"} {
			workflows, err := DBCon.GetIntervalWorkflowsEnv(envName)
			if err != nil {
				log.Printf("Error fetching interval workflows for %s: %v", envName, err)
			} else if workflows != nil {
				for _, workflowObj := range workflows.Workflows {
					go job.processNode(workflowObj, envName)
				}
			}
		}
		<-ticker.C
	}
}

func (job *IntervalJob) processNode(workflow *wf.Workflow, envName string) {
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

	cacheKey := fmt.Sprintf("workflow:interval:%s:%s", envName, workflow.Id)
	set, err := db.SetCacheNX(ctx, cacheKey, "running", duration)
	if err != nil {
		log.Printf("Error setting Redis cache lock for workflow %v (%s): %v", workflow.Id, envName, err)
		return
	}

	if !set {
		return
	}

	log.Printf("Processing workflow %v (%s)", workflow.Id, envName)
	grpcAddr := fmt.Sprintf("%s:%s", db.AppConfig.Server_GRPC_Host, db.AppConfig.Server_Plain_Port)
	conn, err := grpc.NewClient(grpcAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("Error connecting to gRPC server: %v", err)
		return
	}
	defer conn.Close()

	client := wf.NewWorkflowServiceClient(conn)

	envEnum := wf.Environment_PRODUCTION
	if envName == "staging" {
		envEnum = wf.Environment_STAGING
	}

	log.Printf("Executing workflow %s (%s)", workflow.Id, envName)
	stream, err := client.RunWorkflowId(ctx, &wf.RunWorkflowIdRequest{
		Id:          workflow.Id,
		Environment: envEnum,
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
