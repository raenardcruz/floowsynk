package DB

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/raenardcruz/floowsynk/Server/crypto"
)

const (
	UserRoleAdmin       = "admin"
	UserRoleUser        = "user"
	UserRoleGuest       = "guest"
	UserRoleService     = "service"
	userCacheExpiration = 15 * time.Minute
)

type Users struct {
	ID        string
	Username  string
	Password  string
	Email     string
	Role      string
	CreatedAt int64
	UpdatedAt int64
}

func (db *DatabaseConnection) GetUsers() ([]Users, error) {
	log.Print("Getting users")
	var users []Users
	if err := db.conn.Find(&users).Error; err != nil {
		return nil, err
	}

	return users, nil
}

func (db *DatabaseConnection) GetUser(id string) (Users, error) {
	ctx := context.Background()
	cacheKey := "user:" + id

	if cachedData, found := GetFromCache(ctx, cacheKey); found {
		var cachedUser Users
		if err := json.Unmarshal(cachedData, &cachedUser); err == nil {
			return cachedUser, nil
		}
	}

	var user Users
	if err := db.conn.First(&user, "id = ?", id).Error; err != nil {
		return Users{}, err
	}

	if err := SetCache(ctx, cacheKey, user, userCacheExpiration); err != nil {
		log.Printf("Error setting cache for user %s: %v", id, err)
	}

	return user, nil
}

func (db *DatabaseConnection) AddUser(u Users) error {
	log.Printf("Adding user %s", u.Username)
	encPassword, err := crypto.EncryptPassword(u.Password)
	if err != nil {
		log.Printf("Error encrypting password: %v", err)
		return err
	}
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	u.Password = encPassword
	u.CreatedAt = time.Now().UTC().Unix()
	u.UpdatedAt = time.Now().UTC().Unix()
	if err := db.conn.Create(&u).Error; err != nil {
		log.Printf("Error adding user: %v", err)
		return err
	}
	return nil
}

func (db *DatabaseConnection) GetUserByUsername(username string) (Users, error) {
	ctx := context.Background()
	cacheKey := "user:username:" + username

	if cachedData, found := GetFromCache(ctx, cacheKey); found {
		var cachedUser Users
		if err := json.Unmarshal(cachedData, &cachedUser); err == nil {
			return cachedUser, nil
		}
	}

	log.Printf("Getting user with username %s", username)
	var user Users
	if err := db.conn.First(&user, "username = ?", username).Error; err != nil {
		return Users{}, err
	}

	if err := SetCache(ctx, cacheKey, user, userCacheExpiration); err != nil {
		log.Printf("Error setting cache for user %s: %v", username, err)
	}

	return user, nil
}

func (db *DatabaseConnection) UpdateUser(u Users) error {
	ctx := context.Background()
	cacheKey := "user:" + u.ID
	cacheKeyByUsername := "user:username:" + u.Username

	u.UpdatedAt = time.Now().UTC().Unix()

	encPassword, err := crypto.EncryptPassword(u.Password)
	if err != nil {
		log.Printf("Error encrypting password: %v", err)
		return err
	}
	u.Password = encPassword
	if err := db.conn.Model(&Users{}).Where("id = ?", u.ID).Updates(&u).Error; err != nil {
		log.Printf("Error updating user: %v", err)
		return err
	}

	if err := SetCache(ctx, cacheKey, u, userCacheExpiration); err != nil {
		log.Printf("Error setting cache for user %s: %v", u.ID, err)
	}

	if err := SetCache(ctx, cacheKeyByUsername, u, userCacheExpiration); err != nil {
		log.Printf("Error setting cache for user %s by username: %v", u.Username, err)
	}

	return nil
}

func (db *DatabaseConnection) DeleteUser(id string) error {
	log.Printf("Deleting user with id %s", id)
	if err := db.conn.Delete(&Users{}, "id = ?", id).Error; err != nil {
		log.Printf("Error deleting user: %v", err)
		return err
	}
	return nil
}
