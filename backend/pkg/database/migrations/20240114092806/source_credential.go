package _0240114092806

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/google/uuid"
)

type SourceCredential struct {
	models.ModelBase
	User       *models.User `json:"user,omitempty"`
	UserID     uuid.UUID    `json:"user_id" gorm:"uniqueIndex:idx_user_source_patient"`
	SourceType string       `json:"source_type" gorm:"uniqueIndex:idx_user_source_patient"`
	Patient    string       `json:"patient" gorm:"uniqueIndex:idx_user_source_patient"`

	//New Fields
	Display      string     `json:"display"`
	BrandID      *uuid.UUID `json:"brand_id"`
	PortalID     *uuid.UUID `json:"portal_id"`
	EndpointID   uuid.UUID  `json:"endpoint_id"`
	PlatformType string     `json:"platform_type"`

	LatestBackgroundJob   *models.BackgroundJob `json:"latest_background_job,omitempty"`
	LatestBackgroundJobID *uuid.UUID            `json:"-"`

	//oauth endpoints
	AuthorizationEndpoint string `json:"authorization_endpoint"`
	TokenEndpoint         string `json:"token_endpoint"`
	IntrospectionEndpoint string `json:"introspection_endpoint"`
	RegistrationEndpoint  string `json:"registration_endpoint"` //optional - required when Dynamic Client Registration mode is set

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

	//dynamic client auth/credential data
	DynamicClientJWKS []map[string]string `json:"dynamic_client_jwks" gorm:"type:text;serializer:json"`
	DynamicClientId   string              `json:"dynamic_client_id"`
}
