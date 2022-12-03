package auth

import "github.com/golang-jwt/jwt/v4"

type UserRegisteredClaims struct {
	FullName string `json:"full_name"`
	UserId   string `json:"user_id"`
	jwt.RegisteredClaims
}
