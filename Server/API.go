package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	lg "github.com/raenardcruz/floowsynk/CodeGen/go/login"
	wf "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
	"github.com/raenardcruz/floowsynk/Server/workflow"
	emptypb "google.golang.org/protobuf/types/known/emptypb"
)

func (s *LoginServer) Login(ctx context.Context, in *lg.Credential) (*lg.Token, error) {
	token, err := Login(in.Username, in.Password)
	if err != nil {
		return nil, err
	}
	return &lg.Token{
		Token: token,
	}, nil
}

func (s *LoginServer) ExtendToken(ctx context.Context, _ *emptypb.Empty) (token *lg.Token, err error) {
	oldToken, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	newToken, err := ExtendToken(oldToken)
	if err != nil {
		return nil, err
	}
	token = &lg.Token{Token: newToken}
	return token, nil
}

func (s *WorkflowServer) GetWorkflow(ctx context.Context, req *wf.GetWorkflowRequest) (workflow *wf.Workflow, err error) {
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

func (s *WorkflowServer) ListWorkflows(ctx context.Context, req *wf.PageRequest) (wl *wf.WorkflowList, err error) {
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

func (s *WorkflowServer) UpdateWorkflow(ctx context.Context, req *wf.Workflow) (wl *wf.Workflow, err error) {
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

func (s *WorkflowServer) CreateWorkflow(ctx context.Context, req *wf.Workflow) (wl *wf.Workflow, err error) {
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

func (s *WorkflowServer) DeleteWorkflow(ctx context.Context, req *wf.Workflow) (*emptypb.Empty, error) {
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
	return &emptypb.Empty{}, nil
}

func (s *WorkflowServer) QuickRun(req *wf.Workflow, stream wf.WorkflowService_QuickRunServer) error {
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

func (s *WorkflowServer) RunWorkflowId(req *wf.RunWorkflowIdRequest, stream wf.WorkflowService_RunWorkflowIdServer) error {
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

func (s *WorkflowServer) ListWorkflowHistory(ctx context.Context, in *emptypb.Empty) (*wf.WorkflowHistoryList, error) {
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

func (s *WorkflowServer) GetWorkflowHistory(ctx context.Context, req *wf.WorkflowHistoryRequest) (*wf.WorkflowHistoryResponse, error) {
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
		return &wf.WorkflowHistoryResponse{}, err
	}

	return res, nil
}
