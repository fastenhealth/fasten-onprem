package models

type ClientRegistrationTokenResponse struct {
	AccessToken      string `json:"access_token"`
	TokenType        string `json:"token_type"`
	ExpiresIn        int    `json:"expires_in"`
	Scope            string `json:"scope"`
	State            string `json:"state"`
	Patient          string `json:"patient"`
	EpicDstu2Patient string `json:"__epic.dstu2.patient"`
}
