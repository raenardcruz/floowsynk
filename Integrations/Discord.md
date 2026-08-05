# Discord API Integration Guide for n8n
## 1. Overview
Provider: Discord
API Type: REST API & Webhooks
Primary Auth Method: Bot Token or Webhook URL
Official Docs: [Discord Developer Portal](https://discord.com/developers/docs/intro)
## 2. Required Authentication Parameters
Bot Token: Secret string identifying your Discord Bot.
Webhook URL: Direct channel webhook URL.
Client ID & Client Secret: Used for OAuth2 user login flows.
## 3. Step-by-Step Instructions to Obtain Data
Create Discord Application:
Go to [Discord Developer Portal Applications](https://discord.com/developers/applications).
Click New Application (top right) and name your app.
Generate Bot Token:
In the left menu, click Bot.
Click Reset Token and copy the secret token string.
Scroll down to Privileged Gateway Intents and enable Message Content Intent (required if reading messages).
Add Bot to Your Discord Server:
Go to OAuth2 > URL Generator.
Under Scopes, select bot.
Under Bot Permissions, check Send Messages, Read Message History, Embed Links, and Attach Files.
Copy the generated URL at the bottom, open it in a browser, select your server, and click Authorize.
Obtain Channel ID:
In Discord client, go to User Settings > Advanced > enable Developer Mode.
Right-click any text channel and select Copy Channel ID.
## 4. Base Endpoints & Key Resources
Base URL: https://discord.com/api/v10
Send Message: POST /channels/{channel.id}/messages
List Messages: GET /channels/{channel.id}/messages
## 5. Header / Request Format
Authorization: Bot YOUR_DISCORD_BOT_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, choose Discord Bot API and enter your Bot Token.
Embeds: n8n Discord node supports rich embeds, buttons, and file attachments.
