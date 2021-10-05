import { Injectable } from '@angular/core';

import {
  // import as RouterEvent to avoid confusion with the DOM Event
  Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';
import { MessagesService } from "../core/messages/messages.service";


@Injectable({
  providedIn: 'root',
 })
export class RoutesService {

  constructor(private messagesService: MessagesService) {

  }

  canDeactivatePending: boolean = false;
  pageLoading: boolean = true;
  pageLoadProgress: number = 0;

  unresolvedPromise: Promise<any>;

  /**
   * Shows and hides the progress bar during RouterEvent changes
   * @param event The router event.
   */
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      console.info("Navigation started..." + event.url);
      this.pageLoading = true;
      this.pageLoadProgress = 0;

      this.startPageLoadProgress();
    }
    if (event instanceof NavigationEnd) {
      console.info("Navigation ended...");
      this.pageLoading = false;

      // When navigation ends, check if the message queue is empty
      if (!!this.messagesService && !!this.messagesService.messages && this.messagesService.messages.length > 0) {
        // If there are any messages, discard them.
        this.messagesService.addMessage(null);
      }
    }

    // Set loading state to false in both of the below events to hide the progress bar in case a request fails
    if (event instanceof NavigationCancel) {
      console.info("Navigation canceled...");
      this.pageLoading = false;
      this.pageLoadProgress = 100;
    }
    if (event instanceof NavigationError) {
      console.warn("Navigation errored...");
      this.pageLoading = false;
      this.pageLoadProgress = 100;
    }
  }

  /**
   * Shows a progress loader when navigating between routes.
   */
  startPageLoadProgress() {

    const timeout = window.setTimeout(() => {
        const interval = window.setInterval(() => {

          try {
            if (this.pageLoadProgress >= 100) {
              this.pageLoadProgress = 100;
              this.pageLoading = false;
            } else {

              this.pageLoadProgress++;
            }

            // If the progress has reached its end or the page has finished loading, cancel the interval.
            if (this.pageLoadProgress === 100 || this.pageLoading === false) {
              this.pageLoading = false;
              window.clearInterval(interval);
              window.clearTimeout(timeout);
            }
          } catch (err) {
            console.log(`Progress bar - PageLoad() failed err=${err}`);
            this.pageLoading = false;
            //debugger;
          }

        },
          100);
      },
      100);
  }

  registerUnresolvedPromise(promise: Promise<any>): void {
    this.unresolvedPromise = promise;
  }

  removeUnresolvedPromise() {
    this.unresolvedPromise = null;
  }

  getUnresolvedPromise(): Promise<any> {
    return this.unresolvedPromise;
  }

}
