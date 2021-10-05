import { Pipe, PipeTransform } from '@angular/core';

import { PreferenceService } from "./preference.service";

@Pipe({
  name: 'preferenceDecimal',
  pure: false
})
export class PreferenceDecimalPipe implements PipeTransform {

  constructor(private preferenceService: PreferenceService) { }

  /**
   * Transforms the provided value and rounds it to the decimal places based
   * on the preference provided by the preferenceName parameter.
   * @param value
   * @param preferenceName
   */
  transform(value: any, preferenceName: string): any {

    if (!value) {
      return value;
    }

    const preference = this.preferenceService.allPreferences.find(p => p.name === preferenceName);

    const roundedValue = Math.round(value * Math.pow(10, preference.decimalPlaces)) / Math.pow(10, preference.decimalPlaces);

    return roundedValue;
  }
}
