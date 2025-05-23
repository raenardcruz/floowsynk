package workflow

import (
	"github.com/IBM/sarama"
	proto "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
	db "github.com/raenardcruz/floowsynk/Database"
	"google.golang.org/grpc"
)

type KeyValue struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}
type GrpcWorkflowStream interface {
	Send(*proto.ReplayData) error
	grpc.ServerStream
}

type WorkflowProcessor struct {
	ID               string
	Stream           GrpcWorkflowStream
	Workflow         *proto.Workflow
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
