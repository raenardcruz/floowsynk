package Broker

import (
	"log"

	"github.com/IBM/sarama"
	"github.com/raenardcruz/floowsynk/Broker/kafka"
)

func Init() (*sarama.SyncProducer, error) {
	config := GetConfig()
	for _, topic := range config.topics {
		log.Printf("Creating topic %s with %d partitions and retention %d ms", topic.name, topic.partitionCount, topic.retentionMs)
		if err := kafka.CreateTopic(config.brokers, topic.name, topic.partitionCount, topic.retentionMs); err != nil {
			log.Fatalf("Error creating topic %s: %v", topic.name, err)
			return nil, err
		}
		log.Printf("Topic %s created successfully", topic.name)
	}
	producer, err := kafka.ConnectProducer(config.brokers)
	if err != nil {
		log.Fatalf("Error connecting to producer: %v", err)
		return nil, err
	}
	return &producer, nil
}
