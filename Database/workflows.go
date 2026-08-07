package DB

import (
	"context"
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/lib/pq"
	pb "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
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
	// Environment: "staging" or "production"
	Environment string `gorm:"default:'staging'"`
	IsModified  bool   `gorm:"default:false;column:is_modified"`
}

func (j JSONB) Value() (driver.Value, error) {
	if len(j) == 0 {
		return nil, nil
	}
	return string(j), nil
}

func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	switch v := value.(type) {
	case []byte:
		*j = append((*j)[0:0], v...)
		return nil
	case string:
		*j = append((*j)[0:0], []byte(v)...)
		return nil
	default:
		return errors.New("invalid scan source for JSONB")
	}
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
		Environment: AppConfig.App_Environment,
	}

	if err := db.conn.Save(&wf).Error; err != nil {
		return "", err
	}
	return wf.ID, nil
}

func (db *DatabaseConnection) GetWorkflows(limit, offset int) (*pb.WorkflowList, error) {
	var workflows []Workflow
	if err := db.conn.Where("environment = ?", AppConfig.App_Environment).Limit(limit).Offset(offset).Find(&workflows).Error; err != nil {
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
			IsModified:  wf.IsModified,
		})
	}
	return wl, nil
}

func (db *DatabaseConnection) GetWorkflow(id string) (*pb.Workflow, error) {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("workflow:%s:%s", AppConfig.App_Environment, id)

	if cachedData, found := GetFromCache(ctx, cacheKey); found {
		var cachedWorkflow pb.Workflow
		if err := json.Unmarshal(cachedData, &cachedWorkflow); err == nil {
			return &cachedWorkflow, nil
		}
	}

	var wf Workflow
	if err := db.conn.First(&wf, "id = ? AND environment = ?", id, AppConfig.App_Environment).Error; err != nil {
		if err := db.conn.First(&wf, "id = ?", id).Error; err != nil {
			log.Printf("Error querying workflow: %v", err)
			return nil, err
		}
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
		IsModified:  wf.IsModified,
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
	// Webhook workflows check both staging and production (webhooks are always live)
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
		IsModified:  wf.IsModified,
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
	// Interval workflows always run from production if available, else staging
	if err := db.conn.Where("type = ? AND environment = ?", "interval", AppConfig.App_Environment).Find(&workflows).Error; err != nil {
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
			IsModified:  wf.IsModified,
		})
	}

	if err := SetCache(ctx, cacheKey, wl, workflowCacheExpiration); err != nil {
		log.Printf("Error setting cache for interval workflows: %v", err)
	}

	return wl, nil
}

func (db *DatabaseConnection) UpdateWorkflow(workflow *pb.Workflow) error {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("workflow:%s:%s", AppConfig.App_Environment, workflow.Id)

	nodes, err := json.Marshal(workflow.Nodes)
	if err != nil {
		return err
	}
	edges, err := json.Marshal(workflow.Edges)
	if err != nil {
		return err
	}

	updates := map[string]interface{}{
		"name":        workflow.Name,
		"type":        workflow.Type,
		"description": workflow.Description,
		"nodes":       nodes,
		"edges":       edges,
		"updated_by":  workflow.UpdatedBy,
		"updated_at":  time.Now().UTC().Unix(),
		"tags":        pq.StringArray(workflow.Tags),
	}

	if AppConfig.App_Environment == "production" {
		updates["is_modified"] = true
		workflow.IsModified = true
	}

	if err := db.conn.Model(&Workflow{}).Where("id = ? AND environment = ?", workflow.Id, AppConfig.App_Environment).Updates(updates).Error; err != nil {
		return err
	}

	// Create or update version snapshot (staging only)
	if AppConfig.App_Environment == "staging" {
		if err := db.CreateOrUpdateWorkflowVersion(workflow.Id, nodes, edges, workflow.UpdatedBy); err != nil {
			log.Printf("Warning: Failed to create workflow version for %s: %v", workflow.Id, err)
		}
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

func (db *DatabaseConnection) RevertWorkflowToStaging(workflowID string) (*pb.Workflow, error) {
	ctx := context.Background()
	var stagingWF Workflow
	if err := db.conn.First(&stagingWF, "id = ? AND environment = ?", workflowID, "staging").Error; err != nil {
		return nil, fmt.Errorf("staging workflow %s not found: %w", workflowID, err)
	}

	now := time.Now().UTC().Unix()
	updates := map[string]interface{}{
		"name":        stagingWF.Name,
		"type":        stagingWF.Type,
		"description": stagingWF.Description,
		"nodes":       stagingWF.Nodes,
		"edges":       stagingWF.Edges,
		"updated_by":  stagingWF.UpdatedBy,
		"tags":        stagingWF.Tags,
		"updated_at":  now,
		"is_modified": false,
	}

	if err := db.conn.Model(&Workflow{}).Where("id = ? AND environment = ?", workflowID, "production").Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("failed to revert production workflow: %w", err)
	}

	DeleteCache(ctx, fmt.Sprintf("workflow:%s:%s", "production", workflowID))
	DeleteCache(ctx, "workflow:"+workflowID)

	return db.GetWorkflow(workflowID)
}
