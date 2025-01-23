package db

import (
	"database/sql"
	"log"

	"github.com/google/uuid"
	"github.com/raenardcruz/floowsynk/crypto"
)

func (db *DB) GetUsers() ([]UsersModel, error) {
	log.Print("Getting users")
	rows, err := db.conn.Query("SELECT * FROM users;")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []UsersModel{}
	for rows.Next() {
		var user UsersModel
		if err := rows.Scan(&user.ID, &user.Username, &user.Password, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt); err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func (db *DB) GetUser(u string) (UsersModel, error) {
	log.Printf("Getting user with id %s", u)
	row := db.conn.QueryRow("SELECT * FROM users WHERE id = $1;", u)

	var user UsersModel
	if err := row.Scan(&user.ID, &user.Username, &user.Password, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return UsersModel{}, nil
		}
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
	query := "INSERT INTO users (id, username, password, email, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())"
	args := []interface{}{u.ID, u.Username, encPassword, u.Email, u.Role}

	_, err = db.conn.Exec(query, args...)
	if err != nil {
		log.Printf("Error adding user: %v", err)
		return err
	}
	return nil
}

func (db *DB) GetUserByUsername(username string) (UsersModel, error) {
	log.Printf("Getting user with username %s", username)
	row := db.conn.QueryRow("SELECT * FROM users WHERE username = $1;", username)

	var user UsersModel
	if err := row.Scan(&user.ID, &user.Username, &user.Password, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return UsersModel{}, nil
		}
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
	_, err = db.conn.Exec("UPDATE users SET username = $1, password = $2, email = $3, role = $4, updated_at = NOW() WHERE id = $5", u.Username, encPassword, u.Email, u.Role, u.ID)
	if err != nil {
		log.Printf("Error updating user: %v", err)
		return err
	}
	return nil
}

func (db *DB) DeleteUser(u string) error {
	log.Printf("Deleting user with id %s", u)
	_, err := db.conn.Exec("DELETE FROM users WHERE id = $1", u)
	if err != nil {
		log.Printf("Error deleting user: %v", err)
		return err
	}
	return nil
}
