# HubSpot API Integration Guide for n8n
## 1. Overview
Provider: HubSpot
API Type: REST API
Primary Auth Method: Private App Access Token or OAuth2
Official Docs: [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
## 2. Required Authentication Parameters
Private App Access Token: Secret token string starting with pat-na1- or pat-eu1-.
OAuth2: Client ID and Client Secret + n8n Redirect URI (https://<n8n-host>/rest/oauth2-credential/callback).
## 3. Step-by-Step Instructions to Obtain Data
### Option A: Private App Access Token (Recommended for internal account access)
Log in to your [HubSpot Account](https://app.hubspot.com/).
Click the Settings icon (gear) in the top navigation bar.
In the left sidebar, navigate to Integrations > Private Apps.
Click Create a private app.
On the Basic Info tab, enter a Name (e.g., n8n Integration App).
Switch to the Scopes tab and choose required CRM scopes:
crm.objects.contacts.read & crm.objects.contacts.write
crm.objects.companies.read & crm.objects.companies.write
crm.objects.deals.read & crm.objects.deals.write
crm.schemas.contacts.read
Click Create app in the top right, read the warning, and click Continue creating.
Copy the generated Private App Access Token (pat-...).
### Option B: OAuth2 App (For multi-tenant SaaS integration)
Log in to your [HubSpot Developer Account](https://developers.hubspot.com/).
Go to Apps > Create app.
Under Auth settings, copy your Client ID and Client Secret.
Add Redirect URL: https://<n8n-host>/rest/oauth2-credential/callback.
## 4. Base Endpoints & Key Resources
Base URL: https://api.hubapi.com
Contacts API:
List Contacts: GET /crm/v3/objects/contacts
Create Contact: POST /crm/v3/objects/contacts
Search Contacts: POST /crm/v3/objects/contacts/search
Deals API:
List Deals: GET /crm/v3/objects/deals
Create Deal: POST /crm/v3/objects/deals
## 5. Header / Request Format
Authorization: Bearer pat-na1-YOUR-PRIVATE-APP-TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select HubSpot Developer App API (Access Token) or HubSpot OAuth2 API.
Custom Properties: Ensure any custom properties created in HubSpot are explicitly requested in the properties parameter during GET/SEARCH calls.
