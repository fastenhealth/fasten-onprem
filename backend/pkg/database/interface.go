package database

import (
	"context"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
)

type DatabaseRepository interface {
	Close() error

	CreateProviderCredentials(ctx context.Context, providerCreds models.ProviderCredential) error
}
