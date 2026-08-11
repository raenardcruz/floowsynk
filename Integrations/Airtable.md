# Airtable API Integration Guide for n8n
## 1. Overview
Provider: Airtable
API Type: REST API
Primary Auth Method: Personal Access Token (PAT)
Official Docs: [Airtable Web API Reference](https://airtable.com/developers/web/api/introduction)
## 2. Required Authentication Parameters
Personal Access Token: Key string starting with pat.
Base ID: Unique identifier for your Airtable base (starts with app).
## 3. Step-by-Step Instructions to Obtain Data
Generate Personal Access Token:
Navigate to [Airtable Create Tokens](https://airtable.com/create/tokens).
Click Create new token.
Enter a Token Name (e.g., n8n Sync Token).
Under Scopes, add:
data.records:read
data.records:write
schema.bases:read
Under Access, select All current and future bases (or select a specific base).
Click Create token and copy the secret token string (pat...).
Find Base ID & Table Name:
Open your base in Airtable.
Look at the browser URL: https://airtable.com/appXXXXXXXXXXXXXX/tblYYYYYYYYYYYYYY.
The string starting with app is your Base ID.
Table Name is the tab title at the top of your base.
## 4. Base Endpoints & Key Resources
Base URL: https://api.airtable.com/v0
List Records: GET /v0/{baseId}/{tableIdOrName}
Create Records: POST /v0/{baseId}/{tableIdOrName}
Update Records: PATCH /v0/{baseId}/{tableIdOrName}
Delete Record: DELETE /v0/{baseId}/{tableIdOrName}/{recordId}
## 5. Header / Request Format
Authorization: Bearer patYOUR_PERSONAL_ACCESS_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, choose Airtable Personal Access Token API and paste your token.
Rate Limits: Airtable imposes a limit of 5 requests per second per base. Use n8n batching or wait options if updating large datasets.
