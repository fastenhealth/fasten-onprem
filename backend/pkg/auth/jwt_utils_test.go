package auth_test

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/auth"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/stretchr/testify/require"
	"testing"
)

//TODO: this is broken
func Test_JwtGenerateFastenTokenFromUser(t *testing.T) {
	t.Skip()

	//setup
	userData := models.User{
		ModelBase: models.ModelBase{},
		FullName:  "John Doe",
		Username:  "john.doe@example.com",
		Password:  "mysecretpassword",
	}
	encryptionKey := "thisismysupersecuressessionsecretlength"

	//test
	token, err := auth.JwtGenerateFastenTokenFromUser(userData, encryptionKey)

	//require
	require.NoError(t, err)
	claims, validateErr := auth.JwtValidateFastenToken(encryptionKey, token)
	require.NoError(t, validateErr)
	require.Equal(t, "John Doe", claims.FullName)
	require.Equal(t, "John Doe", claims.UserMetadata.FullName)
	require.Equal(t, "john.doe@example.com", claims.Subject)
	require.Equal(t, "john.doe@example.com", claims.Email)
}

//TODO: this is broken
func Test_JwtGenerateFastenTokenFromUser_WithEmptyEncryptionKey(t *testing.T) {
	t.Skip()

	//setup
	userData := models.User{
		ModelBase: models.ModelBase{},
		FullName:  "John Doe",
		Username:  "john.doe",
		Password:  "mysecretpassword",
	}
	encryptionKey := ""

	//test
	_, err := auth.JwtGenerateFastenTokenFromUser(userData, encryptionKey)

	//require
	require.Error(t, err)
}
