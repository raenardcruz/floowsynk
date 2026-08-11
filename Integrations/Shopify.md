# Shopify API Integration Guide for n8n
## 1. Overview
Provider: Shopify
API Type: REST Admin API & GraphQL Admin API
Primary Auth Method: Custom App Admin API Access Token (shpat_...)
Official Docs: [Shopify Admin REST API Docs](https://shopify.dev/docs/api/admin-rest)
## 2. Required Authentication Parameters
Shop Subdomain: Store name prefix from yourstore.myshopify.com.
Admin API Access Token: Secret token string starting with shpat_.
API Version: Target release version string (e.g., 2024-04).
## 3. Step-by-Step Instructions to Obtain Data
Create Custom App in Shopify:
Log in to your [Shopify Admin](https://admin.shopify.com/).
Navigate to Settings (bottom left) > Apps and sales channels.
Click Develop apps (top right).
Click Create an app and enter an App Name (e.g., n8n Automation).
Configure Admin API Scopes:
Go to the Configuration tab and click Configure under Admin API integration.
Select required scopes according to your workflow needs:
read_orders, write_orders
read_products, write_products
read_customers, write_customers
read_inventory, write_inventory
Click Save.
Install App & Get Token:
Go to the API credentials tab and click Install app.
Confirm by clicking Install.
Under Admin API access token, click Reveal token once and copy the token string (shpat_...).
Note: This token is revealed only once. Store it securely.
## 4. Base Endpoints & Key Resources
Base URL: https://{shop_subdomain}.myshopify.com/admin/api/{api_version}
List Orders: GET /orders.json
Get Product: GET /products/{product_id}.json
List Customers: GET /customers.json
Update Inventory: POST /inventory_levels/set.json
## 5. Header / Request Format
X-Shopify-Access-Token: shpat_YOUR_ADMIN_ACCESS_TOKEN

Content-Type: application/json
## 6. n8n Implementation Notes
Credential Setup: In n8n, select Shopify Admin API and enter Shop Subdomain, Access Token, and API Version.
Triggers: n8n provides a Shopify Trigger node for listening to webhooks (e.g. Order Created, Product Updated).
