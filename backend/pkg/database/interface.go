package database

import (
	"context"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/utils/ips"
	sourcePkg "github.com/fastenhealth/fasten-sources/clients/models"
	"github.com/google/uuid"
)

//go:generate mockgen -source=interface.go -destination=mock/mock_database.go
type DatabaseRepository interface {
	Close() error
	Migrate() error

	CreateUser(context.Context, *models.User) error
	GetUserCount(context.Context) (int, error)
	GetUserByUsername(context.Context, string) (*models.User, error)
	GetCurrentUser(ctx context.Context) (*models.User, error)
	DeleteCurrentUser(ctx context.Context) error
	GetUsers(ctx context.Context) ([]models.User, error)

	//get a count of every resource type
	GetSummary(ctx context.Context) (*models.Summary, error)
	GetInternationalPatientSummaryExport(ctx context.Context) (*ips.InternationalPatientSummaryExportData, error)

	GetResourceByResourceTypeAndId(context.Context, string, string) (*models.ResourceBase, error)
	GetResourceBySourceId(context.Context, string, string) (*models.ResourceBase, error)
	QueryResources(ctx context.Context, query models.QueryResource) (interface{}, error)
	ListResources(context.Context, models.ListResourceQueryOptions) ([]models.ResourceBase, error)
	GetPatientForSources(ctx context.Context) ([]models.ResourceBase, error)
	AddResourceAssociation(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string, relatedSource *models.SourceCredential, relatedResourceType string, relatedResourceId string) error
	RemoveResourceAssociation(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string, relatedSource *models.SourceCredential, relatedResourceType string, relatedResourceId string) error
	RemoveBulkResourceAssociations(ctx context.Context, associationsToDelete []models.RelatedResource) (int64, error)
	FindResourceAssociationsByTypeAndId(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string) ([]models.RelatedResource, error)
	FindAllResourceAssociations(ctx context.Context, source *models.SourceCredential, resourceType string, resourceId string) ([]models.RelatedResource, error)
	GetFlattenedResourceGraph(ctx context.Context, graphType pkg.ResourceGraphType, options models.ResourceGraphOptions) (map[string][]*models.ResourceBase, error)
	DeleteResourceByTypeAndId(ctx context.Context, sourceResourceType string, sourceResourceId string) error
	FindPractitionerEncounters(ctx context.Context, practitionerId string) ([]models.ResourceBase, error)

	// Deprecated:This method has been deprecated. It has been replaced in favor of Fasten SourceCredential & associations
	AddResourceComposition(ctx context.Context, compositionTitle string, resources []*models.ResourceBase) error
	//UpsertProfile(context.Context, *models.Profile) error
	//UpsertOrganziation(context.Context, *models.Organization) error

	CreateSource(context.Context, *models.SourceCredential) error
	GetSource(context.Context, string) (*models.SourceCredential, error)
	GetSourceSummary(context.Context, string) (*models.SourceSummary, error)
	GetSources(context.Context) ([]models.SourceCredential, error)
	UpdateSource(ctx context.Context, sourceCreds *models.SourceCredential) error
	DeleteSource(ctx context.Context, sourceId string) (int64, error)

	CreateGlossaryEntry(ctx context.Context, glossaryEntry *models.Glossary) error
	GetGlossaryEntry(ctx context.Context, code string, codeSystem string) (*models.Glossary, error)

	//background jobs
	CreateBackgroundJob(ctx context.Context, backgroundJob *models.BackgroundJob) error
	GetBackgroundJob(ctx context.Context, backgroundJobId string) (*models.BackgroundJob, error)
	UpdateBackgroundJob(ctx context.Context, backgroundJob *models.BackgroundJob) error
	ListBackgroundJobs(ctx context.Context, queryOptions models.BackgroundJobQueryOptions) ([]models.BackgroundJob, error)

	//favorites (Address book)
	AddFavorite(ctx context.Context, userId string, sourceId string, resourceType string, resourceId string) error
	RemoveFavorite(ctx context.Context, userId string, sourceId string, resourceType string, resourceId string) error
	CheckFavoriteExists(ctx context.Context, userId string, sourceId string, resourceType string, resourceId string) (bool, error)
	GetUserFavorites(ctx context.Context, userId string, resourceType string) ([]models.Favorite, error)

	//settings
	LoadSystemSettings(ctx context.Context) (*models.SystemSettings, error)
	SaveSystemSettings(ctx context.Context, newSettings *models.SystemSettings) error
	LoadUserSettings(ctx context.Context) (*models.UserSettings, error)
	SaveUserSettings(context.Context, *models.UserSettings) error
	PopulateDefaultUserSettings(ctx context.Context, userId uuid.UUID) error

	//used by fasten-sources Clients
	BackgroundJobCheckpoint(ctx context.Context, checkpointData map[string]interface{}, errorData map[string]interface{})
	UpsertRawResource(ctx context.Context, sourceCredentials sourcePkg.SourceCredential, rawResource sourcePkg.RawResourceFhir) (bool, error)
	UpsertRawResourceAssociation(
		ctx context.Context,
		sourceId string,
		sourceResourceType string,
		sourceResourceId string,
		targetSourceId string,
		targetResourceType string,
		targetResourceId string,
	) error

	UnlinkResourceWithSharedNeighbors(ctx context.Context, resourceType string, resourceId string, relatedResourceType string, relatedResourceId string) (int64, error)

	// Access Token Management
	CreateAccessToken(ctx context.Context, accessToken *models.AccessToken) error
	GetUserAccessTokens(ctx context.Context) ([]models.AccessToken, error)
	DeleteAccessToken(ctx context.Context, tokenID string) error
	GetAccessToken(ctx context.Context, tokenID string) (*models.AccessToken, error)
	GetAccessTokenByTokenIDAndUsername(ctx context.Context, tokenID string, username string) (*models.AccessToken, error)
}
