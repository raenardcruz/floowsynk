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

type DB struct {
	conn *sql.DB
}

var (
	host     = getEnv("DB_HOST", "localhost")
	port     = getEnvAsInt("DB_PORT", 5432)
	user     = getEnv("DB_USER", "admin")
	password = getEnv("DB_PASSWORD", "flowsync")
	dbname   = getEnv("DB_NAME", "flowsync")
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
			id SERIAL PRIMARY KEY,
			username VARCHAR(50) NOT NULL UNIQUE,
			password VARCHAR(255) NOT NULL,
			role VARCHAR(50) NOT NULL,
			email VARCHAR(50) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Fatalf("Error creating users table: %v", err)
		return err
	}
	admin, err := db.GetUser(1)
	if err != nil {
		log.Fatalf("Error getting user: %v", err)
	}
	if admin.ID == 0 {
		db.AddUser(UsersModel{
			ID:       1,
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
