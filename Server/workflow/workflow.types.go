package workflow

import (
	db "github.com/raenardcruz/floowsynk/Database"
	"github.com/raenardcruz/floowsynk/Server/proto"
	"google.golang.org/grpc"
)

type KeyValue struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}
type GrpcWorkflowStream interface {
	Send(*proto.RunWorkflowResponse) error
	grpc.ServerStream
}

type WorkflowProcessor struct {
	Stream           GrpcWorkflowStream
	Workflow         *proto.Workflow
	ProcessVariables map[string]interface{}
	DBcon            db.DatabaseConnection
}
