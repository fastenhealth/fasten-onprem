package models

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg"
	"github.com/google/uuid"
)

// Source Data/Medical Provider Credentials
type Source struct {
	ModelBase
	User       User           `json:"user,omitempty"`
	UserID     uuid.UUID      `json:"user_id" gorm:"uniqueIndex:idx_user_source_patient"`
	SourceType pkg.SourceType `json:"source_type" gorm:"uniqueIndex:idx_user_source_patient"`
	PatientId  string         `json:"patient_id" gorm:"uniqueIndex:idx_user_source_patient"`

	//oauth endpoints
	OauthAuthorizationEndpoint    string `json:"oauth_authorization_endpoint"`
	OauthTokenEndpoint            string `json:"oauth_token_endpoint"`
	OauthRegistrationEndpoint     string `json:"oauth_registration_endpoint"`
	OauthIntrospectionEndpoint    string `json:"oauth_introspection_endpoint"`
	OauthUserInfoEndpoint         string `json:"oauth_userinfo_endpoint"`
	OauthTokenEndpointAuthMethods string `json:"oauth_token_endpoint_auth_methods_supported"`

	ApiEndpointBaseUrl string `json:"api_endpoint_base_url"`
	ClientId           string `json:"client_id"`
	RedirectUri        string `json:"redirect_uri"`
	Scopes             string `json:"scopes"`
	AccessToken        string `json:"access_token"`
	RefreshToken       string `json:"refresh_token"`
	IdToken            string `json:"id_token"`
	ExpiresAt          int64  `json:"expires_at"`
	CodeChallenge      string `json:"code_challenge"`
	CodeVerifier       string `json:"code_verifier"`

	Confidential bool `json:"confidential"`
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
