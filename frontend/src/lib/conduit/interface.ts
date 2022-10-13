import {IDatabaseRepository} from '../database/interface';
import {UpsertSummary} from '../models/fasten/upsert-summary';

export interface IClient {
  fhirVersion: string
  GetRequest(resourceSubpath: string): Promise<any>
  GetFhirVersion(): Promise<any>

  /**
   * This function attempts to retrieve a Patient Bundle and sync all resources to the database
   * @param db
   * @constructor
   */
  SyncAll(db: IDatabaseRepository): Promise<UpsertSummary>


  SyncAllByResourceName(db: IDatabaseRepository, resourceNames: string[]): Promise<UpsertSummary>

  //Manual client ONLY functions
  SyncAllFromBundleFile(db: IDatabaseRepository, bundleFile: any): Promise<UpsertSummary>
}

//This is the "raw" Fhir resource
export interface IResourceRaw {
  resourceType: string
  id?: string
  meta?: IResourceMetaRaw
}
// This is the "raw" Fhir Bundle resource
export interface IResourceBundleRaw {
  resourceType: string
  id?: string
  entry: IResourceBundleEntryRaw[]
  total?: number
  link?: IResourceBundleLinkRaw[]
  meta?: IResourceMetaRaw
}

export interface IResourceBundleLinkRaw {
  id?: string
  relation: string
  url: string
}

export interface IResourceBundleEntryRaw {
  id?: string
  fullUrl?: string
  resource: IResourceRaw
}

export interface IResourceMetaRaw {
  id?: string
  versionId?: string
  lastUpdated: string
}
