# ActiveCampaign API Integration Guide for n8n
## 1. Overview
Provider: ActiveCampaign
API Type: REST API (v3)
Primary Auth Method: API Key (Api-Token header)
Official Docs: [ActiveCampaign API v3 Reference](https://developers.activecampaign.com/reference/overview)
## 2. Required Authentication Parameters
API URL: Account-specific API endpoint URL (e.g., https://youraccount.api-us1.com).
API Key: Secret API Token string.
## 3. Step-by-Step Instructions to Obtain Data
Log in to your [ActiveCampaign Account](https://www.activecampaign.com/).
In the bottom left menu, click Settings (gear icon).
Click the Developer tab in the settings sub-menu.
Under the API Access section, locate:
URL: Copy your account API URL (https://<account-name>.api-us1.com).
Key: Copy your secret API Key token string.
## 4. Base Endpoints & Key Resources
Base URL: https://{account_name}.api-us1.com/api/3
List Contacts: GET /contacts
Create / Update Contact: POST /contacts or POST /contact/sync
Add Contact to List: POST /contactLists
Create Deal: POST /deals
## 5. Header / Request Format
Api-Token: YOUR_ACTIVECAMPAIGN_API_KEY

Content-Type: application/json

Accept: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select ActiveCampaign API and enter API URL and API Key.
Contact Syncing: Use POST /contact/sync endpoint in custom HTTP requests to perform upsert operations on contacts.
