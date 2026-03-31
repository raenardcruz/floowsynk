package Broker
	
import (
	"strings"

	db "github.com/raenardcruz/floowsynk/Database"
)

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
	brokers := strings.Split(db.AppConfig.Kafka_Brokers, ",")
	return Config{
		brokers: brokers,
		topics:  topics,
	}
}
