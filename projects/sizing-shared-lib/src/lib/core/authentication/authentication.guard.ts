import { Injectable } from '@angular/core';
import { Router, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable } from "rxjs/Rx";
import { AuthenticationService } from './authentication.service';


/**
 * An authentication guard that decides if a child route can be activated.
 */
@Injectable()
export class AuthenticationGuard implements CanActivateChild {

    constructor(private router: Router, private authenticationService: AuthenticationService) { }
    
    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.authenticationService.checkUser().map(result => {
          if (result === false) {
            // not logged in so redirect to login page with the return url and return false
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          }

          return result;
        }).catch((error: Response) => {
            if (error.status === 401) {
                this.authenticationService.logoutUser();

                // not logged in so redirect to login page with the return url and return false
                this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            }
            else {
                // Any other error from the server regardless of error code is an internal error to the front-end, so redirect to 500 page.
                this.router.navigate(['/500'], { queryParams: { returnUrl: state.url } });
            }

            return Observable.of(false);
        });
    }
}
