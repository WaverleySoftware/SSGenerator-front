import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot } from "@angular/router";

import { PreferenceService } from "./preference.service";
import { Preference } from "./preference.model";

/**
 * Resolves the route to include any user preferences.
 */
@Injectable()
export class PreferenceResolver implements Resolve<Preference[]> {
  constructor(private preferenceService: PreferenceService) { console.info("Instantiating preference resolver..."); }

  resolve(route: ActivatedRouteSnapshot) {
    // Get all preferences for the user.
    console.info(`Resolving preferences...`);

    return this.preferenceService.getAllPreferences();
  }
}
