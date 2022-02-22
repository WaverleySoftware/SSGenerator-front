import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalPlace'
})
export class DecimalPlacePipe implements PipeTransform {

  transform(value: any, decimalPlaces?: number): any {
    if (value && decimalPlaces !== undefined) {
      return Math.round(Number(value) * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
    }

    return value;
  }

}
