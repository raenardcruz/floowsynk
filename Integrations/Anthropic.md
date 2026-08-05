# Anthropic API Integration Guide for n8n
## 1. Overview
Provider: Anthropic (Claude Models)
API Type: REST API
Primary Auth Method: API Key (x-api-key header)
Official Docs: [Anthropic Messages API Documentation](https://docs.anthropic.com/en/api/messages)
## 2. Required Authentication Parameters
API Key: Secret key string starting with sk-ant-api03-.
Anthropic Version: Required API header (e.g., 2023-06-01).
## 3. Step-by-Step Instructions to Obtain Data
Create Account & Set Up Billing:
Go to [Anthropic Console](https://console.anthropic.com/).
Sign up or log in.
Go to Settings > Plans & Billing and add credits/payment details.
Generate API Key:
In the console top menu, navigate to API Keys.
Click Create Key.
Enter a Key Name (e.g., n8n Integration Key).
Click Create Key and copy the secret key string immediately (sk-ant-api03-...).
## 4. Base Endpoints & Key Resources
Base URL: https://api.anthropic.com/v1
Messages Endpoint: POST /v1/messages
Supported Models: claude-3-7-sonnet-20250219, claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022
## 5. Header / Request Format
x-api-key: sk-ant-api03-YOUR_ANTHROPIC_KEY

anthropic-version: 2023-06-01

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, choose Anthropic Header Auth (or official Anthropic / LangChain node) and enter API Key.
Node Capabilities: Supports system prompts, multi-turn messages, tool calling / function execution, and streaming responses.
