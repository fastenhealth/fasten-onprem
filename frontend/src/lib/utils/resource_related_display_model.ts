/*
  This function flattens all resources
   */
import {ResourceFhir} from '../../app/models/fasten/resource_fhir';
import {FastenDisplayModel} from '../models/fasten/fasten-display-model';
import {fhirModelFactory} from '../models/factory';
import {ResourceType} from '../models/constants';


// This function takes a ResourceFhir object, then recursively converts it, and its related resources, into FastenDisplayModel objects.
export function RecResourceRelatedDisplayModel(resource: ResourceFhir, resourcesLookup?: {[name:string]: FastenDisplayModel}): {displayModel: FastenDisplayModel, resourcesLookup: {[name:string]: FastenDisplayModel}} {
  if(!resourcesLookup){
    resourcesLookup = {}
  }
  let resourceId = GenResourceId(resource)
  let resourceDisplayModel: FastenDisplayModel = resourcesLookup[resourceId]



  //ensure display model is populated
  if(!resourceDisplayModel){
    try{
      resourceDisplayModel = fhirModelFactory(resource?.source_resource_type as ResourceType, resource)
      resourcesLookup[resourceId] = resourceDisplayModel
    }catch(e){
      console.error(e) //failed to parse a model
      return {displayModel: null, resourcesLookup}
    }

  }

  if(!resource.related_resources){
    return {displayModel: resourceDisplayModel, resourcesLookup}
  } else {
    for(let relatedResource of resource.related_resources){
      resourceDisplayModel.related_resources[relatedResource.source_resource_type] = resourceDisplayModel.related_resources[relatedResource.source_resource_type] || []

      let result = RecResourceRelatedDisplayModel(relatedResource, resourcesLookup)
      resourcesLookup = result.resourcesLookup
      if(result.displayModel){
        resourceDisplayModel.related_resources[relatedResource.source_resource_type].push(result.displayModel)
      }
    }
  }
  return {displayModel: resourceDisplayModel, resourcesLookup}
}

export function GenResourceId(relatedResource: ResourceFhir): string {
  return `/source/${relatedResource?.source_id}/resource/${relatedResource?.source_resource_type}/${relatedResource?.source_resource_id}`
}
