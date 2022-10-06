import {IDatabaseRepository} from '../database/interface';

export interface IClient {
  fhirVersion: string
  GetRequest(resourceSubpath: string): Promise<any>
  GetFhirVersion(): Promise<any>
  SyncAll(db: IDatabaseRepository): Promise<any>

  //Manual client ONLY functions
  SyncAllBundle(db: IDatabaseRepository, bundleFile: any): Promise<any>
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
