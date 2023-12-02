import {FastenDisplayModel} from '../models/fasten/fasten-display-model';
import {Reference, Resource} from 'fhir/r4';

//this function is used to generate an id to a resource within this bundle
export function internalResourceReferenceUri(resourceId: string): string {
  return `urn:uuid:${resourceId}`
}

//this function is used to generate an id to a resource outside this bundle, but owned by the same user in another source
export function externalFastenResourceReferenceUri(sourceId: string, resourceType: string, resourceId: string): string {
  return `urn:fastenhealth-id:${sourceId}:${resourceType}/${resourceId}`
}

export function generateReferenceUriFromResourceOrReference(displayModelOrResourceOrReference: FastenDisplayModel | Resource | Reference): string {
  if((displayModelOrResourceOrReference as Reference).reference) {
    //reference from external source, eg. urn:fastenhealth-id:0000-0000-0000-0000:${source_resource_type}/${source_resource_id}
    return (displayModelOrResourceOrReference as Reference).reference
  } else if (
    (displayModelOrResourceOrReference as FastenDisplayModel).source_id &&
    (displayModelOrResourceOrReference as FastenDisplayModel).source_resource_type &&
    (displayModelOrResourceOrReference as FastenDisplayModel).source_resource_id
  ) {
    //reference from external source -- in display model format, eg.  urn:fastenhealth-id:${source_id}:${source_resource_type}/${source_resource_id}
    return `${externalFastenResourceReferenceUri(
      (displayModelOrResourceOrReference as FastenDisplayModel).source_id,
      (displayModelOrResourceOrReference as FastenDisplayModel).source_resource_type,
      (displayModelOrResourceOrReference as FastenDisplayModel).source_resource_id
    )}`

  } else if(
    (displayModelOrResourceOrReference as FastenDisplayModel).source_resource_type &&
    (displayModelOrResourceOrReference as FastenDisplayModel).source_resource_id) {
    //internal reference (within this bundle), eg. urn:uuid:${resource.id}
    return `${internalResourceReferenceUri((displayModelOrResourceOrReference as FastenDisplayModel).source_resource_id)}`
  } else if((displayModelOrResourceOrReference as Resource).id && (displayModelOrResourceOrReference as Resource).resourceType) {
    //internal reference (within this bundle), eg. urn:uuid:${resource.id}
    return `${internalResourceReferenceUri((displayModelOrResourceOrReference as Resource).id)}`
  } else {
    console.warn("Cannot determine resource id, this should not happen", displayModelOrResourceOrReference)
    throw new Error("Cannot find resource id")
  }
}

