package main

import (
	"log"
	"net/http"
	"time"

	"github.com/raenardcruz/floowsynk/crypto"
	"github.com/raenardcruz/floowsynk/db"

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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting user"})
		return
	}
	if dbUser.ID == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	ePassword, err := crypto.EncryptPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error encrypting password"})
		return
	}

	if dbUser.Password == ePassword {
		token := generateToken(dbUser.ID, user.Username, dbUser.Role, time.Now().Add(time.Minute*15).UTC().Unix())
		c.JSON(http.StatusOK, LoginResponse{Token: token})
		return
	}

	c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
}

func generateToken(id string, username, role string, expiry int64) string {
	claims := jwt.MapClaims{
		"id":       id,
		"username": username,
		"role":     role,
		"exp":      expiry,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(jwtKey)
	return tokenString
}

func validateToken(c *gin.Context) *ValidateResults {
	tokenString := c.GetHeader("Authorization")
	if tokenString == "" {
		return &ValidateResults{status: http.StatusUnauthorized, message: "Unauthorized"}
	}

	token, err := jwt.ParseWithClaims(tokenString, jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil {
		return &ValidateResults{status: http.StatusUnauthorized, message: err.Error()}
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return &ValidateResults{
			id:       claims["id"].(string),
			username: claims["username"].(string),
			role:     claims["role"].(string),
			status:   http.StatusOK,
		}
	}

	return &ValidateResults{status: http.StatusUnauthorized, message: "Invalid token"}
}

func ExtendToken(c *gin.Context) {
	results := validateToken(c)
	if results.status != http.StatusOK {
		c.JSON(results.status, gin.H{"error": results.message})
		return
	}

	token := generateToken(results.id, results.username, results.role, time.Now().Add(time.Minute*15).UTC().Unix())
	c.JSON(http.StatusOK, LoginResponse{Token: token})
}
