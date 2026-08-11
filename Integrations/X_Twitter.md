# X (Twitter) API Integration Guide for n8n
## 1. Overview
Provider: X Corp. (formerly Twitter)
API Type: REST API (v2)
Primary Auth Method: OAuth 1.0a User Context or OAuth 2.0 Bearer Token
Official Docs: [X API v2 Reference Documentation](https://developer.x.com/en/docs/x-api)
## 2. Required Authentication Parameters
API Key (Consumer Key) & API Key Secret (Consumer Secret)
Access Token & Access Token Secret
Client ID & Client Secret (for OAuth 2.0 user login)
## 3. Step-by-Step Instructions to Obtain Data
Create Developer Project & App:
Log in to [X Developer Portal](https://developer.x.com/).
Click Projects & Apps > Overview > Create App (or sign up for Developer Tier).
Enter an App Name.
Configure User Authentication Settings:
On the App Settings page, click Edit under User authentication settings.
Set App permissions to Read and write (or Read and write and Direct messages).
Set Type of App to Web App, Automated App or Bot.
Under Callback URL / Redirect URL, add https://<n8n-host>/rest/oauth2-credential/callback.
Enter Website URL and click Save.
Generate Keys & Tokens:
Go to the Keys and tokens tab.
Under API Key and Secret, click Generate and copy both strings.
Under Access Token and Secret, click Generate and copy both strings (Access Token and Access Token Secret).
## 4. Base Endpoints & Key Resources
Base URL: https://api.twitter.com/2
Post Tweet: POST /2/tweets
Delete Tweet: DELETE /2/tweets/{id}
Get User Tweets: GET /2/users/{id}/tweets
Search Recent Tweets: GET /2/tweets/search/recent
## 5. Header / Request Format
Authorization: Bearer YOUR_OAUTH2_BEARER_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Twitter OAuth1 API (enter Consumer Key/Secret + Access Token/Secret) or Twitter OAuth2 API.
Payload Limits: X API v2 posting endpoint payload format: {"text": "Hello world from n8n!"}.
