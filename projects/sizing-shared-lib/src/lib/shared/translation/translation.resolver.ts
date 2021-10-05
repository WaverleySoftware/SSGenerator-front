import { Injectable } from "@angular/core";
import { Resolve, ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router, RouterStateSnapshot } from "@angular/router";

import { TranslationService } from "./translation.service";
import { DisplayGroup } from "./translation.model";
import { Observable } from "rxjs";

@Injectable()
export class TranslationResolver implements Resolve<Observable<DisplayGroup>> {

  constructor(private translationService: TranslationService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {

    console.info("Instantiating translation resolver...");
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DisplayGroup> {

    // Get the display group.
    const param = this.getDisplayGroup(route);
    return this.translationService.getTranslatedDisplayGroup(!!param ? param : null);
  }

  /**
   * Gets the display group value from the current route.
   * @param route
   */
  private getDisplayGroup(route: ActivatedRouteSnapshot): string {
    if (!!route.data && !!route.data['displayGroup']) {
      return route.data['displayGroup'];
    } else {
      for (let i = 0; i < route.children.length; i++) {
        const displayGroup = this.getDisplayGroup(route.children[i]);

        if (!!displayGroup) {
          return displayGroup;
        }
      }
    }
  }
}
