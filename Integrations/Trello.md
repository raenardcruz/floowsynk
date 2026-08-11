# Trello API Integration Guide for n8n
## 1. Overview
Provider: Trello (Atlassian)
API Type: REST API (v1)
Primary Auth Method: API Key + User API Token
Official Docs: [Trello REST API Documentation](https://developer.atlassian.com/cloud/trello/rest/)
## 2. Required Authentication Parameters
API Key: 32-character hexadecimal key string.
API Token: User authorization token string.
## 3. Step-by-Step Instructions to Obtain Data
Retrieve Trello API Key:
Log in to your Trello account.
Navigate to [Trello App Key Portal](https://trello.com/app-key).
Read and accept developer terms.
Copy the 32-character string under Personal Key.
Generate User API Token:
On the same page, locate the text paragraph right below your API Key: "You can manually generate a Token...".
Click the Token link.
Review permissions on the authorization screen and click Allow.
Copy the generated secret Token string.
## 4. Base Endpoints & Key Resources
Base URL: https://api.trello.com/1
Create Card: POST /1/cards
Get Cards on Board: GET /1/boards/{board_id}/cards
Update Card: PUT /1/cards/{card_id}
Get Lists on Board: GET /1/boards/{board_id}/lists
## 5. Header / Query Format
GET https://api.trello.com/1/members/me?key=YOUR_API_KEY&token=YOUR_API_TOKEN

(Trello API accepts credentials as query parameters key and token)
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Trello API and enter both API Key and API Token.
Triggers: Use the Trello Trigger node to listen to card movements, comments, or label changes.
