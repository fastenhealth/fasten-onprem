package models

import (
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/jwk"
	sourcesPkg "github.com/fastenhealth/fasten-sources/pkg"
	"github.com/google/uuid"
	"github.com/lestrrat-go/jwx/v2/jwa"
	"github.com/lestrrat-go/jwx/v2/jwt"
	"io"
	"log"
	"net/http"
	"net/url"
	"time"
)

// SourceCredential Data/Medical Provider Credentials
// similar to LighthouseSourceDefinition from fasten-source
type SourceCredential struct {
	ModelBase
	User       *User                 `json:"user,omitempty"`
	UserID     uuid.UUID             `json:"user_id" gorm:"uniqueIndex:idx_user_source_patient"`
	SourceType sourcesPkg.SourceType `json:"source_type" gorm:"uniqueIndex:idx_user_source_patient"`
	Patient    string                `json:"patient" gorm:"uniqueIndex:idx_user_source_patient"`

	LatestBackgroundJob   *BackgroundJob `json:"latest_background_job,omitempty"`
	LatestBackgroundJobID *uuid.UUID     `json:"-"`

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

	Confidential                  bool   `json:"confidential"`                     //if enabled, requires client_secret to authenticate with provider (PKCE)
	DynamicClientRegistrationMode string `json:"dynamic_client_registration_mode"` //if enabled, will dynamically register client with provider (https://oauth.net/2/dynamic-client-registration/)
	CORSRelayRequired             bool   `json:"cors_relay_required"`              //if true, requires CORS proxy/relay, as provider does not return proper response to CORS preflight
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

func (s *SourceCredential) GetSourceType() sourcesPkg.SourceType {
	return s.SourceType
}

func (s *SourceCredential) GetClientId() string {
	return s.ClientId
}

func (s *SourceCredential) GetPatientId() string {
	return s.Patient
}

func (s *SourceCredential) GetOauthAuthorizationEndpoint() string {
	return s.AuthorizationEndpoint
}

func (s *SourceCredential) GetOauthTokenEndpoint() string {
	return s.TokenEndpoint
}

func (s *SourceCredential) GetApiEndpointBaseUrl() string {
	return s.ApiEndpointBaseUrl
}

func (s *SourceCredential) GetRefreshToken() string {
	return s.RefreshToken
}

func (s *SourceCredential) GetAccessToken() string {
	return s.AccessToken
}

func (s *SourceCredential) GetExpiresAt() int64 {
	return s.ExpiresAt
}

func (s *SourceCredential) SetTokens(accessToken string, refreshToken string, expiresAt int64) {
	if expiresAt > 0 && expiresAt != s.ExpiresAt {
		s.ExpiresAt = expiresAt
	}

	if accessToken != s.AccessToken {
		// update the "source" credential with new data (which will need to be sent
		s.AccessToken = accessToken
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

// IsDynamicClient this method is used to check if this source uses dynamic client registration (used to customize token refresh logic)
func (s *SourceCredential) IsDynamicClient() bool {
	return len(s.DynamicClientRegistrationMode) > 0
}

// this will set/update the AccessToken and Expiry using the dynamic client credentials
func (s *SourceCredential) RefreshDynamicClientAccessToken() error {
	if len(s.DynamicClientRegistrationMode) == 0 {
		return fmt.Errorf("dynamic client registration mode not set")
	}
	if len(s.DynamicClientJWKS) == 0 {
		return fmt.Errorf("dynamic client jwks not set")
	}
	if len(s.DynamicClientId) == 0 {
		return fmt.Errorf("dynamic client id not set")
	}

	//convert the serialized dynamic-client credentials to a jwx.Key
	jwkeypair, err := jwk.JWKDeserialize(s.DynamicClientJWKS[0])
	if err != nil {
		return err
	}

	// see https://github.com/lestrrat-go/jwx/tree/v2/jwt#token-usage
	t := jwt.New()
	t.Set("kid", jwkeypair.KeyID())
	t.Set(jwt.SubjectKey, s.DynamicClientId)
	t.Set(jwt.AudienceKey, s.TokenEndpoint)
	t.Set(jwt.JwtIDKey, uuid.New().String())
	t.Set(jwt.ExpirationKey, time.Now().Add(time.Minute*2).Unix()) // must be less than 5 minutes from now. Time when this JWT expires
	t.Set(jwt.IssuedAtKey, time.Now().Unix())
	t.Set(jwt.IssuerKey, s.DynamicClientId)

	//sign the jwt with the private key
	// Signing a token (using raw rsa.PrivateKey)
	signed, err := jwt.Sign(t, jwt.WithKey(jwa.RS256, jwkeypair))
	if err != nil {
		return fmt.Errorf("failed to sign dynamic-client jwt: %s", err)
	}

	//send this signed jwt to the token endpoint to get a new access token
	// https://fhir.epic.com/Documentation?docId=oauth2&section=JWKS

	postForm := url.Values{
		"grant_type": {"urn:ietf:params:oauth:grant-type:jwt-bearer"},
		"assertion":  {string(signed)},
		"client_id":  {s.DynamicClientId},
	}

	tokenResp, err := http.PostForm(s.TokenEndpoint, postForm)

	if err != nil {
		return fmt.Errorf("an error occurred while sending dynamic client token request, %s", err)
	}

	defer tokenResp.Body.Close()
	if tokenResp.StatusCode >= 300 || tokenResp.StatusCode < 200 {

		b, err := io.ReadAll(tokenResp.Body)
		if err == nil {
			log.Printf("Error Response body: %s", string(b))
		}

		return fmt.Errorf("an error occurred while reading dynamic client token response, status code was not 200: %d", tokenResp.StatusCode)
	}

	var registrationTokenResponseBytes ClientRegistrationTokenResponse
	err = json.NewDecoder(tokenResp.Body).Decode(&registrationTokenResponseBytes)
	if err != nil {
		return fmt.Errorf("an error occurred while parsing dynamic client token response: %v", err)
	}

	//update the source credential with the new access token
	s.AccessToken = registrationTokenResponseBytes.AccessToken
	s.ExpiresAt = time.Now().Add(time.Second * time.Duration(registrationTokenResponseBytes.ExpiresIn)).Unix()

	return nil
}
