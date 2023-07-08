package models

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"strings"
)

type User struct {
	ModelBase
	FullName string `json:"full_name"`
	Username string `json:"username" gorm:"unique"`
	Password string `json:"password"`

	//additional optional metadata that Fasten stores with users
	Picture string `json:"picture"`
	Email   string `json:"email"`
	//Roles   datatypes.JSON `json:"roles"`
}

func (user *User) HashPassword(password string) error {
	if len(strings.TrimSpace(password)) == 0 {
		return fmt.Errorf("password cannot be empty")
	}
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		return err
	}
	user.Password = string(bytes)
	return nil
}
func (user *User) CheckPassword(providedPassword string) error {
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(providedPassword))
	if err != nil {
		return err
	}
	return nil
}
