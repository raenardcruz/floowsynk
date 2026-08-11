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

type DynamicJSONB map[string]interface{}

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
	return db.CreateReplayDataEnv(data, "staging")
}

func (db *DatabaseConnection) CreateReplayDataEnv(data *ReplayData, env string) (string, error) {
	if data == nil {
		return "", fmt.Errorf("data is Empty")
	}
	data.CreatedAt = time.Now().UTC().Unix()
	if data.ID == "" {
		data.ID = uuid.NewString()
	}
	tableName := db.TableFor(env, "replay_data")
	result := db.conn.Table(tableName).Create(&data)
	if result.Error != nil {
		return "", result.Error
	}

	ctx := context.Background()
	DeleteCache(ctx, fmt.Sprintf("replayHistoryList:%s", env))
	DeleteCache(ctx, fmt.Sprintf("ReplayData:%s:%s", env, data.ProcessID))

	log.Printf("Replay Data %v added to DB (%s)", data, tableName)
	return data.ID, nil
}

func (db *DatabaseConnection) CreateBatchReplayData(dataList []ReplayData) ([]string, error) {
	return db.CreateBatchReplayDataEnv(dataList, "staging")
}

func (db *DatabaseConnection) CreateBatchReplayDataEnv(dataList []ReplayData, env string) ([]string, error) {
	if len(dataList) == 0 {
		return nil, fmt.Errorf("dataList is empty")
	}

	var ids []string
	processIDs := make(map[string]struct{})
	for i := range dataList {
		dataList[i].CreatedAt = time.Now().UTC().Unix()
		if dataList[i].ID == "" {
			dataList[i].ID = uuid.NewString()
		}
		ids = append(ids, dataList[i].ID)
		processIDs[dataList[i].ProcessID] = struct{}{}
	}

	tableName := db.TableFor(env, "replay_data")
	const chunkSize = 500
	for i := 0; i < len(dataList); i += chunkSize {
		end := i + chunkSize
		if end > len(dataList) {
			end = len(dataList)
		}
		chunk := dataList[i:end]
		result := db.conn.Table(tableName).Create(&chunk)
		if result.Error != nil {
			return nil, result.Error
		}
	}

	ctx := context.Background()
	DeleteCache(ctx, fmt.Sprintf("replayHistoryList:%s", env))
	for pID := range processIDs {
		DeleteCache(ctx, fmt.Sprintf("ReplayData:%s:%s", env, pID))
	}

	return ids, nil
}

func (db *DatabaseConnection) GetWorkflowHistory() ([]ReplayData, error) {
	return db.GetWorkflowHistoryEnv("staging")
}

func (db *DatabaseConnection) GetWorkflowHistoryEnv(env string) ([]ReplayData, error) {
	log.Printf("Getting ProcessID and WorkflowID for %s", env)
	var replayData []ReplayData
	ctx := context.Background()
	cacheKey := fmt.Sprintf("replayHistoryList:%s", env)

	if cachedData, found := GetFromCache(ctx, cacheKey); found {
		var cacheData []ReplayData
		if err := json.Unmarshal(cachedData, &cacheData); err == nil {
			return cacheData, nil
		}
	}

	tableName := db.TableFor(env, "replay_data")
	result := db.conn.Table(tableName).Select("process_id, workflow_id, min(created_at) as created_at, MAX(CASE WHEN status = 2 THEN 2 WHEN status = 1 THEN 1 ELSE 0 END) as status").Group("process_id, workflow_id").Order("created_at DESC").Find(&replayData)

	if result.Error != nil {
		return nil, result.Error
	}

	if err := SetCache(ctx, cacheKey, replayData, replayDataCacheExpiration); err != nil {
		log.Printf("Error Setting cache for %s", cacheKey)
	}

	return replayData, nil
}

func (db *DatabaseConnection) GetReplayDataGroupedByProcessID(processID string) ([]ReplayData, error) {
	return db.GetReplayDataGroupedByProcessIDEnv(processID, "staging")
}

func (db *DatabaseConnection) GetReplayDataGroupedByProcessIDEnv(processID string, env string) ([]ReplayData, error) {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("ReplayData:%s:%s", env, processID)
	var replayData []ReplayData

	if cachedData, found := GetFromCache(ctx, cacheKey); found {
		var cacheData []ReplayData
		if err := json.Unmarshal(cachedData, &cacheData); err == nil {
			return cacheData, nil
		}
	}

	tableName := db.TableFor(env, "replay_data")
	result := db.conn.Table(tableName).Where("process_id = ?", processID).Order("process_sequence ASC").Find(&replayData)
	if result.Error != nil {
		return nil, result.Error
	}

	if err := SetCache(ctx, cacheKey, replayData, replayDataCacheExpiration); err != nil {
		log.Printf("Error Setting cache for %s", cacheKey)
	}

	return replayData, nil
}

func (db *DatabaseConnection) Cleanup(retention int) error {
	cutoff := time.Now().UTC().AddDate(0, 0, -retention).Unix()
	for _, env := range []string{"staging", "production"} {
		tableName := db.TableFor(env, "replay_data")
		if err := db.conn.Table(tableName).Where("created_at < ?", cutoff).Delete(&ReplayData{}).Error; err != nil {
			return err
		}
	}
	return nil
}

func (db *DatabaseConnection) ClearAllReplayData() error {
	for _, env := range []string{"staging", "production"} {
		tableName := db.TableFor(env, "replay_data")
		db.conn.Exec(fmt.Sprintf("TRUNCATE TABLE %s;", tableName))
	}
	ctx := context.Background()
	DeleteCache(ctx, "replayHistoryList:staging")
	DeleteCache(ctx, "replayHistoryList:production")
	if RedisClient != nil {
		ClearCache(ctx)
	}
	log.Printf("All Replay Data cleared from DB and Redis Cache.")
	return nil
}
