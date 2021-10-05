import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject } from "rxjs/Rx";

import { AuthenticatedUser } from "./authenticatedUser.model";

@Injectable()
export class AuthenticationService {
  private loginHeaders = new HttpHeaders({ "Content-Type": "application/x-www-form-urlencoded" });

  authenticatedUser: AuthenticatedUser = new AuthenticatedUser();
  authUserChange: Subject<AuthenticatedUser> = new Subject<AuthenticatedUser>();



  constructor(private http: HttpClient) {
    // When the class in constructed, initialise the subject so that whenever it is called, its subscriber resolves the result to the provided object.
    this.authUserChange.subscribe(() => {
      this.authenticatedUser = new AuthenticatedUser();

      let userObj: any = JSON.parse(localStorage.getItem("userObj"));

      if (!!userObj) {
       // let currentdateTime = new Date();
        // const expires = currentdateTime.setMilliseconds(currentdateTime.getMilliseconds() + (userObj[".expires_in"])) ;

        const ticketDurationMilliseconds: number = userObj["expires_in"] ; // number = (expires.valueOf() - new Date().valueOf());

        this.authenticatedUser.name = userObj["Name"];
        this.authenticatedUser.isLoggedIn = ticketDurationMilliseconds > 0;
        this.authenticatedUser.expiryMilliseconds = ticketDurationMilliseconds;
        this.authenticatedUser.impersonator = userObj["impersonator"];
        this.authenticatedUser.isImpersonating = !!userObj["impersonator"];

        this.authenticatedUser.clientMode = (userObj["ClientMode"] === "True");
        this.authenticatedUser.syncAccess = (userObj["SyncAccess"] === "True");
        this.authenticatedUser.newClientUser = (userObj["NewClientUser"] === "True");

        // Set the individual permissions here. Double exclamation is done to handle undefined permissions.
        this.authenticatedUser.permissions["canEditTranslations"] =               !!(userObj["CanEditTranslations"] === "True");
        this.authenticatedUser.permissions["canAccessSizingSuite"] =              !!(userObj["CanAccessSizingSuite"] === "True");
        this.authenticatedUser.permissions["canManageModuleAccess"] =             !!(userObj["CanManageModuleAccess"] === "True");
        this.authenticatedUser.permissions["canManageModulePreferences"] =        !!(userObj["CanManageModulePreferences"] === "True");
        this.authenticatedUser.permissions["canManageOpCoPreferences"] =          !!(userObj["CanManageOpCoPreferences"] === "True");
        this.authenticatedUser.permissions["canManageProductSelection"] =         !!(userObj["CanManageProductSelection"] === "True");
        this.authenticatedUser.permissions["canViewAdminTasks"] =                 !!(userObj["CanViewAdminTasks"] === "True");
        this.authenticatedUser.permissions["canViewCurrencyInfo"] =               !!(userObj["CanViewCurrencyInfo"] === "True");
        this.authenticatedUser.permissions["canViewMyProfile"] =                  !!(userObj["CanViewMyProfile"] === "True");
        this.authenticatedUser.permissions["canViewNotifications"] =              !!(userObj["CanViewNotifications"] === "True");
        this.authenticatedUser.permissions["canViewProjectsJobs"] =               !!(userObj["CanViewProjectsJobs"] === "True");
        this.authenticatedUser.permissions["canViewUserPreferences"] =            !!(userObj["CanViewUserPreferences"] === "True");
        this.authenticatedUser.permissions["canManageEasiheatBillOfMaterials"] =  !!(userObj["CanManageEasiheatBillOfMaterials"] === "True");
        this.authenticatedUser.permissions["canDownloadOfflineClient"] =          !!(userObj["CanDownloadOfflineClient"] === "True");
        this.authenticatedUser.permissions["canExportExcelDocuments"] =           !!(userObj["CanExportExcelDocuments"] === "True");
        this.authenticatedUser.permissions["canExportToCRM"] =                    !!(userObj["CanExportToCRM"] === "True");
        this.authenticatedUser.permissions["canManagePricingAccessLevel"] =       !!(userObj["CanManagePricingAccessLevel"] === "True");

        if (!this.authenticatedUser.picture) {
          // Set the default picture if there is none.
          //this.authenticatedUser.picture = 'assets/img/user/default_user.png';
          this.authenticatedUser.picture = 'assets/img/user/blueLogo.jpg';
        }
      }
    });
  }

  checkUser(): Observable<boolean> {
    return this.http.get(`./Api/user/IsUserAuthenticated`).map((response: boolean) => {

      // Update the subject with the data that's just been retrieved (see the constructor).
      this.authUserChange.next();

      // Return the response
      return response;
    }, (error: Error) => {
      // Anything that's not 200, is an error
      return false;
    });
  }

  getAuthToken(username: string, password: string, language: string): Observable<boolean> {
    var user = { client_id: "sizingClient", client_secret: "secret", grant_type: 'password', username: "username", password: "password", scope: 'obApi' };
    return this.http.post("./Api/identity/connect/token", `username=${username}&password=${password}&culture=${language}&grant_type=password&client_id=sizingsuite_v2_clientid&client_secret=sizingsuite_v2_secret&scope=sizingsuite_v2_api_all_scope offline_access`, { headers: this.loginHeaders })
      .map((responseObj: Response) => {
        localStorage.clear();

        localStorage.setItem("userObj", `${JSON.stringify(responseObj)}`);

        // Update the subject with the data that's just been retrieved (see the constructor).
        this.authUserChange.next();

        return true;
      },
      (error: Error) => {
        throw error;
      });
  }

  impersonateUser(username: string): Observable<boolean> {
    return this.http.post("./Api/identity/Api/Token", `username=${username}&grant_type=impersonate_user`, { headers: this.loginHeaders })
      .map((responseObj: Response) => {
        localStorage.clear();

        // Override the original token with the new
        localStorage.setItem("userObj", `${JSON.stringify(responseObj)}`);

        // Update the subject with the data that's just been retrieved (see the constructor).
        this.authUserChange.next();

        return true;
      },
      (error: Error) => {
        throw error;
      });
  }

  logoutUser(): void {
    localStorage.clear();

    var authenticatedUser = new AuthenticatedUser();

    authenticatedUser.name = null;
    authenticatedUser.isLoggedIn = false;
    authenticatedUser.impersonator = null;
    authenticatedUser.isImpersonating = false;

    // Update the subject with the data that's just been retrieved (see the constructor).
    this.authUserChange.next(authenticatedUser);

    console.info("User logged out");
  }

  endImpersonation(): Observable<boolean> {

    return this.http.post("./Api/identity/Token", `grant_type=revoke_impersonation`, { headers: this.loginHeaders })
      .map((responseObj: Response) => {
        localStorage.clear();

        // Override the original token with the new
        localStorage.setItem("userObj", `${JSON.stringify(responseObj)}`);

        // Update the subject with the data that's just been retrieved (see the constructor).
        this.authUserChange.next();

        return true;
      },
      (error: Error) => {
        throw error;
      });

  }
}
