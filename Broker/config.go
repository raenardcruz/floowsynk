package Broker

const (
	WORKFLOW_REPLAY_DATA = "workflow-replay-data"
)

var topics = []TopicConfig{
	{
		name:           WORKFLOW_REPLAY_DATA,
		partitionCount: 3,
		retentionMs:    24 * 60 * 60 * 1000, // 24 hours
	},
}

func GetConfig() Config {
	return Config{
		brokers: []string{"localhost:9092"},
		topics:  topics,
	}
}
