import {FastenOptions} from './fasten-options';
import {ResourceType} from '../constants';

export class FastenDisplayModel {
  source_resource_type: ResourceType | undefined
  source_resource_id: string | undefined
  source_id: string | undefined
  sort_title: string | undefined
  sort_date: Date | undefined

  related_resources: {[ modelResourceType: string]: FastenDisplayModel[]} = {}

  constructor(options?: FastenOptions) {}
}
