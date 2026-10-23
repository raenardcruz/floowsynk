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

type IntervalJob struct {
	client wf.WorkflowServiceClient
	sem    chan struct{}
}

var DBCon *db.DatabaseConnection

func (job *IntervalJob) ProcessIntervalWorkflows() {
	if job.sem == nil {
		job.sem = make(chan struct{}, 50)
	}
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
	if job.sem != nil {
		job.sem <- struct{}{}
		defer func() { <-job.sem }()
	}

	if workflow == nil {
		return
	}

	var node *wf.Node
	for _, n := range workflow.Nodes {
		if n != nil && n.Nodetype == "interval" {
			node = n
			break
		}
	}
	if node == nil && len(workflow.Nodes) > 0 {
		node = workflow.Nodes[0]
	}
	if node == nil || node.Data == nil {
		return
	}

	currentDay := time.Now().Weekday()
	weeks := node.Data.GetWeeks()
	if weeks == nil || len(weeks.BoolItems) <= int(currentDay) || !weeks.BoolItems[int(currentDay)] {
		return
	}

	interval := node.Data.GetInterval()
	if interval <= 0 {
		return
	}

	intervalType := node.Data.GetType()
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

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()
	ctx = metadata.AppendToOutgoingContext(ctx, "Authorization", db.AppConfig.Job_Token)

	cacheKey := fmt.Sprintf("workflow:interval:%s:%s", envName, workflow.Id)
	set, err := db.SetCacheNX(ctx, cacheKey, "running", duration)
	if err != nil {
		log.Printf("Error setting Redis cache lock for workflow %v (%s): %v", workflow.Id, envName, err)
		return
	}

	if !set {
		return
	}

	if job.client == nil {
		log.Printf("Workflow service client not initialized for workflow %v", workflow.Id)
		return
	}

	envEnum := wf.Environment_PRODUCTION
	if envName == "staging" {
		envEnum = wf.Environment_STAGING
	}

	log.Printf("Executing workflow %s (%s)", workflow.Id, envName)
	stream, err := job.client.RunWorkflowId(ctx, &wf.RunWorkflowIdRequest{
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

	grpcAddr := fmt.Sprintf("%s:%s", db.AppConfig.Server_GRPC_Host, db.AppConfig.Server_Plain_Port)
	conn, err := grpc.NewClient(grpcAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect to gRPC server: %v", err)
	}
	defer conn.Close()

	client := wf.NewWorkflowServiceClient(conn)
	job := &IntervalJob{
		client: client,
		sem:    make(chan struct{}, 50),
	}
	log.Println("Starting interval workflow processor...")
	job.ProcessIntervalWorkflows()
}
