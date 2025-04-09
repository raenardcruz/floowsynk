package db

import (
	"log"

	"github.com/google/uuid"
	"github.com/raenardcruz/floowsynk/Server/crypto"
)

func (db *DB) GetUsers() ([]UsersModel, error) {
	log.Print("Getting users")
	var users []UsersModel
	if err := db.conn.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (db *DB) GetUser(id string) (UsersModel, error) {
	log.Printf("Getting user with id %s", id)
	var user UsersModel
	if err := db.conn.First(&user, "id = ?", id).Error; err != nil {
		return UsersModel{}, err
	}
	return user, nil
}

func (db *DB) AddUser(u UsersModel) error {
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
	if err := db.conn.Create(&u).Error; err != nil {
		log.Printf("Error adding user: %v", err)
		return err
	}
	return nil
}

func (db *DB) GetUserByUsername(username string) (UsersModel, error) {
	log.Printf("Getting user with username %s", username)
	var user UsersModel
	if err := db.conn.First(&user, "username = ?", username).Error; err != nil {
		return UsersModel{}, err
	}
	return user, nil
}

func (db *DB) UpdateUser(u UsersModel) error {
	log.Printf("Updating user with id %s", u.ID)
	encPassword, err := crypto.EncryptPassword(u.Password)
	if err != nil {
		log.Printf("Error encrypting password: %v", err)
		return err
	}
	u.Password = encPassword
	if err := db.conn.Model(&UsersModel{}).Where("id = ?", u.ID).Updates(&u).Error; err != nil {
		log.Printf("Error updating user: %v", err)
		return err
	}
	return nil
}

func (db *DB) DeleteUser(id string) error {
	log.Printf("Deleting user with id %s", id)
	if err := db.conn.Delete(&UsersModel{}, "id = ?", id).Error; err != nil {
		log.Printf("Error deleting user: %v", err)
		return err
	}
	return nil
}
