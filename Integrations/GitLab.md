# GitLab API Integration Guide for n8n
## 1. Overview
Provider: GitLab Inc.
API Type: REST API (v4)
Primary Auth Method: Personal Access Token (PAT) or OAuth2
Official Docs: [GitLab REST API v4 Documentation](https://docs.gitlab.com/ee/api/rest/)
## 2. Required Authentication Parameters
Personal Access Token: Key string starting with glpat-.
GitLab Domain: https://gitlab.com or custom self-hosted URL (e.g. https://gitlab.yourcompany.com).
## 3. Step-by-Step Instructions to Obtain Data
Generate Personal Access Token:
Log in to your GitLab instance.
Click your profile avatar > Edit profile > Access Tokens (or go to https://gitlab.com/-/user_settings/personal_access_tokens).
Click Add new token.
Enter a Token Name (e.g., n8n Automation).
Set Expiration Date (or leave empty if supported).
Under Select scopes, check:
api (Full API access)
read_repository & write_repository
read_user
Click Create personal access token and copy the secret string (glpat-...).
## 4. Base Endpoints & Key Resources
Base URL: https://gitlab.com/api/v4 (or https://<your-gitlab-host>/api/v4)
List Projects: GET /projects
Get Issues: GET /projects/{id}/issues
Create Issue: POST /projects/{id}/issues
Create Merge Request: POST /projects/{id}/merge_requests
Trigger Pipeline: POST /projects/{id}/pipeline
## 5. Header / Request Format
PRIVATE-TOKEN: glpat-YOUR_PERSONAL_ACCESS_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, choose GitLab API and enter your Personal Access Token and Domain URL.
Triggers: Use GitLab Trigger node to capture webhooks (push events, merge requests, pipeline status updates).
