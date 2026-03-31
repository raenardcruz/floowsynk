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

func (db *DatabaseConnection) InitializeFeature(featureName string, description string) error {
	for _, feature := range FeatureFlags {
		var existingFeature Feature
		result := db.conn.Where("name = ?", feature.Name).First(&existingFeature)
		if result.Error != nil {
			if result.RowsAffected == 0 {
				if err := db.conn.Create(&feature).Error; err != nil {
					log.Printf("Failed to initialize feature %s: %v", feature.Name, err)
					return err
				}
			} else {
				log.Printf("Error querying feature %s: %v", feature.Name, result.Error)
				return result.Error
			}
		}
	}
	return nil
}

func (db *DatabaseConnection) IsFeatureEnabled(featureName string) bool {
	var feature Feature
	result := db.conn.Where("name = ?", featureName).First(&feature)
	if result.Error != nil {
		return false
	}
	return feature.Enabled
}
