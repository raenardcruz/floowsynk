# Twilio API Integration Guide for n8n
## 1. Overview
Provider: Twilio
API Type: REST API
Primary Auth Method: Basic Authentication (Account SID + Auth Token / API Key)
Official Docs: [Twilio REST API Documentation](https://www.twilio.com/docs/usage/api)
## 2. Required Authentication Parameters
Account SID: Unique account string starting with AC.
Auth Token: Primary secret token associated with your Twilio account.
Twilio Phone Number: Formatted in E.164 (e.g., +14155552671).
## 3. Step-by-Step Instructions to Obtain Data
Retrieve Account SID & Auth Token:
Log in to [Twilio Console](https://console.twilio.com/).
On the main dashboard, scroll to Account Info.
Copy the Account SID (AC...).
Click Show under Auth Token and copy the secret token string.
Obtain Twilio Phone Number:
In the left sidebar, go to Phone Numbers > Manage > Active numbers.
If no active numbers exist, click Buy a number and select a number with SMS/Voice capabilities.
Copy the phone number in E.164 format (+1...).
## 4. Base Endpoints & Key Resources
Base URL: https://api.twilio.com/2010-04-01
Send SMS/MMS: POST /2010-04-01/Accounts/{AccountSid}/Messages.json
Make Voice Call: POST /2010-04-01/Accounts/{AccountSid}/Calls.json
List Messages: GET /2010-04-01/Accounts/{AccountSid}/Messages.json
## 5. Header / Request Format
Authorization: Basic BASE64(ACCOUNT_SID:AUTH_TOKEN)

Content-Type: application/x-www-form-urlencoded
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Twilio API and fill in Account SID and Auth Token.
Message Body: Body data must be URL-encoded (e.g., To=+1234567890&From=+1098765432&Body=Hello+from+n8n).
