package encryption

import (
	"crypto/rand"
	"encoding/hex"
)

// GenerateRandomToken generates a cryptographically secure random token.
func GenerateRandomToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
