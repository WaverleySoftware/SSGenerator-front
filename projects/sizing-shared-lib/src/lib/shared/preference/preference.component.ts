import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { UnitsService } from "../units/units.service";

import { Preference } from "./preference.model";
import { Unit } from "../units/unit.model";

@Component({
  selector: 'preference',
  exportAs: 'preference',
  templateUrl: './preference.component.html',
  styleUrls: ['./preference.component.scss'],
  providers: [{
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PreferenceComponent),
    }]
})
export class PreferenceComponent implements ControlValueAccessor {

  @Input("unit-type") unitType: string;
  @Input("unit-label") unitLabel: string;
  @Input("default-value") defaultValue: string;
  @Input("requires-decimals") requiresDecimals: boolean = false;

  /* Boilerplate directive component code */
  @Input('value') internalValue: Preference = null;
  onChange: any = () => { };
  onTouched: any = () => { };

  get preference(): Preference {

    return this.internalValue;
  }

  set preference(pref: Preference) {

    // Provide a default if nothing has been provided.
    if (!!pref && !pref.value) {
      pref.value = this.defaultValue;
    }

    if (!!pref && !pref.label) {
      pref.label = this.unitLabel;
    }

    this.internalValue = pref;

    this.onChange(this.internalValue);
    this.onTouched();
  }

  public minDecimalPlaces: number = 0;
  public maxDecimalPlaces: number = 9;

  constructor(private unitsService: UnitsService) { }

  /**
   * Gets the units that matches the specified @Input Unit Type.
   * @returns The array of units sorted by Name.
   */
  get unitCollection(): Unit[] {
    const units = this.unitsService.units.filter(us => us.unitType === this.unitType);

    return units.sort((currentUnit, nextUnit) => {
      if (currentUnit.name > nextUnit.name) {
        return 1;
      }

      if (currentUnit.name < nextUnit.name) {
        return -1;
      }

      return 0;
    });
  }

  /**
   * Registers any changes to the directive and applies the provided callback function.
   * @param fn The callback function.
   */
  registerOnChange(fn) {
    const bespokeChange = (newValue: any, changeType: string) => {
      // The prefernce is still in memory, so only apply the changed value.
      if (changeType === 'value') {
        this.preference.value = newValue;
      } else if (changeType === 'decimalPlaces') {
        this.preference.decimalPlaces = newValue;
      }

      fn(this.preference);
    };

    this.onChange = bespokeChange;
  }

  /**
   * Registers the touched event to the directive and applies the provided callback function.
   * @param fn The callback function.
   */
  registerOnTouched(fn) {
    const bespokeTouched = () => {
      fn();
    };

    this.onTouched = bespokeTouched;
  }

  /**
   * Registers a final change to the provided directive's value and provides a space to apply it.
   * @param value The directive's implicit value.
   */
  writeValue(value) {
    if (value) {
      this.preference = value;
    }
  }

  /**
   * Callback event that rationalises the number of decimal places.
   * @param decimalPlaces The number of decimal places.
   */
  changeDecimalPlaces(decimalPlaces: number): void {

    // Normalise the number in case anyone gets any ideas.
    if (decimalPlaces <= this.minDecimalPlaces) {
      decimalPlaces = this.minDecimalPlaces;
    }

    if (decimalPlaces >= this.maxDecimalPlaces) {
      decimalPlaces = this.maxDecimalPlaces;
    }

    // Do not return anything, but set the value implicitly.
    this.preference.decimalPlaces = decimalPlaces;

    // This has been changed
    //this.onChange(this.preference);
    this.onChange(this.preference.decimalPlaces, 'decimalPlaces');
  }
}
