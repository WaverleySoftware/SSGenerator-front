import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import { ProjectsAndJobsSyncInfoModel } from "./syncClient.model";


@Injectable()
export class SyncClientService {

  isSyncingUserData: boolean;
  isSyncingGetProjectsAndJobs: boolean;
  isSyncingTechnicalInformation: boolean;

  constructor(private http: HttpClient) {

  }

  /**
  * Sync this users data.
  */
  syncUserData(): Observable<boolean> {
    this.isSyncingUserData = true;
    var theResponseData = this.http.get<boolean>(`./Api/User/SyncUserData`);
      
    return theResponseData;
  }

  /**
    * Sync Info for Projects And Jobs to transfer
    */
  projectsAndJobsSyncInfo(): Observable<ProjectsAndJobsSyncInfoModel> {    
    return this.http.get<ProjectsAndJobsSyncInfoModel>(`./Api/User/SyncGetProjectsAndJobsInfo`);
  }

  /**
  * Sync Project And Job Data
  */
  projectsAndJobsSyncData(): Observable<boolean> {
    this.isSyncingGetProjectsAndJobs = true;
    var theResponseData = this.http.get<boolean>(`./Api/User/SyncProjectAndJobsData`);
     
    return (theResponseData) as any;
  }

  /**
  * Sync Technical Information Data (download Tis by module)
  */
  technicalInformationSyncData(): Observable<boolean> {
    this.isSyncingTechnicalInformation = true;
    var theResponseData = this.http.get<boolean>(`./Api/User/SyncTechnicalInformationData`);

    return (theResponseData) as any;
  }

}
