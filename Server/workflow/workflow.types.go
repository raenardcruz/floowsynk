package workflow

import (
	"sync"

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
	VariablesMu      sync.RWMutex
	DBcon            db.DatabaseConnection
	Producer         *sarama.SyncProducer
	Step             int32
	Depth            int32
	ResponseChan     chan string
	ExecutedEdges    map[string]bool
	NodeVisitCount   map[string]int
	MaxStepLimit     int
}

type WorkflowHistory struct {
	ID         string `json:"id"`
	WorkflowId string `json:"workflowId"`
	RunDate    string `json:"runDate"`
}
