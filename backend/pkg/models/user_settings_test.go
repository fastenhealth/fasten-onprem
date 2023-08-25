package models

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestFromUserSettingsEntry(t *testing.T) {
	t.Parallel()

	//setup
	userSettings := new(UserSettings)
	userSettingsEntry := UserSettingEntry{
		SettingKeyName:    "dashboard_locations",
		SettingDataType:   "array",
		SettingValueArray: []string{"a", "b", "c"},
	}

	//test
	err := userSettings.FromUserSettingsEntry(&userSettingsEntry)

	//assert
	require.NoError(t, err)
	require.Equal(t, []string{"a", "b", "c"}, userSettings.DashboardLocations)
}

func TestToUserSettingsEntry(t *testing.T) {
	t.Parallel()

	//setup
	userSettings := new(UserSettings)
	previousUserSettingsEntries := []UserSettingEntry{{
		ModelBase: ModelBase{
			ID: uuid.MustParse("73057947-af24-4739-a4af-ca3496f85b76"),
		},
		SettingKeyName:    "dashboard_locations",
		SettingDataType:   "array",
		SettingValueArray: []string{"a", "b", "c"},
	}}

	//test
	userSettings.DashboardLocations = []string{"d", "e", "f"}
	updatedUserSettingsEntries, err := userSettings.ToUserSettingsEntry(previousUserSettingsEntries)

	//assert
	require.NoError(t, err)
	require.Equal(t, []UserSettingEntry{{
		ModelBase: ModelBase{
			ID: uuid.MustParse("73057947-af24-4739-a4af-ca3496f85b76"),
		},
		SettingKeyName:    "dashboard_locations",
		SettingDataType:   "array",
		SettingValueArray: []string{"d", "e", "f"},
	}}, updatedUserSettingsEntries)
}
