package _20231201122541

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
)

type User struct {
	models.ModelBase
	FullName string `json:"full_name"`
	Username string `json:"username" gorm:"unique"`
	Password string `json:"password"`

	//additional optional metadata that Fasten stores with users
	Picture string `json:"picture"`
	Email   string `json:"email"`
}
