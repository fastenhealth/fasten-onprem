package database

import (
	"context"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
)

type DatabaseRepository interface {
	Close() error
	GetCurrentUser() models.User

	UpsertProfile(ctx context.Context, profile models.Profile) error

	CreateSource(ctx context.Context, providerCreds *models.Source) error
	GetSources(ctx context.Context) ([]models.Source, error)
}
