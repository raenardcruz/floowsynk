package workflow

import (
	"github.com/IBM/sarama"
	"github.com/raenardcruz/floowsynk/Common"
	db "github.com/raenardcruz/floowsynk/Database"
)

type Stream interface {
	Send(*Common.ReplayData) error
}

type WorkflowProcessor struct {
	ID               string
	Stream           Stream
	Workflow         *Common.Workflow
	ProcessVariables map[string]interface{}
	DBcon            db.DatabaseConnection
	Producer         *sarama.SyncProducer
	Step             int32
}

type WorkflowHistory struct {
	ID         string `json:"id"`
	WorkflowId string `json:"workflowId"`
	RunDate    string `json:"runDate"`
}
