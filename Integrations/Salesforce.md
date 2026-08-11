# Salesforce API Integration Guide for n8n
## 1. Overview
Provider: Salesforce
API Type: REST API / SOQL / Bulk API
Primary Auth Method: OAuth2 (Connected App)
Official Docs: [Salesforce REST API Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_rest.htm)
## 2. Required Authentication Parameters
Consumer Key (Client ID)
Consumer Secret (Client Secret)
Instance URL (e.g., https://yourcompany.my.salesforce.com)
Environment: Production or Sandbox
## 3. Step-by-Step Instructions to Obtain Data
Create Connected App in Salesforce:
Log in to your Salesforce org as an Administrator.
Click the Gear icon (top right) and select Setup.
In Quick Find box, search for App Manager and click it.
Click New Connected App (top right).
Configure Basic Information:
Connected App Name: n8n Integration
API Name: n8n_Integration
Contact Email: Enter your administrator email address.
Configure OAuth Settings:
Check the box for Enable OAuth Settings.
Callback URL: Paste n8n Redirect URI (https://<n8n-host>/rest/oauth2-credential/callback).
Under Selected OAuth Scopes, add:
Access and manage your data (api)
Perform requests at any time (refresh_token, offline_access)
Manage user data via APIs (id, profile, email, address, phone)
Uncheck "Require Proof Key for Code Exchange (PKCE)" if using standard web server OAuth.
Click Save and click Continue (Note: Salesforce OAuth setup may take 2-10 minutes to propagate).
Retrieve Consumer Key & Secret:
On the Connected App detail page, click Manage Consumer Details.
Verify identity via email passcode.
Copy the Consumer Key and Consumer Secret.
## 4. Base Endpoints & Key Resources
Base URL: https://<YOUR_INSTANCE>.my.salesforce.com/services/data/v58.0/
SOQL Query: GET /services/data/v58.0/query?q=SELECT+Id,Name,Email+FROM+Contact
Create SObject: POST /services/data/v58.0/sobjects/Lead/
Update SObject: PATCH /services/data/v58.0/sobjects/Account/{Id}
## 5. Header / Request Format
Authorization: Bearer YOUR_SALESFORCE_ACCESS_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, choose Salesforce OAuth2 API.
Environment Selection: Ensure you select Production or Sandbox depending on the login URL (login.salesforce.com vs test.salesforce.com).
