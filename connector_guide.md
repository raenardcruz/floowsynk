# Guide: Adding a New 3rd Party Connector

This guide explains how to add a new 3rd party connector to FloowSynk, using the **GitHub** connector as a reference.

---

## 1. Create a Connector Template Configuration

Create a JSON file in `Server/connectors/templates/<connector_id>.json` (e.g., `Server/connectors/templates/github.json`).

This file configures:
- Metadata (`id`, `name`, `description`, `icon`)
- Authentication (`authType`, `baseUrl`, `oauthConfig` if using OAuth2)
- Supported `actions` (HTTP endpoint configurations)

### JSON Structure Example
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

## 2. Implement the Response Transformer (Optional)

Create a Go file in `Server/workflow/<connector_id>_connector.go` (e.g., `Server/workflow/github_connector.go`).

Use this to define a response transformation helper. This cleans up or simplifies raw payloads from the 3rd party API before return.

### Implementation Example
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

## 3. Register the Connector Transformer

Open the router file: [Server/workflow/connectors.go](file:///Users/raenard/Documents/floowsynk/Server/workflow/connectors.go).

Register the connector response transformer case inside `TransformConnectorResponse`:

```go
func TransformConnectorResponse(connectorID string, actionID string, rawResponse interface{}) interface{} {
	if rawResponse == nil {
		return nil
	}

	switch connectorID {
	case "github":
		return TransformGitHubResponse(actionID, rawResponse)
	// Add your new connector case here:
	case "<connector_id>":
		return Transform<ConnectorName>Response(actionID, rawResponse)
	default:
		return rawResponse
	}
}
```

---

## 4. Environment Setup for Consumer and Interval Jobs

Both the **Consumer** (`Jobs/Consumer`) and **Interval** (`Jobs/Interval`) jobs share the same `Server/.env` file as the main server. They use the shared `Database` package which auto-loads environment variables via `godotenv` on startup.

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
| `SERVER_GRPC_HOST` | **Interval only** | Hostname of the main gRPC server the Interval job dials into (`localhost` locally, `server` in Docker Compose) |
| `SERVER_PLAIN_GRPC_PORT` | **Interval only** | Raw gRPC port of the main server (default: `50051`) |
| `JOB_TOKEN` | **Interval only** | Shared secret authorizing the Interval job to call the gRPC server |

### Local Run (`.env` file)

Both jobs load `Server/.env` automatically when run from the project root. No separate `.env` is needed — ensure `Server/.env` contains all the variables above.

```bash
# Run Consumer job
go run Jobs/Consumer/main.go

# Run Interval job
go run Jobs/Interval/main.go
```

> **Note:** The Interval job dials the main server over plain gRPC. Make sure `SERVER_GRPC_HOST=localhost` and `SERVER_PLAIN_GRPC_PORT=50051` match the running server's plain gRPC port.

### Docker Compose Run

Both jobs are configured in `docker-compose.server.yml` and inherit from `Server/.env` via `env_file`. The host-facing env vars (`DB_HOST`, `REDIS_HOST`, `KAFKA_BROKERS`) are automatically overridden to use `host.docker.internal`. The Interval job also gets `SERVER_GRPC_HOST=server` to resolve the main server container by its service name.

```bash
docker compose -f docker-compose.server.yml up --build -d
```

No additional configuration is required beyond a correctly populated `Server/.env`.
