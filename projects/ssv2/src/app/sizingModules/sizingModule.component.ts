import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, } from "@angular/core";
import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';

import { SizingSuiteModalComponent } from "sizing-shared-lib"; //
import { PreferenceService } from "sizing-shared-lib"; // "../shared/preference/preference.service";
import { MessagesService } from "sizing-shared-lib"; // "../core/messages/messages.service";
import { TranslatePipe } from "sizing-shared-lib"; // "../shared/translation/translate.pipe";
import { Project } from "sizing-shared-lib"; // "../modules/projects-jobs/projects-jobs.model";
import { ProjectsJobsService } from "sizing-shared-lib"; // "../modules/projects-jobs/projects-jobs.service";
import { Location } from '@angular/common';

import swal from 'sweetalert';
import * as cloneDeep_ from 'lodash/cloneDeep';
import { BaseSizingModule } from "sizing-shared-lib";
import { GetSizingJobRequest } from "../../../../sizing-shared-lib/src/lib/modules/projects-jobs/projects-jobs.model"; // "./sizingModule.abstract";

@Component({
  selector: 'sizing-module',
  templateUrl: './sizingModule.component.html',
  styleUrls: ['./sizingModule.component.scss']
})
export class SizingModuleComponent implements OnInit, AfterViewInit {

  @ViewChild("unitsModal", { static: false }) private unitsModal: SizingSuiteModalComponent;
  @ViewChild("saveLoadModal", { static: false }) private saveLoadModal: SizingSuiteModalComponent;

  public childComponent: BaseSizingModule = null;
  public isCalculating: boolean;
  public cloneDeep = cloneDeep_;
  newSizing: boolean = false;
  constructor(
    private http: HttpClient,
    private preferenceService: PreferenceService,
    private messagesService: MessagesService,
    private projectsJobsService: ProjectsJobsService,
    private translatePipe: TranslatePipe,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {

  }


  ngOnInit() {



  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  public modalCallbackCancel() {
    console.log("Oh look, it's closed without this function calling anything!!");
  }

  public modalCallbackOk() {
    console.log("Units changed");
    this.childComponent.onUnitsChanged();
  }

  public reset() {
    console.info("Resetting stuff");

    var title = this.translatePipe.transform('RESET', true) + '?';
    var text = this.translatePipe.transform('RESET_SIZING_MODULE_DATA', true) + '.';
    var resetButton = this.translatePipe.transform('RESET', true);
    var cancelButton = this.translatePipe.transform('CANCEL', true);

    // Simple popup message box
    swal({
      title: title,
      text: text,
      icon: "warning",
      buttons: [cancelButton, resetButton]
    }).then((resetButtoncClicked?: boolean) => {

      //console.info("button clicked...");

      // The parameter can also enter as null
      const returnVal = !(resetButtoncClicked === null);
      if (resetButtoncClicked) {
        this.doSizingModuleReset();
        this.childComponent.sizingModuleForm.markAsPristine();
        this.childComponent.sizingModuleForm.markAsUntouched();
      }
    });

  }

  doSizingModuleReset() {
    // Reset the child form. Inheriting interfaces can result in the object being present,
    // but without any members, so check for the function as well.
    if (!!this.childComponent && !!this.childComponent.sizingModuleForm) {

      this.childComponent.onResetModuleForm();
      this.childComponent.sizingModuleForm.reset();
      this.childComponent.sizingModuleForm.markAsPristine();



    } else {
      // If no members are found then the interface is not implemented or members are missing.
      this.raiseInheritanceWarning();
    }

    // Reset the preferences. Deep clone the original object or there will be side-effects.
    const unitPreferences = this.cloneDeep(this.preferenceService.sizingUnitPreferences);

    // Loop through the preferences and get the original preferences
    for (const unitPreference of unitPreferences) {
      const preferenceName = unitPreference.preference.name;

      const originalPreference = this.preferenceService.allPreferences.find(pref => pref.name === preferenceName);

      this.preferenceService.addSizingUnitPreference(originalPreference, unitPreference.unitType, unitPreference.masterTextKey, unitPreference.moduleGroupId);
    }

    // Lastly, reset any messages
    this.messagesService.addMessage(null);
  }
  public excelSubmit() {
    console.info("Excel Submit");

    // Check if the sizing has been done and a model is selected before we are able to generate the spec sheet?
    if (this.childComponent.isSpecSheetEnabled) {
      this.childComponent.onExcelSubmit();
    }
  }

  public pdfSubmit() {
    console.info("PDF Submit");

    // Check if the sizing has been done and a model is selected before we are able to generate the spec sheet?
    if (this.childComponent.isSpecSheetEnabled) {
      this.childComponent.onPdfSubmit();
    }
  }

  public download(){
    window.open('./Api/ProjectsAndJobs/GetCrmJob?jobid=4861AB4A-A251-40F0-ADE7-A2C9BAE4DD44','_blank');
  }

  public downloadCrmXml() {
    console.info("download Crm Xml clicked");
    // Check if the sizing has been done and a model is selected before we are able to generate the spec sheet?
    if (this.childComponent.jobId) {
      var jobId = this.childComponent.jobId
      var url = "./Api/ProjectsAndJobs/GetCrmJob?jobid=" + jobId;
      const headerDict = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Headers': 'Content-Type',
      }

      const requestOptions = {
        headers: new HttpHeaders(headerDict)
      };

      return this.http.get<any>(url, requestOptions).subscribe(data => {
        var element = document.createElement('a');
        element.setAttribute('href',
        'data:text/plain;charset=utf-8, '
        + encodeURIComponent(data));
        element.setAttribute('download', 'CrmExport.xml');
        document.body.appendChild(element);
        //onClick property
        element.click();
        document.body.removeChild(element);
      })
    }
  }

  public onGetTiSheet() {
    console.info("TI Submit");

    if (this.childComponent.isTiEnabled) {
      this.childComponent.onGetTiSheet();
    }
  }

  public onNewSizingForm() {
    console.info("onNewSizingForm Submit");

    this.childComponent.onNewSizingForm();
    this.childComponent.sizingModuleForm.markAsPristine();
    this.childComponent.sizingModuleForm.markAsUntouched();
  }

  public onEnterHeaderDetailsForm() {
    console.info("onEnterHeaderDetailsForm Submit");
    this.childComponent.onEnterHeaderDetailsForm();
  }


  /**
   * Submits the form for sizing calculations.
   * @param $ev The submission event.
   */
  public submitSizingModuleCalculations($ev) {
    $ev.preventDefault();

    // Inheriting interfaces can result in the object being present,
    // but without any members, so check for the function as well.
    if (!!this.childComponent && this.childComponent.sizingModuleForm.valid && this.childComponent.onCalculateSizing) {

      // Reset any messages before submitting.
      this.messagesService.addMessage(null);

      this.childComponent.onCalculateSizing(this.childComponent.sizingModuleForm);
    } else {
      // If no members are found then the interface is not implemented or members are missing.
      this.raiseInheritanceWarning();
    }

    console.info(`Submitted the form!`);
  }

  public onActivate(componentRef: BaseSizingModule) {
    console.info(`Activating`);
    this.childComponent = componentRef;
  }

  public onDeactivate(componentRef: BaseSizingModule) {
    console.info(`Deactivating`);
  }

  /**
   * The OK function for the Project/Job Saving functionality
   * @param returnObj
   */
  public saveLoadModalOk(projectPromise: Promise<Project>) {
    if (!!projectPromise) {

      projectPromise.then((savedProjectDetails: Project) => {

        // to handle error ((line 187)savedProjectDetails.existingProjectSave cannot read from null)
        if (savedProjectDetails !== null) {

          if (savedProjectDetails.existingProjectSave === false) {

            // from dialog
            this.childComponent.projectName = savedProjectDetails.name;
            this.childComponent.jobName = savedProjectDetails.jobs[0].name;

            // Pick the form group apart and assign the details to an actual class.
            const jobSizing = this.childComponent.onSave(savedProjectDetails);

            // check save type:
            // new project
            if (savedProjectDetails !== null && jobSizing !== null) {
              this.projectsJobsService.saveJobSizing(jobSizing).subscribe((response) => {
                if (response) {

                  // need to display success message
                  this.childComponent.saveJobSuccess = true;
                  this.childComponent.jobId = response.jobId.toString();
                  this.childComponent.projectId = response.projectId && response.projectId.toString(); // TODO: Check is prev modules works fine

                  this.childComponent.sizingModuleForm.markAsPristine();
                  this.childComponent.sizingModuleForm.markAsUntouched();

                  // @ts-ignore // TODO: Added "saveJobToNewProject" function to interface "ISizingModule" but not added to abstract class "BaseSizingModule"
                  const doneFn: (data: GetSizingJobRequest) => void = this.childComponent && this.childComponent.saveJobToNewProject;

                  if (doneFn && typeof doneFn === 'function') {
                    doneFn.call(this.childComponent, response);
                  }

                  // Close the modal manually, because we are handling promises.
                  this.saveLoadModal.close();

                  //debugger;
                  //let lastProjectIndex = this.projectsJobsService.projectsJobs.projects.length;
                  //console.log(this.projectsJobsService.projectsJobs.projects[lastProjectIndex].id)
                  //console.log(this.projectsJobsService.projectsJobs.projects[lastProjectIndex].name)

                }

              },
                error => {
                  this.childComponent.saveJobError = true;
                });
            }
          }

          else {
            // save new job to existing project from the list

            if (savedProjectDetails != null && !!savedProjectDetails.id) {

              let lastJobIndex = savedProjectDetails.jobs.length - 1;
              savedProjectDetails.jobs[lastJobIndex].productName = this.childComponent.productName;
              savedProjectDetails.jobs[lastJobIndex].moduleId = this.childComponent.moduleId;
              savedProjectDetails.jobs[lastJobIndex].jobStatusId = this.childComponent.jobStatusId;
              this.projectsJobsService.insertJob(savedProjectDetails.jobs[lastJobIndex]).subscribe((response) => {
                if (response) {

                  this.childComponent.projectName = savedProjectDetails.name;
                  this.childComponent.projectId = savedProjectDetails.id;
                  this.childComponent.jobId = response.job.id;
                  this.childComponent.jobName = response.job.name;
                  // save as
                  this.childComponent.repackageSizing();

                  this.childComponent.sizingModuleForm.markAsPristine();
                  this.childComponent.sizingModuleForm.markAsUntouched();

                  // Close the modal manually, because we are handling promises.
                  this.saveLoadModal.close();
                }

              },
                error => {
                  this.childComponent.saveJobError = true;
                });

            }
          }
        }
      });
    }
  }

  public resetAlertFlags() {
    this.childComponent.saveJobError = false;
    this.childComponent.saveJobSuccess = false;
  }

  /**
   * Raises a warning when a sizing module does implement ISizingModule or some of its members are missing.
   */
  private raiseInheritanceWarning() {
    console.warn("The current sizing module does not implement ISizingModule or are missing members.");
  }

  public save() {
    //save new project
    if (this.childComponent.onSaveJob() || this.childComponent.projectId == '') {
      this.saveLoadModal.open();
    }
    //save changes to already existing one
    else {
      this.childComponent.repackageSizing();
      this.childComponent.sizingModuleForm.markAsPristine();
      this.childComponent.sizingModuleForm.markAsUntouched();
    }
  }
}
