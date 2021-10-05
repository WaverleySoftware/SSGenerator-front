import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute  } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { SettingsService } from '../../core/settings/settings.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { RoutesService } from "../routes.service";
import { SyncClientService } from "./syncClient.service";
import { RoutingState } from "../routingState";
import { ProjectsAndJobsSyncInfoModel } from "./syncClient.model";

@Component({
  selector: 'app-sync',
  templateUrl: './syncClient.component.html',
  styleUrls: ['./syncClient.component.scss']
})
export class SyncClientComponent implements OnInit {

  loading = false;
  syncing = false;
  returnUrl: string;
  language: string;
  errorMessage: string = '';
  isSuccess: boolean = false;
  alertVisible: boolean = false;

  pageLoadProgress: number = 0;
  interval: number = 0;
  timeout: number = 0;

  previousRoute: string;
  newClientUserRequiresSyncFinishButton: boolean = false;
  projectsAndJobsSyncInfo: ProjectsAndJobsSyncInfoModel;

  private title: string = "sync";

  @ViewChild("syncForm", { static: false })
  syncForm: any;

  constructor(public settingsService: SettingsService,
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private routesService: RoutesService,
    private routingState: RoutingState,
    public syncClientService: SyncClientService,
    private router: Router,
    private titleService: Title) {

    this.loading = false;
    this.language = navigator.language;
  }


  ngOnInit() {

    this.titleService.setTitle(`${this.settingsService.app.name} - ${this.title}`);

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    if (this.returnUrl.search('sync') >= 0) {
      this.returnUrl = '/home';
    }

    if (!this.authenticationService.authenticatedUser.clientMode) {
      // Navigate onward... (only allow component in Client mode)
      this.finished();
      return;
    }

    this.previousRoute = this.routingState.getPreviousUrl();

    var newClientUser = this.authenticationService.authenticatedUser.newClientUser;

    // ************ Post login page New User Sync only! **************************
    // Come from login page (a new User requires local data) then perform sync automatically then continue onward...
    if (newClientUser && (this.previousRoute.search('/login') >= 0)) {
      this.setupUIforSync();
      this.newClientUserRequiresSyncFinishButton = true;
      this.syncClientService.syncUserData().subscribe((syncResponse: boolean) => {

          if (syncResponse) {
            this.handleSyncSuccess();

            // Fire P&J sync then leave in background
            this.syncProjectsAndJobsData();

            // *******************
            // Navigate onward... (only when component is stand alone after new Client user login)
            this.finished();
            // *******************

          } else {
            // Sync failed!
            this.handleSyncFailure();
          }
        },
        // Error callback
        err => {
          // Sync failed!
          console.log(err.error);
          this.handleSyncFailure();
        });
    } else {

      this.newClientUserRequiresSyncFinishButton = false;
    }
    // ************ End of Post login page New User Sync only! **************************

    // Gives the UI some initial feedback of the P&Js to transfer
    this.getProjectsAndJobsSyncInfo();

    // If sync allready running, set UI and start progress bar
    if (this.syncClientService.isSyncingUserData || this.syncClientService.isSyncingGetProjectsAndJobs || this.syncClientService.isSyncingTechnicalInformation) {
      this.setupUIforSync();
    }

  }

  getProjectsAndJobsSyncInfo() {

    // Gves the UI some initial feedback of the P&Js to transfer
    this.syncClientService.projectsAndJobsSyncInfo().subscribe(
      (projectsAndJobsSyncInfoResponse: ProjectsAndJobsSyncInfoModel) => {

        if (!!projectsAndJobsSyncInfoResponse && projectsAndJobsSyncInfoResponse.isSuccessful) {
          this.projectsAndJobsSyncInfo = projectsAndJobsSyncInfoResponse;
        } else {
          // Sync info for P&J failed, don't bother the UI          
        }
      },
      // Error callback
      err => {
        // Sync info for P&J failed, don't bother the UI
        console.log(err.error);
      });
  }

  syncProjectsAndJobsData() {

    this.syncClientService.projectsAndJobsSyncData().subscribe((syncResponse: boolean) => {

        if (syncResponse) {

          setTimeout(() => {
            this.projectsAndJobsSyncInfo.numberOfClientSizingsToUpload = 0;
            this.projectsAndJobsSyncInfo.numberOfServerSizingsToDownload = 0;

            // Turn off info alert
            this.syncClientService.isSyncingGetProjectsAndJobs = false;

            // Do Ti Sync
            this.syncTechnicalInformationSyncData();
          }, 1000); // delay for UI alerts

        } else {
          // Sync failed!
          this.handleSyncFailure();
        }
      },
      // Error callback
      err => {
        // Sync failed!
        console.log(err.error);
        this.handleSyncFailure();
      });
  }


  syncTechnicalInformationSyncData() {

    this.syncClientService.technicalInformationSyncData().subscribe((syncResponse: boolean) => {

      if (syncResponse) {

        setTimeout(() => {
          // Turn off info alert
          this.syncClientService.isSyncingTechnicalInformation = false;
          
          // All manual sync chain done!
          this.handleSyncSuccess();
        }, 1000); // delay for UI alerts

        } else {
          // Sync failed!
          this.handleSyncFailure();
        }
      },
      // Error callback 
      err => {
        // Sync failed!
        console.log(err.error);
        this.handleSyncFailure();
      });
  }

  manualSync() {
    this.setupUIforSync();

    this.syncClientService.syncUserData().subscribe((syncResponse: boolean) => {
        if (syncResponse)
        {
          setTimeout(() => {
            // Turn off info alert
            this.syncClientService.isSyncingUserData= false;

            // Now Fire P&J sync data
            this.syncProjectsAndJobsData();
          }, 1000); // delay for UI alerts

        } else
        {
            // Sync failed!
            this.handleSyncFailure();
        }
      },
      // Error callback
      err => {
        // Sync failed!
        console.log(err.error);
        this.handleSyncFailure();
      });

    // Gives the UI some initial feedback of the P&Js to transfer
    this.getProjectsAndJobsSyncInfo();
  }      



  finished() {
    // Navigate onward...
    this.router.navigate([this.returnUrl]);
  }


  setupUIforSync() {
    // Clear info alerts
    this.syncClientService.isSyncingUserData = false;
    this.syncClientService.isSyncingGetProjectsAndJobs = false;
    this.syncClientService.isSyncingTechnicalInformation = false;
    this.syncing = true;
    this.stopProgress(0);
    this.startpageLoadProgress();
    this.closeAlert();
  }

  handleSyncFailure() {
    console.log("Sync failed!");
    this.syncing = false;
    this.stopProgress(0);
    this.isSuccess = false;
    this.alertVisible = true;
  }

  handleSyncSuccess() {
    console.log("Sync succeded!");
    this.syncing = false;
    this.stopProgress();
    this.isSuccess = true;
    this.alertVisible = true;
  }

  closeAlert(): void {
    // Reset the flag
    this.alertVisible = false;
  }

  /**
 * Shows a progress loader when navigating between routes.
 */
  startpageLoadProgress() {
    this.pageLoadProgress = 0;
    this.timeout = window.setTimeout(() => {
        this.interval = window.setInterval(() => {

            if (this.pageLoadProgress >= 100) {
              this.pageLoadProgress = 0;
            } else {
              this.pageLoadProgress++;
            }

            // If the progress has reached its end or the page has finished loading, cancel the interval.
            if (this.pageLoadProgress === 100) {
              this.pageLoadProgress = 0;
             // window.clearInterval(this.interval);
             // window.clearTimeout(this.timeout);
            }

          },
          100);
      },
      100);
  }

  stopProgress(progress: number = 100) {
    this.pageLoadProgress = progress;
    window.clearInterval(this.interval);
    window.clearTimeout(this.timeout);
  }


}
