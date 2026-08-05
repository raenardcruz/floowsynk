# Zendesk API Integration Guide for n8n
## 1. Overview
Provider: Zendesk
API Type: REST API (v2)
Primary Auth Method: API Token Basic Auth (email/token:API_TOKEN) or OAuth2
Official Docs: [Zendesk Developer Documentation](https://developer.zendesk.com/api-reference/)
## 2. Required Authentication Parameters
Subdomain: Your Zendesk organization prefix (yoursubdomain.zendesk.com).
Email: Admin or agent email address with /token appended (email@company.com/token).
API Token: Generated secret token string from Zendesk Admin Center.
## 3. Step-by-Step Instructions to Obtain Data
Enable Token Access in Zendesk:
Log in to your Zendesk instance as an admin.
Go to Admin Center (https://<your-subdomain>.zendesk.com/admin).
In left menu, navigate to Apps and integrations > APIs > Zendesk APIs.
Under Settings, ensure Token access is toggled ON.
Generate API Token:
On the same page, click Add API token (top right).
Enter a token description (e.g., n8n Support Bot).
Click Save and copy the generated API Token string immediately.
Note Subdomain:
Look at your browser address bar: https://<YOUR_SUBDOMAIN>.zendesk.com.
## 4. Base Endpoints & Key Resources
Base URL: https://<YOUR_SUBDOMAIN>.zendesk.com/api/v2
List Tickets: GET /api/v2/tickets.json
Create Ticket: POST /api/v2/tickets.json
Update Ticket: PUT /api/v2/tickets/{ticket_id}.json
List Users: GET /api/v2/users.json
## 5. Header / Request Format
Authorization: Basic BASE64(YOUR_EMAIL/token:YOUR_API_TOKEN)

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Zendesk API and fill in Subdomain, Email Address, and API Token.
Triggers: Use Zendesk Trigger or set up Zendesk Webhooks via Admin Center > Objects and rules > Webhooks.
