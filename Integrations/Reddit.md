# Reddit API Integration Guide for n8n
## 1. Overview
Provider: Reddit Inc.
API Type: REST API
Primary Auth Method: OAuth2 Script App (Client ID + Secret + Username + Password)
Official Docs: [Reddit API Documentation](https://www.reddit.com/dev/api/)
## 2. Required Authentication Parameters
Client ID: 14-character string located right under the app title on Reddit.
Client Secret: App secret key string.
Reddit Username & Password: Account credentials used to authorize script actions.
User-Agent: Descriptive string (e.g. n8n-script:v1.0 (by /u/yourusername)).
## 3. Step-by-Step Instructions to Obtain Data
Log in to [Reddit](https://www.reddit.com/).
Navigate to [Reddit App Preferences](https://www.reddit.com/prefs/apps).
Scroll to the bottom and click are you a developer? create an app... (or create another app...).
Fill in App Details:
name: n8n Script App
Select radio button: script (Personal use script).
redirect uri: https://<n8n-host>/rest/oauth2-credential/callback (or http://localhost).
Click create app.
Retrieve Credentials:
Client ID: Copy the 14-character string displayed directly beneath your App Name (e.g., a1b2c3d4e5f6g7).
Client Secret: Copy the string labeled secret.
## 4. Base Endpoints & Key Resources
Base URL: https://oauth.reddit.com
Submit Post: POST /api/submit
Get Subreddit Posts: GET /r/{subreddit}/hot
Get User Information: GET /api/v1/me
Add Comment: POST /api/comment
## 5. Header / Request Format
Authorization: Bearer YOUR_REDDIT_OAUTH_TOKEN

User-Agent: n8n-automation-script:v1.0 (by /u/your_reddit_username)

Content-Type: application/x-www-form-urlencoded
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Reddit OAuth2 API (or Reddit Developer API) and fill in Client ID, Client Secret, Username, Password, and User-Agent.
User-Agent Rule: Reddit strictly rate-limits or blocks requests with generic User-Agents. Ensure you set a custom User-Agent in n8n.
