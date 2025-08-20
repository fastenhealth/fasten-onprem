package auth

import "github.com/golang-jwt/jwt/v4"

type UserRegisteredClaims struct {
	UserMetadata
	jwt.RegisteredClaims

	// Optional fields for access tokens
	TokenID   string `json:"token_id,omitempty"`
	UserAgent string `json:"user_agent,omitempty"`
	TokenType string `json:"token_type,omitempty"`
}
