import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortDomain'
})
export class ShortDomainPipe implements PipeTransform {

  transform(url: string, args?: any): any {
    if(!url){
      return url
    }

    //check if protocol is included
    if (!(url.indexOf('://') > -1)) {
      return url.split('/')[0].split('?')[0];
    } else {
      try {
        return (new URL(url).hostname) || url;
      } catch (e) {
        console.log("error parsing url", url, e)
        return url
      }
    }

  }
}
