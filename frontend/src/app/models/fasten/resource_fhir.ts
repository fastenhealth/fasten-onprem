export class ResourceFhir {
  user_id?: string
  source_id: string = ""
  source_resource_type: string = ""
  source_resource_id: string = ""

  fhir_version: string = ""
  resource_raw: IResourceRaw
  related_resources?: ResourceFhir[] = []

  constructor(object?: any) {
    return Object.assign(this, object)
  }
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
