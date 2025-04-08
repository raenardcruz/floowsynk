package db

import (
	"gorm.io/gorm"
)

type JSONB []byte

type DB struct {
	conn *gorm.DB
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
	Profile    JSONB `gorm:"type:jsonb"`
}

type Workflow struct {
	ID          string `gorm:"primaryKey"`
	Name        string
	Type        string
	Description string
	Nodes       JSONB `gorm:"type:jsonb"`
	Edges       JSONB `gorm:"type:jsonb"`
	CreatedBy   string
	UpdatedBy   string
	Tags        []string `gorm:"type:text[]"`
	CreatedAt   string
	UpdatedAt   string
}
