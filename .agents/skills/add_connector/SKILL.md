---
name: add-connector
description: Guide on how to add a new 3rd party connector based on GitHub connector patterns.
---

# Guide: Adding a New 3rd Party Connector

This guide outlines the step-by-step process of adding a new third-party connector to the FloowSynk system, modeled after the implementation of the GitHub connector.

## Step 1: Create the Connector Template Configuration File

Create a new JSON template in the template directory:
`Server/connectors/templates/<connector_id>.json`

### Template Format Example (`Server/connectors/templates/github.json`)
```json
{
  "id": "github",
  "name": "GitHub",
  "description": "Access GitHub repositories, create issues, manage pull requests and trigger workflows.",
  "icon": "/src/components/Icons/github.svg",
  "baseUrl": "https://api.github.com",
  "authType": "oauth2",
  "oauthConfig": {
    "authorizeUrl": "https://github.com/login/oauth/authorize",
    "tokenUrl": "https://github.com/login/oauth/access_token",
    "defaultScopes": ["repo", "read:user", "user:email"]
  },
  "actions": [
    {
      "id": "create_issue",
      "name": "Create Issue",
      "description": "Create a new issue in a GitHub repository",
      "path": "/repos/{{owner}}/{{repo}}/issues",
      "method": "POST",
      "headers": {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
      },
      "queryParams": [],
      "payloadTemplate": "{\"title\": \"{{title}}\", \"body\": \"{{body}}\"}"
    }
  ]
}
```

---

## Step 2: Implement the Response Transformer (Optional)

Create a Go file for custom response formatting:
`Server/workflow/<connector_id>_connector.go`

Implement `Transform<ConnectorName>Response` to format/clean raw JSON responses before sending them back to the client.

### Transformer Example (`Server/workflow/github_connector.go`)
```go
package workflow

import (
	"encoding/json"
)

// TransformGitHubResponse transforms raw GitHub API response into a simplified structure
func TransformGitHubResponse(actionID string, rawResponse interface{}) interface{} {
	var data []byte
	switch val := rawResponse.(type) {
	case string:
		data = []byte(val)
	case []byte:
		data = val
	default:
		bytes, err := json.Marshal(val)
		if err != nil {
			return rawResponse
		}
		data = bytes
	}

	switch actionID {
	case "create_issue":
		var issue struct {
			ID      int64  `json:"id"`
			Number  int    `json:"number"`
			HTMLURL string `json:"html_url"`
			State   string `json:"state"`
			Title   string `json:"title"`
		}
		if err := json.Unmarshal(data, &issue); err == nil {
			issueBytes, err := json.Marshal(issue)
			if err == nil {
				return string(issueBytes)
			}
			return issue
		}
	}

	return rawResponse
}
```

---

## Step 3: Register the Connector Transformer

Register your new connector in the main router file:
[connectors.go](file:///Users/raenard/Documents/floowsynk/Server/workflow/connectors.go)

Modify `TransformConnectorResponse` to route matching connector IDs to your custom response transformer.

```go
func TransformConnectorResponse(connectorID string, actionID string, rawResponse interface{}) interface{} {
	if rawResponse == nil {
		return nil
	}

	switch connectorID {
	case "github":
		return TransformGitHubResponse(actionID, rawResponse)
	case "<connector_id>":
		return Transform<ConnectorName>Response(actionID, rawResponse)
	default:
		return rawResponse
	}
}
```

---

## Step 4: Environment Setup for Consumer and Interval Jobs

Both the **Consumer** (`Jobs/Consumer`) and **Interval** (`Jobs/Interval`) jobs share the same `Server/.env` file as the main server. They rely on the shared `Database` package which calls `godotenv.Load()` on startup to read the `.env` file automatically.

### Required Environment Variables

| Variable | Used By | Description |
|---|---|---|
| `DB_HOST` | Consumer, Interval | PostgreSQL hostname (`localhost` locally, `host.docker.internal` in Docker) |
| `DB_PORT` | Consumer, Interval | PostgreSQL port (default: `5432`) |
| `DB_USER` | Consumer, Interval | PostgreSQL username |
| `DB_PASSWORD` | Consumer, Interval | PostgreSQL password |
| `DB_NAME` | Consumer, Interval | Target database name |
| `REDIS_HOST` | Consumer, Interval | Redis hostname (`localhost` locally, `host.docker.internal` in Docker) |
| `REDIS_PORT` | Consumer, Interval | Redis port (default: `6379`) |
| `REDIS_PASSWORD` | Consumer, Interval | Redis password (empty if none) |
| `REDIS_DB` | Consumer, Interval | Redis logical DB index (default: `0`) |
| `KAFKA_BROKERS` | **Consumer only** | Comma-separated Kafka broker addresses (e.g., `localhost:9092`) |
| `SERVER_GRPC_HOST` | **Interval only** | Hostname of the main gRPC server (`localhost` locally, `server` in Docker Compose) |
| `SERVER_PLAIN_GRPC_PORT` | **Interval only** | Raw gRPC port of the main server (default: `50051`) |
| `JOB_TOKEN` | **Interval only** | Shared secret authorizing the Interval job to call the gRPC server |

### Local Run

Both jobs read `Server/.env` automatically — no separate `.env` is needed. Run each from the project root:

```bash
# Start the Kafka consumer job
go run Jobs/Consumer/main.go

# Start the Interval processor job
go run Jobs/Interval/main.go
```

> **Interval note:** Ensure `SERVER_GRPC_HOST=localhost` and `SERVER_PLAIN_GRPC_PORT=50051` match the running server's plain gRPC address.

### Docker Compose Run

Both jobs are declared in `docker-compose.server.yml`. They inherit env from `Server/.env` via `env_file`, and Docker overrides the host-facing vars (`DB_HOST`, `REDIS_HOST`, `KAFKA_BROKERS`) to `host.docker.internal`. The Interval service also receives `SERVER_GRPC_HOST=server` so it can resolve the main server container by its Compose service name.

```bash
docker compose -f docker-compose.server.yml up --build -d
```

No extra configuration is needed beyond a correctly populated `Server/.env`.
