# Asana API Integration Guide for n8n
## 1. Overview
Provider: Asana
API Type: REST API
Primary Auth Method: Personal Access Token (PAT) or OAuth2
Official Docs: [Asana API Reference](https://developers.asana.com/reference/rest-api-reference)
## 2. Required Authentication Parameters
Personal Access Token: Key string starting with 1/ or 2/.
Workspace GID / Project GID: Unique numeric string identifiers.
## 3. Step-by-Step Instructions to Obtain Data
Generate Personal Access Token:
Log in to Asana.
Go to [Asana Developer Console](https://app.asana.com/-/developer_console).
Scroll to Personal access tokens and click + New access token.
Enter a token description (e.g., n8n Task Automation).
Accept terms, click Create token, and copy the token string immediately.
Retrieve Workspace & Project GIDs:
Open your project in Asana.
Look at the URL in browser: https://app.asana.com/0/{PROJECT_GID}/{VIEW_ID}.
The first numeric string after /0/ is your Project GID.
## 4. Base Endpoints & Key Resources
Base URL: https://app.asana.com/api/1.0
Create Task: POST /tasks
Get Tasks in Project: GET /projects/{project_gid}/tasks
Get Task Details: GET /tasks/{task_gid}
Update Task: PUT /tasks/{task_gid}
## 5. Header / Request Format
Authorization: Bearer YOUR_ASANA_PERSONAL_ACCESS_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Asana Personal Access Token API and paste your token.
Opt Fields: Asana API requires explicit opt_fields query parameters to return specific task properties (e.g., ?opt_fields=name,notes,due_on,completed).
