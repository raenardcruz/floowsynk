package workflow

// TransformConnectorResponse routes the transformation to the appropriate connector-specific file
func TransformConnectorResponse(connectorID string, actionID string, rawResponse interface{}) interface{} {
	if rawResponse == nil {
		return nil
	}

	switch connectorID {
	case "github":
		return TransformGitHubResponse(actionID, rawResponse)
	case "slack":
		return TransformSlackResponse(actionID, rawResponse)
	default:
		return rawResponse
	}
}

// CheckConnectorConnection verifies that stored credentials for a connection are still valid.
// Returns true if valid, false if invalid or the connector has no check implementation.
func CheckConnectorConnection(connectorID string, creds map[string]string) bool {
	switch connectorID {
	case "github":
		return CheckGitHubConnection(creds)
	case "slack":
		return CheckSlackConnection(creds)
	default:
		return false
	}
}

