package kafka

import (
	"github.com/IBM/sarama"
)

func ConnectProducer(brokers []string) (sarama.SyncProducer, error) {
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5
	config.Producer.Return.Successes = true
	config.Producer.Partitioner = sarama.NewHashPartitioner
	producer, err := sarama.NewSyncProducer(brokers, config)
	if err != nil {
		return nil, err
	}
	return producer, nil
}

func SendMessage(producer sarama.SyncProducer, topic string, key string, value string) (int32, int64, error) {
	msg := &sarama.ProducerMessage{
		Topic: topic,
		Key:   sarama.StringEncoder(key),
		Value: sarama.StringEncoder(value),
	}
	partition, offset, err := producer.SendMessage(msg)
	if err != nil {
		return 0, 0, err
	}
	return partition, offset, nil
}

func CloseProducer(producer sarama.SyncProducer) error {
	err := producer.Close()
	if err != nil {
		return err
	}
	return nil
}

func SendMessages(producer sarama.SyncProducer, topic string, messages []string) ([]int32, []int64, error) {
	var partitions []int32
	var offsets []int64
	for _, message := range messages {
		partition, offset, err := SendMessage(producer, topic, "", message)
		if err != nil {
			return nil, nil, err
		}
		partitions = append(partitions, partition)
		offsets = append(offsets, offset)
	}
	return partitions, offsets, nil
}
