package database

import (
	"context"
	sourcePkg "github.com/fastenhealth/fasten-sources/clients/models"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
)

//go:generate mockgen -source=interface.go -destination=mock/mock_database.go
type DatabaseRepository interface {
	Close() error
	Migrate() error

	CreateUser(context.Context, *models.User) error

	GetUserByUsername(context.Context, string) (*models.User, error)
	GetCurrentUser(ctx context.Context) (*models.User, error)

	GetSummary(ctx context.Context) (*models.Summary, error)

	GetResourceBySourceType(context.Context, string, string) (*models.ResourceFhir, error)
	GetResourceBySourceId(context.Context, string, string) (*models.ResourceFhir, error)
	ListResources(context.Context, models.ListResourceQueryOptions) ([]models.ResourceFhir, error)
	GetPatientForSources(ctx context.Context) ([]models.ResourceFhir, error)
	AddResourceAssociation(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string, relatedSource *models.SourceCredential, relatedResourceType string, relatedResourceId string) error
	RemoveResourceAssociation(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string, relatedSource *models.SourceCredential, relatedResourceType string, relatedResourceId string) error
	GetFlattenedResourceGraph(ctx context.Context) ([]*models.ResourceFhir, []*models.ResourceFhir, error)
	AddResourceComposition(ctx context.Context, compositionTitle string, resources []*models.ResourceFhir) error
	//UpsertProfile(context.Context, *models.Profile) error
	//UpsertOrganziation(context.Context, *models.Organization) error

	CreateSource(context.Context, *models.SourceCredential) error
	GetSource(context.Context, string) (*models.SourceCredential, error)
	GetSourceSummary(context.Context, string) (*models.SourceSummary, error)
	GetSources(context.Context) ([]models.SourceCredential, error)

	//used by Client
	UpsertRawResource(ctx context.Context, sourceCredentials sourcePkg.SourceCredential, rawResource sourcePkg.RawResourceFhir) (bool, error)
}
