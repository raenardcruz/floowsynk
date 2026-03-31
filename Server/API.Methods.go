package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/raenardcruz/floowsynk/Common"
	DB "github.com/raenardcruz/floowsynk/Database"
	"github.com/raenardcruz/floowsynk/Server/crypto"
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


func validateToken(tokenString string) *Common.ValidateResults {
	if tokenString == DB.AppConfig.Job_Token {
		return &Common.ValidateResults{
			Id:       "",
			Username: "job",
			Role:     UserRoleService,
			Status:   http.StatusOK,
		}
	}
	token, err := jwt.ParseWithClaims(tokenString, jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil {
		return &Common.ValidateResults{Status: http.StatusUnauthorized, Message: err.Error()}
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return &Common.ValidateResults{
			Id:       claims["id"].(string),
			Username: claims["username"].(string),
			Role:     claims["role"].(string),
			Status:   http.StatusOK,
		}
	}

	return &Common.ValidateResults{Status: http.StatusUnauthorized, Message: "Invalid token"}
}

func ExtendToken(token string) (string, error) {
	results := validateToken(token)
	if results.Status != http.StatusOK {
		return "", fmt.Errorf("Unauthorized")
	}

	newToken := generateToken(results.Id, results.Username, results.Role, time.Now().Add(time.Minute*60).UTC().Unix())
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

func GetWorkflow(id string) (workflow *Common.Workflow, err error) {
	workflow, err = DBCon.GetWorkflow(id)
	if err != nil {
		return workflow, err
	}
	return workflow, nil
}

func ListWorkflows(offset int32, limit int32) (wl *Common.WorkflowList, err error) {
	wl, err = DBCon.GetWorkflows(int(limit), int(offset))
	if err != nil {
		return nil, err
	}
	return wl, nil
}
func UpdateWorkflow(workflow *Common.Workflow) (w *Common.Workflow, err error) {
	if err := DBCon.UpdateWorkflow(workflow); err != nil {
		return nil, err
	}
	return workflow, nil
}
func CreateWorkflow(workflow *Common.Workflow) (*Common.Workflow, error) {
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
func ListWorkflowHistoryImpl() (*Common.WorkflowHistoryList, error) {
	history, err := DBCon.GetWorkflowHistory()
	if err != nil {
		return nil, err
	}

	var hl []*Common.WorkflowHistory
	for _, data := range history {
		w, err := DBCon.GetWorkflow(data.WorkflowID)
		if err != nil {
			continue
		}
		hl = append(hl, &Common.WorkflowHistory{
			Id:           data.ProcessID,
			WorkflowId:   data.WorkflowID,
			WorkflowName: w.Name,
			RunDate:      time.Unix(data.CreatedAt, 0).Format("Jan 02, 2006"),
		})
	}

	return &Common.WorkflowHistoryList{
		History: hl,
	}, nil
}
func GetWorkflowHistoryImpl(Id string) (*Common.WorkflowHistoryResponse, error) {
	replayDataList, err := DBCon.GetReplayDataGroupedByProcessID(Id)
	if err != nil {
		return nil, err
	}

	var data []*Common.ReplayData
	for _, rd := range replayDataList {
		var nodeData Common.NodeData
		if err := json.Unmarshal([]byte(rd.Data), &nodeData); err != nil {
			log.Printf("Error unmarshalling data: %v", err)
			return nil, err
		}
		var variables map[string]string
		if err := json.Unmarshal([]byte(rd.Variables), &variables); err != nil {
			log.Printf("Error unmarshalling variables: %v", err)
			return nil, err
		}

		data = append(data, &Common.ReplayData{
			NodeId:    rd.NodeID,
			Data:      &nodeData,
			Variables: variables,
			Status:    Common.NodeStatus(rd.Status),
			Message:   rd.Message,
		})
	}

	return &Common.WorkflowHistoryResponse{
		Data: data,
	}, nil
}
