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
	if validateResults.role == "guest" {
		return nil, fmt.Errorf("saving or modifying workflows is disabled in Guest Mode")
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
	if validateResults.role == "guest" {
		return nil, fmt.Errorf("saving or modifying workflows is disabled in Guest Mode")
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
	if validateResults.role == "guest" {
		return nil, fmt.Errorf("saving or modifying workflows is disabled in Guest Mode")
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

func (s *WorkflowServer) ListConnectorTemplates(ctx context.Context, _ *emptypb.Empty) (*wf.ConnectorTemplateList, error) {
	_, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	templates := workflow.ListConnectorTemplates()
	pbTemplates := make([]*wf.ConnectorProtoTemplate, 0, len(templates))
	for _, t := range templates {
		pbFields := make([]*wf.ConnectorFieldProto, 0, len(t.Fields))
		for _, f := range t.Fields {
			pbFields = append(pbFields, &wf.ConnectorFieldProto{
				Key:         f.Key,
				Label:       f.Label,
				Type:        f.Type,
				Required:    f.Required,
				Placeholder: f.Placeholder,
			})
		}
		pbActions := make([]*wf.ConnectorActionProto, 0, len(t.Actions))
		for _, a := range t.Actions {
			pbActions = append(pbActions, &wf.ConnectorActionProto{
				Id:          a.ID,
				Name:        a.Name,
				Description: a.Description,
				Method:      a.Method,
				Path:        a.Path,
			})
		}
		pbTemplates = append(pbTemplates, &wf.ConnectorProtoTemplate{
			Id:          t.ID,
			Name:        t.Name,
			Description: t.Description,
			Icon:        t.Icon,
			BaseUrl:     t.BaseURL,
			AuthType:    t.AuthType,
			Fields:      pbFields,
			Actions:     pbActions,
		})
	}
	return &wf.ConnectorTemplateList{Templates: pbTemplates}, nil
}

func (s *WorkflowServer) ListConnections(ctx context.Context, _ *emptypb.Empty) (*wf.ConnectionList, error) {
	_, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	conns, err := DBCon.ListConnections()
	if err != nil {
		return nil, err
	}
	pbConns := make([]*wf.ConnectionProto, 0, len(conns))
	for _, c := range conns {
		pbConns = append(pbConns, &wf.ConnectionProto{
			Id:          c.ID,
			Name:        c.Name,
			ConnectorId: c.ConnectorID,
			AuthType:    c.AuthType,
			CreatedAt:   c.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}
	return &wf.ConnectionList{Connections: pbConns}, nil
}

func (s *WorkflowServer) DeleteConnection(ctx context.Context, req *wf.DeleteConnectionRequest) (*emptypb.Empty, error) {
	_, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	err = DBCon.DeleteConnection(req.Id)
	if err != nil {
		return nil, err
	}
	return &emptypb.Empty{}, nil
}

func (s *WorkflowServer) ListWorkflowVersions(ctx context.Context, req *wf.GetWorkflowVersionsRequest) (*wf.WorkflowVersionList, error) {
	token, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	validateResults := validateToken(token)
	if validateResults.status != http.StatusOK {
		return nil, fmt.Errorf(validateResults.message)
	}
	versions, err := ListWorkflowVersionsImpl(req.WorkflowId)
	if err != nil {
		return nil, err
	}
	return versions, nil
}

func (s *WorkflowServer) RestoreWorkflowVersion(ctx context.Context, req *wf.WorkflowVersion) (*wf.Workflow, error) {
	token, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	validateResults := validateToken(token)
	if validateResults.status != http.StatusOK {
		return nil, fmt.Errorf(validateResults.message)
	}
	if validateResults.role == "guest" {
		return nil, fmt.Errorf("restoring workflow versions is disabled in Guest Mode")
	}
	workflow, err := RestoreWorkflowVersionImpl(req, validateResults.id)
	if err != nil {
		return nil, err
	}
	return workflow, nil
}

func (s *WorkflowServer) PublishWorkflow(ctx context.Context, req *wf.PublishWorkflowRequest) (*wf.PublishWorkflowResponse, error) {
	token, err := getTokenFromContext(ctx)
	if err != nil {
		return nil, err
	}
	validateResults := validateToken(token)
	if validateResults.status != http.StatusOK {
		return nil, fmt.Errorf(validateResults.message)
	}
	if validateResults.role == "guest" {
		return nil, fmt.Errorf("publishing workflows is disabled in Guest Mode")
	}
	resp, err := PublishWorkflowImpl(req)
	if err != nil {
		return nil, err
	}
	return resp, nil
}


