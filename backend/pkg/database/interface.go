package database

import (
	"context"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	sourcePkg "github.com/fastenhealth/fasten-sources/clients/models"
	"github.com/google/uuid"
)

//go:generate mockgen -source=interface.go -destination=mock/mock_database.go
type DatabaseRepository interface {
	Close() error
	Migrate() error

	CreateUser(context.Context, *models.User) error

	GetUserByUsername(context.Context, string) (*models.User, error)
	GetCurrentUser(ctx context.Context) (*models.User, error)

	GetSummary(ctx context.Context) (*models.Summary, error)

	GetResourceByResourceTypeAndId(context.Context, string, string) (*models.ResourceBase, error)
	GetResourceBySourceId(context.Context, string, string) (*models.ResourceBase, error)
	QueryResources(ctx context.Context, query models.QueryResource) (interface{}, error)
	ListResources(context.Context, models.ListResourceQueryOptions) ([]models.ResourceBase, error)
	GetPatientForSources(ctx context.Context) ([]models.ResourceBase, error)
	AddResourceAssociation(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string, relatedSource *models.SourceCredential, relatedResourceType string, relatedResourceId string) error
	RemoveResourceAssociation(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string, relatedSource *models.SourceCredential, relatedResourceType string, relatedResourceId string) error
	FindResourceAssociationsByTypeAndId(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string) ([]models.RelatedResource, error)
	GetFlattenedResourceGraph(ctx context.Context, graphType pkg.ResourceGraphType, options models.ResourceGraphOptions) (map[string][]*models.ResourceBase, error)
	AddResourceComposition(ctx context.Context, compositionTitle string, resources []*models.ResourceBase) error
	//UpsertProfile(context.Context, *models.Profile) error
	//UpsertOrganziation(context.Context, *models.Organization) error

	CreateSource(context.Context, *models.SourceCredential) error
	GetSource(context.Context, string) (*models.SourceCredential, error)
	GetSourceSummary(context.Context, string) (*models.SourceSummary, error)
	GetSources(context.Context) ([]models.SourceCredential, error)
	UpdateSource(ctx context.Context, sourceCreds *models.SourceCredential) error

	CreateGlossaryEntry(ctx context.Context, glossaryEntry *models.Glossary) error
	GetGlossaryEntry(ctx context.Context, code string, codeSystem string) (*models.Glossary, error)

	//settings
	LoadUserSettings(ctx context.Context) (*models.UserSettings, error)
	SaveUserSettings(context.Context, *models.UserSettings) error
	PopulateDefaultUserSettings(ctx context.Context, userId uuid.UUID) error

	//used by fasten-sources Clients
	UpsertRawResource(ctx context.Context, sourceCredentials sourcePkg.SourceCredential, rawResource sourcePkg.RawResourceFhir) (bool, error)
}
