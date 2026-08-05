# Microsoft Teams API Integration Guide for n8n
## 1. Overview
Provider: Microsoft Corporation (Microsoft Graph API)
API Type: REST API
Primary Auth Method: OAuth2 via Azure App Registration (Entra ID)
Official Docs: [Microsoft Graph Teams API Docs](https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview)
## 2. Required Authentication Parameters
Client ID (Application ID)
Client Secret (Secret Value)
Directory (Tenant) ID
OAuth Redirect URI: https://<n8n-host>/rest/oauth2-credential/callback
## 3. Step-by-Step Instructions to Obtain Data
Register Azure App:
Log in to [Azure Portal](https://portal.azure.com/).
Search for Microsoft Entra ID (Azure Active Directory).
In left menu, go to App registrations > click New registration.
Enter Name (e.g., n8n Teams Connector).
Under Redirect URI, select Web and paste https://<n8n-host>/rest/oauth2-credential/callback.
Click Register.
Retrieve App Identifiers:
On the Overview page, copy Application (client) ID and Directory (tenant) ID.
Generate Client Secret:
Go to Certificates & secrets > Client secrets > New client secret.
Add description and expiration, then click Add.
Copy the Secret Value immediately.
Configure Graph API Permissions:
Go to API permissions > Add a permission > Microsoft Graph.
Select Delegated permissions or Application permissions:
ChannelMessage.Send
Team.ReadBasic.All
Chat.ReadWrite
Click **Grant admin consent for **.
## 4. Base Endpoints & Key Resources
Base URL: https://graph.microsoft.com/v1.0
Send Channel Message: POST /teams/{team-id}/channels/{channel-id}/messages
List User Teams: GET /me/joinedTeams
Send Chat Message: POST /chats/{chat-id}/messages
## 5. Header / Request Format
Authorization: Bearer YOUR_MICROSOFT_GRAPH_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Microsoft Teams OAuth2 API and paste Client ID, Client Secret, and Tenant ID.
Team & Channel IDs: Can be fetched dynamically within the n8n Teams node dropdowns.
