package DB

import (
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
}

func (db *DatabaseConnection) AddConnection(conn Connection) error {
	return db.conn.Create(&conn).Error
}

func (db *DatabaseConnection) SaveConnection(conn *Connection) error {
	return db.conn.Save(conn).Error
}

func (db *DatabaseConnection) GetConnection(id string) (Connection, error) {
	var conn Connection
	err := db.conn.Where("id = ?", id).First(&conn).Error
	return conn, err
}

func (db *DatabaseConnection) ListConnections() ([]Connection, error) {
	var conns []Connection
	err := db.conn.Find(&conns).Error
	return conns, err
}

func (db *DatabaseConnection) UpdateConnection(id, name, credentials string) error {
	updates := map[string]interface{}{
		"name":       name,
		"updated_at": time.Now(),
	}
	if credentials != "" {
		updates["credentials"] = credentials
	}
	return db.conn.Model(&Connection{}).Where("id = ?", id).Updates(updates).Error
}

// UpdateConnectionName is kept for backward compatibility.
func (db *DatabaseConnection) UpdateConnectionName(id, name string) error {
	return db.UpdateConnection(id, name, "")
}

func (db *DatabaseConnection) DeleteConnection(id string) error {
	return db.conn.Where("id = ?", id).Delete(&Connection{}).Error
}

