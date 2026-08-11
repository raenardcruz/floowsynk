package DB

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	pb "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
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
	envFile := os.Getenv("ENV_FILE")
	if envFile != "" {
		if err := godotenv.Overload(envFile); err != nil {
			log.Printf("Warning: Failed to load ENV_FILE %s: %v", envFile, err)
		}
	} else {
		godotenv.Load(".env")
		godotenv.Load("Server/.env")
		godotenv.Load("../Server/.env")
		godotenv.Load("../.env")
	}

	appEnv := getEnv("APP_ENVIRONMENT", "staging")

	AppConfig = &Config{
		DB_HOST:            getEnv("DB_HOST", "localhost"),
		DB_PORT:            getEnvAsInt("DB_PORT", 5432),
		DB_USER:            getEnv("DB_USER", "admin"),
		DB_PASSWORD:        getEnv("DB_PASSWORD", "admin"),
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
		App_Environment:    appEnv,
		Prod_Server_URL:    getEnv("PROD_SERVER_URL", ""),
		Prod_API_Token:     getEnv("PROD_API_TOKEN", ""),
	}
}

func getEnv(key, defaultValue string) string {
	val := os.Getenv(key)
	if val != "" {
		return val
	}
	return defaultValue
}

func getEnvAsInt(name string, defaultVal int) int {
	valStr := os.Getenv(name)
	if valStr != "" {
		if value, err := strconv.Atoi(valStr); err == nil && value > 0 {
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

func ResolveEnvName(env pb.Environment) string {
	if env == pb.Environment_STAGING {
		return "staging"
	}
	return "production"
}

func (db *DatabaseConnection) TableFor(env string, baseTable string) string {
	if env == "staging" {
		return baseTable + "_staging"
	}
	return baseTable + "_production"
}

func (db *DatabaseConnection) MigrateAndSeedDatabase() error {
	log.Println("Migrating tables and seeding initial data...")

	envs := []string{"staging", "production"}
	for _, env := range envs {
		if err := db.conn.Table("workflows_" + env).AutoMigrate(&Workflow{}); err != nil {
			log.Fatalf("Error migrating workflows_%s: %v", env, err)
			return err
		}
		if err := db.conn.Table("workflow_versions_" + env).AutoMigrate(&WorkflowVersion{}); err != nil {
			log.Fatalf("Error migrating workflow_versions_%s: %v", env, err)
			return err
		}
		if err := db.conn.Table("connections_" + env).AutoMigrate(&Connection{}); err != nil {
			log.Fatalf("Error migrating connections_%s: %v", env, err)
			return err
		}
		if err := db.conn.Table("replay_data_" + env).AutoMigrate(&ReplayData{}); err != nil {
			log.Fatalf("Error migrating replay_data_%s: %v", env, err)
			return err
		}
	}

	models := []interface{}{
		&Users{},
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
	log.Println("Seeding feature flags...")
	if err := db.InitializeFeatureFlags(); err != nil {
		log.Printf("Error initializing feature flags: %v", err)
	}

	log.Println("Database migration and seeding completed")

	return nil
}

func (db *DatabaseConnection) GetConn() *gorm.DB {
	return db.conn
}

func InitTestDB() (*DatabaseConnection, error) {
	if AppConfig == nil {
		AppConfig = &Config{}
	}
	if AppConfig.DB_HOST == "" {
		AppConfig.DB_HOST = "localhost"
	}
	if AppConfig.DB_PORT == 0 {
		AppConfig.DB_PORT = 5432
	}
	if AppConfig.DB_USER == "" {
		AppConfig.DB_USER = "admin"
	}
	if AppConfig.DB_PASSWORD == "" {
		AppConfig.DB_PASSWORD = "admin"
	}
	if AppConfig.DB_NAME == "" {
		AppConfig.DB_NAME = "floowsynk"
	}
	if AppConfig.App_Environment == "" {
		AppConfig.App_Environment = "staging"
	}

	conn, err := ConnectToDatabase()
	if err != nil {
		return nil, err
	}
	if err := conn.MigrateAndSeedDatabase(); err != nil {
		log.Printf("Warning: MigrateAndSeedDatabase failed in test setup: %v", err)
	}
	return conn, nil
}

