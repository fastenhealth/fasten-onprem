package config

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg/errors"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"testing"
)

func Test_ValidateConfig(t *testing.T) {
	// Test case 1: database.encryption.key is too short
	testConfig1 := configuration{
		Viper: viper.New(),
	}
	testConfig1.Set("database.encryption.key", "tooshort")
	err1 := testConfig1.ValidateConfig()
	require.ErrorIs(t, err1, errors.ConfigValidationError("database.encryption.key must be at least 10 characters"))

	// Test case 2: database.encryption.key is empty
	testConfig2 := configuration{
		Viper: viper.New(),
	}
	testConfig2.Set("database.encryption.key", "")
	err2 := testConfig2.ValidateConfig()
	require.ErrorIs(t, err2, errors.ConfigValidationError("database.encryption.key cannot be empty"))

	// Test case 3: database.encryption.key is not set (should not error)
	testConfig3 := configuration{
		Viper: viper.New(),
	}
	err3 := testConfig3.ValidateConfig()
	require.NoError(t, err3)

	// Test case 4: database.encryption.key is valid (should not error)
	testConfig4 := configuration{
		Viper: viper.New(),
	}
	testConfig4.Set("database.encryption.key", "thisisalongenoughkey")
	err4 := testConfig4.ValidateConfig()
	require.NoError(t, err4)
}
