package db

import (
	"encoding/json"
	"errors"
	"log"

	pb "github.com/raenardcruz/floowsynk/proto"
)

func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	s, ok := value.([]byte)
	if !ok {
		return errors.New("invalid scan source for JSONB")
	}
	*j = append((*j)[0:0], s...)
	return nil
}

func (db *DB) CreateWorkflow(workflow *pb.Workflow) (string, error) {
	nodes, err := json.Marshal(workflow.Nodes)
	if err != nil {
		return "", err
	}
	edges, err := json.Marshal(workflow.Edges)
	if err != nil {
		return "", err
	}

	wf := Workflow{
		ID:          workflow.Id,
		Name:        workflow.Name,
		Type:        workflow.Type,
		Description: workflow.Description,
		Nodes:       nodes,
		Edges:       edges,
		CreatedBy:   workflow.CreatedBy,
		UpdatedBy:   workflow.UpdatedBy,
		Tags:        workflow.Tags,
	}

	if err := db.conn.Create(&wf).Error; err != nil {
		return "", err
	}
	return wf.ID, nil
}

func (db *DB) GetWorkflows(limit, offset int) (*pb.WorkflowList, error) {
	var workflows []Workflow
	if err := db.conn.Limit(limit).Offset(offset).Find(&workflows).Error; err != nil {
		log.Printf("Error querying workflows: %v", err)
		return nil, err
	}

	wl := &pb.WorkflowList{Workflows: make([]*pb.Workflow, 0)}
	for _, wf := range workflows {
		var nodes []*pb.Node
		if err := json.Unmarshal(wf.Nodes, &nodes); err != nil {
			log.Printf("Error unmarshalling nodes: %v", err)
			return nil, err
		}
		var edges []*pb.Edge
		if err := json.Unmarshal(wf.Edges, &edges); err != nil {
			log.Printf("Error unmarshalling edges: %v", err)
			return nil, err
		}
		wl.Workflows = append(wl.Workflows, &pb.Workflow{
			Id:          wf.ID,
			Name:        wf.Name,
			Type:        wf.Type,
			Description: wf.Description,
			Nodes:       nodes,
			Edges:       edges,
			CreatedAt:   wf.CreatedAt,
			UpdatedAt:   wf.UpdatedAt,
			Tags:        wf.Tags,
		})
	}
	return wl, nil
}

func (db *DB) GetWorkflow(id string) (*pb.Workflow, error) {
	var wf Workflow
	if err := db.conn.First(&wf, "id = ?", id).Error; err != nil {
		log.Printf("Error querying workflow: %v", err)
		return nil, err
	}

	var nodes []*pb.Node
	var edges []*pb.Edge
	if err := json.Unmarshal(wf.Nodes, &nodes); err != nil {
		log.Printf("Error unmarshalling nodes: %v", err)
		return nil, err
	}
	if err := json.Unmarshal(wf.Edges, &edges); err != nil {
		log.Printf("Error unmarshalling edges: %v", err)
		return nil, err
	}

	return &pb.Workflow{
		Id:          wf.ID,
		Name:        wf.Name,
		Type:        wf.Type,
		Description: wf.Description,
		Nodes:       nodes,
		Edges:       edges,
		CreatedAt:   wf.CreatedAt,
		UpdatedAt:   wf.UpdatedAt,
		Tags:        wf.Tags,
	}, nil
}

func (db *DB) UpdateWorkflow(workflow *pb.Workflow) error {
	nodes, err := json.Marshal(workflow.Nodes)
	if err != nil {
		return err
	}
	edges, err := json.Marshal(workflow.Edges)
	if err != nil {
		return err
	}

	wf := Workflow{
		ID:          workflow.Id,
		Name:        workflow.Name,
		Type:        workflow.Type,
		Description: workflow.Description,
		Nodes:       nodes,
		Edges:       edges,
		UpdatedBy:   workflow.UpdatedBy,
		Tags:        workflow.Tags,
	}

	if err := db.conn.Model(&Workflow{}).Where("id = ?", wf.ID).Updates(&wf).Error; err != nil {
		return err
	}
	return nil
}

func (db *DB) DeleteWorkflow(id string) error {
	if err := db.conn.Delete(&Workflow{}, "id = ?", id).Error; err != nil {
		return err
	}
	return nil
}
