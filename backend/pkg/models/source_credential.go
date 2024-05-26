package models

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/jwk"
	sourcesDefinitions "github.com/fastenhealth/fasten-sources/definitions"
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
	User       *User     `json:"user,omitempty"`
	UserID     uuid.UUID `json:"user_id" gorm:"uniqueIndex:idx_user_source_patient"`
	Patient    string    `json:"patient" gorm:"uniqueIndex:idx_user_source_patient"`
	EndpointID uuid.UUID `json:"endpoint_id" gorm:"uniqueIndex:idx_user_source_patient"`

	//New Fields
	Display           string                             `json:"display"`
	LighthouseEnvType sourcesPkg.FastenLighthouseEnvType `json:"lighthouse_env_type"`
	BrandID           uuid.UUID                          `json:"brand_id"`
	PortalID          uuid.UUID                          `json:"portal_id"`
	PlatformType      sourcesPkg.PlatformType            `json:"platform_type"`

	LatestBackgroundJob   *BackgroundJob `json:"latest_background_job,omitempty"`
	LatestBackgroundJobID *uuid.UUID     `json:"-"`

	// auth/credential data
	ClientId      string `json:"client_id"`
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

func (s *SourceCredential) GetSourceId() string {
	return s.ID.String()
}

func (s *SourceCredential) GetEndpointId() string {
	return s.EndpointID.String()
}

func (s *SourceCredential) GetPortalId() string {
	return s.PortalID.String()
}

func (s *SourceCredential) GetBrandId() string {
	return s.BrandID.String()
}

func (s *SourceCredential) GetPlatformType() sourcesPkg.PlatformType {
	return s.PlatformType
}

func (s *SourceCredential) GetClientId() string {
	return s.ClientId
}

func (s *SourceCredential) GetPatientId() string {
	return s.Patient
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

	endpoint, err := sourcesDefinitions.GetSourceDefinition(sourcesDefinitions.GetSourceConfigOptions{
		EndpointId: s.EndpointID.String(),
	})
	if err != nil || endpoint == nil {
		return false
	}
	return len(endpoint.DynamicClientRegistrationMode) > 0
}

// This method will generate a new keypair, register a new dynamic client with the provider
// it will set the following fields:
// - DynamicClientJWKS
// - DynamicClientId
func (s *SourceCredential) RegisterDynamicClient() error {

	endpoint, err := sourcesDefinitions.GetSourceDefinition(sourcesDefinitions.GetSourceConfigOptions{
		EndpointId: s.EndpointID.String(),
	})
	if err != nil {
		return fmt.Errorf("an error occurred while retrieving source definition: %w", err)
	} else if endpoint == nil {
		return fmt.Errorf("endpoint definition not found")
	} else if endpoint.RegistrationEndpoint == "" {
		return fmt.Errorf("registration endpoint not found")
	}

	//this source requires dynamic client registration
	// see https://fhir.epic.com/Documentation?docId=Oauth2&section=Standalone-Oauth2-OfflineAccess-0

	// Generate a public-private key pair
	// Must be 2048 bits (larger keys will silently fail when used with Epic, untested on other providers)
	sourceSpecificClientKeyPair, err := jwk.JWKGenerate()
	if err != nil {
		return fmt.Errorf("an error occurred while generating device-specific keypair for dynamic client: %w", err)
	}

	//store in sourceCredential
	serializedKeypair, err := jwk.JWKSerialize(sourceSpecificClientKeyPair)
	if err != nil {
		return fmt.Errorf("an error occurred while serializing keypair for dynamic client: %w", err)
	}
	s.DynamicClientJWKS = []map[string]string{
		serializedKeypair,
	}

	//generate dynamic client registration request
	payload := ClientRegistrationRequest{
		SoftwareId: s.ClientId,
		Jwks: ClientRegistrationRequestJwks{
			Keys: []ClientRegistrationRequestJwksKey{
				{
					KeyType:        "RSA",
					KeyId:          serializedKeypair["kid"],
					Modulus:        serializedKeypair["n"],
					PublicExponent: serializedKeypair["e"],
				},
			},
		},
	}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("an error occurred while marshalling dynamic client registration request: %w", err)
	}

	//http.Post("https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token", "application/x-www-form-urlencoded", bytes.NewBuffer([]byte(fmt.Sprintf("grant_type=client_credentials&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion=%s&scope=system/Patient.read", sourceSpecificClientKeyPair))))
	req, err := http.NewRequest(http.MethodPost, endpoint.RegistrationEndpoint, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return fmt.Errorf("an error occurred while generating dynamic client registration request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.AccessToken))

	registrationResponse, err := http.DefaultClient.Do(req)

	if err != nil {
		return fmt.Errorf("an error occurred while sending dynamic client registration request: %w", err)
	}
	defer registrationResponse.Body.Close()
	if registrationResponse.StatusCode >= 300 || registrationResponse.StatusCode < 200 {
		b, err := io.ReadAll(registrationResponse.Body)
		if err == nil {
			log.Printf("Error Response body: %s", string(b))
		}
		return fmt.Errorf("this institution may not support dynamic client registration, meaning that we cannot automatically fetch your records. Please contact support@fastenhealth.com and we'll modify this provider to use our Legacy integration: %d", registrationResponse.StatusCode)

	}

	//read response
	var registrationResponseBytes ClientRegistrationResponse
	err = json.NewDecoder(registrationResponse.Body).Decode(&registrationResponseBytes)
	if err != nil {
		return fmt.Errorf("an error occurred while parsing dynamic client registration response: %w", err)
	}

	//store the dynamic client id
	s.DynamicClientId = registrationResponseBytes.ClientId
	return nil
}

// this will set/update the AccessToken and Expiry using the dynamic client credentials
// it will set the following fields:
// - AccessToken
// - ExpiresAt
func (s *SourceCredential) RefreshDynamicClientAccessToken() error {
	endpoint, err := sourcesDefinitions.GetSourceDefinition(sourcesDefinitions.GetSourceConfigOptions{
		EndpointId: s.EndpointID.String(),
	})
	if err != nil {
		return fmt.Errorf("an error occurred while retrieving source definition: %w", err)
	}

	if len(endpoint.DynamicClientRegistrationMode) == 0 {
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
	t.Set(jwt.AudienceKey, endpoint.TokenEndpoint)
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

	tokenResp, err := http.PostForm(endpoint.TokenEndpoint, postForm)

	if err != nil {
		return fmt.Errorf("an error occurred while sending dynamic client token request, %s", err)
	}

	//dump, err := httputil.DumpResponse(tokenResp, true)
	//if err != nil {
	//	return fmt.Errorf("an error occurred while introspecting response")
	//}
	//fmt.Printf("%q", dump)
	//
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
