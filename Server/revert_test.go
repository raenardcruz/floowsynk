package main

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	wf "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
	db "github.com/raenardcruz/floowsynk/Database"
)

func TestRevertWorkflowHandler_MethodNotAllowed(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/workflow/revert", nil)
	rec := httptest.NewRecorder()

	revertWorkflowHandler(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected status 405, got %d", rec.Code)
	}
}

func TestRevertWorkflowHandler_MissingID(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/api/workflow/revert", bytes.NewReader([]byte("{}")))
	rec := httptest.NewRecorder()

	revertWorkflowHandler(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status 400 for missing ID, got %d", rec.Code)
	}
}

func TestRevertWorkflow_SameDBFlow(t *testing.T) {
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Skipf("Skipping DB integration test: %v", err)
		return
	}
	DBCon = testDB
	db.AppConfig = &db.Config{App_Environment: "staging"}

	wfID := "test-wf-" + uuid.NewString()

	// 1. Create a staging workflow
	stagingWF := &wf.Workflow{
		Id:          wfID,
		Name:        "Original Staging Workflow",
		Type:        "standard",
		Description: "Staging description",
		Nodes:       []*wf.Node{{Id: "node-1"}},
		Edges:       []*wf.Edge{},
	}
	_, err = DBCon.CreateWorkflow(stagingWF)
	if err != nil {
		t.Fatalf("failed to create staging workflow: %v", err)
	}

	// 2. Publish workflow version to production
	err = DBCon.PublishWorkflowVersion(wfID, "")
	if err != nil {
		t.Fatalf("failed to publish workflow: %v", err)
	}

	// Switch environment to production to simulate production edits
	db.AppConfig.App_Environment = "production"

	// 3. Modify workflow in production
	modifiedProdWF := &wf.Workflow{
		Id:          wfID,
		Name:        "Direct Production Edit Workflow",
		Type:        "standard",
		Description: "Production edit description",
		Nodes:       []*wf.Node{{Id: "node-1"}, {Id: "node-2"}},
		Edges:       []*wf.Edge{},
	}
	err = DBCon.UpdateWorkflow(modifiedProdWF)
	if err != nil {
		t.Fatalf("failed to update production workflow: %v", err)
	}

	// Verify it is modified
	fetched, err := DBCon.GetWorkflow(wfID)
	if err != nil {
		t.Fatalf("failed to get modified workflow: %v", err)
	}
	if !fetched.IsModified {
		t.Errorf("expected workflow to be marked as modified, got false")
	}
	if fetched.Name != "Direct Production Edit Workflow" {
		t.Errorf("expected updated name, got %s", fetched.Name)
	}

	// 4. Revert workflow using published ID
	reverted, err := DBCon.RevertWorkflowToStaging(wfID)
	if err != nil {
		t.Fatalf("failed to revert workflow: %v", err)
	}

	if reverted.IsModified {
		t.Errorf("expected reverted workflow to have IsModified=false, got true")
	}
	if reverted.Name != "Original Staging Workflow" {
		t.Errorf("expected reverted workflow name 'Original Staging Workflow', got '%s'", reverted.Name)
	}
	if len(reverted.Nodes) != 1 {
		t.Errorf("expected 1 node after revert, got %d", len(reverted.Nodes))
	}
}

func TestRevertWorkflow_UsingDraftID(t *testing.T) {
	testDB, err := db.InitTestDB()
	if err != nil {
		t.Skipf("Skipping DB integration test: %v", err)
		return
	}
	DBCon = testDB
	db.AppConfig = &db.Config{App_Environment: "staging"}

	wfID := "test-wf-draft-" + uuid.NewString()

	stagingWF := &wf.Workflow{
		Id:          wfID,
		Name:        "Base Workflow",
		Type:        "standard",
		Description: "Base description",
		Nodes:       []*wf.Node{{Id: "node-1"}},
		Edges:       []*wf.Edge{},
	}
	_, err = DBCon.CreateWorkflow(stagingWF)
	if err != nil {
		t.Fatalf("failed to create staging workflow: %v", err)
	}

	err = DBCon.PublishWorkflowVersion(wfID, "")
	if err != nil {
		t.Fatalf("failed to publish workflow: %v", err)
	}

	db.AppConfig.App_Environment = "production"

	err = DBCon.UpdateWorkflow(&wf.Workflow{
		Id:          wfID,
		Name:        "Production Edit",
		Type:        "standard",
		Nodes:       []*wf.Node{{Id: "node-1"}, {Id: "node-2"}},
	})
	if err != nil {
		t.Fatalf("failed to update workflow: %v", err)
	}

	// Find the draft record ID directly in DB
	var draftRec db.Workflow
	err = testDB.GetConn().First(&draftRec, "source_workflow_id = ? AND environment = ?", wfID, "production_modified").Error
	if err != nil {
		t.Fatalf("draft record not found in DB: %v", err)
	}

	// Pass draft record's primary key ID to RevertWorkflowToStaging
	reverted, err := DBCon.RevertWorkflowToStaging(draftRec.ID)
	if err != nil {
		t.Fatalf("failed to revert workflow using draft ID: %v", err)
	}

	if reverted.Id != wfID {
		t.Errorf("expected reverted workflow ID %s, got %s", wfID, reverted.Id)
	}
	if reverted.IsModified {
		t.Errorf("expected IsModified=false, got true")
	}
}
