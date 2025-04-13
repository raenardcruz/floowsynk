package kafka

import (
	"hash/fnv"

	"github.com/IBM/sarama"
)

func ConnectConsumer(brokers []string) (sarama.Consumer, error) {
	config := sarama.NewConfig()
	config.Consumer.Return.Errors = true
	consumer, err := sarama.NewConsumer(brokers, config)
	if err != nil {
		return nil, err
	}
	return consumer, nil
}

func ReadMessagesFromPartition(consumer sarama.Consumer, topic string, partition int32, offset int64) ([]string, error) {
	partitionConsumer, err := consumer.ConsumePartition(topic, partition, offset)
	if err != nil {
		return nil, err
	}
	defer partitionConsumer.Close()

	var messages []string
	for msg := range partitionConsumer.Messages() {
		messages = append(messages, string(msg.Value))
	}

	return messages, nil
}

func GetPartitionFromKey(key string, numPartitions int32) int32 {
	h := fnv.New32a()
	h.Write([]byte(key))
	return int32(h.Sum32()) % numPartitions
}

func ReadMessagesByKey(consumer sarama.Consumer, topic string, key string, offset int64) ([]string, error) {
	partitions, err := consumer.Partitions(topic)
	if err != nil {
		return nil, err
	}

	partition := GetPartitionFromKey(key, int32(len(partitions)))
	return ReadMessagesFromPartition(consumer, topic, partition, offset)
}
