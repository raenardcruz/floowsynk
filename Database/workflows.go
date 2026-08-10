package DB

import (
	"context"
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
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
	Environment string `gorm:"primaryKey;default:'staging'"`
	// SourceWorkflowID links a production edit copy to its immutable published workflow.
	// It is empty for staging and published production records.
	SourceWorkflowID string `gorm:"index;column:source_workflow_id"`
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
	env := ResolveEnvName(workflow.Environment)
	return db.CreateWorkflowEnv(workflow, env)
}

func (db *DatabaseConnection) CreateWorkflowEnv(workflow *pb.Workflow, env string) (string, error) {
	nodes, err := json.Marshal(workflow.Nodes)
	if err != nil {
		return "", err
	}
	edges, err := json.Marshal(workflow.Edges)
	if err != nil {
		return "", err
	}

	tableName := db.TableFor(env, "workflows")
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
		Environment: env,
	}

	if err := db.conn.Table(tableName).Save(&wf).Error; err != nil {
		return "", err
	}
	return wf.ID, nil
}

func (db *DatabaseConnection) GetWorkflows(limit, offset int) (*pb.WorkflowList, error) {
	return db.GetWorkflowsEnv(limit, offset, "staging")
}

func (db *DatabaseConnection) GetWorkflowsEnv(limit, offset int, env string) (*pb.WorkflowList, error) {
	tableName := db.TableFor(env, "workflows")
	var workflows []Workflow
	if err := db.conn.Table(tableName).Where("source_workflow_id = '' OR source_workflow_id IS NULL").Limit(limit).Offset(offset).Find(&workflows).Error; err != nil {
		log.Printf("Error querying workflows from %s: %v", tableName, err)
		return nil, err
	}

	wl := &pb.WorkflowList{Workflows: make([]*pb.Workflow, 0)}
	for _, wf := range workflows {
		workflowID := wf.ID
		isModified := false

		var duplicate Workflow
		if err := db.conn.Table(tableName).Where("source_workflow_id = ?", wf.ID).Order("updated_at DESC").First(&duplicate).Error; err == nil {
			wf = duplicate
			isModified = true
		}

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
		envEnum := pb.Environment_PRODUCTION
		if env == "staging" {
			envEnum = pb.Environment_STAGING
		}
		wl.Workflows = append(wl.Workflows, &pb.Workflow{
			Id:          workflowID,
			Name:        wf.Name,
			Type:        wf.Type,
			Description: wf.Description,
			Nodes:       nodes,
			Edges:       edges,
			CreatedAt:   time.Unix(wf.CreatedAt, 0).Format("Jan 02, 2006"),
			UpdatedAt:   time.Unix(wf.UpdatedAt, 0).Format("Jan 02, 2006"),
			Tags:        []string(wf.Tags),
			IsModified:  isModified,
			Environment: envEnum,
		})
	}
	return wl, nil
}

func (db *DatabaseConnection) GetWorkflow(id string) (*pb.Workflow, error) {
	return db.GetWorkflowEnv(id, "staging")
}

func (db *DatabaseConnection) GetWorkflowEnv(id string, env string) (*pb.Workflow, error) {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("workflow:%s:%s", env, id)

	if cachedData, found := GetFromCache(ctx, cacheKey); found {
		var cachedWorkflow pb.Workflow
		if err := json.Unmarshal(cachedData, &cachedWorkflow); err == nil {
			return &cachedWorkflow, nil
		}
	}

	tableName := db.TableFor(env, "workflows")
	var wf Workflow
	isModified := false

	if err := db.conn.Table(tableName).First(&wf, "id = ? AND source_workflow_id != '' AND source_workflow_id IS NOT NULL", id).Error; err == nil {
		isModified = true
		if wf.SourceWorkflowID != "" {
			id = wf.SourceWorkflowID
		}
	} else if err := db.conn.Table(tableName).First(&wf, "source_workflow_id = ?", id).Error; err == nil {
		isModified = true
	} else {
		if err := db.conn.Table(tableName).First(&wf, "id = ?", id).Error; err != nil {
			log.Printf("Error querying workflow %s from %s: %v", id, tableName, err)
			return nil, err
		}
		isModified = false
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

	envEnum := pb.Environment_PRODUCTION
	if env == "staging" {
		envEnum = pb.Environment_STAGING
	}

	workflow := &pb.Workflow{
		Id:          id,
		Name:        wf.Name,
		Type:        wf.Type,
		Description: wf.Description,
		Nodes:       nodes,
		Edges:       edges,
		CreatedAt:   time.Unix(wf.CreatedAt, 0).Format("Jan 02, 2006"),
		UpdatedAt:   time.Unix(wf.UpdatedAt, 0).Format("Jan 02, 2006"),
		Tags:        wf.Tags,
		IsModified:  isModified,
		Environment: envEnum,
	}

	if err := SetCache(ctx, cacheKey, workflow, workflowCacheExpiration); err != nil {
		log.Printf("Error setting cache for workflow %s: %v", id, err)
	}

	return workflow, nil
}

func (db *DatabaseConnection) GetWebhookWorkflow(id string) (*pb.Workflow, error) {
	return db.GetWebhookWorkflowEnv(id, "staging")
}

func (db *DatabaseConnection) GetWebhookWorkflowEnv(id string, env string) (*pb.Workflow, error) {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("webhook_workflow:%s:%s", env, id)

	if cachedData, found := GetFromCache(ctx, cacheKey); found {
		var cachedWorkflow pb.Workflow
		if err := json.Unmarshal(cachedData, &cachedWorkflow); err == nil {
			return &cachedWorkflow, nil
		}
	}

	tableName := db.TableFor(env, "workflows")
	var wf Workflow
	loadedModifiedCopy := false
	if env == "production" {
		if err := db.conn.Table(tableName).First(&wf, "source_workflow_id = ? AND type = ?", id, "webhook").Error; err == nil {
			loadedModifiedCopy = true
		}
	}
	if !loadedModifiedCopy {
		if err := db.conn.Table(tableName).First(&wf, "id = ? and type = ?", id, "webhook").Error; err != nil {
			log.Printf("Error querying webhook workflow from %s: %v", tableName, err)
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

	envEnum := pb.Environment_PRODUCTION
	if env == "staging" {
		envEnum = pb.Environment_STAGING
	}

	workflow := &pb.Workflow{
		Id:          id,
		Name:        wf.Name,
		Type:        wf.Type,
		Description: wf.Description,
		Nodes:       nodes,
		Edges:       edges,
		IsModified:  loadedModifiedCopy,
		Environment: envEnum,
	}

	if err := SetCache(ctx, cacheKey, workflow, workflowCacheExpiration); err != nil {
		log.Printf("Error setting cache for webhook workflow %s: %v", id, err)
	}

	return workflow, nil
}

func (db *DatabaseConnection) GetIntervalWorkflows() (*pb.WorkflowList, error) {
	return db.GetIntervalWorkflowsEnv("staging")
}

func (db *DatabaseConnection) GetIntervalWorkflowsEnv(env string) (*pb.WorkflowList, error) {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("interval_workflows:%s", env)

	if cachedData, found := GetFromCache(ctx, cacheKey); found {
		var cachedWorkflowList pb.WorkflowList
		if err := json.Unmarshal(cachedData, &cachedWorkflowList); err == nil {
			return &cachedWorkflowList, nil
		}
	}

	tableName := db.TableFor(env, "workflows")
	var workflows []Workflow
	if err := db.conn.Table(tableName).Where("type = ? AND (source_workflow_id = '' OR source_workflow_id IS NULL)", "interval").Find(&workflows).Error; err != nil {
		log.Printf("Error querying interval workflows from %s: %v", tableName, err)
		return nil, err
	}

	envEnum := pb.Environment_PRODUCTION
	if env == "staging" {
		envEnum = pb.Environment_STAGING
	}

	wl := &pb.WorkflowList{Workflows: make([]*pb.Workflow, 0)}
	for _, wf := range workflows {
		workflowID := wf.ID
		var modified Workflow
		if err := db.conn.Table(tableName).Where("source_workflow_id = ?", wf.ID).Order("updated_at DESC").First(&modified).Error; err == nil {
			wf = modified
		}
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
			Id:          workflowID,
			Name:        wf.Name,
			Type:        wf.Type,
			Description: wf.Description,
			Nodes:       nodes,
			Edges:       edges,
			CreatedAt:   time.Unix(wf.CreatedAt, 0).Format("Jan 02, 2006"),
			UpdatedAt:   time.Unix(wf.UpdatedAt, 0).Format("Jan 02, 2006"),
			Tags:        wf.Tags,
			IsModified:  wf.SourceWorkflowID != "",
			Environment: envEnum,
		})
	}

	if err := SetCache(ctx, cacheKey, wl, workflowCacheExpiration); err != nil {
		log.Printf("Error setting cache for interval workflows: %v", err)
	}

	return wl, nil
}

func (db *DatabaseConnection) UpdateWorkflow(workflow *pb.Workflow) error {
	env := ResolveEnvName(workflow.Environment)
	return db.UpdateWorkflowEnv(workflow, env)
}

func (db *DatabaseConnection) UpdateWorkflowEnv(workflow *pb.Workflow, env string) error {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("workflow:%s:%s", env, workflow.Id)

	nodes, err := json.Marshal(workflow.Nodes)
	if err != nil {
		return err
	}
	edges, err := json.Marshal(workflow.Edges)
	if err != nil {
		return err
	}

	tableName := db.TableFor(env, "workflows")
	if env == "production" {
		var modWF Workflow
		errMod := db.conn.Table(tableName).First(&modWF, "source_workflow_id = ?", workflow.Id).Error
		now := time.Now().UTC().Unix()

		if errMod == nil {
			updates := map[string]interface{}{
				"name":        workflow.Name,
				"type":        workflow.Type,
				"description": workflow.Description,
				"nodes":       nodes,
				"edges":       edges,
				"updated_by":  workflow.UpdatedBy,
				"updated_at":  now,
				"tags":        pq.StringArray(workflow.Tags),
			}
			if err := db.conn.Table(tableName).Where("source_workflow_id = ?", workflow.Id).Updates(updates).Error; err != nil {
				return err
			}
		} else {
			var prodBase Workflow
			if err := db.conn.Table(tableName).First(&prodBase, "id = ?", workflow.Id).Error; err != nil {
				return fmt.Errorf("original published workflow %s not found in %s: %w", workflow.Id, tableName, err)
			}

			modWF = Workflow{
				ID:               uuid.NewString(),
				Name:             workflow.Name,
				Type:             workflow.Type,
				Description:      workflow.Description,
				Nodes:            nodes,
				Edges:            edges,
				CreatedBy:        workflow.CreatedBy,
				UpdatedBy:        workflow.UpdatedBy,
				Tags:             pq.StringArray(workflow.Tags),
				CreatedAt:        now,
				UpdatedAt:        now,
				Environment:      "production_modified",
				SourceWorkflowID: workflow.Id,
			}
			if err := db.conn.Table(tableName).Create(&modWF).Error; err != nil {
				return fmt.Errorf("failed to create duplicate production workflow copy in %s: %w", tableName, err)
			}
		}
	} else {
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

		if err := db.conn.Table(tableName).Where("id = ?", workflow.Id).Updates(updates).Error; err != nil {
			return err
		}

		if err := db.CreateOrUpdateWorkflowVersionEnv(workflow.Id, nodes, edges, workflow.UpdatedBy, env); err != nil {
			log.Printf("Warning: Failed to create workflow version for %s: %v", workflow.Id, err)
		}
	}

	if env == "production" {
		workflow.IsModified = true
		DeleteCache(ctx, cacheKey)
	} else {
		if err := SetCache(ctx, cacheKey, workflow, workflowCacheExpiration); err != nil {
			log.Printf("Error setting cache for workflow %s: %v", workflow.Id, err)
		}
	}

	if workflow.Type == "webhook" {
		webhookCacheKey := fmt.Sprintf("webhook_workflow:%s:%s", env, workflow.Id)
		if err := SetCache(ctx, webhookCacheKey, workflow, workflowCacheExpiration); err != nil {
			log.Printf("Error setting cache for webhook workflow %s: %v", workflow.Id, err)
		}
	}

	if workflow.Type == "interval" {
		DeleteCache(ctx, fmt.Sprintf("interval_workflows:%s", env))
	}

	return nil
}

func (db *DatabaseConnection) DeleteWorkflow(id string) error {
	return db.DeleteWorkflowEnv(id, "staging")
}

func (db *DatabaseConnection) DeleteWorkflowEnv(id string, env string) error {
	tableName := db.TableFor(env, "workflows")
	if env == "production" {
		db.conn.Table(tableName).Where("source_workflow_id = ?", id).Delete(&Workflow{})
		return db.conn.Table(tableName).Where("id = ?", id).Delete(&Workflow{}).Error
	}
	return db.conn.Table(tableName).Where("id = ?", id).Delete(&Workflow{}).Error
}

func (db *DatabaseConnection) RevertWorkflowToStaging(workflowID string) (*pb.Workflow, error) {
	ctx := context.Background()
	prodTable := db.TableFor("production", "workflows")

	targetID := workflowID
	var draftWF Workflow
	if err := db.conn.Table(prodTable).First(&draftWF, "id = ? AND source_workflow_id != '' AND source_workflow_id IS NOT NULL", workflowID).Error; err == nil && draftWF.SourceWorkflowID != "" {
		targetID = draftWF.SourceWorkflowID
	}

	res := db.conn.Exec(fmt.Sprintf("DELETE FROM %s WHERE source_workflow_id = ? OR source_workflow_id = ? OR (id = ? AND source_workflow_id != '' AND source_workflow_id IS NOT NULL)", prodTable), targetID, workflowID, workflowID)
	if res.Error != nil {
		return nil, fmt.Errorf("failed to delete duplicate workflow record: %w", res.Error)
	}
	log.Printf("RevertWorkflowToStaging deleted %d duplicate record(s) for targetID %s (workflowID %s)", res.RowsAffected, targetID, workflowID)

	db.conn.Exec(fmt.Sprintf("UPDATE %s SET is_modified = false WHERE id = ? OR id = ?", prodTable), targetID, workflowID)

	DeleteCache(ctx, fmt.Sprintf("workflow:production:%s", targetID))
	DeleteCache(ctx, fmt.Sprintf("workflow:staging:%s", targetID))
	DeleteCache(ctx, "workflow:"+targetID)
	DeleteCache(ctx, "workflow:"+workflowID)
	DeleteCache(ctx, "webhook_workflow:production:"+targetID)
	DeleteCache(ctx, "webhook_workflow:staging:"+targetID)
	DeleteCache(ctx, "interval_workflows:production")
	DeleteCache(ctx, "interval_workflows:staging")

	return db.GetWorkflowEnv(targetID, "production")
}
