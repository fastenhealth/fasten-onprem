package models

type User struct {
	FullName string `json:"full_name"`
	Username string `json:"username"`
	Password string `json:"password"`
}
