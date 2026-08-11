# Jira API Integration Guide for n8n
## 1. Overview
Provider: Atlassian Jira Cloud
API Type: REST API (v2 & v3)
Primary Auth Method: Basic Authentication (Email + API Token) or OAuth2
Official Docs: [Jira Cloud REST API Docs](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
## 2. Required Authentication Parameters
Domain: Your Jira Cloud URL (e.g., https://yourcompany.atlassian.net).
Email: Atlassian account email address.
API Token: Atlassian secret API token string.
## 3. Step-by-Step Instructions to Obtain Data
Generate Atlassian API Token:
Log in to [Atlassian Account Security](https://id.atlassian.com/manage-profile/security/api-tokens).
Click Create API token.
Enter a descriptive label (e.g., n8n Integration Token).
Click Create and copy the token string immediately.
Find Atlassian Domain & Project Key:
Open Jira in your browser.
Note your domain in the address bar: https://<YOUR_DOMAIN>.atlassian.net.
Open your project and note the Project Key (e.g., PROJ, DEV, KAN).
## 4. Base Endpoints & Key Resources
Base URL: https://<YOUR_DOMAIN>.atlassian.net/rest/api/3
Search Issues (JQL): POST /rest/api/3/search
Create Issue: POST /rest/api/3/issue
Get Issue Details: GET /rest/api/3/issue/{issueIdOrKey}
Update Issue: PUT /rest/api/3/issue/{issueIdOrKey}
## 5. Header / Request Format
Authorization: Basic BASE64(EMAIL:API_TOKEN)

Content-Type: application/json

Accept: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Jira Software Cloud API and enter Domain, Email, and API Token.
Issue Creation Payload: Jira API v3 uses Atlassian Document Format (ADF) for the description field.
