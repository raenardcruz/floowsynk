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
	Server_GRPC_Port   string
	Server_GRPC_Host   string
	Server_REST_Port   string
	Server_Plain_Port  string
	Kafka_Brokers      string
	Job_Token          string
	JWT_Secret         string
	Crypto_Key         string
	// Environment: "staging" or "production"
	App_Environment    string
	// Production target for publish-from-staging (leave blank for same-DB mode)
	Prod_Server_URL    string
	Prod_API_Token     string
}

var AppConfig *Config
var UseCache = true

func init() {
	// Support ENV_FILE=path/to/.env.production to run multiple environments locally
	envFile := os.Getenv("ENV_FILE")
	if envFile == "" {
		envFile = ".env"
	}
	godotenv.Load(envFile)

	AppConfig = &Config{
		DB_HOST:            getEnv("DB_HOST", "localhost"),
		DB_PORT:            getEnvAsInt("DB_PORT", 5432),
		DB_USER:            getEnv("DB_USER", "root"),
		DB_PASSWORD:        getEnv("DB_PASSWORD", "floowsynk"),
		DB_NAME:            getEnv("DB_NAME", "floowsynk"),
		Redis_Host:         getEnv("REDIS_HOST", "localhost"),
		Redis_Port:         getEnvAsInt("REDIS_PORT", 6379),
		Redis_Password:     getEnv("REDIS_PASSWORD", ""),
		Redis_DB:           getEnvAsInt("REDIS_DB", 0),
		App_Admin_Password: getEnv("APP_ADMIN_PASSWORD", "floowsynk"),
		App_Admin_Username: getEnv("APP_ADMIN_USERNAME", "admin"),
		Server_GRPC_Port:   getEnv("SERVER_GRPC_PORT", "8090"),
		Server_GRPC_Host:   getEnv("SERVER_GRPC_HOST", "localhost"),
		Server_REST_Port:   getEnv("SERVER_REST_PORT", "8091"),
		Server_Plain_Port:  getEnv("SERVER_PLAIN_GRPC_PORT", "50051"),
		Kafka_Brokers:      getEnv("KAFKA_BROKERS", "localhost:9092"),
		Job_Token:          getEnv("JOB_TOKEN", "6c9e5318-6e7b-452d-9e22-9f35a755bcbd"),
		JWT_Secret:         getEnv("JWT_SECRET", "secret_key"),
		Crypto_Key:         getEnv("CRYPTO_KEY", "HGD86teHeCb3Gl7Q"),
		App_Environment:    getEnv("APP_ENVIRONMENT", "staging"),
		Prod_Server_URL:    getEnv("PROD_SERVER_URL", ""),
		Prod_API_Token:     getEnv("PROD_API_TOKEN", ""),
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

	// Ensure the database exists by connecting to the default 'postgres' database first
	defaultConnStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=postgres sslmode=disable",
		AppConfig.DB_HOST,
		AppConfig.DB_PORT,
		AppConfig.DB_USER,
		AppConfig.DB_PASSWORD)

	tempDb, err := gorm.Open(postgres.Open(defaultConnStr), &gorm.Config{})
	if err == nil {
		var exists bool
		err = tempDb.Raw("SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = ?)", AppConfig.DB_NAME).Scan(&exists).Error
		if err == nil && !exists {
			log.Printf("Database %s does not exist, creating it...", AppConfig.DB_NAME)
			createDbSQL := fmt.Sprintf("CREATE DATABASE %s", AppConfig.DB_NAME)
			if err := tempDb.Exec(createDbSQL).Error; err != nil {
				log.Printf("Warning: Failed to create database %s: %v", AppConfig.DB_NAME, err)
			} else {
				log.Printf("Database %s created successfully", AppConfig.DB_NAME)
			}
		}
		if sqlDb, err := tempDb.DB(); err == nil {
			sqlDb.Close()
		}
	} else {
		log.Printf("Warning: Failed to connect to default database to check/create %s: %v", AppConfig.DB_NAME, err)
	}

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
		&WorkflowVersion{},
		&ReplayData{},
		&Feature{},
		&Connection{},
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
	log.Println("Seeding feature flags...")
	if err := db.InitializeFeatureFlags(); err != nil {
		log.Printf("Error initializing feature flags: %v", err)
	}

	log.Println("Database migration and seeding completed")

	return nil
}
