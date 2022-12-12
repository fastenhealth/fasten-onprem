// import { Pipe, PipeTransform } from '@angular/core';
//
// @Pipe({
//   name: 'filter',
// })
// export class FilterPipe implements PipeTransform {
//   transform(items: any[], filter: Record<string, any>): any {
//     if (!items || !filter) {
//       return items;
//     }
//
//     const key = Object.keys(filter)[0];
//     const value = filter[key];
//
//     return items.filter((e) => e[key].indexOf(value) !== -1);
//   }
// }


import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], field : string, value : string): any[] {
    if (!items) return null;
    if (!value || value.length == 0) return items;
    let filtered = items.filter(it =>
      it[field].toLowerCase().indexOf(value.toLowerCase()) !=-1);

    return filtered.length > 0 ? filtered : null;
  }
}
