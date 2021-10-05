import { Injectable } from '@angular/core';
import { Router, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { SizingModuleAccessService } from '../../shared/sizingModuleAccess/sizingModuleAccess.service';
import { RoutesService } from "../../modules/routes.service";
import { AuthenticationService } from "../../core/authentication/authentication.service";

import { Observable } from "rxjs/Rx";

import swal from 'sweetalert'

@Injectable()
export class AdminSizingModuleAccessGuard implements CanActivateChild {

  constructor(private router: Router,
    private sizingModuleAccess: SizingModuleAccessService,
    private routesService: RoutesService,
    private authenticationService: AuthenticationService) {
  }

  // TODO: This needs to be implemented in order to prevent users from accessing admin pages when they have got no module access.
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    var moduleName = route.data["moduleName"];

  //  return this.sizingModuleAccess.checkModuleAccess(moduleName).map(result => {
  //    let returnVal: boolean = result;

  //    if (returnVal === false) {
  //      console.warn(`Unauthorised access to: ${moduleName}`);
  //      const unauthorisedAlertPromise = swal("Unauthorised", "You are not authorised to access this module.", "error").then(() => {
  //        // Remove the unresolved promise
  //        this.routesService.removeUnresolvedPromise();

  //      });

  //      // Register the alert promise
  //      this.routesService.registerUnresolvedPromise(unauthorisedAlertPromise);
  //    }

  //    return returnVal;
  //  }).catch((error: Response) => {
  //    return Observable.of(false);
    //  });
    return null;
  }
}
