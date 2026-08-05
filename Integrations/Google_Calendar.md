# Google Calendar API Integration Guide for n8n
## 1. Overview
Provider: Google Cloud Platform / Google Workspace
API Type: REST API (v3)
Primary Auth Method: OAuth2 or Service Account (JSON Key)
Official Docs: [Google Calendar API Docs](https://developers.google.com/calendar/api/v3/reference)
## 2. Required Authentication Parameters
OAuth2: Client ID, Client Secret, and n8n OAuth Redirect URI (https://<n8n-host>/rest/oauth2-credential/callback).
OAuth Scopes: https://www.googleapis.com/auth/calendar and https://www.googleapis.com/auth/calendar.events.
## 3. Step-by-Step Instructions to Obtain Data
Enable Google Calendar API:
Log in to [Google Cloud Console](https://console.cloud.google.com/).
Select or create a project.
Go to APIs & Services > Library.
Search for Google Calendar API and click Enable.
Configure OAuth Credentials:
Go to APIs & Services > Credentials.
Click Create Credentials > OAuth client ID.
Application type: Web application.
Under Authorized redirect URIs, add https://<n8n-host>/rest/oauth2-credential/callback.
Click Create and copy the Client ID and Client Secret.
## 4. Base Endpoints & Key Resources
Base URL: https://www.googleapis.com/calendar/v3
Create Event: POST /calendars/{calendarId}/events
List Events: GET /calendars/{calendarId}/events
Update Event: PUT /calendars/{calendarId}/events/{eventId}
Delete Event: DELETE /calendars/{calendarId}/events/{eventId}
## 5. Header / Request Format
Authorization: Bearer GOOGLE_ACCESS_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, choose Google Calendar OAuth2 API.
Calendar ID: Use primary for the authenticated user's default calendar, or enter a specific shared calendar email.
