# GitHub API Integration Guide for n8n
## 1. Overview
Provider: GitHub (Microsoft)
API Type: REST API (v3) & GraphQL API (v4)
Primary Auth Method: Personal Access Token (PAT), GitHub OAuth App, or GitHub App
Official Docs: [GitHub REST API Documentation](https://docs.github.com/en/rest)
## 2. Required Authentication Parameters
Personal Access Token (PAT): Token string starting with ghp_ (Classic) or github_pat_ (Fine-grained).
OAuth App: Client ID and Client Secret + n8n Callback URL (https://<n8n-host>/rest/oauth2-credential/callback).
## 3. Step-by-Step Instructions to Obtain Data
### Option A: Personal Access Token (Fastest for single user / admin)
Log in to [GitHub](https://github.com/).
Click your profile avatar (top right) > Settings.
Scroll down the left sidebar and click Developer settings.
Select Personal access tokens > Fine-grained tokens (or Tokens (classic)).
Click Generate new token.
Set Token Name, Expiration, and select Repository Access (All or Only select repositories).
Configure Permissions:
Contents: Read/Write (Code, branches)
Issues: Read/Write (Issue tracking)
Pull Requests: Read/Write
Workflows: Read/Write (Trigger GitHub Actions)
Click Generate token and copy the generated token string immediately.
### Option B: OAuth App (For multi-user authentication)
Under Developer settings, click OAuth Apps > New OAuth App.
Enter Application Name, Homepage URL, and Authorization callback URL (https://<n8n-host>/rest/oauth2-credential/callback).
Click Register application.
Copy the Client ID, then click Generate a new client secret and copy the Client Secret.
## 4. Base Endpoints & Key Resources
Base URL: https://api.github.com
User Profile: GET /user
List User Repos: GET /user/repos
Create Issue: POST /repos/{owner}/{repo}/issues
Trigger Workflow: POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches
## 5. Header / Request Format
Authorization: Bearer YOUR_GITHUB_TOKEN

Accept: application/vnd.github+json

X-GitHub-Api-Version: 2022-11-28

User-Agent: n8n-Integration
## 6. n8n Implementation Notes
Credential Setup: In n8n, select GitHub API (Paste PAT) or GitHub OAuth2 API (Client ID & Secret).
Triggers: n8n has a GitHub Trigger node that listens to webhooks (e.g., push events, pull requests, issue creations).
