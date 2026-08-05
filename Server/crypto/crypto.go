package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"io"

	"golang.org/x/crypto/bcrypt"
)

var cryptoKey []byte

func SetKey(newKey string) {
	h := sha256.New()
	h.Write([]byte(newKey))
	cryptoKey = h.Sum(nil)
}

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

// Encrypt encrypts plain text using AES-GCM
func Encrypt(plainText string) (string, error) {
	if len(cryptoKey) == 0 {
		return "", errors.New("crypto key not set")
	}
	block, err := aes.NewCipher(cryptoKey)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	cipherText := gcm.Seal(nonce, nonce, []byte(plainText), nil)
	return hex.EncodeToString(cipherText), nil
}

// Decrypt decrypts hex-encoded cipher text using AES-GCM
func Decrypt(cipherTextHex string) (string, error) {
	if len(cryptoKey) == 0 {
		return "", errors.New("crypto key not set")
	}
	cipherText, err := hex.DecodeString(cipherTextHex)
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher(cryptoKey)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonceSize := gcm.NonceSize()
	if len(cipherText) < nonceSize {
		return "", errors.New("ciphertext too short")
	}
	nonce, actualCipherText := cipherText[:nonceSize], cipherText[nonceSize:]
	plainText, err := gcm.Open(nil, nonce, actualCipherText, nil)
	if err != nil {
		return "", err
	}
	return string(plainText), nil
}


