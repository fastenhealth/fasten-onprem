package models

type User struct {
	ModelBase
	Username string `json:"username" gorm:"unique"`
}
