# Google Sheets API Integration Guide for n8n
## 1. Overview
Provider: Google Cloud Platform / Google Workspace
API Type: REST API
Primary Auth Method: OAuth2 or Service Account (JSON Private Key)
Official Docs: [Google Sheets API Docs](https://developers.google.com/sheets/api)
## 2. Required Authentication Parameters
OAuth2 Method:
Client ID
Client Secret
OAuth Redirect URI: Provided by n8n instance (https://<n8n-host>/rest/oauth2-credential/callback)
Service Account Method:
Service Account Email (...@...iam.gserviceaccount.com)
Private Key (JSON Key file)
## 3. Step-by-Step Instructions to Obtain Data
### Option A: OAuth2 (Recommended for user accounts)
Google Cloud Project Setup:
Go to [Google Cloud Console](https://console.cloud.google.com/).
Create a new project or select an existing one.
Enable APIs:
Go to APIs & Services > Library.
Search for Google Sheets API and click Enable.
Search for Google Drive API and click Enable.
Configure OAuth Consent Screen:
Go to APIs & Services > OAuth consent screen.
Choose External (or Internal if Workspace user).
Fill in App Name, User Support Email, and Developer Contact Info.
Under Scopes, add https://www.googleapis.com/auth/spreadsheets and https://www.googleapis.com/auth/drive.readonly.
Save and publish app or add your user account to Test Users.
Create OAuth Credentials:
Go to Credentials > Create Credentials > OAuth client ID.
Select Web application as Application type.
Under Authorized redirect URIs, paste n8n Redirect URI.
Copy the generated Client ID and Client Secret.
### Option B: Service Account (Recommended for automated/background server execution)
Go to Credentials > Create Credentials > Service account.
Name the service account and click Create and Continue.
Go to the created Service Account > Keys tab > Add Key > Create new key (select JSON).
Download the JSON file containing the private_key and client_email.
Crucial: Open your Google Sheet in a browser and share edit access with the client_email.
## 4. Base Endpoints & Key Resources
Base URL: https://sheets.googleapis.com/v4/spreadsheets
Read Values: GET /{spreadsheetId}/values/{range}
Append Rows: POST /{spreadsheetId}/values/{range}:append?valueInputOption=USER_ENTERED
Update Values: PUT /{spreadsheetId}/values/{range}?valueInputOption=USER_ENTERED
## 5. Header / Request Format
Authorization: Bearer GOOGLE_ACCESS_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Google Sheets OAuth2 API or Google Service Account.
Sheet ID: Found in sheet URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit.
