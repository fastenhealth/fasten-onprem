package models

type ProviderCredential struct {
	//TODO: PRIMARY KEY should be UserId + ProviderId + PatientId

	User   User `gorm:"foreignKey:ID;references:UserId"`
	UserId int  `json:"user_id"`

	ProviderId string `json:"provider" gorm:"primaryKey"`
	PatientId  string `json:"patient" gorm:"primaryKey"`

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
