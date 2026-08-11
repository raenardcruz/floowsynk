# Notion API Integration Guide for n8n
## 1. Overview
Provider: Notion Labs
API Type: REST API
Primary Auth Method: OAuth2 or Internal Integration Token (secret_... or ntn_...)
Official Docs: [Notion API Reference](https://developers.notion.com/reference/intro)
## 2. Required Authentication Parameters
### Option A: Internal Integration Secret (API Key)
Internal Integration Secret: Secret key string starting with secret_ or ntn_.
Notion Version: Header value (e.g., 2022-06-28).
### Option B: OAuth2
Client ID & Client Secret: Obtained from Notion Developer Integration settings.
Redirect URI: https://<n8n-host>/rest/oauth2-credential/callback.
## 3. Step-by-Step Instructions to Obtain Data
Create Integration:
Go to [Notion My Integrations](https://www.notion.so/my-integrations).
Click + New integration.
Select your Workspace, enter Integration Name (e.g., n8n Sync Bot), and set Type to Internal.
Under Capabilities, enable:
Read content
Update content
Insert content
Click Save and copy the generated Internal Integration Secret.
Connect Integration to Target Pages / Databases (Crucial Step):
Open Notion and go to the Database or Page you want n8n to access.
Click the ... menu (top right corner) or click Share.
Click Add connections (or search under Share).
Search for your integration name and select Confirm.
Note: Without this connection step, API calls will return a 404 Not Found error.
## 4. Base Endpoints & Key Resources
Base URL: https://api.notion.com/v1
Query Database: POST /v1/databases/{database_id}/query
Create Page in Database: POST /v1/pages
Retrieve Page: GET /v1/pages/{page_id}
Update Page Properties: PATCH /v1/pages/{page_id}
## 5. Header / Request Format
Authorization: Bearer secret_YOUR_NOTION_SECRET

Notion-Version: 2022-06-28

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Notion API and paste the Internal Integration Secret.
Database ID: Found in URL: https://notion.so/workspace/{DATABASE_ID}?v=... (32-character hexadecimal string).
