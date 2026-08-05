# Microsoft Outlook / Office 365 API Integration Guide for n8n
## 1. Overview
Provider: Microsoft Corporation (Microsoft Graph API)
API Type: REST API
Primary Auth Method: OAuth2 (Azure App Registration)
Official Docs: [Microsoft Graph Mail & Calendar API](https://learn.microsoft.com/en-us/graph/api/resources/mail-api-overview)
## 2. Required Authentication Parameters
Client ID: Azure Application Client ID.
Client Secret: Generated Azure Client Secret Value.
Tenant ID: Azure Directory Tenant ID (common or specific organizational tenant ID).
## 3. Step-by-Step Instructions to Obtain Data
Azure App Registration:
Log in to [Azure Portal](https://portal.azure.com/).
Open Microsoft Entra ID > App registrations > click New registration.
Set Name (e.g., n8n Outlook Connector).
Supported account types: Accounts in any organizational directory and personal Microsoft accounts (or single tenant).
Set Redirect URI (Web): https://<n8n-host>/rest/oauth2-credential/callback.
Click Register.
Collect App Credentials:
Copy Application (client) ID and Directory (tenant) ID.
Navigate to Certificates & secrets > click New client secret > copy the Secret Value.
Set Permissions:
Go to API permissions > Add a permission > Microsoft Graph.
Add Delegated permissions:
Mail.ReadWrite
Mail.Send
Calendars.ReadWrite
offline_access
Click Grant admin consent if managing organization accounts.
## 4. Base Endpoints & Key Resources
Base URL: https://graph.microsoft.com/v1.0
Send Mail: POST /me/sendMail
Get Messages: GET /me/messages
Create Calendar Event: POST /me/events
Get Calendar Events: GET /me/calendarView?startDateTime={start}&endDateTime={end}
## 5. Header / Request Format
Authorization: Bearer YOUR_GRAPH_OAUTH_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Microsoft Outlook OAuth2 API or Microsoft Calendar OAuth2 API.
Attachment Handling: n8n Outlook node supports reading and sending email attachments via binary properties.
