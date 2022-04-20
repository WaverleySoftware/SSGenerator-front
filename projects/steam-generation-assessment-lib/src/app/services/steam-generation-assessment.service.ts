import { Injectable } from "@angular/core";
import { PreferenceService } from "sizing-shared-lib";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";


@Injectable()
export class SteamGenerationAssessmentService {
  constructor(private preferenceService: PreferenceService, private _sanitizer: DomSanitizer) {}

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

  getBase64FromElem(element: Node): string {
    if (!element) { return null; }
    const imgStr = new XMLSerializer().serializeToString(element)

    return 'data:image/svg+xml;base64,' + window.btoa(imgStr);
  }
}
