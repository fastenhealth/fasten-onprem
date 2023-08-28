package database

import (
	"context"
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/google/uuid"
)

// LoadSettings will retrieve settings from the database, store them in the AppConfig object, and return a Settings struct
func (sr *SqliteRepository) LoadUserSettings(ctx context.Context) (*models.UserSettings, error) {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}

	settingsEntries := []models.UserSettingEntry{}
	if err := sr.GormClient.
		WithContext(ctx).
		Where(models.UserSettingEntry{
			UserID: currentUser.ID,
		}).
		Find(&settingsEntries).Error; err != nil {
		return nil, fmt.Errorf("Could not get settings from DB: %v", err)
	}

	settings := models.UserSettings{}
	for _, settingsEntry := range settingsEntries {
		err := settings.FromUserSettingsEntry(&settingsEntry)
		if err != nil {
			return nil, fmt.Errorf("Could not get settings from DB: %v", err)
		}
	}

	return &settings, nil
}

// testing
// curl -d '{"metrics": { "notify_level": 5, "status_filter_attributes": 5, "status_threshold": 5 }}' -H "Content-Type: application/json" -X POST http://localhost:9090/api/settings
// SaveSettings will update settings in AppConfig object, then save the settings to the database.
func (sr *SqliteRepository) SaveUserSettings(ctx context.Context, newSettings *models.UserSettings) error {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}

	//retrieve current settings from the database
	currentSettingsEntries := []models.UserSettingEntry{}

	if err := sr.GormClient.
		WithContext(ctx).
		Where(models.UserSettingEntry{
			UserID: currentUser.ID,
		}).
		Find(&currentSettingsEntries).Error; err != nil {
		return fmt.Errorf("Could not get settings from DB: %v", err)
	}

	//update settingsEntries

	newSettingsEntries, err := newSettings.ToUserSettingsEntry(currentSettingsEntries)
	if err != nil {
		return fmt.Errorf("merge new settings with DB: %v", err)
	}

	for ndx, settingsEntry := range newSettingsEntries {

		// store in database.
		//TODO: this should be `sr.gormClient.Updates(&settingsEntries).Error`
		err := sr.GormClient.
			WithContext(ctx).
			Model(&models.UserSettingEntry{}).
			Where([]uuid.UUID{settingsEntry.ID}).
			Select("setting_value_numeric", "setting_value_string", "setting_value_bool", "setting_value_array").
			Updates(newSettingsEntries[ndx]).Error
		if err != nil {
			return err
		}
	}
	return nil
}

func (sr *SqliteRepository) PopulateDefaultUserSettings(ctx context.Context, userId uuid.UUID) error {

	//retrieve current settings from the database
	settingsEntries := []models.UserSettingEntry{}
	settingsEntries = append(settingsEntries, models.UserSettingEntry{
		UserID:                userId,
		SettingKeyName:        "dashboard_locations",
		SettingKeyDescription: "remote dashboard locations (github gists)",
		SettingDataType:       "array",
		SettingValueArray:     []string{},
	})

	return sr.GormClient.WithContext(ctx).Create(settingsEntries).Error

}
