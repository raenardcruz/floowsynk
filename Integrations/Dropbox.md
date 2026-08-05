# Dropbox API Integration Guide for n8n
## 1. Overview
Provider: Dropbox Inc.
API Type: REST API (v2)
Primary Auth Method: OAuth2 (App Key + App Secret) or Generated Access Token
Official Docs: [Dropbox HTTP API v2 Documentation](https://www.dropbox.com/developers/documentation/http/documentation)
## 2. Required Authentication Parameters
App Key (Client ID)
App Secret (Client Secret)
Access Token / Refresh Token
Redirect URI: https://<n8n-host>/rest/oauth2-credential/callback
## 3. Step-by-Step Instructions to Obtain Data
Create App in Dropbox App Console:
Log in to [Dropbox App Console](https://www.dropbox.com/developers/apps).
Click Create app.
Select API type: Scoped access.
Choose access type: Full Dropbox (or App folder for restricted access).
Enter an App Name (e.g., n8n File Automation).
Click Create app.
Configure Permissions:
Navigate to the Permissions tab.
Check required scopes:
files.content.read
files.content.write
files.metadata.read
Click Submit at the bottom of the page to save scope updates.
Configure OAuth & Redirect URI:
Return to the Settings tab.
Under OAuth 2 > Redirect URIs, add https://<n8n-host>/rest/oauth2-credential/callback and click Add.
Copy the App key and App secret.
Set Token expiration to Access token expiration: Short-lived (standard OAuth2 refresh token workflow).
## 4. Base Endpoints & Key Resources
Content Base URL: https://content.dropboxapi.com/2
RPC Base URL: https://api.dropboxapi.com/2
Upload File: POST https://content.dropboxapi.com/2/files/upload
Download File: POST https://content.dropboxapi.com/2/files/download
List Folder Contents: POST https://api.dropboxapi.com/2/files/list_folder
## 5. Header / Request Format
Authorization: Bearer YOUR_DROPBOX_ACCESS_TOKEN

Dropbox-API-Arg: {"path": "/folder/file.pdf", "mode": "add"}

Content-Type: application/octet-stream
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Dropbox OAuth2 API and enter App Key and App Secret.
Path Syntax: Dropbox API paths must start with a forward slash (e.g. /folder/subfolder/file.txt).
