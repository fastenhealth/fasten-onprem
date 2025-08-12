package config

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg/errors"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"testing"
)

func Test_ValidateConfig(t *testing.T) {
	//setup
	testConfig := configuration{
		Viper: viper.New(),
	}

	//test & verify
	testConfig.Set("database.encryption.key", "tooshort")
	err := testConfig.ValidateConfig()
	require.ErrorIs(t, err, errors.ConfigValidationError("database.encryption.key must be at least 10 characters"))

	testConfig.Set("database.encryption.key", "")
	err = testConfig.ValidateConfig()
	require.ErrorIs(t, err, errors.ConfigValidationError("database.encryption.key cannot be empty"))

}
