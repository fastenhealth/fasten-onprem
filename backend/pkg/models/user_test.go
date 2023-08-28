package models_test

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/stretchr/testify/require"
	"testing"
)

func Test_UserHashPassword(t *testing.T) {
	t.Parallel()

	//setup
	userData := models.User{
		ModelBase: models.ModelBase{},
		FullName:  "John Doe",
		Username:  "john.doe@example.com",
	}

	//test
	err := userData.HashPassword("mysecretpassword")

	//require
	require.NoError(t, err)
	require.NotEmpty(t, userData.Password)
	require.NotEqual(t, "mysecretpassword", userData.Password)

}

func Test_UserHashPassword_WithEmptyPassword(t *testing.T) {
	t.Parallel()

	//setup
	userData := models.User{
		ModelBase: models.ModelBase{},
		FullName:  "John Doe",
		Username:  "john.doe@example.com",
	}

	//test
	err := userData.HashPassword("")

	//require
	require.Error(t, err)
}

func Test_UserCheckPassword(t *testing.T) {
	t.Parallel()

	//setup
	userData := models.User{
		ModelBase: models.ModelBase{},
		FullName:  "John Doe",
		Username:  "john.doe@example.com",
		Password:  "$2a$14$qWf/kcNoRIKvHHmzfoTVK.MaqwNxsMsxDq5U9I2jZKHWLHxkQ8rSq",
	}

	//test
	err := userData.CheckPassword("mysecretpassword")

	//require
	require.NoError(t, err)
}

func Test_UserCheckPassword_WithIncorrectPassword(t *testing.T) {
	t.Parallel()

	//setup
	userData := models.User{
		ModelBase: models.ModelBase{},
		FullName:  "John Doe",
		Username:  "john.doe@example.com",
		Password:  "$2a$14$qWf/kcNoRIKvHHmzfoTVK.MaqwNxsMsxDq5U9I2jZKHWLHxkQ8rSq",
	}

	//test
	err := userData.CheckPassword("wrongpassword")

	//require
	require.Error(t, err)
}
