package database

import (
	"context"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/google/uuid"
	"github.com/mitchellh/mapstructure"
	"strings"
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

	// store retrieved settings in the AppConfig obj
	for _, settingsEntry := range settingsEntries {
		configKey := fmt.Sprintf("%s.%s", config.DB_USER_SETTINGS_SUBKEY, settingsEntry.SettingKeyName)

		if settingsEntry.SettingDataType == "numeric" {
			sr.AppConfig.SetDefault(configKey, settingsEntry.SettingValueNumeric)
		} else if settingsEntry.SettingDataType == "string" {
			sr.AppConfig.SetDefault(configKey, settingsEntry.SettingValueString)
		} else if settingsEntry.SettingDataType == "bool" {
			sr.AppConfig.SetDefault(configKey, settingsEntry.SettingValueBool)
		} else if settingsEntry.SettingDataType == "array" {
			sr.AppConfig.SetDefault(configKey, settingsEntry.SettingValueArray)
		}
	}

	// unmarshal the dbsetting object data to a settings object.
	var settings models.UserSettings
	err := sr.AppConfig.UnmarshalKey(config.DB_USER_SETTINGS_SUBKEY, &settings)
	if err != nil {
		return nil, err
	}
	return &settings, nil
}

// testing
// curl -d '{"metrics": { "notify_level": 5, "status_filter_attributes": 5, "status_threshold": 5 }}' -H "Content-Type: application/json" -X POST http://localhost:9090/api/settings
// SaveSettings will update settings in AppConfig object, then save the settings to the database.
func (sr *SqliteRepository) SaveUserSettings(ctx context.Context, settings *models.UserSettings) error {
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return currentUserErr
	}

	//save the entries to the appconfig
	settingsMap := &map[string]interface{}{}
	err := mapstructure.Decode(settings, &settingsMap)
	if err != nil {
		return err
	}
	settingsWrapperMap := map[string]interface{}{}
	settingsWrapperMap[config.DB_USER_SETTINGS_SUBKEY] = *settingsMap
	err = sr.AppConfig.MergeConfigMap(settingsWrapperMap)
	if err != nil {
		return err
	}
	sr.Logger.Debugf("after merge settings: %v", sr.AppConfig.AllSettings())
	//retrieve current settings from the database
	settingsEntries := []models.UserSettingEntry{}
	if err := sr.GormClient.
		WithContext(ctx).
		Where(models.UserSettingEntry{
			UserID: currentUser.ID,
		}).
		Find(&settingsEntries).Error; err != nil {
		return fmt.Errorf("Could not get settings from DB: %v", err)
	}

	//update settingsEntries
	for ndx, settingsEntry := range settingsEntries {
		configKey := fmt.Sprintf("%s.%s", config.DB_USER_SETTINGS_SUBKEY, strings.ToLower(settingsEntry.SettingKeyName))
		if !sr.AppConfig.IsSet(configKey) {
			continue //skip any settings that don't exist in the appconfig
		}

		if settingsEntry.SettingDataType == "numeric" {
			settingsEntries[ndx].SettingValueNumeric = sr.AppConfig.GetInt(configKey)
		} else if settingsEntry.SettingDataType == "string" {
			settingsEntries[ndx].SettingValueString = sr.AppConfig.GetString(configKey)
		} else if settingsEntry.SettingDataType == "bool" {
			settingsEntries[ndx].SettingValueBool = sr.AppConfig.GetBool(configKey)
		} else if settingsEntry.SettingDataType == "array" {
			settingsEntries[ndx].SettingValueArray = sr.AppConfig.GetStringSlice(configKey)
		}

		// store in database.
		//TODO: this should be `sr.gormClient.Updates(&settingsEntries).Error`
		err := sr.GormClient.
			WithContext(ctx).
			Model(&models.UserSettingEntry{}).
			Where([]uuid.UUID{settingsEntry.ID}).
			Select("setting_value_numeric", "setting_value_string", "setting_value_bool").
			Updates(settingsEntries[ndx]).Error
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
		SettingKeyDescription: "customized dashboard json locations",
		SettingDataType:       "array",
		SettingValueArray:     []string{},
	})

	return sr.GormClient.WithContext(ctx).Create(settingsEntries).Error

}
