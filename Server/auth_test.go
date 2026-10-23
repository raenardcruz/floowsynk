package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestUnauthenticatedEndpoints(t *testing.T) {
	endpoints := []struct {
		name    string
		method  string
		path    string
		handler http.HandlerFunc
	}{
		{
			name:    "ClearHistory_Unauthenticated",
			method:  http.MethodPost,
			path:    "/api/history/clear",
			handler: clearHistoryHandler,
		},
		{
			name:    "CreateConnection_Unauthenticated",
			method:  http.MethodPost,
			path:    "/api/connectors/create",
			handler: createConnectionHandler,
		},
		{
			name:    "UpdateConnection_Unauthenticated",
			method:  http.MethodPatch,
			path:    "/api/connectors/rename",
			handler: updateConnectionHandler,
		},
		{
			name:    "CheckConnection_Unauthenticated",
			method:  http.MethodGet,
			path:    "/api/connectors/check?id=123",
			handler: checkConnectionHandler,
		},
		{
			name:    "RevertConnection_Unauthenticated",
			method:  http.MethodPost,
			path:    "/api/connectors/revert",
			handler: revertConnectionHandler,
		},
		{
			name:    "RevertWorkflow_Unauthenticated",
			method:  http.MethodPost,
			path:    "/api/workflow/revert",
			handler: revertWorkflowHandler,
		},
		{
			name:    "StartOAuth_Unauthenticated",
			method:  http.MethodGet,
			path:    "/api/connectors/oauth/start?connectorId=github&name=Test",
			handler: startOAuthHandler,
		},
	}

	for _, tc := range endpoints {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.path, strings.NewReader(`{}`))
			rec := httptest.NewRecorder()

			tc.handler(rec, req)

			if rec.Code != http.StatusUnauthorized {
				t.Errorf("expected status %d (StatusUnauthorized), got %d", http.StatusUnauthorized, rec.Code)
			}
		})
	}
}
