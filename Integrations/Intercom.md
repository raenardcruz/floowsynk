# Intercom API Integration Guide for n8n
## 1. Overview
Provider: Intercom
API Type: REST API
Primary Auth Method: Access Token (Bearer Auth) or OAuth2
Official Docs: [Intercom API Reference](https://developers.intercom.com/docs/references/rest-api/api-intro/)
## 2. Required Authentication Parameters
Access Token: Secret access token string starting with dG9r....
Intercom Version: API version header (e.g., 2.11).
## 3. Step-by-Step Instructions to Obtain Data
Create App in Intercom Developer Hub:
Log in to [Intercom Developer Hub](https://app.intercom.com/a/apps/_/developer-hub).
Click New app (top right).
Enter an App Name (e.g., n8n Support Sync).
Select your Intercom Workspace and select Internal integration.
Click Create app.
Retrieve Access Token:
Navigate to the Authentication section in the left sidebar.
Locate Access token and click Copy.
Note: For internal apps, this token provides access to your workspace data.
## 4. Base Endpoints & Key Resources
Base URL: https://api.intercom.io
List Contacts: GET /contacts
Create / Update Contact: POST /contacts
List Conversations: GET /conversations
Create Message / Reply: POST /conversations/{id}/reply
## 5. Header / Request Format
Authorization: Bearer YOUR_INTERCOM_ACCESS_TOKEN

Intercom-Version: 2.11

Accept: application/json

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Intercom API and paste your Access Token.
Triggers: Use Intercom Trigger node or Intercom Webhooks (configured in Developer Hub > Webhooks).
