package _20240813222836

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
)

type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

type User struct {
	models.ModelBase
	FullName string `json:"full_name"`
	Username string `json:"username" gorm:"unique"`
	Password string `json:"password"`

	//additional optional metadata that Fasten stores with users
	Picture string `json:"picture"`
	Email   string `json:"email"`
	Role    Role   `json:"role"`
}
