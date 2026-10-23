package workflow

import (
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"
)

func TestNewSafeHTTPClient_Defaults(t *testing.T) {
	client := NewSafeHTTPClient(0)
	if client.Timeout != 30*time.Second {
		t.Errorf("expected default timeout 30s, got %v", client.Timeout)
	}

	clientCustom := NewSafeHTTPClient(10 * time.Second)
	if clientCustom.Timeout != 10*time.Second {
		t.Errorf("expected custom timeout 10s, got %v", clientCustom.Timeout)
	}
}

func TestNewSafeHTTPClient_SSRFProtection(t *testing.T) {
	// Ensure ALLOW_PRIVATE_NETWORKS is not set
	os.Unsetenv("ALLOW_PRIVATE_NETWORKS")

	// Start a local test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	}))
	defer server.Close()

	client := NewSafeHTTPClient(2 * time.Second)

	// Test 1: Local test server URL (127.0.0.1 / localhost) should be blocked by default
	_, err := client.Get(server.URL)
	if err == nil {
		t.Fatalf("expected error accessing loopback URL %s, got nil", server.URL)
	}
	if !strings.Contains(err.Error(), "SSRF protection") {
		t.Errorf("expected SSRF protection error, got %v", err)
	}

	// Test 2: AWS metadata service IP 169.254.169.254 should be blocked
	_, err = client.Get("http://169.254.169.254/latest/meta-data/")
	if err == nil {
		t.Fatalf("expected error accessing link-local IP 169.254.169.254, got nil")
	}
	if !strings.Contains(err.Error(), "SSRF protection") {
		t.Errorf("expected SSRF protection error, got %v", err)
	}

	// Test 3: Private RFC 1918 IPs should be blocked
	privateTargets := []string{
		"http://10.0.0.1:8080",
		"http://172.16.0.1:8080",
		"http://192.168.1.1:8080",
		"http://0.0.0.0:8080",
	}
	for _, target := range privateTargets {
		_, err := client.Get(target)
		if err == nil {
			t.Fatalf("expected error accessing private IP %s, got nil", target)
		}
		if !strings.Contains(err.Error(), "SSRF protection") {
			t.Errorf("expected SSRF protection error for %s, got %v", target, err)
		}
	}

	// Test 4: When ALLOW_PRIVATE_NETWORKS=true, local test server request should succeed
	t.Setenv("ALLOW_PRIVATE_NETWORKS", "true")
	resp, err := client.Get(server.URL)
	if err != nil {
		t.Fatalf("expected request to succeed with ALLOW_PRIVATE_NETWORKS=true, got %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status OK (200), got %d", resp.StatusCode)
	}
}

func TestMakeRequest_SSRFAndLimit(t *testing.T) {
	os.Unsetenv("ALLOW_PRIVATE_NETWORKS")

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success": true}`))
	}))
	defer server.Close()

	wp := &WorkflowProcessor{
		ProcessVariables: make(map[string]interface{}),
	}

	// 1. Without ALLOW_PRIVATE_NETWORKS, makeRequest should fail on localhost server
	_, err := wp.makeRequest(server.URL, "GET", nil, nil)
	if err == nil {
		t.Fatalf("expected makeRequest to fail with SSRF protection error, got nil")
	}
	if !strings.Contains(err.Error(), "SSRF protection") {
		t.Errorf("expected SSRF error message, got %v", err)
	}

	// 2. With ALLOW_PRIVATE_NETWORKS=true, makeRequest should succeed
	t.Setenv("ALLOW_PRIVATE_NETWORKS", "true")
	body, err := wp.makeRequest(server.URL, "GET", nil, nil)
	if err != nil {
		t.Fatalf("expected makeRequest to succeed, got %v", err)
	}
	if wp.ProcessVariables["api.status"] != http.StatusOK {
		t.Errorf("expected api.status 200, got %v", wp.ProcessVariables["api.status"])
	}
	bodyMap, ok := body.(map[string]interface{})
	if !ok || bodyMap["success"] != true {
		t.Errorf("unexpected body returned: %v", body)
	}
}

