package crypto

import (
	"golang.org/x/crypto/bcrypt"
)

func SetKey(newKey string) {}

// EncryptPassword hashes the password using bcrypt.
func EncryptPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// VerifyPassword compares a bcrypt hashed password with its plaintext candidate.
func VerifyPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

