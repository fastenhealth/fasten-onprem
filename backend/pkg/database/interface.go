package database

import (
	"context"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
)

//go:generate mockgen -source=interface.go -destination=mock/mock_database.go
type DatabaseRepository interface {
	Close() error

	CreateUser(context.Context, *models.User) error
	GetUserByEmail(context.Context, string) (*models.User, error)
	GetCurrentUser(context.Context) models.User

	UpsertResource(context.Context, models.ResourceFhir) error
	GetResource(context.Context, string) (*models.ResourceFhir, error)
	GetResourceBySourceId(context.Context, string, string) (*models.ResourceFhir, error)
	ListResources(context.Context, models.ListResourceQueryOptions) ([]models.ResourceFhir, error)
	//UpsertProfile(context.Context, *models.Profile) error
	//UpsertOrganziation(context.Context, *models.Organization) error

	CreateSource(context.Context, *models.Source) error
	GetSource(context.Context, string) (*models.Source, error)
	GetSources(context.Context) ([]models.Source, error)
}
