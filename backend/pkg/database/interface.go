package database

import (
	"context"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
)

type DatabaseRepository interface {
	Close() error
	GetCurrentUser() models.User

	CreateProviderCredentials(ctx context.Context, providerCreds *models.ProviderCredential) error
	GetProviderCredentials(ctx context.Context) ([]models.ProviderCredential, error)
}
