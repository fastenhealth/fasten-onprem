package models

type RequestHealthSystem struct {
	Email         string `json:"email"`
	Name          string `json:"name"`
	Website       string `json:"website"`
	StreetAddress string `json:"street_address"`
}
