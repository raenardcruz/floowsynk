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
	Environment         string `gorm:"default:'staging'"`
	IsModified          bool   `gorm:"default:false;column:is_modified"`
	PublishedVersionID  string `gorm:"column:published_version_id"`
	PublishedVersionNum int    `gorm:"column:published_version_num"`
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
		// A modified production copy has its own database primary key.  Present its
		// published workflow ID to callers so all API operations continue to use the
		// stable workflow identity.
		workflowID := wf.ID
		if AppConfig.App_Environment == "production" {
			var modified Workflow
			if err := db.conn.Where("source_workflow_id = ? AND environment = ?", wf.ID, "production_modified").Order("updated_at DESC").First(&modified).Error; err == nil {
				wf = modified
			}
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
			Id:                  workflowID,
			Name:                wf.Name,
			Type:                wf.Type,
			Description:         wf.Description,
			Nodes:               nodes,
			Edges:               edges,
			CreatedAt:           time.Unix(wf.CreatedAt, 0).Format("Jan 02, 2006"),
			UpdatedAt:           time.Unix(wf.UpdatedAt, 0).Format("Jan 02, 2006"),
			Tags:                []string(wf.Tags),
			IsModified:          wf.IsModified,
			PublishedVersionId:  wf.PublishedVersionID,
			PublishedVersionNum: int32(wf.PublishedVersionNum),
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
	if AppConfig.App_Environment == "production" {
		if err := db.conn.First(&wf, "source_workflow_id = ? AND environment = ?", id, "production_modified").Error; err != nil {
			if err := db.conn.First(&wf, "id = ? AND environment = ?", id, "production").Error; err != nil {
				if err := db.conn.First(&wf, "id = ?", id).Error; err != nil {
					log.Printf("Error querying workflow: %v", err)
					return nil, err
				}
			}
		}
	} else {
		if err := db.conn.First(&wf, "id = ? AND environment = ?", id, AppConfig.App_Environment).Error; err != nil {
			if err := db.conn.First(&wf, "id = ?", id).Error; err != nil {
				log.Printf("Error querying workflow: %v", err)
				return nil, err
			}
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
		// Keep the published ID stable even while serving fields from an edited copy.
		Id:                  id,
		Name:                wf.Name,
		Type:                wf.Type,
		Description:         wf.Description,
		Nodes:               nodes,
		Edges:               edges,
		CreatedAt:           time.Unix(wf.CreatedAt, 0).Format("Jan 02, 2006"),
		UpdatedAt:           time.Unix(wf.UpdatedAt, 0).Format("jan 02, 2006"),
		Tags:                wf.Tags,
		IsModified:          wf.IsModified,
		PublishedVersionId:  wf.PublishedVersionID,
		PublishedVersionNum: int32(wf.PublishedVersionNum),
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
	// Production edits are stored as a linked copy and must take precedence when
	// the webhook is executed by its published workflow ID.
	loadedModifiedCopy := false
	if AppConfig.App_Environment == "production" {
		if err := db.conn.First(&wf, "source_workflow_id = ? AND environment = ? AND type = ?", id, "production_modified", "webhook").Error; err == nil {
			loadedModifiedCopy = true
		}
	}
	// Webhook workflows check both staging and production (webhooks are always live).
	if !loadedModifiedCopy {
		if err := db.conn.First(&wf, "id = ? and type = ?", id, "webhook").Error; err != nil {
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
		Id:          id,
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
		workflowID := wf.ID
		if AppConfig.App_Environment == "production" {
			var modified Workflow
			if err := db.conn.Where("source_workflow_id = ? AND environment = ?", wf.ID, "production_modified").Order("updated_at DESC").First(&modified).Error; err == nil {
				wf = modified
			}
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

	if AppConfig.App_Environment == "production" {
		workflow.IsModified = true
		// Check if a separate modified draft record already exists for production
		var modWF Workflow
		errMod := db.conn.First(&modWF, "source_workflow_id = ? AND environment = ?", workflow.Id, "production_modified").Error
		now := time.Now().UTC().Unix()

		if errMod == nil {
			// Update existing draft record
			updates := map[string]interface{}{
				"name":        workflow.Name,
				"type":        workflow.Type,
				"description": workflow.Description,
				"nodes":       nodes,
				"edges":       edges,
				"updated_by":  workflow.UpdatedBy,
				"updated_at":  now,
				"tags":        pq.StringArray(workflow.Tags),
				"is_modified": true,
			}
			if err := db.conn.Model(&Workflow{}).Where("source_workflow_id = ? AND environment = ?", workflow.Id, "production_modified").Updates(updates).Error; err != nil {
				return err
			}
		} else {
			// Create a separate draft record for production edits
			var prodBase Workflow
			if err := db.conn.First(&prodBase, "id = ? AND environment = ?", workflow.Id, "production").Error; err != nil {
				return fmt.Errorf("published production workflow %s not found: %w", workflow.Id, err)
			}

			modWF = Workflow{
				ID:                  uuid.NewString(),
				Name:                workflow.Name,
				Type:                workflow.Type,
				Description:         workflow.Description,
				Nodes:               nodes,
				Edges:               edges,
				CreatedBy:           workflow.CreatedBy,
				UpdatedBy:           workflow.UpdatedBy,
				Tags:                pq.StringArray(workflow.Tags),
				CreatedAt:           now,
				UpdatedAt:           now,
				Environment:         "production_modified",
				IsModified:          true,
				PublishedVersionID:  prodBase.PublishedVersionID,
				PublishedVersionNum: prodBase.PublishedVersionNum,
				SourceWorkflowID:    workflow.Id,
			}
			if err := db.conn.Create(&modWF).Error; err != nil {
				return fmt.Errorf("failed to create modified production workflow copy: %w", err)
			}
		}

		// Also update is_modified status on the published base workflow so queries mark it as modified
		db.conn.Model(&Workflow{}).Where("id = ? AND environment = ?", workflow.Id, "production").Update("is_modified", true)
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

		if err := db.conn.Model(&Workflow{}).Where("id = ? AND environment = ?", workflow.Id, AppConfig.App_Environment).Updates(updates).Error; err != nil {
			return err
		}

		// Create or update version snapshot (staging only)
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
		DeleteCache(ctx, "interval_workflows:")
	}

	return nil
}

func (db *DatabaseConnection) DeleteWorkflow(id string) error {
	if AppConfig.App_Environment == "production" {
		if err := db.conn.Where("source_workflow_id = ? AND environment = ?", id, "production_modified").Delete(&Workflow{}).Error; err != nil {
			return err
		}
		if err := db.conn.Where("id = ? AND environment = ?", id, "production").Delete(&Workflow{}).Error; err != nil {
			return err
		}
		return nil
	}
	if err := db.conn.Delete(&Workflow{}, "id = ? AND environment = ?", id, AppConfig.App_Environment).Error; err != nil {
		return err
	}
	return nil
}

func (db *DatabaseConnection) RevertWorkflowToStaging(workflowID string) (*pb.Workflow, error) {
	ctx := context.Background()

	// Delete the separate modified draft record if it exists
	if err := db.conn.Where("source_workflow_id = ? AND environment = ?", workflowID, "production_modified").Delete(&Workflow{}).Error; err != nil {
		return nil, fmt.Errorf("failed to delete modified production workflow copy: %w", err)
	}

	// Reset is_modified flag on the published production workflow
	if err := db.conn.Model(&Workflow{}).Where("id = ? AND environment = ?", workflowID, "production").Update("is_modified", false).Error; err != nil {
		return nil, fmt.Errorf("failed to reset published production workflow: %w", err)
	}

	DeleteCache(ctx, fmt.Sprintf("workflow:%s:%s", "production", workflowID))
	DeleteCache(ctx, "workflow:"+workflowID)
	DeleteCache(ctx, "interval_workflows:")

	return db.GetWorkflow(workflowID)
}
