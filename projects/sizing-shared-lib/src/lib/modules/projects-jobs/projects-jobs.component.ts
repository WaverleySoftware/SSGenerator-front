import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { ProjectsJobsService } from "./projects-jobs.service";
import { SharedService } from "../../shared/shared.service";

import { ProjectsAndJobs, Project, Job } from "./projects-jobs.model";

import { Validators } from '@angular/forms';

import { DatatableComponent } from '@swimlane/ngx-datatable';
import { TranslatePipe } from "../../shared/translation/translate.pipe";
import { IGenericChanges } from "../generic.changes.interface";

import * as cloneDeep_ from 'lodash/cloneDeep';
import { SyncClientService } from "../syncClient/syncClient.service";
import { ProjectsAndJobsSyncInfoModel } from "../syncClient/syncClient.model";
import { AuthenticationService } from "../../core/authentication/authentication.service";

import { ChangeDetectorRef } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';

declare var swal: any;

@Component({
  selector: 'app-projects-jobs',
  templateUrl: './projects-jobs.component.html',
  styleUrls: ['./projects-jobs.component.scss']
})
export class ProjectsJobsComponent implements OnInit, IGenericChanges {
  @ViewChild(DatatableComponent, { static: false }) table: DatatableComponent;
  @ViewChild('projectsTable', { static: false }) tableExp: any;

  @ViewChild('projectName', { static: false }) projectNameInput: ElementRef;
  public cloneDeep = cloneDeep_;

  get projectsAndJobsBackingData(): ProjectsAndJobs {
    return this.projectsJobsService.projectsJobs;
  }
  set projectsAndJobsBackingData(projectsAndJobs: ProjectsAndJobs) {
    this.projectsJobsService.projectsJobs = projectsAndJobs;
  }

  timeout: any;

  projects: Project[] = [];
  jobs: Job[] = [];
  selectedProject: Project = new Project();
  selectedProjectIndex: number = 0;
  industryEnumerationName: string = "";

  projectsForm: FormGroup;
  projectName: FormControl;
  customerName: FormControl;
  projectReference: FormControl;
  customerLocation: FormControl;
  quoteReference: FormControl;
  tradeEnum: FormControl;
  industryEnum: FormControl;
  created: FormControl;

  areProjectsAndJobsLoaded: boolean = false;
  isSuccess: boolean = false;
  alertVisible: boolean = false;
  formSubmitted: boolean = false;
  editingProject: boolean = false;
  editingJob: boolean = false;
  rowsSel = [];
  selected = [];

  theFormGroup: FormGroup = this.projectsForm; // to drive GenericChangesGuard
  hasUnsavedDataChanges: boolean; // to drive GenericChangesGuard

  projectsAndJobsSyncInfo: ProjectsAndJobsSyncInfoModel;

  constructor(
    private projectsJobsService: ProjectsJobsService,
    private fb: FormBuilder,
    public translatePipe: TranslatePipe,
    private sharedService: SharedService,
    private authenticationService: AuthenticationService,
    private syncClientService: SyncClientService,
    private cdRef: ChangeDetectorRef
    ) {

    //this.getProjectsAndJobsData();

    // Initialise Form controls
    this.projectName = new FormControl('', [Validators.required]);
    this.customerName = new FormControl('');
    this.projectReference = new FormControl('');
    this.customerLocation = new FormControl('');
    this.quoteReference = new FormControl('');
    this.tradeEnum = new FormControl('');
    this.industryEnum = new FormControl('');
    this.created = new FormControl('');

    // Initialise Form Group
    this.projectsForm = this.fb.group({
      projectName: this.projectName,
      customerName: this.customerName,
      projectReference: this.projectReference,
      customerLocation: this.customerLocation,
      quoteReference: this.quoteReference,
      tradeEnum: this.tradeEnum,
      industryEnum: this.industryEnum,
      created: this.created,

    }, { updateOn: "change" });

    this.theFormGroup = this.projectsForm; // to drive GenericChangesGuard

    // Listen to jobsForm isDirty changes to signal parent via event emitter that this component is in 'edit' mode.
    // This is the current mechanism for detecting a user has edited the form, otherwise we need a button to enter edit mode.
    this.projectsForm.valueChanges.subscribe((value: any) => {
      if (this.projectsForm.dirty && !this.projectName.disabled && !this.editingProject) {
        console.log('projectsForm dirty - yes: ', value);

        //this.editingProjectDataOnChange.emit(true);
        this.editingProject = true;

      }
    });

    // subject subscription, update as service data has changed (probably changed in memory)
    this.projectsJobsService.projectJobsChange.subscribe(() => {
      this.getSubjectUpdatedProjectsAndJobsData();
    });

  }

  ngOnInit() {
    this.getProjectsAndJobsData(); // first get data
    
    if (this.authenticationService.authenticatedUser.clientMode) {
      this.getProjectsAndJobsSyncInfo();
    }
  }
  
  editingJobDataOnChange($event) {
    console.log(`editingJobDataOnChange: event:${event}`);
    this.editingJob = $event;
    // editingJob signalled and handle no projects situtation.    
    if (this.editingJob || (!!this.projectsAndJobsBackingData.projects && this.projectsAndJobsBackingData.projects.length <= 0)) {
      this.disableFormInputControls();
      
      // handle no projects and no jobs situation when loaded
      if (this.editingJob && !!this.projectsAndJobsBackingData.projects && this.projectsAndJobsBackingData.projects.length > 0) {
        this.hasUnsavedDataChanges = true; // to drive GenericChangesGuard    
      }
    } else {
      this.enableFormInputControls();
      this.hasUnsavedDataChanges = false; // to drive GenericChangesGuard
    }
  }

  getProjectsAndJobsData(): void {

    this.areProjectsAndJobsLoaded = false;

    this.projectsJobsService.getProjectsAndJobs().subscribe(() => {

      // Inform the view that areProjectsAndJobs are now loaded.
      this.areProjectsAndJobsLoaded = true;
      this.selectedProjectIndex = 0;
    });    
  }

  getSubjectUpdatedProjectsAndJobsData(): void {

    if (!this.projectsAndJobsBackingData.projects) {
      this.projectsAndJobsBackingData.projects = [];
    } else {
      this.projects = this.cloneDeep(this.projectsAndJobsBackingData.projects);
    }

    if (!this.projects) {
      this.projects = [];
    }

    // Inform the view that areProjectsAndJobs are now loaded.
    this.areProjectsAndJobsLoaded = true;

    this.setupCleanSelectedProject(this.selectedProjectIndex);
  }

  /**
   * Set the form controls for the currently selected project
   */
  setupCleanSelectedProject(projectIndex: number) {

    if (!this.areProjectsAndJobsLoaded && !this.editingProject && !this.projectsForm.dirty) {
      return;
    }

    this.selectedProjectIndex = projectIndex;

    this.projectsForm.reset();

    // Set requested project on the form control, if it exists.
    if (!!this.projects && !!this.projects[projectIndex] && projectIndex > -1) {
      this.selectedProject = this.projects[projectIndex];
      this.tradeEnum.setValue(this.selectedProject.tradeEnum);
      this.industryEnumerationName = this.sharedService.getIndustryEnumNameForProvidedTrade(this.selectedProject.tradeEnum.toString()); // setup the Industry Enumeration based on selected Trade Enumeration value.
      this.projectName.setValue(this.selectedProject.name);
      this.customerName.setValue(this.selectedProject.customerName);
      this.projectReference.setValue(this.selectedProject.projectReference);
      this.customerLocation.setValue(this.selectedProject.customerLocation);
      this.quoteReference.setValue(this.selectedProject.quoteReference);
      this.created.setValue(this.selectedProject.created);
      setTimeout(() => {
        this.industryEnum.setValue(this.selectedProject.industryEnum.toString());
        this.enableFormInputControls();
        this.projectsForm.markAsPristine();
        this.hasUnsavedDataChanges = false;
        this.editingProject = false;
      }, 100);
      

    } else {

      // Clear and disable UI form controls
      this.selectedProject = new Project();
      this.projectName.setValue("");
      this.customerName.setValue("");
      this.projectReference.setValue("");
      this.customerLocation.setValue("");
      this.quoteReference.setValue("");
      this.tradeEnum.setValue("-1");
      this.industryEnumerationName = this.sharedService.getIndustryEnumNameForProvidedTrade("-1"); // setup the Industry Enumeration based on selected Trade Enumeration value.      
      this.created.setValue(new Date().toLocaleDateString());

      this.disableFormInputControls();
    }

    // Set UI selected item
    this.selected.splice(0, this.selected.length);
    this.selected.push(this.selectedProject);

    this.projectsForm.markAsPristine();
    this.hasUnsavedDataChanges = false; // reset flags
    this.editingProject = false; // Important to set this here!

  }

  /**
   * Disable the Form input Controls
   */
  disableFormInputControls() {
    this.projectName.disable();
    this.customerName.disable();
    this.projectReference.disable();
    this.customerLocation.disable();
    this.quoteReference.disable();
    this.tradeEnum.disable();
    this.industryEnum.disable();
    this.created.disable();
  }

  /**
   * Enable the Form input Controls
   */
  enableFormInputControls() {
    this.projectName.enable();
    this.customerName.enable();
    this.projectReference.enable();
    this.customerLocation.enable();
    this.quoteReference.enable();
    this.tradeEnum.enable();
    this.industryEnum.enable();
    this.created.enable();
  }

  /**
 * Add New Project Setup
 */
  newProject(): void {
    console.log("newProject()");

    // block new if already have a new project or
    // ToDo: block an edited project
    if (this.editingProject) {

      console.log("blocked, already editingProject...");
      return;
    }

    let newProject: Project = new Project();
    newProject.jobs = [];
    newProject.id = "";
    newProject.tradeEnum = 8;
    newProject.industryEnum = 8;

    if (!this.projectsAndJobsBackingData.projects) {
      this.projectsAndJobsBackingData.projects = [];
    }

    this.projectsAndJobsBackingData.projects.push(newProject);
    this.projects.push(newProject);

    this.selectedProjectIndex = this.projects.length - 1;
    this.setupCleanSelectedProject(this.selectedProjectIndex); // also sets editingProject = false 
    
    this.projectNameInput.nativeElement.focus();

    //this.cdRef.detectChanges();
    this.editingProject = true; // Set last for correct editing mode!

    //debugger;
    //this.cdRef.detectChanges();
  }

  /**
   * Cancel data edits for newly added project or revert any UI edits.
   */
  cancelEditsForProject(): void {
    console.log("cancelEditsForProject()");

    //ToDo: Any edits? warn user before data purge.
    //this.editingProject = true;
    this.editingProject = false;

    //debugger;
    ////this.cdRef.detectChanges();

    if (!this.selectedProject.id || this.selectedProject.id.toString() === "") {//this.editingProject) {
      // Remove edited new project
      console.log("Canceled new project edits!");
      this.projectsAndJobsBackingData.projects.pop();
      this.projects.pop();
      this.selectedProjectIndex = 0;
      this.setupCleanSelectedProject(this.selectedProjectIndex);
    }
    else if (this.projectsForm.dirty) {
      // Cancel/revert existing edited Project data
      this.setupCleanSelectedProject(this.selectedProjectIndex);
    }
    //this.editingProject = true; 
    //this.editingProject = false;

  }

  /**
   * Checks and Submits the form for saving to the server.
   */
  checkProjectNameDuplication(projectName, projectId) {
    console.log("checkProjectNameDuplication()")
    if (this.projectsAndJobsBackingData.projects.find(x => x.name === projectName && projectId ==='')) {

      const title = this.translatePipe.transform('DUPLICATE_PROJECT_NAME', false);
      const text = this.translatePipe.transform('A_PROJECT_WITH_THE_SAME_NAME_ALREADY_EXISTS_CLICK_YES_TO_SAVE_ANYWAY_OR_NO_TO_CHANGE_THE_NAME_OF_THE_PROJECT_YOU_ARE_SAVING_MESSAGE', false);
      

      const saveDuplicateProject = this.translatePipe.transform('YES', true);
      const noButtonText = this.translatePipe.transform('NO',true);

      return swal({
        title: title,
        text: text,
        icon: "warning",
        dangerMode: true,
        buttons: [saveDuplicateProject, noButtonText]
      }).then((discardChanges?: boolean) => {

        // The parameter can also enter as null
        const returnVal = !(discardChanges === null);

        if (!returnVal) {
          // Go ahead and save anyway
          console.log("Saving Project with duplicated name.")
          this.updateInsertProject();
        }

      });
    }
    else {

      this.updateInsertProject();
    }
  }
 
  updateInsertProject() {
    console.log(`updateInsertProject`);

    // Mark the form as submitted.
    this.formSubmitted = true;
    this.getProjectFormData();

    // Save project data, Insert or Update?
    if (this.selectedProject.id === "") {

      this.projectsJobsService.insertProject(this.selectedProject).subscribe(insertedProjectData => {

        this.selectedProject = insertedProjectData.project;
        if (!this.selectedProject.jobs) { this.selectedProject.jobs = []; }

        this.projectsAndJobsBackingData.projects[this.projectsAndJobsBackingData.projects.length - 1] = this.selectedProject; // update inserted project data
        this.projects[this.selectedProjectIndex] = this.selectedProject; // change UI row data

        // Refresh UI grid
        this.table.rows = this.projects;
        // Select page
        this.table.offset = this.selectedProjectIndex / this.table.limit;

        // The form can be submitted again.
        this.formSubmitted = false;

        // Set the operation based on the response.
        this.isSuccess = insertedProjectData.succeeded;
        this.alertVisible = true;
        this.editingProject = false;

        //debugger;
        ////this.cdRef.detectChanges();

        // Select last/newly added project
        this.setupCleanSelectedProject(this.projects.length - 1);        
        this.projectsJobsService.signalProjectsAndJobsDataHasChanged(this.projectsAndJobsBackingData); // send change event to all subject subcribers
      });

    } else {
      this.projectsJobsService.updateProject(this.selectedProject).subscribe((updatedProjectData) => {

        // Preserve any existing job data
        let preservedJobs: Job[] = this.cloneDeep(this.selectedProject.jobs);

        this.selectedProject = updatedProjectData.project;
        this.selectedProject.jobs = preservedJobs;

        this.projectsAndJobsBackingData.projects[this.selectedProjectIndex] = this.selectedProject; // set the changed data to the master projects data
        this.projects[this.selectedProjectIndex] = this.selectedProject; // change UI row data

        // Refresh UI grid
        this.table.rows = this.projects;
        // Select page
        this.table.offset = this.selectedProjectIndex / this.table.limit;

        // The form can be submitted again.
        this.formSubmitted = false;

        // Set the operation based on the response.
        this.isSuccess = updatedProjectData.succeeded;
        this.alertVisible = true;

        this.setupCleanSelectedProject(this.selectedProjectIndex);
        this.projectsJobsService.signalProjectsAndJobsDataHasChanged(this.projectsAndJobsBackingData); // send change event to all subject subcribers

        //this.editingProject = true; // toggle to force change
        this.editingProject = false;

        //debugger;
        ////this.cdRef.detectChanges();
      });
    }
  }

  /**
   * Delete currently selected project
   */
  deleteProject(): void {
    console.log("deleteProject()");

    //Both of these if statements below prevent the project from being deleted.
    //Commented out in order to fix issue 3838.
    //Confirmation box for when user deletes.

    //if (!this.selectedProject.id) {
    //  console.log("deleteProject() but no project id? Do nothing.");
    //  return;
    //}

    // ToDo: Test jobs exist, delete all jobs or let user delete them first?
    //if (!this.selectedProject.jobs || this.selectedProject.jobs.length > 0) {
    //  console.log("deleteProject() but jobs exist? Do nothing.");
    //  return;
    //}

    this.projectsJobsService.deleteProject(this.selectedProject).subscribe((response: boolean) => {
      if (response) {

        let indexToDelete = this.projects.indexOf(this.selectedProject);

        // ToDo: Delete project from UI, move to first/previous/blank project?
        // Removeproject from list
        this.projectsAndJobsBackingData.projects.splice(indexToDelete, 1);

        // Refresh UI grid
        this.table.rows = this.projects.splice(indexToDelete, 1);
        // Select page
        this.table.offset = this.selectedProjectIndex / this.table.limit;

        if (this.projectsAndJobsBackingData.projects.length > 0 ||
          this.projectsAndJobsBackingData.projects.length <= this.selectedProjectIndex) {
          if (this.projectsAndJobsBackingData.projects.length <= this.selectedProjectIndex
          ) { // if we deleted the last project
            this.selectedProjectIndex = this.projectsAndJobsBackingData.projects.length - 1;
          }
        } else {
          this.selectedProjectIndex = -1;
        }
 
        // The form can be submitted again.
        this.formSubmitted = false;
        //this.alertVisible = true;
        this.editingProject = false;

        //debugger;
        ////this.cdRef.detectChanges();        

        this.setupCleanSelectedProject(this.selectedProjectIndex);
        this.projectsJobsService.signalProjectsAndJobsDataHasChanged(this.projectsAndJobsBackingData); // send change event to all subject subcribers
      } else {
        //failed!
      }
    });
  }

  /**
   * Set th Industrial Enumeration Name dependant on the selected Trade Enumeration definition. (switch to new list)
   */
  handleTradeEnumChanging(event: string) {
    console.info(`TradeEnum change notified, event:${event}`);

    // Load the corresponding Industry Enumeration list into the <Enumeration> control
    this.sharedService.getIndustryEnumNameForProvidedTrade(event);
  }

  /**
   * Load next project in the UI project data (respecting sort order)
   */
  loadNextProject(): void {
    console.log("loadNextProject()");

    if (this.selectedProjectIndex < this.projects.length - 1) {
      this.setupCleanSelectedProject(this.projects.indexOf(this.selectedProject) + 1);
      // Refresh UI grid
      this.table.rows = this.projects;
      // Select page
      this.table.offset = this.selectedProjectIndex / this.table.limit;
    }

  }


  /**
   * Load previous project in the UI project data (respecting sort order)
   */
  loadPreviousProject(): void {
    console.log("loadPreviousProject()");
    if (this.selectedProjectIndex > 0) {
      this.setupCleanSelectedProject(this.projects.indexOf(this.selectedProject) - 1);
      // Refresh UI grid
      this.table.rows = this.projects;
      // Select page
      this.table.offset = this.selectedProjectIndex / this.table.limit;
    }
  }

  /**
   * Data table selection changed
   */
  onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);

    // If editingProject/changing data then don't move away from the currently selected project
    if (this.editingProject || this.editingJob || this.projectsForm.dirty) {
      selected = this.selectedProject;
      // Refresh UI grid
      this.table.rows = this.projects;
      // Select page
      this.table.offset = this.selectedProjectIndex / this.table.limit;

      return;
    }

    if (!this.editingProject && !this.editingJob && !this.projectsForm.dirty) {
      this.setupCleanSelectedProject(this.projects.indexOf(selected[0])); // also sets the Selected project array
    }
  }

  /**
   * Data table events
   */
  onActivate(event) {
    //console.log('Activate Event', event);

    // If editingProject/changing data then don't move away from the currently selected project
    if (this.editingProject || this.editingJob  || this.projectsForm.dirty) {
      // Refresh UI grid
      this.table.rows = this.projects;
      // Select page
      this.table.offset = this.selectedProjectIndex / this.table.limit;

      return;
    }

    // handle arrow key change for selected project
    if (event.type === "keydown" && event.event.code === "ArrowDown") {
      this.loadNextProject();
    }
    if (event.type === "keydown" && event.event.code === "ArrowUp") {
      this.loadPreviousProject();
    }
  }

  public onDeactivate(componentRef: IGenericChanges) {
    console.info(`Deactivating`);
  }


  /**
   * Handle paging
   * @param $event The page event.
   */
  onPage(event) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      console.log('paged!', event);
    }, 100);

    // If editingProject/changing data then don't move away from the currently selected project
    if (this.editingProject || this.editingJob || this.projectsForm.dirty) {
      // Refresh UI grid
      this.table.rows = this.projects;
      // Select page
      this.table.offset = this.selectedProjectIndex / this.table.limit;

      return;
    }

    var indexOfPageTopProject = event.pageSize * event.offset;
    this.setupCleanSelectedProject(indexOfPageTopProject);
  }

  private onPaginated(event) {
    //this.table.limit = this._limitNumber;
    this.table.recalculate();
  }

  /**
   * Updates the filteed rows on UI data grid.
   * @param $event The filter event.
   */
  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const rowsFiltered = this.projectsAndJobsBackingData.projects.filter(function (d) {

      // Test if the Name  is like the filter text
      if (!!d.name) {
        if (d.name.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        }
      }
      if (!!d.projectReference) {
        if (d.projectReference.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        }
      }
      if (!!d.quoteReference) {
        if (d.quoteReference.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        }
      }
      if (!!d.customerName) {
        if (d.customerName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        }
      }
      if (!!d.customerLocation) {
        if (d.customerLocation.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        }
      }

    });

    // update the rows
    this.projects = rowsFiltered;

    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
    this.selectedProjectIndex = 0;
    this.setupCleanSelectedProject(this.selectedProjectIndex);
  }

  /**
   * Get the Project data Form the input Controls
   */
  getProjectFormData(): void {

    const projectName = this.projectsForm.controls["projectName"];
    this.selectedProject.name = projectName.value;

    const customerName = this.projectsForm.controls["customerName"];
    this.selectedProject.customerName = customerName.value;

    const projectReference = this.projectsForm.controls["projectReference"];
    this.selectedProject.projectReference = projectReference.value;

    const customerLocation = this.projectsForm.controls["customerLocation"];
    this.selectedProject.customerLocation = customerLocation.value;

    const quoteReference = this.projectsForm.controls["quoteReference"];
    this.selectedProject.quoteReference = quoteReference.value;

    const tradeEnum = this.projectsForm.controls["tradeEnum"];
    this.selectedProject.tradeEnum = tradeEnum.value;

    const industryEnum = this.projectsForm.controls["industryEnum"];
    this.selectedProject.industryEnum = industryEnum.value;

    if (!!this.selectedProject.tradeEnum) {
      // if TradeEnum = 8 (None) the IndustryEnum must also be 8 (None)
      if (this.selectedProject.tradeEnum.toString() === "8" || this.selectedProject.industryEnum.toString() === "") {
        this.selectedProject.industryEnum = 8;
      }
    }
  }

  /**
  * Event that is called when the selected trade value is changed.
  * @param selectedValue The selected Trade value.
  */
  onTradeChange(event: any) {

    const industry = this.sharedService.getIndustryEnumNameForProvidedTrade(event.selectedValue);

    if (this.industryEnumerationName !== industry) {

     // Set an initial value for the industry enum form value
     this.projectsForm.controls["industryEnum"].setValue(null);

     this.industryEnumerationName = industry;
    }
  }

  closeAlert(): void {
    // Reset the flag
    this.alertVisible = false;
  }


  public modalCallbackCancel() {
    console.log("Modal cancel button, do nothing!");
  }

  public modalCallbackOk() {
    console.log("Oh look, it's OK'd without this function calling anything!!");
  }


  getProjectsAndJobsSyncInfo() {
    // Only get P&J sync info if this is a client implmentation
    if (!this.authenticationService.authenticatedUser.clientMode) {
      return;
    }

    this.syncClientService.projectsAndJobsSyncInfo().subscribe(
      (projectsAndJobsSyncInfoResponse: ProjectsAndJobsSyncInfoModel) => {

        if (!!projectsAndJobsSyncInfoResponse && projectsAndJobsSyncInfoResponse.isSuccessful) {
          this.projectsAndJobsSyncInfo = projectsAndJobsSyncInfoResponse;
          this.hasUnsavedDataChanges = false; // reset flags
        } else {
          // ToDo: sync failed!
          //this.handleSyncFailure();
        }
      },
      // Error callback
      err => {
        // ToDo: sync failed!
        console.log(err.error);
        //this.handleSyncFailure();
      });
  }
}
