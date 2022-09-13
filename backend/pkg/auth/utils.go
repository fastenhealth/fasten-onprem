package auth

import (
	"errors"
	"github.com/golang-jwt/jwt"
	"time"
)

//TODO: this key should be dynamically generated/taken from config file.
var jwtKey = []byte("supersecretkey")

//TODO: this should match the ID and username for the user.
type JWTClaim struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	jwt.StandardClaims
}

func GenerateJWT(username string) (tokenString string, err error) {
	expirationTime := time.Now().Add(2 * time.Hour)
	claims := &JWTClaim{
		Username: username,
		Email:    username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err = token.SignedString(jwtKey)
	return
}

func ValidateToken(signedToken string) (*JWTClaim, error) {
	token, err := jwt.ParseWithClaims(
		signedToken,
		&JWTClaim{},
		func(token *jwt.Token) (interface{}, error) {
			if jwt.SigningMethodHS256 != token.Method {
				return nil, errors.New("Invalid signing algorithm")
			}
			return []byte(jwtKey), nil
		},
	)
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*JWTClaim)
	if !ok {
		err = errors.New("couldn't parse claims")
		return nil, err
	}
	if claims.ExpiresAt < time.Now().Local().Unix() {
		err = errors.New("token expired")
		return nil, err
	}
	return claims, nil
}
