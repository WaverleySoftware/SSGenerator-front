import { Injectable } from "@angular/core";
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

import { BaseSizingModule } from "./sizingModule.abstract";

import { TranslatePipe } from "../shared/translation/translate.pipe";
import { RoutesService } from "../modules/routes.service";
import { AuthenticationService } from "../core/authentication/authentication.service";

import { Observable } from "rxjs";
import swal from 'sweetalert';

@Injectable()
export class SizingModuleChangesGuard implements CanDeactivate<BaseSizingModule> {
  constructor(private translatePipe: TranslatePipe, private routesService: RoutesService, private authenticationService: AuthenticationService) {

  }

  /**
   * A Guard that decides if a route can be deactivated.
   * @param component
   * @param currentRoute
   * @param currentState
   * @param nextState
   */
  canDeactivate(component: BaseSizingModule, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Promise<boolean> {
    

    if (!!component === false) {
      // If no component has been found throw an error.
      throw "Sizing Module Deactivation Guard requires a component to implement 'ISizingModule'";
    }

    // Check if the user is logged in before continuing.
    this.authenticationService.authUserChange.next();

    if (!this.authenticationService.authenticatedUser.isLoggedIn) {
      // Let the deactivation continue, because the user needs to login again.
      return Observable.of(true).toPromise();
    }

    this.routesService.canDeactivatePending = true;

    console.info(`Attempting to deactivate Sizing Module component '${component.constructor.name}'`);

    let defaultReturn: Promise<boolean> = Observable.of(true).toPromise();

    // Check the url the app wants to navigate to
    if (!!nextState && (nextState.url === "/500")) {

      // The app is in an erroneous state, so don't even show the alert message.
      return defaultReturn;
    }

    if (!!component &&
      !component.saveJobSuccess &&
      !!component.sizingModuleForm &&
      (component.sizingModuleForm.dirty ||
        component.sizingModuleForm.touched ||
        !component.sizingModuleForm.pristine)) {

      const title = this.translatePipe.transform("SIZING_MODULE_CHANGES_TITLE", true);
      const text = this.translatePipe.transform("SIZING_MODULE_CHANGES_TEXT", true);

      const saveButtonText = this.translatePipe.transform("GO_BACK_AND_KEEP_CHANGES", true);
      const cancelButtonText = this.translatePipe.transform("DISCARD_CHANGES", true);

      // Inform the routes service that no page loading has occurred yet because the user needs to make a decision first.
      this.routesService.pageLoading = false;

      defaultReturn = swal({
        title: title,
        text: text,
        icon: "warning",
        dangerMode: true,
        buttons: [saveButtonText, cancelButtonText]
      }).then((discardChanges?: boolean) => {

        console.info("Resolving unsaved changes promise");

        // The parameter can also enter as null
        const returnVal = !(discardChanges === null);

        // When Angular looks at a guard decision, page navigation has already occurred.
        // Reset the page load progress
        this.routesService.pageLoadProgress = 0;
        this.routesService.pageLoading = returnVal;

        // Exit the guard.
        this.routesService.canDeactivatePending = false;

        // Remove the unresolved promise
        this.routesService.removeUnresolvedPromise();

        return returnVal;
        });

      // Register the promise so that other parts of the system are aware.
      this.routesService.registerUnresolvedPromise(defaultReturn);

    }

    return defaultReturn;
  }
}
