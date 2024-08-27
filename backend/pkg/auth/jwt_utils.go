package auth

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/golang-jwt/jwt/v4"
)

// JwtGenerateFastenTokenFromUser Note: these functions are duplicated, in Fasten Cloud
// Any changes here must be replicated in that repo
func JwtGenerateFastenTokenFromUser(user models.User, issuerSigningKey string) (string, error) {
	if len(strings.TrimSpace(issuerSigningKey)) == 0 {
		return "", fmt.Errorf("issuer signing key cannot be empty")
	}
	//log.Printf("ISSUER KEY: " + issuerSigningKey)
	userClaims := UserRegisteredClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			// In JWT, the expiry time is expressed as unix milliseconds
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "docker-fastenhealth",
			Subject:   user.Username,
		},
		UserMetadata: UserMetadata{
			FullName: user.FullName,
			Email:    user.Email,
			Role:     user.Role,
		},
	}

	//FASTEN_JWT_ISSUER_KEY
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, userClaims)
	//token.Header["kid"] = "docker"
	tokenString, err := token.SignedString([]byte(issuerSigningKey))

	if err != nil {
		return "", err
	}
	return tokenString, nil
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
