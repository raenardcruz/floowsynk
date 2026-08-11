package workflow

import (
	"encoding/json"
	"strings"
)

// CheckMongoDBConnection verifies the SRV URI / connection string structure.
func CheckMongoDBConnection(creds map[string]string) (bool, string) {
	connStr := creds["connection_string"]
	if connStr == "" {
		return false, "Missing MongoDB connection string"
	}
	if !strings.HasPrefix(connStr, "mongodb://") && !strings.HasPrefix(connStr, "mongodb+srv://") {
		return false, "Invalid MongoDB connection string scheme"
	}
	return true, ""
}

// TransformMongoDBResponse formats MongoDB action responses.
func TransformMongoDBResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "insert_document":
		var res struct {
			InsertedID   string `json:"insertedId"`
			Acknowledged bool   `json:"acknowledged"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res)
			if err == nil {
				return string(resBytes)
			}
			return res
		}
	case "update_documents":
		var res struct {
			MatchedCount  int  `json:"matchedCount"`
			ModifiedCount int  `json:"modifiedCount"`
			Acknowledged  bool `json:"acknowledged"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res)
			if err == nil {
				return string(resBytes)
			}
			return res
		}
	case "delete_documents":
		var res struct {
			DeletedCount int  `json:"deletedCount"`
			Acknowledged bool `json:"acknowledged"`
		}
		if err := json.Unmarshal(data, &res); err == nil {
			resBytes, err := json.Marshal(res)
			if err == nil {
				return string(resBytes)
			}
			return res
		}
	}

	return rawResponse
}
