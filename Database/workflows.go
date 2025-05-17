package DB

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"time"

	"github.com/lib/pq"
	pb "github.com/raenardcruz/floowsynk/Server/proto"
)

const workflowCacheExpiration = 15 * time.Minute

type Workflow struct {
	ID          string `gorm:"primaryKey"`
	Name        string
	Type        string
	Description string
	Nodes       JSONB `gorm:"type:jsonb"`
	Edges       JSONB `gorm:"type:jsonb"`
	CreatedBy   string
	UpdatedBy   string
	Tags        pq.StringArray `gorm:"type:text[]"`
	CreatedAt   int64
	UpdatedAt   int64
}

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

func (db *DatabaseConnection) CreateWorkflow(workflow *pb.Workflow) (string, error) {
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
		Tags:        pq.StringArray(workflow.Tags),
		CreatedAt:   time.Now().UTC().Unix(),
		UpdatedAt:   time.Now().UTC().Unix(),
	}

	if err := db.conn.Create(&wf).Error; err != nil {
		return "", err
	}
	return wf.ID, nil
}

func (db *DatabaseConnection) GetWorkflows(limit, offset int) (*pb.WorkflowList, error) {
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
			CreatedAt:   time.Unix(wf.CreatedAt, 0).Format("Jan 02, 2006"),
			UpdatedAt:   time.Unix(wf.UpdatedAt, 0).Format("Jan 02, 2006"),
			Tags:        []string(wf.Tags),
		})
	}
	return wl, nil
}

func (db *DatabaseConnection) GetWorkflow(id string) (*pb.Workflow, error) {
	ctx := context.Background()
	cacheKey := "workflow:" + id

	if cachedData, found := GetFromCache(ctx, cacheKey); found {
		var cachedWorkflow pb.Workflow
		if err := json.Unmarshal(cachedData, &cachedWorkflow); err == nil {
			return &cachedWorkflow, nil
		}
	}

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

	workflow := &pb.Workflow{
		Id:          wf.ID,
		Name:        wf.Name,
		Type:        wf.Type,
		Description: wf.Description,
		Nodes:       nodes,
		Edges:       edges,
		CreatedAt:   time.Unix(wf.CreatedAt, 0).Format("Jan 02, 2006"),
		UpdatedAt:   time.Unix(wf.UpdatedAt, 0).Format("jan 02, 2006"),
		Tags:        wf.Tags,
	}

	if err := SetCache(ctx, cacheKey, workflow, workflowCacheExpiration); err != nil {
		log.Printf("Error setting cache for workflow %s: %v", id, err)
	}

	return workflow, nil
}

func (db *DatabaseConnection) GetWebhookWorkflow(id string) (*pb.Workflow, error) {
	ctx := context.Background()
	cacheKey := "webhook_workflow:" + id

	if cachedData, found := GetFromCache(ctx, cacheKey); found {
		var cachedWorkflow pb.Workflow
		if err := json.Unmarshal(cachedData, &cachedWorkflow); err == nil {
			return &cachedWorkflow, nil
		}
	}

	var wf Workflow
	if err := db.conn.First(&wf, "id = ? and type = ?", id, "webhook").Error; err != nil {
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

	workflow := &pb.Workflow{
		Id:          wf.ID,
		Name:        wf.Name,
		Type:        wf.Type,
		Description: wf.Description,
		Nodes:       nodes,
		Edges:       edges,
	}

	if err := SetCache(ctx, cacheKey, workflow, workflowCacheExpiration); err != nil {
		log.Printf("Error setting cache for webhook workflow %s: %v", id, err)
	}

	return workflow, nil
}

func (db *DatabaseConnection) GetIntervalWorkflows() (*pb.WorkflowList, error) {
	ctx := context.Background()
	cacheKey := "interval_workflows:"

	if cachedData, found := GetFromCache(ctx, cacheKey); found {
		var cachedWorkflowList pb.WorkflowList
		if err := json.Unmarshal(cachedData, &cachedWorkflowList); err == nil {
			return &cachedWorkflowList, nil
		}
	}

	var workflows []Workflow
	if err := db.conn.Where("type = ?", "interval").Find(&workflows).Error; err != nil {
		log.Printf("Error querying interval workflows: %v", err)
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
			CreatedAt:   time.Unix(wf.CreatedAt, 0).Format("Jan 02, 2006"),
			UpdatedAt:   time.Unix(wf.UpdatedAt, 0).Format("Jan 02, 2006"),
			Tags:        wf.Tags,
		})
	}

	if err := SetCache(ctx, cacheKey, wl, workflowCacheExpiration); err != nil {
		log.Printf("Error setting cache for interval workflows: %v", err)
	}

	return wl, nil
}

func (db *DatabaseConnection) UpdateWorkflow(workflow *pb.Workflow) error {
	ctx := context.Background()
	cacheKey := "workflow:" + workflow.Id

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
		UpdatedAt:   time.Now().UTC().Unix(),
		Tags:        pq.StringArray(workflow.Tags),
	}

	if err := db.conn.Model(&Workflow{}).Where("id = ?", wf.ID).Updates(&wf).Error; err != nil {
		return err
	}

	if err := SetCache(ctx, cacheKey, workflow, workflowCacheExpiration); err != nil {
		log.Printf("Error setting cache for workflow %s: %v", workflow.Id, err)
	}

	if workflow.Type == "webhook" {
		webhookCacheKey := "webhook_workflow:" + workflow.Id
		if err := SetCache(ctx, webhookCacheKey, workflow, workflowCacheExpiration); err != nil {
			log.Printf("Error setting cache for webhook workflow %s: %v", workflow.Id, err)
		}
	}

	if workflow.Type == "interval" {
		intervalCacheKey := "workflow:interval:" + workflow.Id
		DeleteCache(ctx, intervalCacheKey)
	}

	return nil
}

func (db *DatabaseConnection) DeleteWorkflow(id string) error {
	if err := db.conn.Delete(&Workflow{}, "id = ?", id).Error; err != nil {
		return err
	}
	return nil
}
