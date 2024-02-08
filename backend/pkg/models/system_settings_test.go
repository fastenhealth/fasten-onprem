package models

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
	"testing"
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
	require.Equal(t, []SystemSettingEntry{{
		ModelBase: ModelBase{
			ID: uuid.MustParse("73057947-af24-4739-a4af-ca3496f85b76"),
		},
		SettingKeyName:     "installation_id",
		SettingDataType:    "string",
		SettingValueString: "9876",
	}}, updatedSystemSettingsEntries)
}
