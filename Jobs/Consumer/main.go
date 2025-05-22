package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/IBM/sarama"
	"github.com/raenardcruz/floowsynk/Broker"
	db "github.com/raenardcruz/floowsynk/Database"
)

const (
	brokerAddress = "localhost:9092"
	topic         = Broker.WORKFLOW_REPLAY_DATA
	groupID       = "floowsynk-job-group3"
	bufferTime    = 3 * time.Second
)

var replayData []db.ReplayData
var DBCon *db.DatabaseConnection

type ConsumerGroupHandler struct{}

func (ConsumerGroupHandler) Setup(_ sarama.ConsumerGroupSession) error   { return nil }
func (ConsumerGroupHandler) Cleanup(_ sarama.ConsumerGroupSession) error { return nil }

func (ConsumerGroupHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for message := range claim.Messages() {
		log.Printf("Message claimed: topic=%s partition=%d offset=%d key=%s value=%s",
			message.Topic, message.Partition, message.Offset, string(message.Key), string(message.Value))
		rd := db.ReplayData{}
		err := json.Unmarshal(message.Value, &rd)
		if err != nil {
			log.Printf("Error unmarshalling message: %v", err)
			continue
		}
		replayData = append(replayData, rd)
		session.MarkMessage(message, "")
	}
	return nil
}

func main() {
	db.ConnectToRedis()
	config := sarama.NewConfig()
	config.Version = sarama.V4_0_0_0
	config.Consumer.Group.Rebalance.Strategy = sarama.NewBalanceStrategyRoundRobin()
	config.Consumer.Offsets.Initial = sarama.OffsetOldest

	consumerGroup, err := sarama.NewConsumerGroup([]string{brokerAddress}, groupID, config)
	if err != nil {
		log.Fatalf("Error creating consumer group client: %v", err)
	}
	defer consumerGroup.Close()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigchan := make(chan os.Signal, 1)
	signal.Notify(sigchan, os.Interrupt)

	DBCon, err = db.ConnectToDatabase()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Timer to periodically flush replayData to the database
	timer := time.NewTimer(bufferTime)
	defer timer.Stop()

	go func() {
		for {
			<-timer.C
			if len(replayData) > 0 {
				log.Printf("Flushing %d replay data to the database", len(replayData))
				DBCon.CreateBatchReplayData(replayData)
				replayData = []db.ReplayData{}
			}
			timer.Reset(bufferTime)
		}
	}()

	// Start the consumer group
	go func() {
		for {
			if err := consumerGroup.Consume(ctx, []string{topic}, ConsumerGroupHandler{}); err != nil {
				log.Fatalf("Error from consumer: %v", err)
			}
		}
	}()

	log.Println("Kafka consumer group started. Press Ctrl+C to stop.")
	<-sigchan
	log.Println("Interrupt is detected. Shutting down.")
}
