package DB

import (
	"time"
)

type RagConnection struct {
	ID             string    `gorm:"primaryKey;type:uuid" json:"id"`
	Name           string    `gorm:"type:varchar(100)" json:"name"`
	OllamaBaseURL  string    `gorm:"type:varchar(255)" json:"ollamaBaseUrl"`
	EmbeddingModel string    `gorm:"type:varchar(100)" json:"embeddingModel"`
	ChatModel      string    `gorm:"type:varchar(100)" json:"chatModel"`
	Description    string    `gorm:"type:text" json:"description"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
	IsModified     bool      `gorm:"default:false;column:is_modified" json:"isModified"`
}

type RagDocument struct {
	ID              string    `gorm:"primaryKey;type:uuid" json:"id"`
	RagConnectionID string    `gorm:"type:uuid;index" json:"ragConnectionId"`
	FileName        string    `gorm:"type:varchar(255)" json:"fileName"`
	FileSize        int64     `json:"fileSize"`
	FileType        string    `gorm:"type:varchar(50)" json:"fileType"`
	ChunkCount          int       `json:"chunkCount"`
	ProcessedChunkCount int       `json:"processedChunkCount"`
	TotalChunkCount     int       `json:"totalChunkCount"`
	Status              string    `gorm:"type:varchar(50)" json:"status"` // PROCESSING, READY, FAILED
	ErrorMessage    string    `gorm:"type:text" json:"errorMessage"`
	CreatedAt       time.Time `json:"createdAt"`
}

type RagChunk struct {
	ID              string `gorm:"primaryKey;type:uuid" json:"id"`
	RagConnectionID string `gorm:"type:uuid;index" json:"ragConnectionId"`
	RagDocumentID   string `gorm:"type:uuid;index" json:"ragDocumentId"`
	ChunkIndex      int    `json:"chunkIndex"`
	Content         string `gorm:"type:text" json:"content"`
	Embedding       string `gorm:"type:text" json:"embedding"` // JSON serialized []float32
}

// Connections CRUD
func (db *DatabaseConnection) AddRagConnectionEnv(conn RagConnection, env string) error {
	tableName := db.TableFor(env, "rag_connections")
	return db.conn.Table(tableName).Create(&conn).Error
}

func (db *DatabaseConnection) SaveRagConnectionEnv(conn *RagConnection, env string) error {
	tableName := db.TableFor(env, "rag_connections")
	if env == "production" && !conn.IsModified {
		conn.IsModified = true
	}
	return db.conn.Table(tableName).Save(conn).Error
}

func (db *DatabaseConnection) GetRagConnectionEnv(id string, env string) (RagConnection, error) {
	tableName := db.TableFor(env, "rag_connections")
	var conn RagConnection
	err := db.conn.Table(tableName).Where("id = ?", id).First(&conn).Error
	if err != nil && env == "staging" {
		prodTable := db.TableFor("production", "rag_connections")
		if errProd := db.conn.Table(prodTable).Where("id = ?", id).First(&conn).Error; errProd == nil {
			return conn, nil
		}
	}
	return conn, err
}

func (db *DatabaseConnection) ListRagConnectionsEnv(env string) ([]RagConnection, error) {
	tableName := db.TableFor(env, "rag_connections")
	var conns []RagConnection
	err := db.conn.Table(tableName).Find(&conns).Error
	return conns, err
}

func (db *DatabaseConnection) DeleteRagConnectionEnv(id string, env string) error {
	ragConnTable := db.TableFor(env, "rag_connections")
	docTable := db.TableFor(env, "rag_documents")
	chunkTable := db.TableFor(env, "rag_chunks")

	// Cascade delete chunks and documents
	_ = db.conn.Table(chunkTable).Where("rag_connection_id = ?", id).Delete(&RagChunk{}).Error
	_ = db.conn.Table(docTable).Where("rag_connection_id = ?", id).Delete(&RagDocument{}).Error
	return db.conn.Table(ragConnTable).Where("id = ?", id).Delete(&RagConnection{}).Error
}

// Documents CRUD
func (db *DatabaseConnection) AddRagDocumentEnv(doc RagDocument, env string) error {
	tableName := db.TableFor(env, "rag_documents")
	return db.conn.Table(tableName).Create(&doc).Error
}

func (db *DatabaseConnection) UpdateRagDocumentEnv(doc *RagDocument, env string) error {
	tableName := db.TableFor(env, "rag_documents")
	return db.conn.Table(tableName).Save(doc).Error
}

func (db *DatabaseConnection) ListRagDocumentsEnv(ragConnID string, env string) ([]RagDocument, error) {
	tableName := db.TableFor(env, "rag_documents")
	var docs []RagDocument
	err := db.conn.Table(tableName).Where("rag_connection_id = ?", ragConnID).Order("created_at desc").Find(&docs).Error
	return docs, err
}

func (db *DatabaseConnection) GetRagDocumentCountEnv(ragConnID string, env string) (int64, error) {
	tableName := db.TableFor(env, "rag_documents")
	var count int64
	err := db.conn.Table(tableName).Where("rag_connection_id = ?", ragConnID).Count(&count).Error
	return count, err
}

func (db *DatabaseConnection) DeleteRagDocumentEnv(id string, ragConnID string, env string) error {
	docTable := db.TableFor(env, "rag_documents")
	chunkTable := db.TableFor(env, "rag_chunks")

	_ = db.conn.Table(chunkTable).Where("rag_document_id = ?", id).Delete(&RagChunk{}).Error
	return db.conn.Table(docTable).Where("id = ? AND rag_connection_id = ?", id, ragConnID).Delete(&RagDocument{}).Error
}

// Chunks CRUD
func (db *DatabaseConnection) AddRagChunksEnv(chunks []RagChunk, env string) error {
	if len(chunks) == 0 {
		return nil
	}
	tableName := db.TableFor(env, "rag_chunks")
	return db.conn.Table(tableName).Create(&chunks).Error
}

func (db *DatabaseConnection) ListRagChunksEnv(ragConnID string, env string) ([]RagChunk, error) {
	tableName := db.TableFor(env, "rag_chunks")
	var chunks []RagChunk
	err := db.conn.Table(tableName).Where("rag_connection_id = ?", ragConnID).Find(&chunks).Error
	return chunks, err
}

func (db *DatabaseConnection) GetRagChunkCountEnv(ragConnID string, env string) (int64, error) {
	tableName := db.TableFor(env, "rag_chunks")
	var count int64
	err := db.conn.Table(tableName).Where("rag_connection_id = ?", ragConnID).Count(&count).Error
	return count, err
}

func (db *DatabaseConnection) GetRagDocumentNameMapEnv(ragConnID string, env string) (map[string]string, error) {
	docs, err := db.ListRagDocumentsEnv(ragConnID, env)
	if err != nil {
		return nil, err
	}
	m := make(map[string]string)
	for _, d := range docs {
		m[d.ID] = d.FileName
	}
	return m, nil
}
