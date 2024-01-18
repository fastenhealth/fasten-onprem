package _20240114103850

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	sourcesPkg "github.com/fastenhealth/fasten-sources/pkg"
	"github.com/google/uuid"
)

// SourceCredential Data/Medical Provider Credentials
// similar to LighthouseSourceDefinition from fasten-source
type SourceCredential struct {
	models.ModelBase
	User       *models.User `json:"user,omitempty"`
	UserID     uuid.UUID    `json:"user_id" gorm:"uniqueIndex:idx_user_source_patient"`
	Patient    string       `json:"patient" gorm:"uniqueIndex:idx_user_source_patient"`
	EndpointID uuid.UUID    `json:"endpoint_id" gorm:"uniqueIndex:idx_user_source_patient"`

	//New Fields
	Display           string                             `json:"display"`
	LighthouseEnvType sourcesPkg.FastenLighthouseEnvType `json:"lighthouse_env_type"`
	BrandID           uuid.UUID                          `json:"brand_id"`
	PortalID          uuid.UUID                          `json:"portal_id"`
	PlatformType      sourcesPkg.PlatformType            `json:"platform_type"`

	LatestBackgroundJob   *models.BackgroundJob `json:"latest_background_job,omitempty"`
	LatestBackgroundJobID *uuid.UUID            `json:"-"`

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
