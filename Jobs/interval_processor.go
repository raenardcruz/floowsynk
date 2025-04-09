package main

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"database/sql"

	"github.com/raenardcruz/floowsynk/Server/db"
	"github.com/raenardcruz/floowsynk/Server/proto"
	"github.com/segmentio/kafka-go"
)

type IntervalJob struct {
	DB *sql.DB
}

func (job *IntervalJob) ProcessIntervalWorkflows() {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:   []string{"localhost:9092"},
		Topic:     "interval-workflows",
		Partition: 0,
		MinBytes:  10e3, // 10KB
		MaxBytes:  10e6, // 10MB
	})
	defer reader.Close()

	for {
		m, err := reader.ReadMessage(context.Background())
		if err != nil {
			log.Printf("Error reading message from Kafka: %v", err)
			continue
		}

		workflow := proto.Workflow{}
		if err := json.Unmarshal(m.Value, &workflow); err != nil {
			log.Printf("Error unmarshalling workflow: %v", err)
			continue
		}

		for _, node := range workflow.Nodes {
			if node.Nodetype == "interval" {
				job.processNode(node)
			}
		}
	}
}

func (job *IntervalJob) processNode(node *proto.Node) {
	interval := node.Data.GetInterval()
	intervalType := node.Data.GetType()
	weeks := node.Data.GetWeeks()

	currentDay := time.Now().Weekday()
	if !weeks.BoolItems[int(currentDay)] {
		return // Skip execution for this day
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

	time.Sleep(duration)
	log.Printf("Processing node %v", node.Id)
	// Add logic to execute the node's workflow
}

func main() {
	dbConnection := db.NewDBConnection()
	job := &IntervalJob{DB: dbConnection}
	log.Println("Starting interval workflow processor...")
	job.ProcessIntervalWorkflows()
}
