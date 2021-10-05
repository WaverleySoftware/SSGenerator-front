import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ModulePreference } from "./module-preference.model";
//import { SizingUnitPreference } from "./sizing-unit-preference.model";

import { Observable, Subject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import { ModulePreferenceDetails } from "./module-preference-details.model";

@Injectable()
export class ModulePreferenceService {
  // Exposed field and private subject for when preferences change.
  allModulePreferences: ModulePreference[] = null;
  private allModulePreferencesChange: Subject<ModulePreference[]> = new Subject<ModulePreference[]>();

  constructor(private http: HttpClient) {
    // Create a subscriber for when preferences change.
    this.allModulePreferencesChange.subscribe((modulePreferences: ModulePreference[]) => {
      this.allModulePreferences = modulePreferences;
    });

  }

  /**
   * Gets all Operating Company Module Preferences by Module Id.
   */
  getOperatingCompanyModulePreferences(moduleId: string): Observable<Array<ModulePreference>> {
    return this.http.get<Array<ModulePreference>>(`./Api/Admin/GetOperatingCompanyModulePreferences/${moduleId}`).map((modulePreferences: ModulePreference[]) => {

      if (modulePreferences == null) {
        return null;
      }

      // Publish the next set of changes to the subject.
      this.allModulePreferencesChange.next(modulePreferences);

      return modulePreferences;
    });
  }

  getModulePreferenceByName(preferenceName: string): ModulePreference {


    if (this.allModulePreferences == null) {
      return null;
    }

    let specifiedPreference = this.allModulePreferences.find(o => o.name === preferenceName);

    return specifiedPreference;
  }



}
