import { Directive, Injectable, Input, OnInit } from "@angular/core";

import { PreferenceService } from "./preference.service";
import { Preference } from "./preference.model";

import * as cloneDeep_ from 'lodash/cloneDeep';

@Injectable()
@Directive({
  selector: "[display-preference]",
  exportAs: "display-preference"
})
export class DisplayPreferenceDirective implements OnInit {
  private pending: boolean = false;
  public cloneDeep = cloneDeep_;
  @Input("display-preference") private displayPreference: string;

  @Input("display-preference-unit-type") private unitType: string;

  @Input("display-masterTextKey") private displayMasterTextKey: string; // masterKeyText used to translate the label next to the drop list (select)

  @Input("display-preference-module-group-id") private moduleGroupId: number;

  constructor(private preferenceService: PreferenceService) { }

  get preference(): Preference {
    if (!!this.displayPreference === false) {
      return null;
    }

    const sizingUnitPreference =
      this.preferenceService.sizingUnitPreferences.find(su => su.preference.name === this.displayPreference);

    return !!sizingUnitPreference ? sizingUnitPreference.preference : null;
  }

  ngOnInit() {

    console.log('initializing display directive for ' + this.displayPreference)

    const sizingUnitPreference =
      this.preferenceService.sizingUnitPreferences.find(su => su.preference.name === this.displayPreference && su.moduleGroupId === this.moduleGroupId);

      if (!sizingUnitPreference){

    console.log("unit preference does not exist so adding it");
    // Clone the object so that it does not interfere with the original preferences.
    const preference = this.cloneDeep(this.preference || this.preferenceService.allPreferences.find(prefs => prefs.name === this.displayPreference));

    ;

    if (!!preference && preference.isUnit && !!this.unitType === false) {
      console.error(`The preference '${this.displayPreference}' is a unit, but no 'display-preference-unit-type' parameter was provided.`);
    }

    // Add the preference name and unit type to the preference service, so that it can be used later (e.g. the unit modal component).
    this.preferenceService.addSizingUnitPreference(preference, this.unitType, this.displayMasterTextKey, this.moduleGroupId);
  }
}
}
