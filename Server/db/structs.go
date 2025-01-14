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
	ID          string
	Name        string
	Description string
	Nodes       []interface{}
	Edges       []interface{}
	CreatedAt   time.Time
	CreatedBy   string
	UpdatedAt   time.Time
	UpdatedBy   string
}

type WprkflowProfileModel struct {
	ID         string
	WorkflowId string
	Name       string
	Profile    interface{}
}
