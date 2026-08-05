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
	case "discord":
		return TransformDiscordResponse(actionID, rawResponse)
	case "trello":
		return TransformTrelloResponse(actionID, rawResponse)
	case "notion":
		return TransformNotionResponse(actionID, rawResponse)
	case "jira":
		return TransformJiraResponse(actionID, rawResponse)
	case "gitlab":
		return TransformGitLabResponse(actionID, rawResponse)
	case "google_drive":
		return TransformGoogleDriveResponse(actionID, rawResponse)
	case "hubspot":
		return TransformHubSpotResponse(actionID, rawResponse)
	case "asana":
		return TransformAsanaResponse(actionID, rawResponse)
	case "twilio":
		return TransformTwilioResponse(actionID, rawResponse)
	case "sendgrid":
		return TransformSendGridResponse(actionID, rawResponse)
	case "aws_s3":
		return TransformAWS_S3Response(actionID, rawResponse)
	case "activecampaign":
		return TransformActiveCampaignResponse(actionID, rawResponse)
	case "airtable":
		return TransformAirtableResponse(actionID, rawResponse)
	case "anthropic":
		return TransformAnthropicResponse(actionID, rawResponse)
	case "clickup":
		return TransformClickUpResponse(actionID, rawResponse)
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
	case "discord":
		return CheckDiscordConnection(creds)
	case "trello":
		return CheckTrelloConnection(creds)
	case "notion":
		return CheckNotionConnection(creds)
	case "jira":
		return CheckJiraConnection(creds)
	case "gitlab":
		return CheckGitLabConnection(creds)
	case "google_drive":
		return CheckGoogleDriveConnection(creds)
	case "hubspot":
		return CheckHubSpotConnection(creds)
	case "asana":
		return CheckAsanaConnection(creds)
	case "twilio":
		return CheckTwilioConnection(creds)
	case "sendgrid":
		return CheckSendGridConnection(creds)
	case "aws_s3":
		return CheckAWS_S3Connection(creds)
	case "activecampaign":
		return CheckActiveCampaignConnection(creds)
	case "airtable":
		return CheckAirtableConnection(creds)
	case "anthropic":
		return CheckAnthropicConnection(creds)
	case "clickup":
		return CheckClickUpConnection(creds)
	default:
		return false
	}
}

