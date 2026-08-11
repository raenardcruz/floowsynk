# Kit (ConvertKit) API Integration Guide for n8n
## 1. Overview
Provider: Kit (formerly ConvertKit)
API Type: REST API (v3)
Primary Auth Method: API Key & API Secret
Official Docs: [Kit Developer API Reference](https://developers.kit.com/)
## 2. Required Authentication Parameters
API Key: Public account API key.
API Secret: Secret API key (required for sensitive read/write operations).
## 3. Step-by-Step Instructions to Obtain Data
Log in to your [Kit (ConvertKit) Account](https://app.kit.com/).
Click your account name/profile avatar in the top right corner and select Settings.
In the left navigation sidebar, select Developer.
Locate the API Key section and copy the key string.
Under API Secret, click Show and copy the secret key string.
## 4. Base Endpoints & Key Resources
Base URL: https://api.convertkit.com/v3
List Forms: GET /forms?api_key=YOUR_API_KEY
Add Subscriber to Form: POST /forms/{form_id}/subscribe
List Subscribers: GET /subscribers?api_secret=YOUR_API_SECRET
Add Tag to Subscriber: POST /tags/{tag_id}/subscribe
## 5. Header / Body Format
POST https://api.convertkit.com/v3/forms/{form_id}/subscribe

Content-Type: application/json

{

"api_key": "YOUR_API_KEY",

"email": "user@example.com",

"first_name": "Jane"

}
## 6. n8n Implementation Notes
Credential Setup: In n8n, select ConvertKit API and fill in your API Key and API Secret.
API Secret vs API Key: Read endpoints and subscriber data extraction require the api_secret, while public form submissions only require the api_key.
