import { Pipe, PipeTransform } from '@angular/core';
import {evaluate} from 'fhirpath';
import {HumanNameModel} from '../../lib/models/datatypes/human-name-model';

@Pipe({
  name: 'humanName'
})
export class HumanNamePipe implements PipeTransform {



  transform(humanNameModel: HumanNameModel | HumanNameModel[], ...args: unknown[]): unknown {
    if(!humanNameModel){
      return null
    }

    let names = []

    if(Array.isArray(humanNameModel)){
      //array of values
      for(let humanName of humanNameModel){
        names.push(this.getDisplayName(humanName));
      }
    } else {
      //single value
      names.push(this.getDisplayName(humanNameModel));
    }

    return names.join(", ")
  }

  getDisplayName(humanNameModel: HumanNameModel): string {
    return humanNameModel.textName ? humanNameModel.textName : `${humanNameModel.givenName} ${humanNameModel.familyName}`.trim();
  }

}
