package DB

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	_ "github.com/lib/pq"
)

// Implement json.Unmarshaler for JSONB
type JSONB []byte

func (j *JSONB) UnmarshalJSON(data []byte) error {
	if !json.Valid(data) {
		return fmt.Errorf("invalid JSON data")
	}
	*j = append((*j)[0:0], data...)
	return nil
}

type DatabaseConnection struct {
	conn *gorm.DB
}
type Config struct {
	DB_HOST            string
	DB_PORT            int
	DB_USER            string
	DB_PASSWORD        string
	DB_NAME            string
	Redis_Host         string
	Redis_Port         int
	Redis_Password     string
	Redis_DB           int
	App_Admin_Password string
	App_Admin_Username string
}

var AppConfig *Config
var UseCache = true

func init() {
	godotenv.Load()
	AppConfig = &Config{
		DB_HOST:            getEnv("DB_HOST", "localhost"),
		DB_PORT:            getEnvAsInt("DB_PORT", 5432),
		DB_USER:            getEnv("DB_USER", "root"),
		DB_PASSWORD:        getEnv("DB_PASSWORD", "floowsynk"),
		DB_NAME:            getEnv("DB_NAME", "floowsynk"),
		Redis_Host:         getEnv("REDIS_HOST", "localhost"),
		Redis_Port:         getEnvAsInt("REDIS_PORT", 6379),
		Redis_Password:     getEnv("REDIS_PASSWORD", "floowsynk"),
		Redis_DB:           getEnvAsInt("REDIS_DB", 0),
		App_Admin_Password: getEnv("APP_ADMIN_PASSWORD", "floowsynk"),
		App_Admin_Username: getEnv("APP_ADMIN_USERNAME", "admin"),
	}
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

func ConnectToDatabase() (*DatabaseConnection, error) {
	log.Println("Connecting to database...")
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		AppConfig.DB_HOST,
		AppConfig.DB_PORT,
		AppConfig.DB_USER,
		AppConfig.DB_PASSWORD,
		AppConfig.DB_NAME)
	conn, err := gorm.Open(postgres.Open(connStr), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	log.Println("Connected to database")
	dbCon := &DatabaseConnection{conn: conn}
	UseCache = dbCon.IsFeatureEnabled(FEATURE_DB_CACHE)
	log.Printf("Use Cache Feature Flag: %v", UseCache)
	return dbCon, nil
}

func (db *DatabaseConnection) MigrateAndSeedDatabase() error {
	log.Println("Migrating tables and seeding initial data...")

	models := []interface{}{
		&Users{},
		&Workflow{},
		&ReplayData{},
		&Feature{},
	}

	for _, model := range models {
		log.Printf("Migrating model: %T", model)
		if err := db.conn.AutoMigrate(model); err != nil {
			log.Fatalf("Error migrating model %T: %v", model, err)
			return err
		}
	}

	log.Println("Seeding initial data...")
	admin, err := db.GetUser("b5bd8424-fb52-4454-8102-488959a41ca8")
	if admin.ID == "" || err != nil {
		log.Println("Admin user not found, creating a new one...")
		db.AddUser(Users{
			ID:       "b5bd8424-fb52-4454-8102-488959a41ca8",
			Username: AppConfig.App_Admin_Username,
			Password: AppConfig.App_Admin_Password,
			Role:     UserRoleAdmin,
		})
	}
	log.Println("Database migration and seeding completed")

	return nil
}
