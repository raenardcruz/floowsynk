package DB

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
)

const replayDataCacheExpiration = 15 * time.Minute

type ReplayData struct {
	ID              string `gorm:"primaryKey"`
	ProcessID       string
	WorkflowID      string
	NodeID          string `gorm:"ommitempty"`
	ProcessSequence int    `gorm:"omitempty"`
	Data            JSONB  `gorm:"type:jsonb"`
	Variables       JSONB  `gorm:"type:jsonb"`
	Status          int32  `gorm:"omitempty"`
	Message         string `gorm:"omitempty"`
	CreatedAt       int64  `gorm:"omitempty"`
}

func (db *DatabaseConnection) CreateReplayData(data *ReplayData) (string, error) {
	if data == nil {
		return "", fmt.Errorf("data is Empty")
	}
	data.CreatedAt = time.Now().UTC().Unix()
	if data.ID == "" {
		data.ID = uuid.NewString()
	}
	result := db.conn.Create(&data)
	if result.Error != nil {
		return "", result.Error
	}
	log.Printf("Replay Data %v added to DB", data)
	log.Printf("SQL: %v, Rows Affected: %d", result.Statement.SQL.String(), result.RowsAffected)
	return data.ID, nil
}

func (db *DatabaseConnection) CreateBatchReplayData(dataList []ReplayData) ([]string, error) {
	if len(dataList) == 0 {
		return nil, fmt.Errorf("dataList is empty")
	}

	var ids []string
	for i := range dataList {
		dataList[i].CreatedAt = time.Now().UTC().Unix()
		if dataList[i].ID == "" {
			dataList[i].ID = uuid.NewString()
		}
		ids = append(ids, dataList[i].ID)
	}

	result := db.conn.Create(&dataList)
	if result.Error != nil {
		return nil, result.Error
	}

	log.Printf("Batch Replay Data added to DB: %v", ids)
	log.Printf("SQL: %v, Rows Affected: %d", result.Statement.SQL.String(), result.RowsAffected)
	return ids, nil
}

func (db *DatabaseConnection) GetWorkflowHistory() ([]ReplayData, error) {
	log.Print("Getting ProcessID and WorkflowID")
	var replayData []ReplayData
	ctx := context.Background()
	cacheKey := "replayHistoryList"

	if cachedData, found := GetFromCache(ctx, cacheKey); found {
		var cacheData []ReplayData
		if err := json.Unmarshal(cachedData, &cacheData); err == nil {
			return cacheData, nil
		}
	}

	result := db.conn.Select("id, process_id, workflow_id").Distinct().Find(&replayData)
	if result.Error != nil {
		return nil, result.Error
	}

	log.Printf("SQL: %v, Rows Affected: %d", result.Statement.SQL.String(), result.RowsAffected)

	if err := SetCache(ctx, cacheKey, replayData, replayDataCacheExpiration); err != nil {
		log.Printf("Error Setting cache for %s", cacheKey)
	}

	return replayData, nil
}

func (db *DatabaseConnection) GetReplayDataGroupedByProcessID(processID string) ([]ReplayData, error) {
	ctx := context.Background()
	cacheKey := "ReplayData:" + processID
	var replayData []ReplayData

	if cachedData, found := GetFromCache(ctx, cacheKey); found {
		var cacheData []ReplayData
		if err := json.Unmarshal(cachedData, &cacheData); err == nil {
			return cacheData, nil
		}
	}

	result := db.conn.Where("process_id = ?", processID).Find(&replayData)
	if result.Error != nil {
		return nil, result.Error
	}

	log.Printf("SQL: %v, Rows Affected: %d", result.Statement.SQL.String(), result.RowsAffected)

	if err := SetCache(ctx, cacheKey, replayData, replayDataCacheExpiration); err != nil {
		log.Printf("Error Setting cache for %s", cacheKey)
	}

	return replayData, nil
}

func (db *DatabaseConnection) Cleanup(retention int) error {
	cutoff := time.Now().UTC().AddDate(0, 0, -retention).Unix()
	result := db.conn.Where("created_at < ?", cutoff).Delete(&ReplayData{})
	if err := result.Error; err != nil {
		return err
	}
	log.Printf("SQL: %v, Rows Affected: %d", result.Statement.SQL.String(), result.RowsAffected)
	log.Printf("Cleaned up Replay Data older than %d days", retention)
	return nil
}
