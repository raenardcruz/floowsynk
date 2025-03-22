package main

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/raenardcruz/floowsynk/crypto"
	pb "github.com/raenardcruz/floowsynk/proto"
	"google.golang.org/grpc/metadata"
)

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

func getTokenFromContext(ctx context.Context) (token string, err error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return "", fmt.Errorf("metadata not found")
	}
	token = strings.Join(md.Get("Authorization"), "")
	if token == "" {
		return "", fmt.Errorf("token not found")
	}
	return token, nil
}

func validateToken(tokenString string) *ValidateResults {
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

func ExtendToken(token string) (string, error) {
	results := validateToken(token)
	if results.status != http.StatusOK {
		return "", fmt.Errorf("Unauthorized")
	}

	newToken := generateToken(results.id, results.username, results.role, time.Now().Add(time.Minute*15).UTC().Unix())
	return newToken, nil
}

func Login(userName string, password string) (string, error) {
	dbUser, err := dbcon.DB.GetUserByUsername(userName)
	if err != nil {
		return "", fmt.Errorf("error getting user")
	}
	if dbUser.ID == "" {
		return "", fmt.Errorf("user not found")
	}

	ePassword, err := crypto.EncryptPassword(password)
	if err != nil {
		return "", fmt.Errorf("error encrypting password")
	}

	if dbUser.Password == ePassword {
		token := generateToken(dbUser.ID, userName, dbUser.Role, time.Now().Add(time.Minute*15).UTC().Unix())
		return token, nil
	}

	return "", fmt.Errorf("invalid password")
}

func GetWorkflow(id string) (workflow *pb.Workflow, err error) {
	workflow, err = dbcon.DB.GetWorkflow(id)
	if err != nil {
		return workflow, err
	}
	return workflow, nil
}

func ListWorkflows(offset int32, limit int32) (wl *pb.WorkflowList, err error) {
	wl, err = dbcon.DB.GetWorkflows(int(limit), int(offset))
	if err != nil {
		return nil, err
	}
	return wl, nil
}
func UpdateWorkflow(workflow *pb.Workflow) (w *pb.Workflow, err error) {
	if err := dbcon.DB.UpdateWorkflow(workflow); err != nil {
		return nil, err
	}
	return workflow, nil
}
func CreateWorkflow(workflow *pb.Workflow) (*pb.Workflow, error) {
	id, err := dbcon.DB.CreateWorkflow(workflow)
	if err != nil {
		return nil, err
	}
	workflow.Id = id
	return workflow, nil
}
func DeleteWorkflow(id string) error {
	return dbcon.DB.DeleteWorkflow(id)
}

// func Protected(c *gin.Context) {
// 	validateResults := validateToken(c)
// 	if validateResults.status != http.StatusOK {
// 		c.JSON(validateResults.status, gin.H{"error": validateResults.message})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"message": "Hello, " + validateResults.username + ", your role is " + validateResults.role})
// }
