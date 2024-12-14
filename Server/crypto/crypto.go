package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/hex"
)

var key string = "HGD86teHeCb3Gl7Q"

func EncryptPassword(password string) (string, error) {
	block, err := aes.NewCipher([]byte(key))
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Use a fixed nonce to produce the same encryption result for the same value
	nonce := []byte(key)[:aesGCM.NonceSize()]

	ciphertext := aesGCM.Seal(nonce, nonce, []byte(password), nil)
	return hex.EncodeToString(ciphertext), nil
}
