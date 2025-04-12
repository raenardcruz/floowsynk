package DB

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
)

var RedisClient *redis.Client

func ConnectToRedis() {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", AppConfig.Redis_Host, AppConfig.Redis_Port),
		Password: AppConfig.Redis_Password,
		DB:       AppConfig.Redis_DB,
	})

	_, err := RedisClient.Ping(context.Background()).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	log.Println("Connected to Redis")
}

func GetFromCache(ctx context.Context, key string) ([]byte, bool) {
	val, err := RedisClient.Get(ctx, key).Result()
	if err == redis.Nil {
		return nil, false
	} else if err != nil {
		log.Printf("Error getting from cache key %s: %v", key, err)
		return nil, false
	}
	return []byte(val), true
}

func SetCache(ctx context.Context, key string, data interface{}, expiration time.Duration) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal data to JSON: %w", err)
	}
	err = RedisClient.Set(ctx, key, jsonData, expiration).Err()
	if err != nil {
		return fmt.Errorf("failed to set data to cache key %s: %w", key, err)
	}
	return nil
}

func DeleteCache(ctx context.Context, key string) error {
	err := RedisClient.Del(ctx, key).Err()
	if err != nil {
		return fmt.Errorf("failed to delete cache key %s: %w", key, err)
	}
	return nil
}
