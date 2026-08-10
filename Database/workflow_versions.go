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
	windowStart := time.Now().UTC().Add(-versionWindowHours * time.Hour).Unix()

	var existing WorkflowVersion
	err := db.conn.
		Where("workflow_id = ? AND saved_at >= ?", workflowID, windowStart).
		Order("saved_at DESC").
		First(&existing).Error

	now := time.Now().UTC().Unix()

	if err == nil {
		// Version exists within 3-hour window — update in place
		existing.Nodes = nodes
		existing.Edges = edges
		existing.SavedBy = savedBy
		existing.SavedAt = now
		if err := db.conn.Save(&existing).Error; err != nil {
			return fmt.Errorf("failed to update workflow version: %w", err)
		}
		log.Printf("Updated existing version %s (v%d) for workflow %s within 3h window", existing.ID, existing.VersionNum, workflowID)
		return nil
	}

	// No recent version — find the highest VersionNum and increment
	var maxVersion WorkflowVersion
	var nextNum int = 1
	if err := db.conn.
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
	if err := db.conn.Create(&newVersion).Error; err != nil {
		return fmt.Errorf("failed to create workflow version: %w", err)
	}
	log.Printf("Created new version %s (v%d) for workflow %s", newVersion.ID, nextNum, workflowID)
	return nil
}

// ListWorkflowVersions returns all versions for a workflow, ordered newest first.
func (db *DatabaseConnection) ListWorkflowVersions(workflowID string) ([]*pb.WorkflowVersion, error) {
	var versions []WorkflowVersion
	if err := db.conn.
		Where("workflow_id = ?", workflowID).
		Order("version_num DESC").
		Find(&versions).Error; err != nil {
		log.Printf("Error listing workflow versions for %s: %v", workflowID, err)
		return nil, err
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
			Id:         v.ID,
			WorkflowId: v.WorkflowID,
			VersionNum: int32(v.VersionNum),
			Label:      v.Label,
			Nodes:      nodes,
			Edges:      edges,
			SavedBy:    v.SavedBy,
			SavedAt:    time.Unix(v.SavedAt, 0).Format("Jan 02, 2006 15:04"),
		})
	}
	return result, nil
}

// GetWorkflowVersion returns a single version by ID.
func (db *DatabaseConnection) GetWorkflowVersion(versionID string) (*WorkflowVersion, error) {
	var version WorkflowVersion
	if err := db.conn.First(&version, "id = ?", versionID).Error; err != nil {
		return nil, fmt.Errorf("workflow version %s not found: %w", versionID, err)
	}
	return &version, nil
}

// UpdateWorkflowVersionLabel updates the user-defined label on a version.
func (db *DatabaseConnection) UpdateWorkflowVersionLabel(versionID, label string) error {
	return db.conn.Model(&WorkflowVersion{}).Where("id = ?", versionID).Update("label", label).Error
}

// SaveRemotePublishedWorkflow upserts a workflow received from a remote staging server into the production database.
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
	// A new publish supersedes any local production edit; the published copy is
	// once again the authoritative state.
	if err := db.conn.Where("source_workflow_id = ? AND environment = ?", workflow.Id, "production_modified").Delete(&Workflow{}).Error; err != nil {
		return fmt.Errorf("failed to remove modified production workflow copy: %w", err)
	}
	defer DeleteCache(context.Background(), fmt.Sprintf("workflow:production:%s", workflow.Id))

	var existing Workflow
	err = db.conn.First(&existing, "id = ? AND environment = ?", workflow.Id, "production").Error
	if err == nil {
		err = db.conn.Model(&Workflow{}).
			Where("id = ? AND environment = ?", workflow.Id, "production").
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
		IsModified:  false,
	}
	if err := db.conn.Create(&prodWF).Error; err != nil {
		return fmt.Errorf("failed to create production workflow: %w", err)
	}
	log.Printf("Created production workflow %s from remote publish", workflow.Id)
	return nil
}

// PublishWorkflowVersion copies a specific version's snapshot into the production workflow record (same-DB mode).
// If versionID is empty, the current live workflow is used as-is.
func (db *DatabaseConnection) PublishWorkflowVersion(workflowID, versionID string) error {
	var nodes JSONB
	var edges JSONB
	var stagingWF Workflow

	if err := db.conn.First(&stagingWF, "id = ? AND environment = ?", workflowID, "staging").Error; err != nil {
		return fmt.Errorf("staging workflow %s not found: %w", workflowID, err)
	}

	pubVersionID := ""
	pubVersionNum := 0

	if versionID != "" {
		version, err := db.GetWorkflowVersion(versionID)
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

		// Always ensure an explicit WorkflowVersion snapshot exists when publishing current live workflow
		var maxVersion WorkflowVersion
		nextNum := 1
		if err := db.conn.Where("workflow_id = ?", workflowID).Order("version_num DESC").First(&maxVersion).Error; err == nil {
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
		if err := db.conn.Create(&newVersion).Error; err != nil {
			log.Printf("Warning: could not create snapshot version on publish: %v", err)
			pubVersionNum = nextNum
		} else {
			pubVersionID = newVersion.ID
			pubVersionNum = newVersion.VersionNum
		}
	}

	// Delete any existing production_modified draft record when publishing a new version to production
	if err := db.conn.Where("source_workflow_id = ? AND environment = ?", workflowID, "production_modified").Delete(&Workflow{}).Error; err != nil {
		return fmt.Errorf("failed to remove modified production workflow copy: %w", err)
	}
	defer DeleteCache(context.Background(), fmt.Sprintf("workflow:production:%s", workflowID))

	// Upsert into production environment
	now := time.Now().UTC().Unix()
	var prodWF Workflow
	err := db.conn.First(&prodWF, "id = ? AND environment = ?", workflowID, "production").Error
	if err == nil {
		err = db.conn.Model(&Workflow{}).
			Where("id = ? AND environment = ?", workflowID, "production").
			Updates(map[string]interface{}{
				"name":                  stagingWF.Name,
				"type":                  stagingWF.Type,
				"description":           stagingWF.Description,
				"nodes":                 nodes,
				"edges":                 edges,
				"updated_by":            stagingWF.UpdatedBy,
				"tags":                  stagingWF.Tags,
				"updated_at":            now,
				"is_modified":           false,
				"published_version_id":  pubVersionID,
				"published_version_num": pubVersionNum,
			}).Error
		if err != nil {
			return fmt.Errorf("failed to update production workflow: %w", err)
		}
		log.Printf("Updated production workflow %s from staging version %s (v%d)", workflowID, pubVersionID, pubVersionNum)
	} else {
		prodWF = Workflow{
			ID:                  stagingWF.ID,
			Name:                stagingWF.Name,
			Type:                stagingWF.Type,
			Description:         stagingWF.Description,
			Nodes:               nodes,
			Edges:               edges,
			CreatedBy:           stagingWF.CreatedBy,
			UpdatedBy:           stagingWF.UpdatedBy,
			Tags:                stagingWF.Tags,
			CreatedAt:           stagingWF.CreatedAt,
			UpdatedAt:           now,
			Environment:         "production",
			IsModified:          false,
			PublishedVersionID:  pubVersionID,
			PublishedVersionNum: pubVersionNum,
		}
		if err := db.conn.Create(&prodWF).Error; err != nil {
			return fmt.Errorf("failed to create production workflow: %w", err)
		}
		log.Printf("Created production workflow %s from staging version %s (v%d)", workflowID, pubVersionID, pubVersionNum)
	}
	return nil
}
