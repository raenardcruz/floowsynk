# Telegram Bot API Integration Guide for n8n
## 1. Overview
Provider: Telegram
API Type: REST API & Webhooks
Primary Auth Method: Bot API Access Token
Official Docs: [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
## 2. Required Authentication Parameters
Access Token: String in format 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ....
Chat ID: Numeric identifier for a user chat, group, or channel (e.g., 12345678 or -100123456789).
## 3. Step-by-Step Instructions to Obtain Data
Create Telegram Bot via @BotFather:
Open Telegram and search for the official @BotFather account.
Click Start or send /newbot.
Enter a display name for your bot (e.g., n8n Notification Bot).
Enter a username for your bot (must end in bot, e.g., my_n8n_notify_bot).
BotFather will generate an HTTP API Token. Copy and save this token string.
Obtain Chat ID:
Open a direct chat with your new bot and click Start or send a test message.
In a web browser, open: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates.
Locate "chat":{"id":12345678,...} in the JSON response. Copy this numeric Chat ID.
For Groups/Channels: Add the bot as a member/admin, send a message in the group, and refresh getUpdates to get the negative group ID (e.g., -100...).
## 4. Base Endpoints & Key Resources
Base URL: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/
Send Text Message: POST /sendMessage
Send Photo / Document: POST /sendPhoto or POST /sendDocument
Set Webhook: POST /setWebhook?url=https://<n8n-host>/webhook/telegram
## 5. Header / Request Format
Content-Type: application/json

(Token is passed directly in the URL endpoint path)
## 6. n8n Implementation Notes
Credential Setup: In n8n, choose Telegram API and paste the Access Token.
Triggers: Use the Telegram Trigger node for event-driven workflows (e.g. reacting to incoming user commands, photos, or voice notes).
