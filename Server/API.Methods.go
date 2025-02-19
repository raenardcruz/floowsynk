package main

import (
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

func Protected(c *gin.Context) {
	validateResults := validateToken(c)
	if validateResults.status != http.StatusOK {
		c.JSON(validateResults.status, gin.H{"error": validateResults.message})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Hello, " + validateResults.username + ", your role is " + validateResults.role})
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
