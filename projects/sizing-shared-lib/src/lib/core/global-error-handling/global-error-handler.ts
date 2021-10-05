import { ErrorHandler, Injectable, Injector, NgZone } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";

import { AuthenticationService } from "../authentication/authentication.service";
import { MessagesService } from "../messages/messages.service";

import { Message } from "../messages/message.model";

import swal from 'sweetalert';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private router: Router;

  constructor(private injector: Injector, private zone: NgZone, private authService: AuthenticationService, private location: Location, private messagesService: MessagesService) {
    setTimeout(() => this.router = injector.get(Router));
  }

  handleError(error: Error | Response) {
    
    console.info("Global error handler hit");

    let rejection = error as Response;

    if (typeof rejection === "undefined") {
      rejection = error["rejection"] as Response;
    }

    let redirectToPage = "/500";
    let preventRedirection: boolean = false;

    if (!!rejection && !!rejection.status) {
      switch (rejection.status) {
        case 500: // Internal error
          console.error(error);
          break;
        case 400: // Validation failure
          console.info("Validation failure");
          preventRedirection = true;

          if (!!rejection["error"] && (rejection["error"] as Message[])) {

            var messages = rejection["error"] as Message[];

            // Ensure that this is an actual array of messages and not just a string (which can happen)
            if (messages.length <= 0 || typeof messages[0] !== "object") {
              // Regardless of whether or not messages is a string or even empty, error handling has not been processed correctly,
              // so return a generic error message.

              var rejectionMessage = "";
              // Get any rejection info
              if (!!rejection["error"] && !!rejection["error"].message) {
                rejectionMessage = rejectionMessage + rejection["error"].message;
                console.info(`rejectionMessage: ${rejectionMessage}`);
              }

              if (!!messages) {
                messages = [];
              }

              messages.push({ messageKey: "GENERIC_ERROR_MESSAGE", severity: 2, value: 0, unitKey: "", displayValue: rejectionMessage });
            }

            console.info(`Processing ${messages.length} messages.`);

            // Ng Zone is mapped in because Angular's Global Error Handler is processed outside of a zone because,
            // as with routing, Angular's error handling runs outside of change detection, so trigger it here manually
            this.zone.run(() => {
              this.messagesService.addMessage(messages);
            });
          }

          break;
        case 401: // Not authorised
          this.authService.logoutUser();
          redirectToPage = "/login";
          break;
        case 403:
          preventRedirection = true;
          this.location.back();
          swal("Forbidden", "Forbidden access", "error");
          break;
        case 404: // URL not found
          console.warn(`URL not found: ${rejection.url}`);
          redirectToPage = "/404";
          break;
        default:
      }
    } else {
      console.error(error);
    }

    // Ng Zone is mapped in because Angular's Global Error Handler is processed outside of a zone, meaning it loses track of any routing.
    if (preventRedirection === false) {
      this.zone.run(() => {
        const replaceUrl = redirectToPage === "/login";
        const skipLocationChange = redirectToPage !== "/login";

        this.router.navigate([redirectToPage], { replaceUrl: replaceUrl, skipLocationChange: skipLocationChange });
      });
    }
  }
}
