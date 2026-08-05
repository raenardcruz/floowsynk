# Gmail API Integration Guide for n8n
## 1. Overview
Provider: Google Cloud Platform / Google Workspace
API Type: REST API (v1)
Primary Auth Method: OAuth2 or Service Account (Domain-Wide Delegation)
Official Docs: [Gmail API v1 Reference](https://developers.google.com/gmail/api/reference/rest)
## 2. Required Authentication Parameters
OAuth2: Client ID, Client Secret, and n8n OAuth Redirect URI (https://<n8n-host>/rest/oauth2-credential/callback).
OAuth Scopes: https://mail.google.com/, https://www.googleapis.com/auth/gmail.send, https://www.googleapis.com/auth/gmail.readonly.
## 3. Step-by-Step Instructions to Obtain Data
Enable Gmail API:
Log in to [Google Cloud Console](https://console.cloud.google.com/).
Go to APIs & Services > Library.
Search for Gmail API and click Enable.
Configure Credentials:
Go to APIs & Services > Credentials.
Click Create Credentials > OAuth client ID.
Application type: Web application.
Authorized redirect URIs: https://<n8n-host>/rest/oauth2-credential/callback.
Copy Client ID and Client Secret.
## 4. Base Endpoints & Key Resources
Base URL: https://gmail.googleapis.com/gmail/v1/users/me
Send Message: POST /messages/send
List Messages: GET /messages
Get Message Details: GET /messages/{id}
Create Draft: POST /drafts
## 5. Header / Request Format
Authorization: Bearer GOOGLE_ACCESS_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Gmail OAuth2 API.
RFC 2822 Formatting: For custom HTTP requests, emails must be Base64URL-encoded RFC 2822 formatted strings. The built-in n8n Gmail node handles this automatically.
