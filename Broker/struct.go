package Broker

type TopicConfig struct {
	name           string
	partitionCount int32
	retentionMs    int64
}

type Config struct {
	brokers []string
	topics  []TopicConfig
}
