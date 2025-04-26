package kafka

import (
	"hash/fnv"

	"github.com/IBM/sarama"
)

var client sarama.Client

func ConnectConsumer(brokers []string) (sarama.Consumer, error) {
	var err error
	config := sarama.NewConfig()
	client, err = sarama.NewClient(brokers, config)
	if err != nil {
		return nil, err
	}
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
	messagesCount, err := client.GetOffset(topic, partition, sarama.OffsetNewest)
	if err != nil {
		return nil, err
	}

	var messages []string
	for {
		select {
		case msg := <-partitionConsumer.Messages():
			messages = append(messages, string(msg.Value))
			if msg.Offset >= (messagesCount - 1) {
				return messages, nil
			}
		case err := <-partitionConsumer.Errors():
			if err != nil {
				return nil, err
			}
		}
	}
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
func ReadAllMessages(consumer sarama.Consumer, topic string, offset int64) ([]string, error) {
	partitions, err := consumer.Partitions(topic)
	if err != nil {
		return nil, err
	}

	var messages []string
	for _, partition := range partitions {
		partitionMessages, err := ReadMessagesFromPartition(consumer, topic, partition, offset)
		if err != nil {
			return nil, err
		}
		messages = append(messages, partitionMessages...)
	}

	return messages, nil
}
