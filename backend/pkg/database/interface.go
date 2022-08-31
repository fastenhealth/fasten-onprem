package database

import (
	"context"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
)

type DatabaseRepository interface {
	Close() error
	GetCurrentUser() models.User

	UpsertProfile(context.Context, *models.Profile) error
	UpsertOrganziation(context.Context, *models.Organization) error

	CreateSource(context.Context, *models.Source) error
	GetSources(context.Context) ([]models.Source, error)
}
