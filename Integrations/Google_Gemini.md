# Google Gemini API Integration Guide for n8n
## 1. Overview
Provider: Google AI / Google Cloud
API Type: REST API
Primary Auth Method: API Key (key=AIzaSy...)
Official Docs: [Google Gemini API Documentation](https://ai.google.dev/docs)
## 2. Required Authentication Parameters
API Key: Key string starting with AIzaSy.
Target Models: gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash.
## 3. Step-by-Step Instructions to Obtain Data
Generate Gemini API Key:
Visit [Google AI Studio](https://aistudio.google.com/).
Log in with your Google Account.
Click Get API key in the left sidebar or top banner.
Click Create API key.
Choose an existing Google Cloud project or click Create API key in new project.
Copy the generated API key string immediately (AIzaSy...).
## 4. Base Endpoints & Key Resources
Base URL: https://generativelanguage.googleapis.com/v1beta
Generate Content: POST /models/{model}:generateContent?key=YOUR_API_KEY
Count Tokens: POST /models/{model}:countTokens?key=YOUR_API_KEY
Embed Content: POST /models/text-embedding-004:embedContent?key=YOUR_API_KEY
## 5. Header / Request Format
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSy_YOUR_API_KEY

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, choose Google Gemini PaLM API (or official Google AI / LangChain node) and enter your API Key.
Capabilities: Supports multimodal prompt processing (text + images/documents), structured JSON output schemas, system instructions, and tool calling.
