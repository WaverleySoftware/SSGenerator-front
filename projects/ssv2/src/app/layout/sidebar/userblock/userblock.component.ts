import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from 'sizing-shared-lib'; // '../../../core/authentication/authentication.service';
import { SettingsService } from 'sizing-shared-lib'; //'../../../core/settings/settings.service';
import { RoutesService } from "sizing-shared-lib";

import { AuthenticatedUser } from 'sizing-shared-lib'; // '../../../core/authentication/authenticatedUser.model';

import swal from 'sweetalert';
import * as moment from 'moment';

@Component({
  selector: 'app-userblock',
  templateUrl: './userblock.component.html',
  styleUrls: ['./userblock.component.scss']
})
export class UserblockComponent implements OnInit, OnDestroy {

  private timeout: number;

  get currentUser(): AuthenticatedUser {
    return this.authenticationService.authenticatedUser;
  }

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    public settings: SettingsService,
    private routesService: RoutesService) {
  }

  ngOnInit() {

    const remainingTime = moment.utc(this.authenticationService.authenticatedUser.expiryMilliseconds).format('HH:mm:ss');

    console.info(`Registering user token monitor. User has '${remainingTime}' seconds until expiry.`);

    this.timeout = window.setTimeout(() => {
      console.info("Verifying user token");

      this.authenticationService.authUserChange.next();

      if (this.currentUser.isLoggedIn === false) {

        // Before raising this alert, check if there are any unresolved alert promises first
        const unresolvedPromise = this.routesService.getUnresolvedPromise();

        if (!!unresolvedPromise) {

          console.info("Unresolved promise found. Waiting for promise to be resolved.");

          // Wait for the unresolved promise to resolve itself first,
          // before continuing with this one.
          unresolvedPromise.then(() => {
            console.info("Promise has been resolved, showing logout alert");

            // User has been logged out, show the alert
            this.showLogoutAlert();
          });
        } else {
          console.info("No unresolved promise has been found, showing logout alert");

          // User has been logged out, show the alert
          this.showLogoutAlert();
        }
      }
    }, this.authenticationService.authenticatedUser.expiryMilliseconds);

  }

  /**
   * Shows an alert when the user has been logged out.
   */
  showLogoutAlert() {
    swal("Logged out", "TokenExpiredMessage", "error").then(() => {
      this.logout();
    });
  }

  ngOnDestroy(): void {
    console.info("De-registering user token monitor");
    window.clearTimeout(this.timeout);
  }

  logout(): void {
    this.authenticationService.logoutUser();

    this.router.navigate(['/login'], { queryParams: { returnUrl: '/home' } }); // not this.router.url as could be forbiden for next user login
  }

  isSidebarCollapsedText() {
    return this.settings.layout.isCollapsedText;
  }
}
