import {FastenOptions} from './fasten-options';

export class FastenDisplayModel {
  sortTitle: string | undefined
  sortDate: Date | undefined

  constructor(options?: FastenOptions) {
    if(options){
      this.sortTitle = options.sortTitle
      this.sortDate = options.sortDate
    }
  }
}
