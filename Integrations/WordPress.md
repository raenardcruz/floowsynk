# WordPress REST API Integration Guide for n8n
## 1. Overview
Provider: WordPress.org (Self-Hosted) & WordPress.com
API Type: REST API (v2)
Primary Auth Method: WordPress Application Passwords (Basic Auth) or JWT
Official Docs: [WordPress REST API Developer Handbook](https://developer.wordpress.org/rest-api/)
## 2. Required Authentication Parameters
URL: WordPress site base URL (e.g., https://yourblog.com).
Username: Administrator or editor username.
Application Password: Generated 24-character application password.
## 3. Step-by-Step Instructions to Obtain Data
Log in to your WordPress Admin Dashboard (https://yourwebsite.com/wp-admin).
In the left sidebar, navigate to Users > Profile (or All Users > edit your user account).
Scroll down to the Application Passwords section.
In the New Application Password Name text field, enter a name (e.g., n8n Automation).
Click Add New Application Password.
Copy the generated application password string immediately (abcd efgh ijkl mnop).
## 4. Base Endpoints & Key Resources
Base URL: https://yourwebsite.com/wp-json/wp/v2
List Posts: GET /wp-json/wp/v2/posts
Create Post: POST /wp-json/wp/v2/posts
Update Post: POST /wp-json/wp/v2/posts/{id}
Media Upload: POST /wp-json/wp/v2/media
Get Categories: GET /wp-json/wp/v2/categories
## 5. Header / Request Format
Authorization: Basic BASE64(USERNAME:APPLICATION_PASSWORD)

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select WordPress API and fill in Site URL, Username, and Application Password.
Post Status: By default, creating a post via API sets status: "draft". Pass status: "publish" in the request body to publish immediately.
