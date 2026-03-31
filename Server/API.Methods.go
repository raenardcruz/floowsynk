package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	wf "github.com/raenardcruz/floowsynk/CodeGen/go/workflow"
	DB "github.com/raenardcruz/floowsynk/Database"
	"github.com/raenardcruz/floowsynk/Server/crypto"
	"google.golang.org/grpc/metadata"
)

const UserRoleService = DB.UserRoleService

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
	if tokenString == JobToken {
		return &ValidateResults{
			id:       "",
			username: "job",
			role:     UserRoleService,
			status:   http.StatusOK,
		}
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

func ExtendToken(token string) (string, error) {
	results := validateToken(token)
	if results.status != http.StatusOK {
		return "", fmt.Errorf("Unauthorized")
	}

	newToken := generateToken(results.id, results.username, results.role, time.Now().Add(time.Minute*60).UTC().Unix())
	return newToken, nil
}

func Login(userName string, password string) (string, error) {
	dbUser, err := DBCon.GetUserByUsername(userName)
	if err != nil {
		return "", fmt.Errorf("error getting user")
	}
	if dbUser.ID == "" {
		return "", fmt.Errorf("user not found")
	}

	if dbUser.Role == UserRoleService {
		return "", fmt.Errorf("login not allowed for service users")
	}

	ePassword, err := crypto.EncryptPassword(password)
	if err != nil {
		return "", fmt.Errorf("error encrypting password")
	}

	if dbUser.Password == ePassword {
		token := generateToken(dbUser.ID, userName, dbUser.Role, time.Now().Add(time.Minute*60).UTC().Unix())
		return token, nil
	}

	return "", fmt.Errorf("invalid password")
}

func GetWorkflow(id string) (workflow *wf.Workflow, err error) {
	workflow, err = DBCon.GetWorkflow(id)
	if err != nil {
		return workflow, err
	}
	return workflow, nil
}

func ListWorkflows(offset int32, limit int32) (wl *wf.WorkflowList, err error) {
	wl, err = DBCon.GetWorkflows(int(limit), int(offset))
	if err != nil {
		return nil, err
	}
	return wl, nil
}
func UpdateWorkflow(workflow *wf.Workflow) (w *wf.Workflow, err error) {
	if err := DBCon.UpdateWorkflow(workflow); err != nil {
		return nil, err
	}
	return workflow, nil
}
func CreateWorkflow(workflow *wf.Workflow) (*wf.Workflow, error) {
	id, err := DBCon.CreateWorkflow(workflow)
	if err != nil {
		return nil, err
	}
	workflow.Id = id
	return workflow, nil
}
func DeleteWorkflow(id string) error {
	return DBCon.DeleteWorkflow(id)
}
func ListWorkflowHistoryImpl() (*wf.WorkflowHistoryList, error) {
	history, err := DBCon.GetWorkflowHistory()
	if err != nil {
		return nil, err
	}

	var hl []*wf.WorkflowHistory
	for _, data := range history {
		w, err := DBCon.GetWorkflow(data.WorkflowID)
		if err != nil {
			continue
		}
		hl = append(hl, &wf.WorkflowHistory{
			Id:           data.ProcessID,
			WorkflowId:   data.WorkflowID,
			WorkflowName: w.Name,
			RunDate:      time.Unix(data.CreatedAt, 0).Format("Jan 02, 2006"),
		})
	}

	return &wf.WorkflowHistoryList{
		History: hl,
	}, nil
}
func GetWorkflowHistoryImpl(Id string) (*wf.WorkflowHistoryResponse, error) {
	replayDataList, err := DBCon.GetReplayDataGroupedByProcessID(Id)
	if err != nil {
		return nil, err
	}

	var data []*wf.ReplayData
	for _, rd := range replayDataList {
		var nodeData wf.NodeData
		if err := json.Unmarshal([]byte(rd.Data), &nodeData); err != nil {
			log.Printf("Error unmarshalling data: %v", err)
			return nil, err
		}
		var variables map[string]string
		if err := json.Unmarshal([]byte(rd.Variables), &variables); err != nil {
			log.Printf("Error unmarshalling variables: %v", err)
			return nil, err
		}

		data = append(data, &wf.ReplayData{
			NodeId:    rd.NodeID,
			Data:      &nodeData,
			Variables: variables,
			Status:    wf.NodeStatus(rd.Status),
			Message:   rd.Message,
		})
	}

	return &wf.WorkflowHistoryResponse{
		Data: data,
	}, nil
}
