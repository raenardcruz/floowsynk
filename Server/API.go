package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/raenardcruz/floowsynk/Server/proto"
	"github.com/raenardcruz/floowsynk/Server/workflow"
)

func (s *LoginServer) Login(ctx context.Context, in *proto.Credential) (*proto.Token, error) {
	token, err := Login(in.Username, in.Password)
	if err != nil {
		return nil, err
	}
	return &proto.Token{
		Token: token,
	}, nil
}

func (s *LoginServer) ExtendToken(ctx context.Context, _ *proto.Empty) (token *proto.Token, err error) {
	oldToken, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	newToken, err := ExtendToken(oldToken)
	if err != nil {
		return nil, err
	}
	token = &proto.Token{Token: newToken}
	return token, nil
}

func (s *WorkflowServer) GetWorkflow(ctx context.Context, req *proto.GetWorkflowRequest) (workflow *proto.Workflow, err error) {
	token, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	validateResults := validateToken(token)
	if validateResults.status != http.StatusOK {
		return nil, fmt.Errorf(validateResults.message)
	}
	workflow, err = GetWorkflow(req.Id)
	if err != nil {
		return nil, err
	}
	return workflow, nil
}

func (s *WorkflowServer) ListWorkflows(ctx context.Context, req *proto.PageRequest) (wl *proto.WorkflowList, err error) {
	token, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	validateResults := validateToken(token)
	if validateResults.status != http.StatusOK {
		return nil, fmt.Errorf(validateResults.message)
	}
	wl, err = ListWorkflows(req.Offset, req.Limit)
	if err != nil {
		return nil, err
	}
	return wl, nil
}

func (s *WorkflowServer) UpdateWorkflow(ctx context.Context, req *proto.Workflow) (wl *proto.Workflow, err error) {
	token, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	validateResults := validateToken(token)
	if validateResults.status != http.StatusOK {
		return nil, fmt.Errorf(validateResults.message)
	}
	req.UpdatedBy = validateResults.id

	if wl, err = UpdateWorkflow(req); err != nil {
		return nil, err
	}
	return wl, nil
}

func (s *WorkflowServer) CreateWorkflow(ctx context.Context, req *proto.Workflow) (wl *proto.Workflow, err error) {
	token, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	validateResults := validateToken(token)
	if validateResults.status != http.StatusOK {
		return nil, fmt.Errorf(validateResults.message)
	}
	req.CreatedBy = validateResults.id
	req.UpdatedBy = validateResults.id

	if wl, err = CreateWorkflow(req); err != nil {
		return nil, err
	}
	return wl, nil
}

func (s *WorkflowServer) DeleteWorkflow(ctx context.Context, req *proto.Workflow) (*proto.Empty, error) {
	token, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	validateResults := validateToken(token)
	if validateResults.status != http.StatusOK {
		return nil, fmt.Errorf(validateResults.message)
	}
	if err := DeleteWorkflow(req.Id); err != nil {
		return nil, err
	}
	return &proto.Empty{}, nil
}

func (s *WorkflowServer) QuickRun(req *proto.Workflow, stream proto.WorkflowService_QuickRunServer) error {
	ctx := stream.Context()
	token, err := getTokenFromContext(ctx)
	if err != nil {
		return err
	}
	validateResults := validateToken(token)
	if validateResults.status != http.StatusOK {
		return fmt.Errorf(validateResults.message)
	}
	processor := workflow.WorkflowProcessor{
		ID:               uuid.NewString(),
		Stream:           stream,
		Workflow:         req,
		ProcessVariables: make(map[string]interface{}),
		DBcon:            *DBCon,
		Producer:         producer,
		Step:             1,
	}
	err = processor.StartWorkflow()
	if err != nil {
		return err
	}
	return nil
}

func (s *WorkflowServer) RunWorkflowId(req *proto.RunWorkflowIdRequest, stream proto.WorkflowService_RunWorkflowIdServer) error {
	ctx := stream.Context()
	token, err := getTokenFromContext(ctx)
	if err != nil {
		return err
	}
	validateResults := validateToken(token)
	if validateResults.status != http.StatusOK {
		return fmt.Errorf(validateResults.message)
	}
	wf, err := GetWorkflow(req.Id)
	processor := workflow.WorkflowProcessor{
		Stream:           nil,
		ProcessVariables: make(map[string]interface{}),
		DBcon:            *DBCon,
		Workflow:         wf,
		Step:             1,
	}
	processor.StartWorkflow()
	return nil
}

func (s *WorkflowServer) ListWorkflowHistory(ctx context.Context, in *proto.Empty) (*proto.WorkflowHistoryList, error) {
	token, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	validateResults := validateToken(token)
	if validateResults.status != http.StatusOK {
		return nil, fmt.Errorf(validateResults.message)
	}
	wh, err := ListWorkflowHistoryImpl()
	if err != nil {
		return nil, err
	}

	return wh, nil
}

func (s *WorkflowServer) GetWorkflowHistory(ctx context.Context, req *proto.WorkflowHistoryRequest) (*proto.WorkflowHistoryResponse, error) {
	token, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	validateResults := validateToken(token)
	if validateResults.status != http.StatusOK {
		return nil, fmt.Errorf(validateResults.message)
	}

	res, err := GetWorkflowHistoryImpl(req.Id)
	if err != nil {
		return &proto.WorkflowHistoryResponse{}, err
	}

	return res, nil
}
