package DB

import (
	"log"
)

type Feature struct {
	Name        string `gorm:"primaryKey"`
	Description string
	Enabled     bool
}

const (
	FEATURE_DB_CACHE = "DB Cache"
)

var FeatureFlags = []Feature{
	{
		Name:        FEATURE_DB_CACHE,
		Description: "Enable DB Caching",
		Enabled:     true,
	},
}

func (db *DatabaseConnection) InitializeFeatureFlags() error {
	log.Println("Initializing feature flags...")
	for _, feature := range FeatureFlags {
		var existingFeature Feature
		result := db.conn.Where("name = ?", feature.Name).First(&existingFeature)
		if result.Error != nil {
			log.Printf("Feature %s not found, creating...", feature.Name)
			if err := db.conn.Create(&feature).Error; err != nil {
				log.Printf("Failed to initialize feature %s: %v", feature.Name, err)
				return err
			}
		}
	}
	return nil
}

func (db *DatabaseConnection) IsFeatureEnabled(featureName string) bool {
	var feature Feature
	// Use Find instead of First to avoid ErrRecordNotFound logging
	result := db.conn.Where("name = ?", featureName).Limit(1).Find(&feature)
	if result.Error != nil || result.RowsAffected == 0 {
		return false
	}
	return feature.Enabled
}
