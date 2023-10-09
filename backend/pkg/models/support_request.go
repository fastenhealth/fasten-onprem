package models

type SupportRequest struct {
	FullName       string `json:"full_name"`
	Email          string `json:"email"`
	RequestContent string `json:"request_content"`

	CurrentPage string `json:"current_page"`
	DistType    string `json:"dist_type"`
	Version     string `json:"version"`
	Flavor      string `json:"flavor"`
	Os          string `json:"os"`
	Arch        string `json:"arch"`
}
