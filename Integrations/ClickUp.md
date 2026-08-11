# ClickUp API Integration Guide for n8n
## 1. Overview
Provider: ClickUp
API Type: REST API (v2)
Primary Auth Method: Personal API Token (pk_...) or OAuth2
Official Docs: [ClickUp API v2 Reference](https://clickup.com/api/)
## 2. Required Authentication Parameters
Personal API Token: Secret key string starting with pk_.
Team (Workspace) ID: Unique numeric ID for your ClickUp workspace.
List ID: Target List ID for creating/fetching tasks.
## 3. Step-by-Step Instructions to Obtain Data
Generate Personal API Token:
Log in to [ClickUp](https://app.clickup.com/).
Click your profile avatar (bottom left corner in classic UI, or top right).
Select Apps (or Settings > Apps).
Under API Token, click Generate (or copy the displayed key starting with pk_...).
Find Workspace & List IDs:
Open ClickUp in a web browser and click your target List.
Look at the browser URL: https://app.clickup.com/{WORKSPACE_ID}/v/l/{LIST_ID}.
## 4. Base Endpoints & Key Resources
Base URL: https://api.clickup.com/api/v2
Create Task: POST /list/{list_id}/task
Get Tasks: GET /list/{list_id}/task
Update Task: PUT /task/{task_id}
Get Workspace Teams: GET /team
## 5. Header / Request Format
Authorization: pk_YOUR_PERSONAL_API_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select ClickUp API and paste your Personal API Token (pk_...).
Triggers: Use the ClickUp Trigger node for event-driven automation (e.g. task created, status changed).
