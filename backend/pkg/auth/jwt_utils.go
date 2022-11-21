package auth

import (
	"errors"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/golang-jwt/jwt/v4"
	"log"
	"time"
)

func JwtGenerateFastenTokenFromUser(user models.User, issuerSigningKey string) (string, error) {
	log.Printf("ISSUER KEY: " + issuerSigningKey)
	userClaims := UserRegisteredClaims{
		FullName: user.FullName,
		UserId:   user.ID.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			// In JWT, the expiry time is expressed as unix milliseconds
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "docker-fastenhealth",
			Subject:   user.Username,
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
				return nil, errors.New("Invalid signing algorithm")
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
