package models

import "gorm.io/gorm"

type ProviderCredential struct {
	gorm.Model

	OauthEndpointBaseUrl string   `json:"oauth_endpoint_base_url"`
	ApiEndpointBaseUrl   string   `json:"api_endpoint_base_url"`
	ClientId             string   `json:"client_id"`
	RedirectUri          string   `json:"redirect_uri"`
	Scopes               []string `json:"scopes"`
	PatientId            string   `json:"patient"`
	AccessToken          string   `json:"access_token"`
	RefreshToken         string   `json:"refresh_token"`
	IdToken              string   `json:"id_token"`
	ExpiresAt            string   `json:"expires_at"`
	CodeChallenge        string   `json:"code_challenge"`
	CodeVerifier         string   `json:"code_verifier"`
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
