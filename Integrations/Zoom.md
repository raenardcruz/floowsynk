# Zoom API Integration Guide for n8n
## 1. Overview
Provider: Zoom Communications
API Type: REST API (v2)
Primary Auth Method: Server-to-Server OAuth (Account ID + Client ID + Client Secret)
Official Docs: [Zoom Developer REST API Docs](https://developers.zoom.us/docs/api/rest/)
## 2. Required Authentication Parameters
Account ID: Zoom Account Identifier.
Client ID: OAuth Client ID string.
Client Secret: Secret OAuth Client Secret string.
## 3. Step-by-Step Instructions to Obtain Data
Create Server-to-Server OAuth App:
Log in to [Zoom App Marketplace](https://marketplace.zoom.us/).
Click Develop (top right menu) > Build App.
Under Server-to-Server OAuth, click Create.
Enter an App Name (e.g., n8n Zoom Automation) and click Create.
Retrieve Credentials:
On the App Credentials tab, copy Account ID, Client ID, and Client Secret.
Configure Scopes & Activate App:
Navigate to the Scopes tab and click + Add Scopes.
Select required scopes:
meeting:write:admin or meeting:write (Create/Update meetings)
meeting:read:admin or meeting:read (List meetings)
recording:read:admin (Access cloud recordings)
Go to the Activation tab and click Activate your app.
## 4. Base Endpoints & Key Resources
Base URL: https://api.zoom.us/v2
Create Meeting: POST /users/{userId}/meetings
List Meetings: GET /users/{userId}/meetings
Get Recording: GET /meetings/{meetingId}/recordings
## 5. Header / Request Format
Authorization: Bearer YOUR_OAUTH_ACCESS_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, choose Zoom Server-to-Server OAuth API and enter Account ID, Client ID, and Client Secret.
User ID: Use me or user email address in endpoint paths to target meeting actions.
