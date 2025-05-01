package main

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	DB "github.com/raenardcruz/floowsynk/Database"
	"github.com/raenardcruz/floowsynk/Helper"
	"github.com/raenardcruz/floowsynk/Server/crypto"
	"github.com/raenardcruz/floowsynk/Server/proto"
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

func GetWorkflow(id string) (workflow *proto.Workflow, err error) {
	workflow, err = DBCon.GetWorkflow(id)
	if err != nil {
		return workflow, err
	}
	return workflow, nil
}

func ListWorkflows(offset int32, limit int32) (wl *proto.WorkflowList, err error) {
	wl, err = DBCon.GetWorkflows(int(limit), int(offset))
	if err != nil {
		return nil, err
	}
	return wl, nil
}
func UpdateWorkflow(workflow *proto.Workflow) (w *proto.Workflow, err error) {
	if err := DBCon.UpdateWorkflow(workflow); err != nil {
		return nil, err
	}
	return workflow, nil
}
func CreateWorkflow(workflow *proto.Workflow) (*proto.Workflow, error) {
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
func ListWorkflowHistoryImpl() (*proto.WorkflowHistoryList, error) {
	history, err := DBCon.GetWorkflowHistory()
	if err != nil {
		return nil, err
	}

	var hl []*proto.WorkflowHistory
	for _, data := range history {
		w, err := DBCon.GetWorkflow(data.WorkflowID)
		if err != nil {
			return nil, err
		}
		hl = append(hl, &proto.WorkflowHistory{
			Id:           data.ID,
			WorkflowId:   data.WorkflowID,
			WorkflowName: w.Name,
			RunDate:      time.Unix(data.CreatedAt, 0).Format("Jan 02, 2006"),
		})
	}

	return &proto.WorkflowHistoryList{
		History: hl,
	}, nil
}
func GetWorkflowHistoryImpl(Id string) (*proto.WorkflowHistoryResponse, error) {
	replayDataList, err := DBCon.GetReplayDataGroupedByProcessID(Id)
	if err != nil {
		return nil, err
	}

	var data []*proto.ReplayData
	for _, rd := range replayDataList {
		ndStr, err := Helper.Marshal(rd.Data)
		if err != nil {
			return nil, err
		}
		nd, err := Helper.Unmarshal[proto.NodeData](ndStr)
		if err != nil {
			return nil, err
		}
		variableStr, err := Helper.Marshal(rd.Variables)
		if err != nil {
			return nil, err
		}
		variables, err := Helper.Unmarshal[map[string]string](variableStr)
		if err != nil {
			return nil, err
		}

		data = append(data, &proto.ReplayData{
			NodeId:    rd.NodeID,
			Data:      &nd,
			Variables: variables,
			Status:    proto.NodeStatus(rd.Status),
			Message:   rd.Message,
		})
	}

	return &proto.WorkflowHistoryResponse{
		Data: data,
	}, nil
}
