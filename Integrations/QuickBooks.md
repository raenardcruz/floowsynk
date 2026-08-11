# QuickBooks Online API Integration Guide for n8n
## 1. Overview
Provider: Intuit QuickBooks
API Type: REST API (v3)
Primary Auth Method: OAuth2 (Client ID + Client Secret + Realm ID)
Official Docs: [QuickBooks Online Accounting API Reference](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/account)
## 2. Required Authentication Parameters
Client ID: Intuit OAuth Client ID.
Client Secret: Intuit OAuth Client Secret.
Company ID (Realm ID): Unique numeric ID for your QuickBooks Online company.
Environment: Sandbox or Production.
## 3. Step-by-Step Instructions to Obtain Data
Create App in Intuit Developer Portal:
Log in to [Intuit Developer Portal](https://developer.intuit.com/).
Go to My Apps > click Create an app.
Select QuickBooks Online and Payments as the platform.
Enter App Name (e.g., n8n Invoice Sync).
Configure OAuth & Redirect URI:
Under the Keys & credentials menu, select Keys & OAuth under Development (for testing) or Production.
Under Redirect URIs, click Add URI and enter https://<n8n-host>/rest/oauth2-credential/callback.
Click Save.
Copy the generated Client ID and Client Secret.
Find Company ID (Realm ID):
Open QuickBooks Online in a browser.
Press Ctrl + Alt + ? (or Cmd + Option + ? on Mac) to display your Company ID (Realm ID).
## 4. Base Endpoints & Key Resources
Base URL (Production): https://quickbooks.api.intuit.com/v3/company/{realmId}
Base URL (Sandbox): https://sandbox-quickbooks.api.intuit.com/v3/company/{realmId}
Create Invoice: POST /invoice
Get Customer: GET /customer/{customerId}
Execute Query (SQL-like): GET /query?query=SELECT+*+FROM+Invoice
## 5. Header / Request Format
Authorization: Bearer YOUR_INTUIT_OAUTH_TOKEN

Accept: application/json

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select QuickBooks OAuth2 API and enter Client ID, Client Secret, Company ID (Realm ID), and select Environment (Sandbox/Production).
Minor Version Header: Add minorversion=65 as query parameter to ensure compatibility with latest API fields.
