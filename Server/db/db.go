package db

import (
	"database/sql"
	"fmt"
	"log"
	"strconv"

	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var (
	host     = getEnv("DB_HOST", "localhost")
	port     = getEnvAsInt("DB_PORT", 5432)
	user     = getEnv("DB_USER", "root")
	password = getEnv("DB_PASSWORD", "floowsynk")
	dbname   = getEnv("DB_NAME", "floowsynk")
)

func init() {
	godotenv.Load()
}

func getEnv(key, defaultValue string) string {
	log.Printf("Getting env variable %s", key)
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvAsInt(name string, defaultVal int) int {
	log.Printf("Getting env variable %s", name)
	if valueStr, exists := os.LookupEnv(name); exists {
		if value, err := strconv.Atoi(valueStr); err == nil {
			return value
		}
	}
	return defaultVal
}

func NewDB() (*DB, error) {
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	conn, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	return &DB{conn: conn}, nil
}

func (db *DB) InitDB() error {
	log.Println("Creating tables...")
	_, err := db.conn.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY,
			username VARCHAR(50) NOT NULL UNIQUE,
			password VARCHAR(255) NOT NULL,
			role VARCHAR(50) NOT NULL,
			email VARCHAR(50) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
		CREATE TABLE IF NOT EXISTS workflows (
			id UUID PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			description TEXT,
			nodes JSONB,
			edges JSONB,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			created_by UUID NOT NULL,
			updated_by UUID NOT NULL
		);
		CREATE TABLE IF NOT EXISTS workflow_profiles (
			id SERIAL PRIMARY KEY,
			workflow_id UUID NOT NULL,
			name VARCHAR(100) NOT NULL,
			profile JSONB
		);
	`)
	if err != nil {
		log.Fatalf("Error creating tables: %v", err)
		return err
	}
	admin, err := db.GetUser("b5bd8424-fb52-4454-8102-488959a41ca8")
	if err != nil {
		log.Fatalf("Error getting user: %v", err)
	}
	if admin.ID == "" {
		db.AddUser(UsersModel{
			ID:       "b5bd8424-fb52-4454-8102-488959a41ca8",
			Username: "admin",
			Password: "admin",
			Role:     "admin",
		})
	}

	return nil
}

func (db *DB) Close() {
	db.conn.Close()
}
