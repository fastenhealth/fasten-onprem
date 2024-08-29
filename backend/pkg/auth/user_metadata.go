package auth

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
)

type UserMetadata struct {
	FullName string       `json:"full_name"`
	Picture  string       `json:"picture"`
	Email    string       `json:"email"`
	Role     pkg.UserRole `json:"role"`
}
