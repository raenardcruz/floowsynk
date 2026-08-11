# Google Drive API Integration Guide for n8n
## 1. Overview
Provider: Google Cloud Platform / Google Workspace
API Type: REST API (v3)
Primary Auth Method: OAuth2 or Service Account (JSON Key)
Official Docs: [Google Drive API v3 Documentation](https://developers.google.com/drive/api/v3/about-sdk)
## 2. Required Authentication Parameters
OAuth2 Method: Client ID, Client Secret, and n8n OAuth Redirect URI (https://<n8n-host>/rest/oauth2-credential/callback).
Service Account Method: Service Account Email and Private Key JSON file.
## 3. Step-by-Step Instructions to Obtain Data
Enable Google Drive API:
Log in to [Google Cloud Console](https://console.cloud.google.com/).
Select or create a project.
Go to APIs & Services > Library.
Search for Google Drive API and click Enable.
Configure OAuth Credentials:
Go to APIs & Services > Credentials.
Click Create Credentials > OAuth client ID.
Application type: Web application.
Under Authorized redirect URIs, add https://<n8n-host>/rest/oauth2-credential/callback.
Click Create and copy the Client ID and Client Secret.
## 4. Base Endpoints & Key Resources
Base URL: https://www.googleapis.com/drive/v3
Upload File: POST /upload/drive/v3/files?uploadType=multipart
Download File: GET /files/{fileId}?alt=media
List Files: GET /files?q='root'+in+parents+and+trashed=false
Delete File: DELETE /files/{fileId}
## 5. Header / Request Format
Authorization: Bearer GOOGLE_ACCESS_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Google Drive OAuth2 API or Google Service Account.
Folder / File IDs: Extracted from URL: https://drive.google.com/drive/folders/{FOLDER_ID}.
