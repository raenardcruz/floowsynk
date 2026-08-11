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
	case "convertkit":
		return TransformConvertKitResponse(actionID, rawResponse)
	case "dropbox":
		return TransformDropboxResponse(actionID, rawResponse)
	case "gmail":
		return TransformGmailResponse(actionID, rawResponse)
	case "google_calendar":
		return TransformGoogleCalendarResponse(actionID, rawResponse)
	case "google_gemini":
		return TransformGoogleGeminiResponse(actionID, rawResponse)
	case "google_sheets":
		return TransformGoogleSheetsResponse(actionID, rawResponse)
	case "intercom":
		return TransformIntercomResponse(actionID, rawResponse)
	case "mailchimp":
		return TransformMailchimpResponse(actionID, rawResponse)
	case "microsoft_teams":
		return TransformMicrosoftTeamsResponse(actionID, rawResponse)
	case "mongodb":
		return TransformMongoDBResponse(actionID, rawResponse)
	case "openai":
		return TransformOpenAIResponse(actionID, rawResponse)
	case "outlook":
		return TransformOutlookResponse(actionID, rawResponse)
	case "pipedrive":
		return TransformPipedriveResponse(actionID, rawResponse)
	case "postgresql":
		return TransformPostgreSQLResponse(actionID, rawResponse)
	case "quickbooks":
		return TransformQuickBooksResponse(actionID, rawResponse)
	case "reddit":
		return TransformRedditResponse(actionID, rawResponse)
	case "salesforce":
		return TransformSalesforceResponse(actionID, rawResponse)
	case "shopify":
		return TransformShopifyResponse(actionID, rawResponse)
	case "stripe":
		return TransformStripeResponse(actionID, rawResponse)
	case "telegram":
		return TransformTelegramResponse(actionID, rawResponse)
	case "wordpress":
		return TransformWordPressResponse(actionID, rawResponse)
	case "x_twitter":
		return TransformXTwitterResponse(actionID, rawResponse)
	case "zendesk":
		return TransformZendeskResponse(actionID, rawResponse)
	case "zoom":
		return TransformZoomResponse(actionID, rawResponse)
	default:
		return rawResponse
	}
}

// CheckConnectorConnection verifies that stored credentials for a connection are still valid.
// Returns (true, "") if valid, or (false, "error message") if invalid or check fails.
func CheckConnectorConnection(connectorID string, creds map[string]string) (bool, string) {
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
	case "convertkit":
		return CheckConvertKitConnection(creds)
	case "dropbox":
		return CheckDropboxConnection(creds)
	case "gmail":
		return CheckGmailConnection(creds)
	case "google_calendar":
		return CheckGoogleCalendarConnection(creds)
	case "google_gemini":
		return CheckGoogleGeminiConnection(creds)
	case "google_sheets":
		return CheckGoogleSheetsConnection(creds)
	case "intercom":
		return CheckIntercomConnection(creds)
	case "mailchimp":
		return CheckMailchimpConnection(creds)
	case "microsoft_teams":
		return CheckMicrosoftTeamsConnection(creds)
	case "mongodb":
		return CheckMongoDBConnection(creds)
	case "openai":
		return CheckOpenAIConnection(creds)
	case "outlook":
		return CheckOutlookConnection(creds)
	case "pipedrive":
		return CheckPipedriveConnection(creds)
	case "postgresql":
		return CheckPostgreSQLConnection(creds)
	case "quickbooks":
		return CheckQuickBooksConnection(creds)
	case "reddit":
		return CheckRedditConnection(creds)
	case "salesforce":
		return CheckSalesforceConnection(creds)
	case "shopify":
		return CheckShopifyConnection(creds)
	case "stripe":
		return CheckStripeConnection(creds)
	case "telegram":
		return CheckTelegramConnection(creds)
	case "wordpress":
		return CheckWordPressConnection(creds)
	case "x_twitter":
		return CheckXTwitterConnection(creds)
	case "zendesk":
		return CheckZendeskConnection(creds)
	case "zoom":
		return CheckZoomConnection(creds)
	default:
		return false, "Unsupported or unknown connector ID"
	}
}

