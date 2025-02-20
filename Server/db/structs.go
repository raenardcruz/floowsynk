package db

import (
	"database/sql"
	"time"
)

type DB struct {
	conn *sql.DB
}

type UsersModel struct {
	ID        string
	Username  string
	Password  string
	Email     string
	Role      string
	CreatedAt string
	UpdatedAt string
}

type WorkflowModel struct {
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	Type        string        `json:"type"`
	Nodes       []interface{} `json:"nodes"`
	Edges       []interface{} `json:"edges"`
	CreatedAt   time.Time     `json:"created_at"`
	CreatedBy   string        `json:"created_by"`
	UpdatedAt   time.Time     `json:"updated_at"`
	UpdatedBy   string        `json:"updated_by"`
}

type WorkflowProfileModel struct {
	ID         string
	WorkflowId string
	Name       string
	Profile    interface{}
}
