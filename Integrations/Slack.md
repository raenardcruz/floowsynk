# Slack API Integration Guide for n8n
## 1. Overview
Provider: Slack (Salesforce)
API Type: REST API & Webhooks
Primary Auth Method: OAuth2 or Bot User Token (xoxb-...)
Official Docs: [Slack API Documentation](https://api.slack.com/docs)
## 2. Required Authentication Parameters
Bot User OAuth Token (xoxb-...): Used for bot actions (messaging, reading channels).
Client ID & Client Secret: Required when setting up OAuth2 authentication in n8n.
Signing Secret: Needed for verifying incoming webhooks/events from Slack.
## 3. Step-by-Step Instructions to Obtain Data
Create Slack App:
Go to [Slack API Apps](https://api.slack.com/apps).
Click Create New App > From scratch.
Enter App Name and select your target Slack Workspace.
Configure Bot Token Scopes:
Navigate to OAuth & Permissions in the sidebar.
Under Scopes > Bot Token Scopes, add required scopes:
chat:write (Send messages)
channels:read / groups:read (List public/private channels)
channels:history (Read messages)
users:read (Read user profiles)
files:write (Upload files)
Install App & Get Token:
Scroll up on OAuth & Permissions and click Install to Workspace.
Copy the generated Bot User OAuth Token (xoxb-...).
Configure OAuth2 for n8n (Optional for multi-tenant / user auth):
Under Basic Information, copy Client ID and Client Secret.
In OAuth & Permissions, add Redirect URL from n8n: https://<your-n8n-domain>/rest/oauth2-credential/callback.
## 4. Base Endpoints & Key Resources
Base URL: https://slack.com/api/
Post Message: POST /chat.postMessage
List Channels: GET /conversations.list
Get User Info: GET /users.info
## 5. Header / Request Format
Authorization: Bearer xoxb-YOUR-BOT-TOKEN

Content-Type: application/json; charset=utf-8
## 6. n8n Implementation Notes
Credential Setup: Choose Slack API (Bot Token) or Slack OAuth2 API.
Channel Selection: In n8n, channel names or channel IDs (e.g., C01234567) can be passed. Ensure the bot is invited to private channels using /invite @BotName.
