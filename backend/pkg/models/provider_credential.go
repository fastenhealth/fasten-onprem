package models

import "gorm.io/gorm"

type ProviderCredential struct {
	gorm.Model
	User       User   `json:"user,omitempty"`
	UserID     uint   `json:"user_id" gorm:"uniqueIndex:idx_user_provider_patient"`
	ProviderId string `json:"provider_id" gorm:"uniqueIndex:idx_user_provider_patient"`
	PatientId  string `json:"patient_id" gorm:"uniqueIndex:idx_user_provider_patient"`

	OauthEndpointBaseUrl string `json:"oauth_endpoint_base_url"`
	ApiEndpointBaseUrl   string `json:"api_endpoint_base_url"`
	ClientId             string `json:"client_id"`
	RedirectUri          string `json:"redirect_uri"`
	Scopes               string `json:"scopes"`
	AccessToken          string `json:"access_token"`
	RefreshToken         string `json:"refresh_token"`
	IdToken              string `json:"id_token"`
	ExpiresAt            int64  `json:"expires_at"`
	CodeChallenge        string `json:"code_challenge"`
	CodeVerifier         string `json:"code_verifier"`
}

/*
serverUrl: connectData.message.api_endpoint_base_url,
clientId: connectData.message.client_id,
redirectUri: connectData.message.redirect_uri,
tokenUri: `${connectData.message.oauth_endpoint_base_url}/token`,
scope: connectData.message.scopes.join(' '),
tokenResponse: payload,
expiresAt: getAccessTokenExpiration(payload, new BrowserAdapter()),
codeChallenge: codeChallenge,
codeVerifier: codeVerifier

*/
