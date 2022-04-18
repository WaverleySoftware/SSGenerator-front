import { Injectable } from '@angular/core';
import { PreferenceService } from "sizing-shared-lib";


@Injectable()
export class SteamGenerationAssessmentService {
  constructor(private preferenceService: PreferenceService,) {}

  getPreferenceStrUnit(preferenceName: string): string {
    const sPreference = this.preferenceService.sizingUnitPreferences
      .find(({unitType}) => unitType === preferenceName || unitType === preferenceName + 's');
    let preference  = sPreference && sPreference.preference;

    if (!preference) {
      preference = this.preferenceService.allPreferences
        .find(({name}) => name === preferenceName || name === preferenceName + 's');
    }

    return preference && preference.unitName;
  }
}
