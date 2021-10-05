import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot } from "@angular/router";

import { ModulePreference } from "./module-preference.model";
import { Observable } from "rxjs/internal/Observable";
import { ModulePreferenceService } from "./module-preference.service";

/**
 * Resolves the route to include any user preferences.
 */
@Injectable()
export class ModulePreferenceResolver implements Resolve<ModulePreference[]> {
  constructor(private modulePreferenceService: ModulePreferenceService) { console.info("Instantiating module preference resolver..."); }

  resolve(route: ActivatedRouteSnapshot) {
    // Get all preferences for the user.
    console.info(`Resolving preferences...`);

    // Get the moduleName.
    const param = this.getModuleId(route);
    
    var result = this.modulePreferenceService.getOperatingCompanyModulePreferences(param);
    
    return result; 
  }

  /**
   * Gets the display group value from the current route.
   * @param route
   */
  private getModuleId(route: ActivatedRouteSnapshot): string {
    if (!!route.data && !!route.data['moduleId']) {
      return route.data['moduleId'];
    } else {
      for (let i = 0; i < route.children.length; i++) {
        const moduleId = this.getModuleId(route.children[i]);

        if (!!moduleId) {
          return moduleId;
        }
      }
    }
  }
}
