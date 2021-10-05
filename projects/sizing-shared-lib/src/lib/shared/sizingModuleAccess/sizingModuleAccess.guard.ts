import { Injectable } from '@angular/core';
import { Router, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { SizingModuleAccessService } from './sizingModuleAccess.service';
import { RoutesService } from "../../modules/routes.service";
import { AuthenticationService } from "../../core/authentication/authentication.service";

import { Observable } from "rxjs/Rx";

import swal from 'sweetalert'

/**
 * An authentication guard that decides if a child route can be activated.
 */
@Injectable()
export class SizingModuleAccessGuard implements CanActivateChild {

  constructor(private router: Router,
    private sizingModuleAccess: SizingModuleAccessService,
    private routesService: RoutesService,
    private authenticationService: AuthenticationService) {
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    var moduleName = route.data["moduleName"];

    return this.sizingModuleAccess.checkModuleAccess(moduleName).map(result => {
      let returnVal: boolean = result;

      if (returnVal === false) {
        console.warn(`Unauthorised access to: ${moduleName}`);
        const unauthorisedAlertPromise = swal("Unauthorised", "You are not authorised to access this module.", "error").then(() => {
          // Remove the unresolved promise
          this.routesService.removeUnresolvedPromise();

          //  redirect to login page with the return url and return false
          this.router.navigate(['/home'], { queryParams: { returnUrl: '/home' } }); // not  { returnUrl: state.url } as it will be forbiden after next user login     

        });

        // Register the alert promise
        this.routesService.registerUnresolvedPromise(unauthorisedAlertPromise);
      }

      return returnVal;
    }).catch((error: Response) => {
      return Observable.of(false);
    });
  }
}
