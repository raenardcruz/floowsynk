# Pipedrive API Integration Guide for n8n
## 1. Overview
Provider: Pipedrive
API Type: REST API (v1)
Primary Auth Method: Personal API Token or OAuth2
Official Docs: [Pipedrive API Reference](https://developers.pipedrive.com/docs/api/v1)
## 2. Required Authentication Parameters
Personal API Token: Secret 40-character hexadecimal token.
Company Domain: Your Pipedrive URL prefix (yourcompany.pipedrive.com).
## 3. Step-by-Step Instructions to Obtain Data
Retrieve Personal API Token:
Log in to your [Pipedrive Account](https://pipedrive.com/).
Click your profile icon/avatar in the top right corner.
Select Personal preferences.
Navigate to the API tab.
Under Your personal API token, copy the 40-character string (or click Generate new token if none exists).
Identify Company Domain:
Look at your browser address bar: https://<YOUR_COMPANY_DOMAIN>.pipedrive.com.
## 4. Base Endpoints & Key Resources
Base URL: https://{company_domain}.pipedrive.com/v1
List Deals: GET /deals
Create Deal: POST /deals
List Persons (Contacts): GET /persons
Create Organization: POST /organizations
## 5. Header / Query Format
GET https://yourcompany.pipedrive.com/v1/deals?api_token=YOUR_PERSONAL_API_TOKEN

(Pipedrive API passes credentials as api_token query parameter or Bearer token)
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Pipedrive API and fill in your API Token and Company Domain.
Custom Fields: Pipedrive identifies custom fields using 40-character hash keys (e.g. 2a7c8...). n8n resolves these in node field mapping dropdowns.
