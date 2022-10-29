import {Source} from '../models/database/source';
import {ResourceFhir} from '../models/database/resource_fhir';
import {SourceSummary} from '../models/fasten/source-summary';
import {Summary} from '../models/fasten/summary';
import {User} from '../models/fasten/user';
import {UpsertSummary} from '../models/fasten/upsert-summary';
// import {SourceSummary} from '../../app/models/fasten/source-summary';

export interface IDatabaseDocument {
  _id?: string
  _rev?: string
  doc_type: string
  updated_at?: string

  populateId(): void
  base64Id(): string
}

export interface IDatabasePaginatedResponse {
  offset: number,
  total_rows: number,
  rows: any[]
}
export interface IDatabaseRepository {
  GetDB(skipEncryption?: boolean): any
  Close(): void

  // CreateUser(*models.User) error
  // GetUserByEmail(context.Context, string) (*models.User, error)
  // GetCurrentUser(context.Context) *models.User

  UpsertSource(source: Source): Promise<UpsertSummary>
  GetSource(source_id: string): Promise<Source>
  DeleteSource(source_id: string): Promise<boolean>
  GetSourceSummary(source_id: string): Promise<SourceSummary>
  GetSources(): Promise<IDatabasePaginatedResponse>
  IsDatabasePopulated(): Promise<boolean>

  // UpsertResource(context.Context, *models.ResourceFhir) error
  // GetResourceBySourceType(context.Context, string, string) (*models.ResourceFhir, error)
  // GetResourceBySourceId(context.Context, string, string) (*models.ResourceFhir, error)
  // ListResources(context.Context, models.ListResourceQueryOptions) ([]models.ResourceFhir, error)
  // GetPatientForSources(ctx context.Context) ([]models.ResourceFhir, error)
  UpsertResource(resource: ResourceFhir): Promise<UpsertSummary>
  UpsertResources(resources: ResourceFhir[]): Promise<UpsertSummary>
  GetResource(resource_id: string): Promise<ResourceFhir>
  GetResources(): Promise<IDatabasePaginatedResponse>
  GetResourcesForSource(source_id: string, source_resource_type?: string): Promise<IDatabasePaginatedResponse>

  GetEndpointAbsolutePath(currentUrl: {pathname: string, protocol: string, host: string}, relativePath: string): string
}
