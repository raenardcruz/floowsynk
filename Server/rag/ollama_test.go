package rag

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestNormalizeOllamaURL(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		envVar   string
		expected string
	}{
		{
			name:     "Bare host.docker.internal",
			input:    "host.docker.internal",
			expected: "http://host.docker.internal:11434",
		},
		{
			name:     "host.docker.internal with port",
			input:    "host.docker.internal:11434",
			expected: "http://host.docker.internal:11434",
		},
		{
			name:     "http host.docker.internal without port",
			input:    "http://host.docker.internal",
			expected: "http://host.docker.internal:11434",
		},
		{
			name:     "localhost with port and trailing slash",
			input:    "http://localhost:11434/",
			expected: "http://localhost:11434",
		},
		{
			name:     "Custom https url",
			input:    "https://ollama.mycompany.com",
			expected: "https://ollama.mycompany.com",
		},
		{
			name:     "Custom port retained",
			input:    "http://host.docker.internal:12345",
			expected: "http://host.docker.internal:12345",
		},
		{
			name:     "Environment variable override when empty",
			input:    "",
			envVar:   "http://my-ollama:11434",
			expected: "http://my-ollama:11434",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if tc.envVar != "" {
				os.Setenv("OLLAMA_BASE_URL", tc.envVar)
				defer os.Unsetenv("OLLAMA_BASE_URL")
			} else {
				os.Unsetenv("OLLAMA_BASE_URL")
			}

			result := NormalizeOllamaURL(tc.input)
			if result != tc.expected {
				t.Errorf("NormalizeOllamaURL(%q) = %q, expected %q", tc.input, result, tc.expected)
			}
		})
	}
}

func TestIsLoopbackHost(t *testing.T) {
	cases := []struct {
		host     string
		expected bool
	}{
		{"localhost", true},
		{"localhost:11434", true},
		{"127.0.0.1", true},
		{"127.0.0.1:11434", true},
		{"::1", true},
		{"[::1]:11434", true},
		{"host.docker.internal", false},
		{"host.docker.internal:11434", false},
		{"ollama", false},
	}

	for _, c := range cases {
		if res := isLoopbackHost(c.host); res != c.expected {
			t.Errorf("isLoopbackHost(%q) = %v, expected %v", c.host, res, c.expected)
		}
	}
}

func TestReplaceHostWithDockerInternal(t *testing.T) {
	cases := []struct {
		input    string
		expected string
	}{
		{"http://localhost:11434", "http://host.docker.internal:11434"},
		{"http://127.0.0.1:11434", "http://host.docker.internal:11434"},
		{"http://[::1]:11434", "http://host.docker.internal:11434"},
		{"http://localhost:8080", "http://host.docker.internal:8080"},
	}

	for _, c := range cases {
		if res := replaceHostWithDockerInternal(c.input); res != c.expected {
			t.Errorf("replaceHostWithDockerInternal(%q) = %q, expected %q", c.input, res, c.expected)
		}
	}
}

func TestListInstalledModels(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/tags" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{
			"models": [
				{
					"name": "gemma4:e2b-mlx",
					"model": "gemma4:e2b-mlx",
					"size": 7476595162,
					"details": { "family": "safetensors", "parameter_size": "7b" },
					"capabilities": ["completion", "vision"]
				},
				{
					"name": "embeddinggemma-2:latest",
					"model": "embeddinggemma-2:latest",
					"size": 1325205612,
					"details": { "family": "safetensors", "parameter_size": "2b" },
					"capabilities": ["embedding"]
				},
				{
					"name": "nomic-embed-text:latest",
					"model": "nomic-embed-text:latest",
					"size": 274302450,
					"details": { "family": "nomic-bert" },
					"capabilities": null
				}
			]
		}`))
	}))
	defer ts.Close()

	client := NewOllamaClient(ts.URL)
	models, err := client.ListInstalledModels()
	if err != nil {
		t.Fatalf("ListInstalledModels failed: %v", err)
	}

	if len(models) != 3 {
		t.Fatalf("expected 3 models, got %d", len(models))
	}

	// First model: gemma4
	if models[0].Name != "gemma4:e2b-mlx" || !models[0].IsChat || models[0].IsEmbedding {
		t.Errorf("unexpected gemma4 model: %+v", models[0])
	}

	// Second model: embeddinggemma-2
	if models[1].Name != "embeddinggemma-2:latest" || !models[1].IsEmbedding {
		t.Errorf("unexpected embeddinggemma-2 model: %+v", models[1])
	}

	// Third model: nomic-embed-text (detected via name/family substring)
	if models[2].Name != "nomic-embed-text:latest" || !models[2].IsEmbedding {
		t.Errorf("unexpected nomic-embed-text model: %+v", models[2])
	}
}

func TestLiveLocalOllamaIfAvailable(t *testing.T) {
	client := NewOllamaClient("http://localhost:11434")
	models, err := client.ListInstalledModels()
	if err != nil {
		t.Skipf("Local Ollama not reachable: %v", err)
		return
	}
	t.Logf("Found %d models in live local Ollama:", len(models))
	for _, m := range models {
		t.Logf(" - %s (isEmbed: %v, isChat: %v, size: %d)", m.Name, m.IsEmbedding, m.IsChat, m.Size)
	}
}


