package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckShopifyConnection verifies stored credentials against Shopify Admin API shop resource.
func CheckShopifyConnection(creds map[string]string) (bool, string) {
	shopSubdomain := creds["shop_subdomain"]
	token := creds["access_token"]
	apiVersion := creds["api_version"]

	if shopSubdomain == "" {
		return false, "Missing Shopify shop subdomain"
	}
	if token == "" {
		return false, "Missing Shopify Admin API access token"
	}
	if apiVersion == "" {
		apiVersion = "2024-04"
	}

	url := fmt.Sprintf("https://%s.myshopify.com/admin/api/%s/shop.json", shopSubdomain, apiVersion)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}

	req.Header.Set("X-Shopify-Access-Token", token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("Shopify API returned status code %d", resp.StatusCode)
	}

	return true, ""
}

// TransformShopifyResponse formats raw JSON responses from Shopify Admin API.
func TransformShopifyResponse(actionID string, rawResponse interface{}) interface{} {
	var data []byte
	switch val := rawResponse.(type) {
	case string:
		data = []byte(val)
	case []byte:
		data = val
	default:
		bytes, err := json.Marshal(val)
		if err != nil {
			return rawResponse
		}
		data = bytes
	}

	switch actionID {
	case "list_orders", "get_product", "list_customers", "update_inventory":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	}

	return rawResponse
}
