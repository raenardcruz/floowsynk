package workflow

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// CheckStripeConnection verifies stored Secret Key against Stripe API balance endpoint.
func CheckStripeConnection(creds map[string]string) (bool, string) {
	secretKey := creds["secret_key"]

	if secretKey == "" {
		return false, "Missing Stripe Secret Key"
	}

	req, err := http.NewRequest("GET", "https://api.stripe.com/v1/balance", nil)
	if err != nil {
		return false, fmt.Sprintf("Failed to create request: %v", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", secretKey))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Sprintf("Connection failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Sprintf("Stripe API returned status code %d", resp.StatusCode)
	}

	return true, ""
}

// TransformStripeResponse formats raw JSON responses from Stripe API.
func TransformStripeResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "list_customers", "create_customer", "create_payment_intent", "list_subscriptions":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	}

	return rawResponse
}
