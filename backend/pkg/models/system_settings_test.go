package models

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestFromSystemSettingsEntry(t *testing.T) {
	t.Parallel()

	//setup
	systemSettings := new(SystemSettings)
	systemSettingsEntry := SystemSettingEntry{
		SettingKeyName:     "installation_id",
		SettingDataType:    "string",
		SettingValueString: "12345",
	}

	//test
	err := systemSettings.FromSystemSettingsEntry(&systemSettingsEntry)

	//assert
	require.NoError(t, err)
	require.Equal(t, "12345", systemSettings.InstallationID)
	require.Equal(t, "", systemSettings.InstallationSecret)
}

func TestToSystemSettingsEntry(t *testing.T) {
	t.Parallel()

	//setup
	systemSettings := new(SystemSettings)
	previousSystemSettingsEntries := []SystemSettingEntry{{
		ModelBase: ModelBase{
			ID: uuid.MustParse("73057947-af24-4739-a4af-ca3496f85b76"),
		},
		SettingKeyName:     "installation_id",
		SettingDataType:    "string",
		SettingValueString: "4567",
	}}

	//test
	systemSettings.InstallationID = "9876"
	updatedSystemSettingsEntries, err := systemSettings.ToSystemSettingsEntry(previousSystemSettingsEntries)

	//assert
	require.NoError(t, err)

	require.Contains(t, updatedSystemSettingsEntries, SystemSettingEntry{
		ModelBase: ModelBase{
			ID: uuid.MustParse("73057947-af24-4739-a4af-ca3496f85b76"),
		},
		SettingKeyName:     "installation_id",
		SettingDataType:    "string",
		SettingValueString: "9876",
	})

	// Check that the other fields were added
	require.Contains(t, updatedSystemSettingsEntries, SystemSettingEntry{
		SettingKeyName:     "installation_secret",
		SettingDataType:    "string",
		SettingValueString: "", // or whatever the zero value is
	})

	require.Contains(t, updatedSystemSettingsEntries, SystemSettingEntry{
		SettingKeyName:   "typesense_data_indexed",
		SettingDataType:  "bool",
		SettingValueBool: false, // default zero value
	})
}
