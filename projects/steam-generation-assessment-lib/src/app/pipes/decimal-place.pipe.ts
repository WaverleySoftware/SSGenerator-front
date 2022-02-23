import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalPlace'
})
export class DecimalPlacePipe implements PipeTransform {

  transform(value: any, decimalPlaces?: number): any {
    if (value && decimalPlaces !== undefined) {
      return Math.round(Number(value) * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
      /*return new Intl.NumberFormat('zh', {
        style: 'decimal',
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: decimalPlaces,
        minimumIntegerDigits: 1 }).format(Number(value));*/
    }

    return value;
  }

}
