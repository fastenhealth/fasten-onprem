import {FastenOptions} from './fasten-options';
import {ResourceType} from '../constants';

export class FastenDisplayModel {
  resourceType: ResourceType | undefined
  sortTitle: string | undefined
  sortDate: Date | undefined

  constructor(options?: FastenOptions) {
    if(options){
      this.sortTitle = options.sortTitle
      this.sortDate = options.sortDate
    }
  }
}
