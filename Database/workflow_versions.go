package DB

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	pb "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
)

const versionWindowHours = 3

// WorkflowVersion stores a versioned snapshot of a workflow (staging only).
type WorkflowVersion struct {
	ID         string `gorm:"primaryKey"`
	WorkflowID string `gorm:"index;not null"`
	VersionNum int    // monotonically increasing per workflow
	Label      string // optional user-defined label (e.g. "v1 - fixed loop")
	Nodes      JSONB  `gorm:"type:jsonb"`
	Edges      JSONB  `gorm:"type:jsonb"`
	SavedBy    string
	SavedAt    int64 // unix timestamp
}

// CreateOrUpdateWorkflowVersion implements the 3-hour window versioning rule:
//   - If a version exists for this workflow saved within the last 3 hours, update it in place.
//   - Otherwise, create a new version with an incremented VersionNum.
func (db *DatabaseConnection) CreateOrUpdateWorkflowVersion(workflowID string, nodes JSONB, edges JSONB, savedBy string) error {
	return db.CreateOrUpdateWorkflowVersionEnv(workflowID, nodes, edges, savedBy, "staging")
}

func (db *DatabaseConnection) CreateOrUpdateWorkflowVersionEnv(workflowID string, nodes JSONB, edges JSONB, savedBy string, env string) error {
	tableName := db.TableFor(env, "workflow_versions")
	windowStart := time.Now().UTC().Add(-versionWindowHours * time.Hour).Unix()

	var existing WorkflowVersion
	err := db.conn.Table(tableName).
		Where("workflow_id = ? AND saved_at >= ?", workflowID, windowStart).
		Order("saved_at DESC").
		First(&existing).Error

	now := time.Now().UTC().Unix()

	if err == nil {
		existing.Nodes = nodes
		existing.Edges = edges
		existing.SavedBy = savedBy
		existing.SavedAt = now
		if err := db.conn.Table(tableName).Save(&existing).Error; err != nil {
			return fmt.Errorf("failed to update workflow version in %s: %w", tableName, err)
		}
		log.Printf("Updated existing version %s (v%d) for workflow %s in %s within 3h window", existing.ID, existing.VersionNum, workflowID, tableName)
		return nil
	}

	var maxVersion WorkflowVersion
	var nextNum int = 1
	if err := db.conn.Table(tableName).
		Where("workflow_id = ?", workflowID).
		Order("version_num DESC").
		First(&maxVersion).Error; err == nil {
		nextNum = maxVersion.VersionNum + 1
	}

	newVersion := WorkflowVersion{
		ID:         uuid.NewString(),
		WorkflowID: workflowID,
		VersionNum: nextNum,
		Label:      fmt.Sprintf("v%d", nextNum),
		Nodes:      nodes,
		Edges:      edges,
		SavedBy:    savedBy,
		SavedAt:    now,
	}
	if err := db.conn.Table(tableName).Create(&newVersion).Error; err != nil {
		return fmt.Errorf("failed to create workflow version in %s: %w", tableName, err)
	}
	log.Printf("Created new version %s (v%d) for workflow %s in %s", newVersion.ID, nextNum, workflowID, tableName)
	return nil
}

func (db *DatabaseConnection) ListWorkflowVersions(workflowID string) ([]*pb.WorkflowVersion, error) {
	return db.ListWorkflowVersionsEnv(workflowID, "staging")
}

func (db *DatabaseConnection) ListWorkflowVersionsEnv(workflowID string, env string) ([]*pb.WorkflowVersion, error) {
	tableName := db.TableFor(env, "workflow_versions")
	var versions []WorkflowVersion
	if err := db.conn.Table(tableName).
		Where("workflow_id = ?", workflowID).
		Order("version_num DESC").
		Find(&versions).Error; err != nil {
		log.Printf("Error listing workflow versions for %s in %s: %v", workflowID, tableName, err)
		return nil, err
	}

	envEnum := pb.Environment_PRODUCTION
	if env == "staging" {
		envEnum = pb.Environment_STAGING
	}

	result := make([]*pb.WorkflowVersion, 0, len(versions))
	for _, v := range versions {
		var nodes []*pb.Node
		var edges []*pb.Edge
		if err := json.Unmarshal(v.Nodes, &nodes); err != nil {
			log.Printf("Warning: failed to unmarshal nodes for version %s: %v", v.ID, err)
		}
		if err := json.Unmarshal(v.Edges, &edges); err != nil {
			log.Printf("Warning: failed to unmarshal edges for version %s: %v", v.ID, err)
		}
		result = append(result, &pb.WorkflowVersion{
			Id:          v.ID,
			WorkflowId:  v.WorkflowID,
			VersionNum:  int32(v.VersionNum),
			Label:       v.Label,
			Nodes:       nodes,
			Edges:       edges,
			SavedBy:     v.SavedBy,
			SavedAt:     time.Unix(v.SavedAt, 0).Format("Jan 02, 2006 15:04"),
			Environment: envEnum,
		})
	}
	return result, nil
}

func (db *DatabaseConnection) GetWorkflowVersion(versionID string) (*WorkflowVersion, error) {
	return db.GetWorkflowVersionEnv(versionID, "staging")
}

func (db *DatabaseConnection) GetWorkflowVersionEnv(versionID string, env string) (*WorkflowVersion, error) {
	tableName := db.TableFor(env, "workflow_versions")
	var version WorkflowVersion
	if err := db.conn.Table(tableName).First(&version, "id = ?", versionID).Error; err != nil {
		return nil, fmt.Errorf("workflow version %s not found in %s: %w", versionID, tableName, err)
	}
	return &version, nil
}

func (db *DatabaseConnection) UpdateWorkflowVersionLabel(versionID, label string) error {
	return db.UpdateWorkflowVersionLabelEnv(versionID, label, "staging")
}

func (db *DatabaseConnection) UpdateWorkflowVersionLabelEnv(versionID, label string, env string) error {
	tableName := db.TableFor(env, "workflow_versions")
	return db.conn.Table(tableName).Where("id = ?", versionID).Update("label", label).Error
}

func (db *DatabaseConnection) SaveRemotePublishedWorkflow(workflow *pb.Workflow) error {
	nodes, err := json.Marshal(workflow.Nodes)
	if err != nil {
		return fmt.Errorf("failed to marshal nodes: %w", err)
	}
	edges, err := json.Marshal(workflow.Edges)
	if err != nil {
		return fmt.Errorf("failed to marshal edges: %w", err)
	}

	now := time.Now().UTC().Unix()
	prodTable := db.TableFor("production", "workflows")
	if err := db.conn.Table(prodTable).Where("source_workflow_id = ? AND environment = ?", workflow.Id, "production_modified").Delete(&Workflow{}).Error; err != nil {
		return fmt.Errorf("failed to remove modified production workflow copy: %w", err)
	}
	defer DeleteCache(context.Background(), fmt.Sprintf("workflow:production:%s", workflow.Id))

	var existing Workflow
	err = db.conn.Table(prodTable).First(&existing, "id = ?", workflow.Id).Error
	if err == nil {
		err = db.conn.Table(prodTable).
			Where("id = ?", workflow.Id).
			Updates(map[string]interface{}{
				"name":        workflow.Name,
				"type":        workflow.Type,
				"description": workflow.Description,
				"nodes":       nodes,
				"edges":       edges,
				"updated_by":  workflow.UpdatedBy,
				"tags":        pq.StringArray(workflow.Tags),
				"updated_at":  now,
				"is_modified": false,
			}).Error
		if err != nil {
			return fmt.Errorf("failed to update production workflow: %w", err)
		}
		log.Printf("Updated production workflow %s from remote publish", workflow.Id)
		return nil
	}

	prodWF := Workflow{
		ID:          workflow.Id,
		Name:        workflow.Name,
		Type:        workflow.Type,
		Description: workflow.Description,
		Nodes:       nodes,
		Edges:       edges,
		CreatedBy:   workflow.CreatedBy,
		UpdatedBy:   workflow.UpdatedBy,
		Tags:        pq.StringArray(workflow.Tags),
		CreatedAt:   now,
		UpdatedAt:   now,
		Environment: "production",
	}
	if err := db.conn.Table(prodTable).Create(&prodWF).Error; err != nil {
		return fmt.Errorf("failed to create production workflow: %w", err)
	}
	log.Printf("Created production workflow %s from remote publish", workflow.Id)
	return nil
}

func (db *DatabaseConnection) PublishWorkflowVersion(workflowID, versionID string) error {
	var nodes JSONB
	var edges JSONB
	var stagingWF Workflow

	stagingTable := db.TableFor("staging", "workflows")
	prodTable := db.TableFor("production", "workflows")
	stagingVersionsTable := db.TableFor("staging", "workflow_versions")

	if err := db.conn.Table(stagingTable).First(&stagingWF, "id = ?", workflowID).Error; err != nil {
		return fmt.Errorf("staging workflow %s not found in %s: %w", workflowID, stagingTable, err)
	}

	pubVersionID := ""
	pubVersionNum := 0

	if versionID != "" {
		version, err := db.GetWorkflowVersionEnv(versionID, "staging")
		if err != nil {
			return err
		}
		nodes = version.Nodes
		edges = version.Edges
		pubVersionID = version.ID
		pubVersionNum = version.VersionNum
	} else {
		nodes = stagingWF.Nodes
		edges = stagingWF.Edges

		var maxVersion WorkflowVersion
		nextNum := 1
		if err := db.conn.Table(stagingVersionsTable).Where("workflow_id = ?", workflowID).Order("version_num DESC").First(&maxVersion).Error; err == nil {
			nextNum = maxVersion.VersionNum + 1
		}

		now := time.Now().UTC().Unix()
		newVersion := WorkflowVersion{
			ID:         uuid.NewString(),
			WorkflowID: workflowID,
			VersionNum: nextNum,
			Label:      fmt.Sprintf("v%d (Published)", nextNum),
			Nodes:      nodes,
			Edges:      edges,
			SavedBy:    stagingWF.UpdatedBy,
			SavedAt:    now,
		}
		if err := db.conn.Table(stagingVersionsTable).Create(&newVersion).Error; err != nil {
			log.Printf("Warning: could not create snapshot version on publish: %v", err)
			pubVersionNum = nextNum
		} else {
			pubVersionID = newVersion.ID
			pubVersionNum = newVersion.VersionNum
		}
	}

	if err := db.conn.Table(prodTable).Where("source_workflow_id = ?", workflowID).Delete(&Workflow{}).Error; err != nil {
		return fmt.Errorf("failed to remove modified production workflow copy: %w", err)
	}
	defer DeleteCache(context.Background(), fmt.Sprintf("workflow:production:%s", workflowID))

	now := time.Now().UTC().Unix()
	var prodWF Workflow
	err := db.conn.Table(prodTable).First(&prodWF, "id = ?", workflowID).Error
	if err == nil {
		err = db.conn.Table(prodTable).
			Where("id = ?", workflowID).
			Updates(map[string]interface{}{
				"name":        stagingWF.Name,
				"type":        stagingWF.Type,
				"description": stagingWF.Description,
				"nodes":       nodes,
				"edges":       edges,
				"updated_by":  stagingWF.UpdatedBy,
				"tags":        stagingWF.Tags,
				"updated_at":  now,
			}).Error
		if err != nil {
			return fmt.Errorf("failed to update production workflow: %w", err)
		}
		log.Printf("Updated production workflow %s from staging version %s (v%d)", workflowID, pubVersionID, pubVersionNum)
	} else {
		prodWF = Workflow{
			ID:          stagingWF.ID,
			Name:        stagingWF.Name,
			Type:        stagingWF.Type,
			Description: stagingWF.Description,
			Nodes:       nodes,
			Edges:       edges,
			CreatedBy:   stagingWF.CreatedBy,
			UpdatedBy:   stagingWF.UpdatedBy,
			Tags:        stagingWF.Tags,
			CreatedAt:   stagingWF.CreatedAt,
			UpdatedAt:   now,
			Environment: "production",
		}
		if err := db.conn.Table(prodTable).Create(&prodWF).Error; err != nil {
			return fmt.Errorf("failed to create production workflow: %w", err)
		}
		log.Printf("Created production workflow %s from staging version %s (v%d)", workflowID, pubVersionID, pubVersionNum)
	}
	return nil
}
