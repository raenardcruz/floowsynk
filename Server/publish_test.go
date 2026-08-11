package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	wf "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
	db "github.com/raenardcruz/floowsynk/Database"
)

func TestPublishWorkflowHandler_MethodNotAllowed(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/publish/workflow", nil)
	rec := httptest.NewRecorder()

	publishWorkflowHandler(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected status 405, got %d", rec.Code)
	}
}

func TestPublishWorkflowHandler_Unauthorized(t *testing.T) {
	db.AppConfig = &db.Config{Prod_API_Token: "secret_token"}

	req := httptest.NewRequest(http.MethodPost, "/api/publish/workflow", nil)
	req.Header.Set("Authorization", "wrong_token")
	rec := httptest.NewRecorder()

	publishWorkflowHandler(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", rec.Code)
	}
}

func TestPublishWorkflowHandler_MissingWorkflowID(t *testing.T) {
	db.AppConfig = &db.Config{Prod_API_Token: "secret_token"}

	payload, _ := json.Marshal(&wf.Workflow{Name: "Test Workflow"})
	req := httptest.NewRequest(http.MethodPost, "/api/publish/workflow", bytes.NewReader(payload))
	req.Header.Set("Authorization", "secret_token")
	rec := httptest.NewRecorder()

	publishWorkflowHandler(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status 400 for missing workflow ID, got %d", rec.Code)
	}
}

func TestPublishConnectionHandler_Unauthorized(t *testing.T) {
	db.AppConfig = &db.Config{Prod_API_Token: "secret_token"}

	req := httptest.NewRequest(http.MethodPost, "/api/publish/connection", nil)
	req.Header.Set("Authorization", "wrong_token")
	rec := httptest.NewRecorder()

	publishConnectionHandler(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", rec.Code)
	}
}

func TestPublishConnectionHandler_MissingID(t *testing.T) {
	db.AppConfig = &db.Config{Prod_API_Token: "secret_token"}

	payload, _ := json.Marshal(&db.Connection{Name: "Test Conn"})
	req := httptest.NewRequest(http.MethodPost, "/api/publish/connection", bytes.NewReader(payload))
	req.Header.Set("Authorization", "secret_token")
	rec := httptest.NewRecorder()

	publishConnectionHandler(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status 400 for missing connection ID, got %d", rec.Code)
	}
}

