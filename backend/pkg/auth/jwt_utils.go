package auth

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/golang-jwt/jwt/v4"
)

// generateToken is a helper to generate JWT tokens with flexible claims
func generateToken(user models.User, issuerSigningKey string, expiresAt time.Time, tokenID, tokenType string) (string, error) {
	if len(strings.TrimSpace(issuerSigningKey)) == 0 {
		return "", fmt.Errorf("issuer signing key cannot be empty")
	}
	claims := UserRegisteredClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "docker-fastenhealth",
			Subject:   user.Username,
			ID:        tokenID,
		},
		UserMetadata: UserMetadata{
			FullName: user.FullName,
			Email:    user.Email,
			Role:     user.Role,
		},
		TokenType: tokenType,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(issuerSigningKey))
}

// JwtGenerateFastenTokenFromUser generates a standard user token
func JwtGenerateFastenTokenFromUser(user models.User, issuerSigningKey string) (string, error) {
	return generateToken(user, issuerSigningKey, time.Now().Add(1*time.Hour), "", "")
}

func JwtValidateFastenToken(encryptionKey string, signedToken string) (*UserRegisteredClaims, error) {
	token, err := jwt.ParseWithClaims(
		signedToken,
		&UserRegisteredClaims{},
		func(token *jwt.Token) (interface{}, error) {
			if jwt.SigningMethodHS256 != token.Method {
				return nil, fmt.Errorf("invalid signing algorithm: %s", token.Method)
			}
			return []byte(encryptionKey), nil
		},
	)
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*UserRegisteredClaims)
	if !ok {
		err = errors.New("couldn't parse claims")
		return nil, err
	}
	if claims.ExpiresAt.Unix() < time.Now().Local().Unix() {
		err = errors.New("token expired")
		return nil, err
	}
	return claims, nil
}

// JwtGenerateAccessToken generates an access token with custom expiration and metadata
func JwtGenerateAccessToken(user models.User, issuerSigningKey string, expiresAt time.Time, tokenID string) (string, error) {
	return generateToken(user, issuerSigningKey, expiresAt, tokenID, "access")
}
