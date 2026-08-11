# OpenAI API Integration Guide for n8n
## 1. Overview
Provider: OpenAI
API Type: REST API
Primary Auth Method: API Key (Bearer Token)
Official Docs: [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
## 2. Required Authentication Parameters
API Key (OPENAI_API_KEY): Secret key used to authenticate API calls.
Organization ID (Optional): Needed if managing multiple organizations.
Project ID (Optional): Used for project-level access control.
## 3. Step-by-Step Instructions to Obtain Data
Create Account / Log In: Visit [OpenAI Platform](https://platform.openai.com/).
Add Payment Method:
Go to Settings > Billing.
Add a payment method and purchase prepaid API credits.
Generate API Key:
Navigate to API Keys.
Click Create new secret key.
Name your key and assign permissions.
Copy and save the key securely (it will only be displayed once).
Retrieve Organization ID (Optional):
Go to Settings > Organization and copy the Organization ID (org-...).
## 4. Base Endpoints & Key Resources
Base URL: https://api.openai.com/v1
Chat Completions: POST /chat/completions
Embeddings: POST /embeddings
Audio Speech/Transcription: POST /audio/transcriptions
## 5. Header / Request Format
Authorization: Bearer OPENAI_API_KEY

OpenAI-Organization: ORG_ID (optional)

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, add credentials under OpenAI API and paste the API Key.
Node Capabilities: Supports text generation, function calling, structured outputs, vision, embeddings, and AI Agent tools.
