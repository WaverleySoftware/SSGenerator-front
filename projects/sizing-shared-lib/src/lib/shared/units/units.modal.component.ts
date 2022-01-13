import { Component, OnInit } from '@angular/core';

import { PreferenceService } from "../preference/preference.service";
import { UnitsService } from "./units.service";

import { Unit } from "./unit.model";
import { SizingUnitPreference } from "../preference/sizing-unit-preference.model";

import * as cloneDeep_ from 'lodash/cloneDeep';

@Component({
  selector: 'units-modal',
  templateUrl: './units.modal.component.html',
  styleUrls: ['./units.modal.component.scss']
})
export class UnitsModalComponent implements OnInit {

  public parentSubmitIsDisabled = true; // Modal parent container component submit button state (enabled/disabled)
  public cloneDeep = cloneDeep_;
  private moduleGroupId = 0;
  constructor(private preferenceService: PreferenceService, private unitsService: UnitsService) { }

  selectableUnitPreferences: SizingUnitPreference[] = [];

  ngOnInit() {

    // Get all the units
    this.unitsService.getAllUnitsByAllTypes().subscribe((units: Unit[]) => {

      // Get all the preferences eligble for changing and sort by unit type.
      const sizingUnitPreferences = this.preferenceService.sizingUnitPreferences.sort((currentUnitPreference, nextUnitPreference) => {
        this.moduleGroupId = currentUnitPreference.moduleGroupId;
        if (currentUnitPreference.unitType > nextUnitPreference.unitType) {
          return 1;
        }

        if (currentUnitPreference.unitType < nextUnitPreference.unitType) {
          return -1;
        }

        return 0;
      });

      for (let sizingUnitPreference of sizingUnitPreferences) {
        const selectableUnitPreference = new SizingUnitPreference();

        // Deep copy the object
        selectableUnitPreference.preference = this.cloneDeep(sizingUnitPreference.preference);
        selectableUnitPreference.unitType = sizingUnitPreference.unitType;
        selectableUnitPreference.masterTextKey = sizingUnitPreference.masterTextKey;
        selectableUnitPreference.moduleGroupId = this.moduleGroupId;
        selectableUnitPreference.currencies = sizingUnitPreference.currencies;

        // Get the relevant units
        selectableUnitPreference.units = sizingUnitPreference.units
          || units.filter(u => u.unitType === sizingUnitPreference.unitType);

        // Add the new item to the array.
        this.selectableUnitPreferences.push(selectableUnitPreference);
      }
    });
  }

  /**
   * Callback function that is dynamically called by a modal popup when "Save/Submit/Ok" is clicked.
   */
  modalSubmitCallback(): void {
    // This is the OK event, so commit the changes
    for (var selectedUnitPreference of this.selectableUnitPreferences) {
      // Publish the new changes.
      this.preferenceService.addSizingUnitPreference(
        selectedUnitPreference.preference,
        selectedUnitPreference.unitType,
        selectedUnitPreference.masterTextKey,
        selectedUnitPreference.moduleGroupId,
        selectedUnitPreference.units,
        selectedUnitPreference.currencies,
      );
    }
  }

  /**
 * Support this method is you require Modal Submit button state handling. ie. disable the submit button if any validation errors exist.
 */
  public checkIfSubmitIsDisabled(): boolean {
    return this.parentSubmitIsDisabled;
  }

  onChange(newValue: string, unitPreference: SizingUnitPreference) {

    const index = this.selectableUnitPreferences.indexOf(unitPreference);

    if (index > -1) {
      const matchedPreference = this.selectableUnitPreferences[index];

      // Get the new unit
      let unit;
      if (matchedPreference.currencies) {
        unit = matchedPreference.currencies.find(({currencyCode}) => currencyCode === newValue);
        matchedPreference.preference.unitName = unit.symbol;
      } else {
        unit = matchedPreference.units.find(({id}) => id === parseInt(newValue));
        matchedPreference.preference.unitName = unit.units;
      }

      // Update the object
      matchedPreference.preference.value = newValue;
      matchedPreference.preference.masterTextKey = unit.masterTextKey;

      this.selectableUnitPreferences[index] = matchedPreference;

      this.parentSubmitIsDisabled = false; // signal parent modal to enable Submit button
    }
  }
}
