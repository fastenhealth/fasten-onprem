package models

import (
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"time"
)

type InstallationRegistrationResponse struct {
	// InstallationID specifies client identifier string. REQUIRED
	InstallationID string `json:"installation_id"`

	// InstallationSecret specifies client secret string. OPTIONAL
	InstallationSecret string `json:"installation_secret"`

	// InstallationIDIssuedAt specifies time at which the client identifier was issued. OPTIONAL
	InstallationIDIssuedAt time.Time `json:"installation_id_issued_at"`

	VerificationStatus pkg.InstallationVerificationStatus `json:"verification_status"`
	QuotaStatus        pkg.InstallationQuotaStatus        `json:"quota_status"`

	*InstallationRegistrationRequest `json:",inline"`
}
