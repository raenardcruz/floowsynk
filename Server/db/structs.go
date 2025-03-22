package db

import (
	"database/sql"
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

type WorkflowProfileModel struct {
	ID         string
	WorkflowId string
	Name       string
	Profile    interface{}
}
