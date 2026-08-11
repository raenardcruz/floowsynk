package workflow

import (
	"encoding/json"
	"fmt"
	"net"
	"time"
)

// CheckPostgreSQLConnection verifies network connectivity to the PostgreSQL server host:port.
func CheckPostgreSQLConnection(creds map[string]string) (bool, string) {
	host := creds["host"]
	port := creds["port"]
	if port == "" {
		port = "5432"
	}
	user := creds["user"]
	database := creds["database"]

	if host == "" {
		return false, "Missing PostgreSQL host"
	}
	if user == "" {
		return false, "Missing PostgreSQL user"
	}
	if database == "" {
		return false, "Missing PostgreSQL database name"
	}

	address := fmt.Sprintf("%s:%s", host, port)
	conn, err := net.DialTimeout("tcp", address, 5*time.Second)
	if err != nil {
		return false, fmt.Sprintf("Failed to connect to PostgreSQL server at %s: %v", address, err)
	}
	conn.Close()

	return true, ""
}

// TransformPostgreSQLResponse cleans and structures raw database response objects.
func TransformPostgreSQLResponse(actionID string, rawResponse interface{}) interface{} {
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
	case "execute_query", "insert_rows", "update_rows":
		var result map[string]interface{}
		if err := json.Unmarshal(data, &result); err == nil {
			return result
		}
	}

	return rawResponse
}
