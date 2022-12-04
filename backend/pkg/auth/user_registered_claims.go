package auth

import "github.com/golang-jwt/jwt/v4"

type UserRegisteredClaims struct {
	UserMetadata
	jwt.RegisteredClaims
}
