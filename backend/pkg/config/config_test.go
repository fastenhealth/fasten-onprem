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
	testConfig1.Set("database.encryption.enabled", true)
	testConfig1.Set("database.encryption.key", "tooshort")
	err1 := testConfig1.ValidateConfig()
	require.ErrorIs(t, err1, errors.ConfigValidationError("database.encryption.key must be at least 10 characters"))

	// Test case 2: database.encryption.key is empty
	testConfig2 := configuration{
		Viper: viper.New(),
	}
	testConfig2.Set("database.encryption.enabled", true)
	testConfig2.Set("database.encryption.key", "")
	err2 := testConfig2.ValidateConfig()
	require.ErrorIs(t, err2, errors.ConfigValidationError("database.encryption.key cannot be empty"))

	// Test case 3: database.encryption.key is not set, but encryption is enabled
	testConfig3 := configuration{
		Viper: viper.New(),
	}
	testConfig3.Set("database.encryption.enabled", true)
	err3 := testConfig3.ValidateConfig()
	require.ErrorIs(t, err3, errors.ConfigValidationError("database.encryption.key must be set when encryption is enabled"))

	// Test case 4: database.encryption.enabled is false, key is too short (should not error)
	testConfig4 := configuration{
		Viper: viper.New(),
	}
	testConfig4.Set("database.encryption.enabled", false)
	testConfig4.Set("database.encryption.key", "tooshort")
	err4 := testConfig4.ValidateConfig()
	require.NoError(t, err4)

	// Test case 5: database.encryption.enabled is false, key is empty (should not error)
	testConfig5 := configuration{
		Viper: viper.New(),
	}
	testConfig5.Set("database.encryption.enabled", false)
	testConfig5.Set("database.encryption.key", "")
	err5 := testConfig5.ValidateConfig()
	require.NoError(t, err5)

	// Test case 6: database.encryption.enabled is false, key is not set (should not error)
	testConfig6 := configuration{
		Viper: viper.New(),
	}
	testConfig6.Set("database.encryption.enabled", false)
	err6 := testConfig6.ValidateConfig()
	require.NoError(t, err6)
}
