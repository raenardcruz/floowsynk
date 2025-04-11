package db

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	_ "github.com/lib/pq" // PostgreSQL driver
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
	log.Println("Connecting to database...")
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	conn, err := gorm.Open(postgres.Open(connStr), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	log.Println("Connected to database")
	return &DB{conn: conn}, nil
}

func (db *DB) InitDB() error {
	log.Println("Migrating tables...")

	// Add logging to identify problematic models
	models := []interface{}{
		&UsersModel{},
		&Workflow{},
		&WorkflowProfileModel{},
	}

	for _, model := range models {
		log.Printf("Migrating model: %T", model)
		if err := db.conn.AutoMigrate(model); err != nil {
			log.Fatalf("Error migrating model %T: %v", model, err)
			return err
		}
	}

	admin, err := db.GetUser("b5bd8424-fb52-4454-8102-488959a41ca8")
	if admin.ID == "" || err != nil {
		db.AddUser(UsersModel{
			ID:       "b5bd8424-fb52-4454-8102-488959a41ca8",
			Username: "admin",
			Password: "admin",
			Role:     "admin",
		})
	}

	return nil
}
