package auth

type UserMetadata struct {
	FullName string `json:"full_name"`
	Picture  string `json:"picture"`
	Email    string `json:"email"`
}
