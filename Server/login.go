package main

import (
	"log"
	"net/http"
	"time"

	"flowsync/crypto"
	"flowsync/db"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

var jwtKey = []byte("secret_key")

func Login(c *gin.Context) {
	var user User
	if err := c.BindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db, err := db.NewDB()
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
		return
	}
	defer db.Close()

	dbUser, err := db.GetUserByUsername(user.Username)
	if err != nil {
		log.Fatalf("Error getting user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting user"})
		return
	}
	if dbUser.ID == 0 {
		log.Fatalf("Error getting user: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	ePassword, err := crypto.EncryptPassword(user.Password)
	if err != nil {
		log.Fatalf("Error encrypting password: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error encrypting password"})
		return
	}

	if dbUser.Password == ePassword {
		token := generateToken(user.Username, dbUser.Role)
		c.JSON(http.StatusOK, LoginResponse{Token: token})
		return
	}

	c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
}

func generateToken(username, role string) string {
	claims := jwt.MapClaims{
		"username": username,
		"role":     role,
		"exp":      time.Now().Add(time.Minute * 10).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(jwtKey)
	return tokenString
}

func validateToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.ParseWithClaims(tokenString, jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if _, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return token, nil
	}

	return nil, err
}
