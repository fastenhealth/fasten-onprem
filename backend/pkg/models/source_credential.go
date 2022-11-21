package models

import (
	"github.com/fastenhealth/fasten-sources/pkg"
	"github.com/google/uuid"
)

// SourceCredential Data/Medical Provider Credentials
// similar to LighthouseSourceDefinition from fasten-source
type SourceCredential struct {
	ModelBase
	User       User           `json:"user,omitempty"`
	UserID     uuid.UUID      `json:"user_id" gorm:"uniqueIndex:idx_user_source_patient"`
	SourceType pkg.SourceType `json:"source_type" gorm:"uniqueIndex:idx_user_source_patient"`
	Patient    string         `json:"patient" gorm:"uniqueIndex:idx_user_source_patient"`

	//oauth endpoints
	AuthorizationEndpoint string `json:"authorization_endpoint"`
	TokenEndpoint         string `json:"token_endpoint"`
	IntrospectionEndpoint string `json:"introspection_endpoint"`

	Scopes                        []string `json:"scopes_supported" gorm:"type:text;serializer:json"`
	Issuer                        string   `json:"issuer"`
	GrantTypesSupported           []string `json:"grant_types_supported" gorm:"type:text;serializer:json"`
	ResponseType                  []string `json:"response_types_supported" gorm:"type:text;serializer:json"`
	ResponseModesSupported        []string `json:"response_modes_supported" gorm:"type:text;serializer:json"`
	Audience                      string   `json:"aud"` //optional - required for some providers
	CodeChallengeMethodsSupported []string `json:"code_challenge_methods_supported" gorm:"type:text;serializer:json"`

	//Fasten custom configuration
	UserInfoEndpoint   string `json:"userinfo_endpoint"`     //optional - supported by some providers, not others.
	ApiEndpointBaseUrl string `json:"api_endpoint_base_url"` //api endpoint we'll communicate with after authentication
	ClientId           string `json:"client_id"`
	RedirectUri        string `json:"redirect_uri"` //lighthouse url the provider will redirect to (registered with App)

	Confidential      bool `json:"confidential"`        //if enabled, requires client_secret to authenticate with provider (PKCE)
	CORSRelayRequired bool `json:"cors_relay_required"` //if true, requires CORS proxy/relay, as provider does not return proper response to CORS preflight
	//SecretKeyPrefix   string `json:"-"`                   //the secret key prefix to use, if empty (default) will use the sourceType value

	// auth/credential data
	AccessToken   string `json:"access_token"`
	RefreshToken  string `json:"refresh_token"`
	IdToken       string `json:"id_token"`
	ExpiresAt     int64  `json:"expires_at"`
	CodeChallenge string `json:"code_challenge"`
	CodeVerifier  string `json:"code_verifier"`
}

func (s SourceCredential) GetSourceType() pkg.SourceType {
	return s.SourceType
}

func (s SourceCredential) GetClientId() string {
	return s.ClientId
}

func (s SourceCredential) GetPatientId() string {
	return s.Patient
}

func (s SourceCredential) GetOauthAuthorizationEndpoint() string {
	return s.AuthorizationEndpoint
}

func (s SourceCredential) GetOauthTokenEndpoint() string {
	return s.TokenEndpoint
}

func (s SourceCredential) GetApiEndpointBaseUrl() string {
	return s.ApiEndpointBaseUrl
}

func (s SourceCredential) GetRefreshToken() string {
	return s.RefreshToken
}

func (s SourceCredential) GetAccessToken() string {
	return s.AccessToken
}

func (s SourceCredential) GetExpiresAt() int64 {
	return s.ExpiresAt
}

func (s SourceCredential) RefreshTokens(accessToken string, refreshToken string, expiresAt int64) {
	if accessToken != s.AccessToken {
		// update the "source" credential with new data (which will need to be sent
		s.AccessToken = accessToken
		s.ExpiresAt = expiresAt
		// Don't overwrite `RefreshToken` with an empty value
		// if this was a token refreshing request.
		if refreshToken != "" {
			s.RefreshToken = refreshToken
		}
	}
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
