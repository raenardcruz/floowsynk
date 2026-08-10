package DB

import (
	"fmt"
	"time"
)

type Connection struct {
	ID          string    `gorm:"primaryKey;type:uuid" json:"id"`
	Name        string    `gorm:"type:varchar(100)" json:"name"`
	ConnectorID string    `gorm:"type:varchar(100)" json:"connectorId"`
	AuthType    string    `gorm:"type:varchar(50)" json:"authType"`
	Credentials string    `gorm:"type:text" json:"credentials"` // AES-GCM encrypted hex string
	UserID      string    `gorm:"type:uuid" json:"userId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	IsModified  bool      `gorm:"default:false;column:is_modified" json:"isModified"`
}

func (db *DatabaseConnection) AddConnection(conn Connection) error {
	return db.AddConnectionEnv(conn, "staging")
}

func (db *DatabaseConnection) AddConnectionEnv(conn Connection, env string) error {
	tableName := db.TableFor(env, "connections")
	return db.conn.Table(tableName).Create(&conn).Error
}

func (db *DatabaseConnection) SaveConnection(conn *Connection) error {
	return db.SaveConnectionEnv(conn, "staging")
}

func (db *DatabaseConnection) SaveConnectionEnv(conn *Connection, env string) error {
	tableName := db.TableFor(env, "connections")
	if env == "production" && !conn.IsModified {
		conn.IsModified = true
	}
	return db.conn.Table(tableName).Save(conn).Error
}

func (db *DatabaseConnection) SavePublishedConnection(conn *Connection) error {
	conn.IsModified = false
	prodTable := db.TableFor("production", "connections")
	return db.conn.Table(prodTable).Save(conn).Error
}

func (db *DatabaseConnection) GetConnection(id string) (Connection, error) {
	return db.GetConnectionEnv(id, "staging")
}

func (db *DatabaseConnection) GetConnectionEnv(id string, env string) (Connection, error) {
	tableName := db.TableFor(env, "connections")
	var conn Connection
	err := db.conn.Table(tableName).Where("id = ?", id).First(&conn).Error
	if err != nil && env == "staging" {
		// Fallback check in production connection table if missing in staging
		prodTable := db.TableFor("production", "connections")
		if errProd := db.conn.Table(prodTable).Where("id = ?", id).First(&conn).Error; errProd == nil {
			return conn, nil
		}
	}
	return conn, err
}

func (db *DatabaseConnection) ListConnections() ([]Connection, error) {
	return db.ListConnectionsEnv("staging")
}

func (db *DatabaseConnection) ListConnectionsEnv(env string) ([]Connection, error) {
	tableName := db.TableFor(env, "connections")
	var conns []Connection
	err := db.conn.Table(tableName).Find(&conns).Error
	return conns, err
}

func (db *DatabaseConnection) UpdateConnection(id, name, credentials string) error {
	return db.UpdateConnectionEnv(id, name, credentials, "staging")
}

func (db *DatabaseConnection) UpdateConnectionEnv(id, name, credentials string, env string) error {
	tableName := db.TableFor(env, "connections")
	updates := map[string]interface{}{
		"name":       name,
		"updated_at": time.Now(),
	}
	if credentials != "" {
		updates["credentials"] = credentials
	}
	if env == "production" {
		updates["is_modified"] = true
	}
	return db.conn.Table(tableName).Where("id = ?", id).Updates(updates).Error
}

func (db *DatabaseConnection) UpdateConnectionName(id, name string) error {
	return db.UpdateConnectionEnv(id, name, "", "staging")
}

func (db *DatabaseConnection) DeleteConnection(id string) error {
	return db.DeleteConnectionEnv(id, "staging")
}

func (db *DatabaseConnection) DeleteConnectionEnv(id string, env string) error {
	tableName := db.TableFor(env, "connections")
	return db.conn.Table(tableName).Where("id = ?", id).Delete(&Connection{}).Error
}

func (db *DatabaseConnection) RevertConnectionToStaging(id string) error {
	prodTable := db.TableFor("production", "connections")
	return db.conn.Exec(fmt.Sprintf("UPDATE %s SET is_modified = false, updated_at = NOW() WHERE id = ?", prodTable), id).Error
}

