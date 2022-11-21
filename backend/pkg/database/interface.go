package database

import (
	"context"
	sourcePkg "github.com/fastenhealth/fasten-sources/clients/models"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
)

//go:generate mockgen -source=interface.go -destination=mock/mock_database.go
type DatabaseRepository interface {
	Close() error

	CreateUser(context.Context, *models.User) error

	GetUserByEmail(context.Context, string) (*models.User, error)
	GetCurrentUser(context.Context) *models.User

	GetSummary(ctx context.Context) (*models.Summary, error)

	UpsertRawResource(ctx context.Context, sourceCredentials sourcePkg.SourceCredential, rawResource sourcePkg.RawResourceFhir) error
	GetResourceBySourceType(context.Context, string, string) (*models.ResourceFhir, error)
	GetResourceBySourceId(context.Context, string, string) (*models.ResourceFhir, error)
	ListResources(context.Context, models.ListResourceQueryOptions) ([]models.ResourceFhir, error)
	GetPatientForSources(ctx context.Context) ([]models.ResourceFhir, error)
	//UpsertProfile(context.Context, *models.Profile) error
	//UpsertOrganziation(context.Context, *models.Organization) error

	CreateSource(context.Context, *models.SourceCredential) error
	GetSource(context.Context, string) (*models.SourceCredential, error)
	GetSourceSummary(context.Context, string) (*models.SourceSummary, error)
	GetSources(context.Context) ([]models.SourceCredential, error)
}
