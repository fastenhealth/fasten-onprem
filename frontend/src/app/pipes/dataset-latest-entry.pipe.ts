import { Pipe, PipeTransform } from '@angular/core';
import {ChartDataset} from 'chart.js';
import * as _ from 'lodash';

@Pipe({
  name: 'datasetLatestEntry'
})
export class DatasetLatestEntryPipe implements PipeTransform {

  transform(dataset: ChartDataset<'line'>, round?: number, valLookupKey?: string,  unitLookupKey?: string): string {
    if(!dataset) {
      return '--'
    }

    try{
      if (!round) {
        round = 0 //round to nearest whole number
      }
      let lastItem = dataset?.data?.[dataset?.data?.length - 1] || ''
      // let valueKey = this.chartOptions?.parsing?.['yAxisKey'] || dataset?.parsing?.['key']
      let lastItemUnit = ""
      let lastItemValue

      if (Array.isArray(lastItem)) {
        lastItemValue = _.flatten(lastItem?.[0]?.[valLookupKey])?.[0] as string
        lastItemUnit = _.flatten(lastItem?.[0]?.[unitLookupKey])?.[0] as string
      } else if (typeof lastItem === 'object') {
        lastItemValue = lastItem?.[valLookupKey]
        lastItemUnit = lastItem?.[unitLookupKey]
      } else {
        //do nothing
      }

      lastItemValue = this.roundToDecimalPlaces(lastItemValue, round)
      if (lastItemUnit) {
        return lastItemValue + ' ' + lastItemUnit
      } else {
        return lastItemValue.toString()
      }
    }
    catch (e) {
      return '--'
    }
  }


  roundToDecimalPlaces(value: string, decimalPlaces: number): string {
    if(!value) {
      return '--'
    }
    try{
      return parseFloat(value).toFixed(decimalPlaces).toString()
    } catch (e) {
      return '--'
    }
  }

}
