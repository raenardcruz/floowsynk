package workflow

import (
	"testing"
)

func TestTier1Connectors_TemplatesLoad(t *testing.T) {
	err := LoadConnectorTemplates("connectors/templates")
	if err != nil {
		t.Fatalf("failed to load connector templates: %v", err)
	}

	tier1Connectors := []string{"linear", "supabase", "resend", "sentry", "pinecone"}
	for _, id := range tier1Connectors {
		tmpl, exists := GetConnectorTemplate(id)
		if !exists {
			t.Errorf("expected connector template %s to exist", id)
			continue
		}
		if tmpl.Name == "" || len(tmpl.Actions) == 0 {
			t.Errorf("connector %s has invalid template: %+v", id, tmpl)
		}
	}
}

func TestTier1Connectors_TransformResponse(t *testing.T) {
	// 1. Linear create_issue
	linearRaw := `{
		"data": {
			"issueCreate": {
				"success": true,
				"issue": {
					"id": "lin-1",
					"identifier": "ENG-42",
					"title": "Fix login bug",
					"url": "https://linear.app/team/issue/ENG-42",
					"state": { "name": "In Progress" }
				}
			}
		}
	}`
	res := TransformConnectorResponse("linear", "create_issue", linearRaw)
	resMap, ok := res.(map[string]interface{})
	if !ok || resMap["identifier"] != "ENG-42" {
		t.Fatalf("unexpected Linear transform: %+v", res)
	}

	// 2. Supabase select_rows
	supabaseRaw := `[{"id": 1, "name": "Test User"}]`
	res = TransformConnectorResponse("supabase", "select_rows", supabaseRaw)
	resArr, ok := res.([]interface{})
	if !ok || len(resArr) != 1 {
		t.Fatalf("unexpected Supabase transform: %+v", res)
	}

	// 3. Resend send_email
	resendRaw := `{"id": "resend-uuid-123", "from": "hi@example.com"}`
	res = TransformConnectorResponse("resend", "send_email", resendRaw)
	resMap, ok = res.(map[string]interface{})
	if !ok || resMap["id"] != "resend-uuid-123" {
		t.Fatalf("unexpected Resend transform: %+v", res)
	}

	// 4. Sentry get_issue
	sentryRaw := `{"id": "sentry-123", "title": "Crash in handler"}`
	res = TransformConnectorResponse("sentry", "get_issue", sentryRaw)
	resMap, ok = res.(map[string]interface{})
	if !ok || resMap["title"] != "Crash in handler" {
		t.Fatalf("unexpected Sentry transform: %+v", res)
	}

	// 5. Pinecone query_vectors
	pineconeRaw := `{"matches": [{"id": "vec-1", "score": 0.98}]}`
	res = TransformConnectorResponse("pinecone", "query_vectors", pineconeRaw)
	resMap, ok = res.(map[string]interface{})
	if !ok || resMap["matches"] == nil {
		t.Fatalf("unexpected Pinecone transform: %+v", res)
	}
}

func TestTier1Connectors_CheckConnection_MissingCreds(t *testing.T) {
	connectors := []string{"linear", "supabase", "resend", "sentry", "pinecone"}
	emptyCreds := map[string]string{}

	for _, c := range connectors {
		valid, msg := CheckConnectorConnection(c, emptyCreds)
		if valid {
			t.Errorf("expected CheckConnectorConnection to fail with empty creds for %s", c)
		}
		if msg == "" {
			t.Errorf("expected error message for %s, got empty string", c)
		}
	}
}
