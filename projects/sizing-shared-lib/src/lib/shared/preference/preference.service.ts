import { Injectable, Predicate } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Preference } from "./preference.model";
import { SizingUnitPreference } from "./sizing-unit-preference.model";

import { Observable, Subject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

@Injectable({
  providedIn:'root'
})
export class PreferenceService {
  // Exposed field and private subject for when preferences change.
  allPreferences: Preference[] = null;
  private allPreferencesChange: Subject<Preference[]> = new Subject<Preference[]>();

  // Exposed field and private subject for when a new preference and unit type
  // is added for unit selection during a sizing process.
  sizingUnitPreferences: SizingUnitPreference[] = [];
  private sizingUnitPreferenceChange: Subject<SizingUnitPreference> = new Subject<SizingUnitPreference>();

  constructor(private http: HttpClient) {
    // Create a subscriber for when preferences change.
    console.log('prefernce service created..')
    this.allPreferencesChange.subscribe((preferences: Preference[]) => {
      this.allPreferences = preferences;
      console.log("all Preferences changed -" + this.allPreferences);
    });

    // Create a subscriber for when a new sizing unit preference is added.
    this.sizingUnitPreferenceChange.subscribe((sizingUnitPreference: SizingUnitPreference) => {
      // Reset sizing preferences for new modules.
      if (this.sizingUnitPreferences.filter(p => p.moduleGroupId != sizingUnitPreference.moduleGroupId).length > 0) {
        this.sizingUnitPreferences = [];
        console.log("Reset units preference because there exists some non module group preferences")
      }

      // Check if the preference is already added
      const sizingPref = this.sizingUnitPreferences.find(s => !!s && s.preference.name === sizingUnitPreference.preference.name &&
        s.unitType === sizingUnitPreference.unitType);

      // Remove if it exists
      if (!!sizingPref) {
        const index = this.sizingUnitPreferences.indexOf(sizingPref);

        if (index > -1) {
          this.sizingUnitPreferences.splice(index, 1);
        }
      }

      // Add the new preference
      this.sizingUnitPreferences.push(sizingUnitPreference);
      console.log("New preference added " + sizingUnitPreference.unitType);
    });
  }

  clearUnitPreferences(){
    this.sizingUnitPreferences = [];
  }

  /**
 * Gets all operating company specific preferences.
 */
  getOperatingCompanyPreferences(): Observable<Array<Preference>> {
    return this.http.get<Array<Preference>>(`./Api/Admin/GetOperatingCompanyPreferences`);
  }

  /**
 * Gets all user specific preferences.
 */
  getUserPreferences(): Observable<Array<Preference>> {
    return this.http.get<Array<Preference>>(`./Api/Admin/GetUserPreferences`);
  }

  /**
   * Manages the specified preferences for the operating company Id assigned to the current user.
   * @param preferences The array of preferences.
   */
  manageOperatingCompanyPreferences(preferences: Preference[]): Observable<boolean> {
    return this.http.post<boolean>(`./Api/Admin/ManageOperatingCompanyPreferences`,  preferences);
  }

  /**
   * Manages the specified preferences for the current user.
   * @param preferences The array of preferences.
   */
  manageUserPreferences(preferences: Preference[]): Observable<boolean> {
    return this.http.post<boolean>(`./Api/Admin/ManageUserPreferences`, preferences );
  }

  /**
   * Gets all preferences for the current user.
   */
  getAllPreferences(): Observable<Array<Preference>> {
    return this.http.get<Array<Preference>>(`./Api/Admin/GetAllPreferences`).map((preferences: Preference[]) => {

      // Publish the next set of changes to the subject.
      this.allPreferencesChange.next(preferences);

      return preferences;
    });
  }

  /**
   * Inspects the specified preference and returns a rationalised object if no match was found.
   * @param preferences
   * @param prefName
   */
  rationalisePreferenceObjectByName(preferences: Preference[], prefName: string, prefLabel?: string): Preference {
    let specifiedPreference: Preference;

    if (!!preferences) {
      specifiedPreference = preferences.find(o => o.name === prefName);


      // Return only if a valid preference is found
      if (!!specifiedPreference) {
        return specifiedPreference;
      }
    }

    // Return a new preference, with default values.
    specifiedPreference = new Preference();
    specifiedPreference.name = prefName;
    specifiedPreference.label = prefLabel;
    specifiedPreference.decimalPlaces = 0;
    specifiedPreference.value = null;

    return specifiedPreference;
  }

  /**
   * Adds the specified preference name and unit type to a subject so that it can be interrogated later.
   * @param preference The preference.
   * @param unitType The unit type.
   */
  addSizingUnitPreference(preference: Preference, unitType: string, masterTextKey: string, moduleGroupId: number) {
    const sizingUnitPreference = new SizingUnitPreference();

    sizingUnitPreference.preference = preference;
    sizingUnitPreference.unitType = unitType;
    sizingUnitPreference.masterTextKey = masterTextKey;

    sizingUnitPreference.moduleGroupId = moduleGroupId;

    this.sizingUnitPreferenceChange.next(sizingUnitPreference);
    console.log("addingSizingPreference " + this.sizingUnitPreferences);
  }

  /*
   * Gets the preference details by pref name.
   */
  getUserPreferenceByName(preferenceName: string): Preference {
    if (this.allPreferences == null) {
      return null;
    }

    let specifiedPreference = this.allPreferences.find(o => o.name === preferenceName);

    return specifiedPreference;
  }
}
