package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/hex"
)

func EncryptPassword(password string) (string, error) {
	block, err := aes.NewCipher([]byte("flowsync12345678"))
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Use a fixed nonce to produce the same encryption result for the same value
	nonce := []byte("fixednonce123456")[:aesGCM.NonceSize()]

	ciphertext := aesGCM.Seal(nonce, nonce, []byte(password), nil)
	return hex.EncodeToString(ciphertext), nil
}
