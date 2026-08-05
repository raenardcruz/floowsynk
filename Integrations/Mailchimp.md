# Mailchimp API Integration Guide for n8n
## 1. Overview
Provider: Mailchimp (Intuit)
API Type: REST API (v3)
Primary Auth Method: API Key (ends with datacenter suffix) or OAuth2
Official Docs: [Mailchimp Marketing API Reference](https://mailchimp.com/developer/marketing/api/)
## 2. Required Authentication Parameters
API Key: String formatted as 32-char-hex-string-usX (e.g., xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-usXX).
Server Prefix / Datacenter: Datacenter identifier code (e.g., us21, us6).
## 3. Step-by-Step Instructions to Obtain Data
Generate Mailchimp API Key:
Log in to your [Mailchimp Dashboard](https://login.mailchimp.com/).
Click your profile icon/avatar at the bottom left and select Account & billing (or Profile).
Click Extras in the top navigation bar and select API keys.
Under the Your API Keys section, click Create A Key.
Enter an API Key Name (e.g., n8n Automation).
Click Generate Key and copy the generated token string.
Identify Server Prefix:
Look at the end of your generated API Key: the characters after the hyphen (e.g., -us21) represent your Server Prefix.
Alternatively, look at your browser address bar when logged into Mailchimp: https://us21.admin.mailchimp.com.
## 4. Base Endpoints & Key Resources
Base URL: https://{server_prefix}.api.mailchimp.com/3.0
List Audiences: GET /lists
Add/Update Member: PUT /lists/{list_id}/members/{subscriber_hash}
Create Campaign: POST /campaigns
## 5. Header / Request Format
Authorization: Basic BASE64(anystring:YOUR_MAILCHIMP_API_KEY)

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Mailchimp API and enter your API Key.
Subscriber Hash: Mailchimp uses MD5 hash of lowercase email address to target individual subscribers (e.g., md5("user@example.com")).
