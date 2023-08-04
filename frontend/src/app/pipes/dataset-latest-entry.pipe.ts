import { Pipe, PipeTransform } from '@angular/core';
import {ChartDataset} from 'chart.js';
import * as _ from 'lodash';

@Pipe({
  name: 'datasetLatestEntry'
})
export class DatasetLatestEntryPipe implements PipeTransform {

  transform(dataset: ChartDataset<'line'>, round?: number, valLookupKey?: string,  unitLookupKey?: string): string {
    if(!round){
      round = 0 //round to nearest whole number
    }
    let lastItem = dataset?.data?.[dataset?.data?.length -1] || ''
    // let valueKey = this.chartOptions?.parsing?.['yAxisKey'] || dataset?.parsing?.['key']
    console.log('latestEntryConfig', lastItem, valLookupKey, unitLookupKey, round)
    let lastItemUnit = ""
    let lastItemValue

    if(Array.isArray(lastItem)){
      lastItemValue = _.flatten(lastItem?.[0]?.[valLookupKey])?.[0] as string
      lastItemUnit = _.flatten(lastItem?.[0]?.[unitLookupKey])?.[0] as string
    } else if(typeof lastItem === 'object'){
      console.log('lastItem-object', lastItem?.[valLookupKey])
      lastItemValue = lastItem?.[valLookupKey]
      lastItemUnit = lastItem?.[unitLookupKey]
    } else {
      //do nothing
    }

    lastItemValue = this.roundToDecimalPlaces(lastItemValue, round)
    if(lastItemUnit){
      return lastItemValue + ' ' + lastItemUnit
    } else {
      return lastItemValue.toString()
    }
  }


  roundToDecimalPlaces(value: string, decimalPlaces: number): string {
    return parseFloat(value).toFixed(decimalPlaces).toString()
  }

}
