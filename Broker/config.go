package Broker

const (
	WORKFLOW_REPLAY_DATA = "workflow-replay-data"
	WORKFLOW_RUN_HISTORY = "workflow-run_history"
)

var topics = []TopicConfig{
	{
		name:           WORKFLOW_REPLAY_DATA,
		partitionCount: 3,
		retentionMs:    7 * 24 * 60 * 60 * 1000, // 7 days
	},
	{
		name:           WORKFLOW_RUN_HISTORY,
		partitionCount: 3,
		retentionMs:    7 * 24 * 60 * 60 * 1000, // 7 days
	},
}

func GetConfig() Config {
	return Config{
		brokers: []string{"localhost:9092"},
		topics:  topics,
	}
}
