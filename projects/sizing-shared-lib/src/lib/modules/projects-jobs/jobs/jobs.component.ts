import { Component, ViewChild, Input, Output, OnInit, ElementRef, EventEmitter, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ProjectsJobsService } from "./../projects-jobs.service";
import { Project, Job, JobStatus } from "./../projects-jobs.model";

import { Validators } from '@angular/forms';

import { DatatableComponent } from '@swimlane/ngx-datatable';
import { TranslatePipe } from "../../../shared/translation/translate.pipe";
import { MenuService } from "../../../core/menu/menu.service";
import { ModuleGroup, ModuleListItem } from "../../admin/module-group.model";
import { LayoutService } from "../../../layout/layout.service";

import { ChangeDetectorRef } from '@angular/core';
import * as cloneDeep_ from 'lodash/cloneDeep';

declare var swal: any;

@Component({
  selector: 'jobs',
  exportAs: 'jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {
  @Output('editingJobDataOnChange') editingJobDataOnChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  public cloneDeep = cloneDeep_;
  private _selectedProjectId: string;
  @Input('selectedProjectId')
  get selectedProjectId(): string {
    return this._selectedProjectId;
  }
  set selectedProjectId(selectedProjectId: string) {
    console.log('JobsComponent set selectedProjectId() prev value: ', this._selectedProjectId);

    // Set selectedProjectId and use subjects job data:
    // If(not editing a Job) or(not editing a project) or(editing a job AND editing a project),
    // which seems odd but is a required condition for empty projects.
    if ((!this.editingJob || !this.editingProject) || (this.editingJob && this.editingProject)) { 
      console.log('JobsComponent set selectedProjectId() got selectedProjectId: ', selectedProjectId);
      this._selectedProjectId = selectedProjectId;
      this.selectedJobIndex = 0;
      this.getSubjectUpdatedJobsData();
    }
  }

  private _editingProject: boolean;
  @Input('editingProject')
  get editingProject(): boolean {
    return this._editingProject;
  }
  set editingProject(editingProject: boolean) {
    console.log('JobsComponent set editingProject() prev value: ', this._editingProject);
    console.log('JobsComponent set editingProject() got editingProject: ', editingProject);
    this._editingProject = editingProject;
    ////this.cdRef.detectChanges();

    if (this.editingProject || this.editingJob || this.jobsForm.dirty || (!this.selectedProjectId)
      || (!!this.jobs && this.jobs.length < 1)) {
      this.disableFormInputControls();
    } else {
      this.enableFormInputControls();
    }
  }

  private _editingJob: boolean = false;
  get editingJob(): boolean { return this._editingJob || this._editingProject; }
  set editingJob(editingJob: boolean) {
    this._editingJob = editingJob;
    this.editingJobDataOnChange.emit(editingJob);
  }

  @ViewChild(DatatableComponent, { static: false })
  @ViewChild('jobsTable', { static: false }) table: DatatableComponent;

  @ViewChild('jobName', { static: false }) jobNameInput: ElementRef;
  tableExp: any;

  get jobsBackingData(): Job[] {
    if (!!this.selectedProjectId) {
      let project: Project = this.projectsJobsService.projectsJobs.projects.find(p => p.id === this.selectedProjectId);

      if (!!project && !!project.jobs) {
        return this.projectsJobsService.projectsJobs.projects.find(p => p.id === this.selectedProjectId).jobs;
      } else { // couldn't find the project, no jobs defined        
        return [];
      }
    } else {
      this.jobs = []; // project does not exist, create empty jobs array
      return this.jobs;
    }
  }

  set jobsBackingData(jobs: Job[]) {
    this.projectsJobsService.projectsJobs.projects.find(p => p.id === this.selectedProjectId).jobs = jobs;

    // Assign the new users to the subject.
    this.projectsJobsService.projectJobsChange.next(this.projectsJobsService.projectsJobs);
  }

  timeout: any;

  projects: Project[] = [];
  jobs: Job[] = [];
  selectedJob: Job = new Job();
  selectedJobIndex: number = 0;

  accessibleModules: ModuleGroup[] = [];

  jobsForm: FormGroup;
  jobName: FormControl;
  customerName: FormControl;
  plantOwner: FormControl;
  moduleId: FormControl;
  jobStatusId: FormControl;
  productName: FormControl;
  created: FormControl;
  jobStatuses: JobStatus[] = [];
  jobStatus: JobStatus = new JobStatus();

  areJobsLoaded: boolean = false;
  isSuccess: boolean = false;
  alertVisible: boolean = false;
  formSubmitted: boolean = false;  
  rowsSel = [];
  selected = [];

  moduleGroupsForUser: ModuleGroup[] = [];
  availableModuleListItems: ModuleListItem[] = [];
  jobHasModuleAccess: boolean = false;

  constructor(
    private layoutService: LayoutService,
    private menuService: MenuService,
    private router: Router,
    private projectsJobsService: ProjectsJobsService,
    private fb: FormBuilder,
    public translatePipe: TranslatePipe,
    private cdRef: ChangeDetectorRef) {

    // Initialise Form controls
    this.jobName = new FormControl('', [Validators.required]);
    this.customerName = new FormControl('');
    this.plantOwner = new FormControl('');    
    this.moduleId = new FormControl('', [Validators.required]);
    this.jobStatusId = new FormControl('');
    this.productName = new FormControl('');
    this.created = new FormControl('');

    // Initialise Form Group
    this.jobsForm = this.fb.group({
        jobName: this.jobName,
        customerName: this.customerName,
        plantOwner: this.plantOwner,        
        moduleId: this.moduleId,
        jobStatusId: this.jobStatusId,
        productName: this.productName,
        created: this.created,

      },
      { updateOn: "change" });

    // Listen to jobsForm isDirty changes to signal parent via event emitter that this component is in 'edit' mode.
    // This is the current mechanism for detecting a user has edited the form, otherwise we need a button to enter edit mode.
    this.jobsForm.valueChanges.subscribe((value: any) => {
      if (this.jobsForm.dirty && !this.jobName.disabled && !this.editingJob) {
        console.log('jobsForm dirty - yes: ', value);
        this.editingJobDataOnChange.emit(true);     
      }
    });
  }

  ngOnInit() {
    this.getJobsData(); // first get data

    // Call the service for module groups and module
    this.layoutService.getModuleGroupsForUser().subscribe(() => {
      // Filter the menu items so that only the assigned modules are shown.
      //const sizingModuleMenuItems = menu.getMenu().filter(mu => mu.isSidebarNav === true && this.userModuleGroups.findIndex(moduleGroup => moduleGroup.masterTextKey === mu.text) > -1);

      this.moduleGroupsForUser = this.cloneDeep(this.layoutService.userModuleGroups);

      // User Data Sync not happened or the user is not setup correctly
      if (!!this.moduleGroupsForUser) {
        // Build internal moduleGroup combined with modules for the UI list binding
        this.moduleGroupsForUser.forEach(mg => {

          mg.modules.forEach(m => {
            let moduleListItem: ModuleListItem =
            {
              moduleGroupId: m.moduleGroupId,
              moduleGroupMasterTextKey: mg.masterTextKey,
              moduleId: m.id,
              moduleMasterTextKey: m.masterTextKey
            };
            this.availableModuleListItems.push(moduleListItem);
          });
        });
      }

      // Is this moduleId for this Job accessible?
      if (!!this.selectedJob && !!this.selectedJob.moduleId) {
        this.jobHasModuleAccess = (!!this.availableModuleListItems.find(m => m.moduleId === this.selectedJob.moduleId) || !this.selectedJob.moduleId) ? true : false;
      }
    }); // end of getModuleGroupsForUser().subscribe

    this.projectsJobsService.getAllJobStatuses().subscribe(data => {
      this.jobStatuses = data.jobStatuses;
    });

    // subject subscription, update as service data has changed (probably changed in memory)
    this.projectsJobsService.projectJobsChange.subscribe(() => {
      this.getSubjectUpdatedJobsData();
    });
  }

  getJobsData(): void {

    // Avoid double call for P&J data. The parent component has already called for the data.
    this.areJobsLoaded = true;

    //this.areJobsLoaded = false;
    //this.projectsJobsService.getProjectsAndJobs().subscribe(() => {
    //  // Inform the view that areProjectsAndJobs are now loaded.
    //  this.areJobsLoaded = true;
    //  this.selectedJobIndex = 0;
    //});
  }

  getSubjectUpdatedJobsData(): void {

    this.jobs = this.cloneDeep(this.jobsBackingData);

    if (!this.jobsBackingData) {
      this.jobsBackingData = [];
    }
    if (!this.jobs) {
      this.jobs = [];
    }

    // Inform the view that areProjectsAndJobs are now loaded.
    this.areJobsLoaded = true;

    this.setupCleanSelectedJob(this.selectedJobIndex);
  }

  /**
   * Set the form controls for the currently selected job
   */
  setupCleanSelectedJob(jobIndex: number) {

    if (!this.areJobsLoaded && !this.editingJob && !this.jobsForm.dirty) {
      return;
    }

    this.selectedJobIndex = jobIndex;

    this.jobsForm.reset();

    // Set requested job on the form control, if it exists.
    if (!!this.jobs && !!this.jobs[jobIndex] && jobIndex > -1) {
      this.enableFormInputControls();

      this.selectedJob = this.jobs[jobIndex];
      this.jobName.setValue(this.selectedJob.name);
      this.plantOwner.setValue(this.selectedJob.plantOwner);
      this.moduleId.setValue(this.selectedJob.moduleId);
      this.jobStatusId.setValue(this.selectedJob.jobStatusId);
      this.productName.setValue(this.selectedJob.productName);
      this.created.setValue(this.selectedJob.created);

      if (!!this.jobStatuses && this.jobStatuses.length > 0 && this.selectedJob.jobStatusId > 0) {
        //Setup Job Status
        this.jobStatus = this.jobStatuses.find(s => s.id === this.selectedJob.jobStatusId);
      }

    } else {

      this.disableFormInputControls();
      // Clear and disable UI form controls
      this.selectedJob = new Job();
      this.jobName.setValue("");
      this.customerName.setValue("");
      this.plantOwner.setValue("");      
      this.moduleId.setValue("");
      this.jobStatusId.setValue("");
      this.productName.setValue("");
      this.created.setValue(new Date().toLocaleDateString());
      
    }

    // Is this moduleId for this Job accessible?
    this.jobHasModuleAccess = (!!this.availableModuleListItems.find(m => m.moduleId === this.selectedJob.moduleId) || !this.selectedJob.moduleId) ? true : false;

    // Set UI selected item  //if (!!this.selected && this.selected.length > 0) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(this.selectedJob);
    

    this.jobsForm.markAsPristine();
    this.editingJob = false; // Important to set this here!
  }

  /**
   * Disable the Form input Controls
   */
  disableFormInputControls() {
    this.jobName.disable();
    this.customerName.disable();
    this.plantOwner.disable();
    this.productName.disable();
    this.created.disable();

    this.moduleId.disable(); // normally not editable unless creating a new job 
    this.jobStatusId.disable(); // always readonly
  } 

  /**
   * Enable the Form input Controls
   */
  enableFormInputControls() {
    this.jobName.enable();
    this.customerName.enable();
    this.plantOwner.enable();
    this.productName.enable();
    this.created.enable();

    this.moduleId.disable();
    this.jobStatusId.disable();
  }
  
  /**
   * Add New job Setup
   */
  newJob(): void {
    console.log("newJob()");

    // block new if already have a new job or
    // ToDo: block an edited job
    if (this.editingJob) { //!this.selectedJob.id || this.selectedJob.id.toString() === "") {

      console.log("blocked, already editingJob...");
      return;
    }
     
    let newJob: Job = new Job();
    newJob.id = "";
    newJob.projectId = this.selectedProjectId;
    newJob.jobStatusId = 1;    

    if (!this.jobsBackingData) {
      this.jobsBackingData = [];
    }
    if (!this.jobs) {
      this.jobs = [];
    }

    this.jobsBackingData.push(newJob);
    this.jobs.push(newJob);

    this.selectedJobIndex = this.jobs.length - 1;
    this.setupCleanSelectedJob(this.selectedJobIndex); // also sets editingJob = false 

    this.jobNameInput.nativeElement.focus();

    this.editingJob = true;

    // enable module selection list change
    this.moduleId.enable();
  }

  /**
   * Cancel data edits for newly added job or revert any UI edits.
   */
  cancelEditsForJob(): void {
    console.log("cancelEditsForJob()");

    //ToDo: Any edits? warn user before data purge.

    if (this.editingJob) {
      // Remove edited new job
      console.log("Canceled new job edits!");
      this.jobsBackingData.pop();
      this.jobs.pop();
      this.selectedJobIndex = 0;
      this.setupCleanSelectedJob(this.selectedJobIndex);
    } else if (this.jobsForm.dirty) {
      // Cancel/revert Edited Job data
      this.setupCleanSelectedJob(this.selectedJobIndex);
    }

    // set page
    this.table.offset = this.selectedJobIndex / this.table.limit;

    this.editingJob = false;
  }

  /**
   * Checks and Submits the form for saving to the server.
   */
  checkJobNameDuplication(newJobName, jobId) {
    console.log("checkJobNameDuplication()")
    if (this.jobsBackingData.find(x => x.name === newJobName && jobId === '')) {

      const title = this.translatePipe.transform('DUPLICATE_JOB_NAME', false); 
      const text = this.translatePipe.transform('A_JOB_WITH_THE_SAME_NAME_EXISTS_IN_THIS_PROJECT_CLICK_YES_TO_SAVE_ANYWAY_OR_NO_TO_CHANGE_THE_NAME_OF_THE_JOB_YOU_ARE_SAVING_MESSAGE', false); 

      const saveDuplicateProject = this.translatePipe.transform("YES", true);
      const cancelButtonText = this.translatePipe.transform("NO", true);

      return swal({
        title: title,
        text: text,
        icon: "warning",
        dangerMode: true,
        buttons: [saveDuplicateProject, cancelButtonText]
      }).then((discardChanges?: boolean) => {

        // The parameter can also enter as null
        const returnVal = !(discardChanges === null);

        if (!returnVal) {
          // Go ahead and save anyway
          console.log("Saving Job with duplicated name.")
          this.updateInsertJob();
        }

      });
    }
    else {

      this.updateInsertJob();
    }
  }

  updateInsertJob() {
    console.log(`updateInsertJob`);

    // Mark the form as submitted.
    this.formSubmitted = true;
    this.getProjectFormData();

      // Save job data, Insert or Update?
    if (this.selectedJob.id === "") {

       this.projectsJobsService.insertJob(this.selectedJob).subscribe(insertedJobData => {

          this.selectedJob = insertedJobData.job;

          this.jobsBackingData[this.jobsBackingData.length - 1] = this.selectedJob; // update inserted job data  
          this.jobs[this.selectedJobIndex] = this.selectedJob; // change UI row data

          // Refresh UI grid
          this.table.rows = this.jobs;
          // set page
          this.table.offset = this.selectedJobIndex / this.table.limit;

          // The form can be submitted again.
          this.formSubmitted = false;

          // Set the operation based on the response.
          this.isSuccess = insertedJobData.succeeded;
          this.alertVisible = true;
          this.editingJob = false;

          // Select last/newly added job
          this.setupCleanSelectedJob(this.jobs.length - 1);
          this.projectsJobsService.signalProjectsAndJobsDataHasChanged(this.projectsJobsService.projectsJobs); // send change event to all subject subcribers

       });

    }
    else {

       this.projectsJobsService.updateJob(this.selectedJob).subscribe((updatedJobData) => {

         this.selectedJob = updatedJobData.job;

         this.jobsBackingData[this.selectedJobIndex] = this.selectedJob; // send change event to all subject subcribers
         this.jobs[this.selectedJobIndex] = this.selectedJob; // change UI row data

         // Refresh UI grid
         this.table.rows = this.jobs;
         // set page
         this.table.offset = this.selectedJobIndex / this.table.limit;


         // The form can be submitted again.
         this.formSubmitted = false;

         // Set the operation based on the response.
         this.isSuccess = updatedJobData.succeeded;
         this.alertVisible = true;
         this.setupCleanSelectedJob(this.selectedJobIndex);
         this.projectsJobsService.signalProjectsAndJobsDataHasChanged(this.projectsJobsService.projectsJobs); // send change event to all subject subcribers

         //this.editingJob = true; // toggle to force change
         this.editingJob = false;

       });
    }
  }

  /**
   * Delete currently selected job
   */
  deleteJob(): void {
    console.log("deleteJob()");

    if (!this.selectedJob.id) {
      console.log("deleteJob() but no job id? Do nothing.");
      return;
    }


    this.projectsJobsService.deleteJob(this.selectedJob).subscribe((response: boolean) => {

      if (response) {

        let indexToDelete = this.jobs.indexOf(this.selectedJob);

        // ToDo: Delete job from UI, move to first/previous/blank job?
        // Removeproject from list
        this.jobsBackingData.splice(indexToDelete, 1);
        this.projects.splice(indexToDelete, 1);

        // Refresh UI grid
        this.table.rows = this.projects;
        // Select page
        this.table.offset = this.selectedJobIndex / this.table.limit;

        if (this.jobsBackingData.length > 0 ||
          this.jobsBackingData.length <= this.selectedJobIndex) {
          if (this.jobsBackingData.length <= this.selectedJobIndex)
          { // if we deleted the last project
            this.selectedJobIndex = this.jobsBackingData.length - 1;
          }
        } else {
          this.selectedJobIndex = -1;
        }
        
        this.setupCleanSelectedJob(this.selectedJobIndex);

        // The form can be submitted again.
        this.formSubmitted = false; 
        this.editingJob = false;
        //this.alertVisible = true;

        this.projectsJobsService.signalProjectsAndJobsDataHasChanged(this.projectsJobsService.projectsJobs); // send change event to all subject subcribers
      } else {
        //failed!
      }
    });
  }


  /**
 * Open currently selected job
 */
  openJob(): void {
    console.log("openJob()");

    if (!this.selectedJob.id) {
      console.log("openJob() but no job id? Do nothing.");
      return;
    }

    let moduleGroupNameMasterKeyText: string;

    if (!!this.availableModuleListItems.find(m => m.moduleId === this.selectedJob.moduleId))
    {
      moduleGroupNameMasterKeyText = this.availableModuleListItems.find(m => m.moduleId === this.selectedJob.moduleId).moduleGroupMasterTextKey;
      const url = this.menuService.menuItems.find(mu => mu.text === moduleGroupNameMasterKeyText).link;

      // ToDo: note that when navigating like this, we loose the Title layout translation of the sizing module.
      // Plus params are lost and undefine in the sizing module for the ActiveRoute.
      //this.router.navigate([url], { queryParams: { projectId: this.selectedJob.projectId, jobId: this.selectedJob.id } });

      this.router.navigate([url, this.selectedJob.projectId, this.selectedJob.id]);

    }
    else
    {
      // Please select a module ofr this job!
      // or User doesn't have module access.

      //Todo: Raise UI error.
    }

    
  }

  /**
   * Load next job in the UI job data (respecting sort order)
   */
  loadNextJob(): void {
    console.log("loadNextJob()");

    if (this.selectedJobIndex < this.jobs.length - 1) {
      this.setupCleanSelectedJob(this.jobs.indexOf(this.selectedJob) + 1);
      // Refresh UI grid
      this.table.rows = this.jobs;
      // set page
      this.table.offset = this.selectedJobIndex / this.table.limit;

    }
  }

  /**
   * Load previous job in the UI job data (respecting sort order)
   */
  loadPreviousJob(): void {
    console.log("loadPreviousJob()");
    if (this.selectedJobIndex > 0) {
      this.setupCleanSelectedJob(this.jobs.indexOf(this.selectedJob) - 1);
      // Refresh UI grid
      this.table.rows = this.jobs;
      // set page
      this.table.offset = this.selectedJobIndex / this.table.limit;

    }
  }

  /**
   * Data table selection changed
   */
  onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);

    // If editingJob/changing data then don't move away from the currently selected job
    if (this.editingJob || this.jobsForm.dirty) {
      selected = this.selectedJob;
      // Refresh UI grid
      this.table.rows = this.jobs;
      // set page
      this.table.offset = this.selectedJobIndex / this.table.limit;

      return;
    }

    if (!this.editingJob && !this.jobsForm.dirty) {
      this.setupCleanSelectedJob(this.jobs.indexOf(selected[0])); // also sets the Slected job array
    }
  }

  /**
   * Data table events
   */
  onActivate(event) {
    //console.log('Activate Event', event);

    // If editingJob/changing data then don't move away from the currently selected job
    if (this.editingJob || this.jobsForm.dirty) {
      // Refresh UI grid
      this.table.rows = this.jobs;
      // set page
      this.table.offset = this.selectedJobIndex / this.table.limit;

      return;
    }

    // handle arrow key change for selected job
    if (event.type === "keydown" && event.event.code === "ArrowDown") {
      this.loadNextJob();
    }
    if (event.type === "keydown" && event.event.code === "ArrowUp") {
      this.loadPreviousJob();
    }
  }

  /**
   * Handle paging
   * @param $event The page event.
   */
  onPage(event) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
        console.log('paged!', event);
      },
      100);

    // If editingJob/changing data then don't move away from the currently selected job
    if (this.editingJob || this.jobsForm.dirty) {

      // Refresh UI grid
      this.table.rows = this.jobs;
      // set page
      this.table.offset = this.selectedJobIndex / this.table.limit;

      return;
    }

    var indexOfPageTopJob = event.pageSize * event.offset;
    this.setupCleanSelectedJob(indexOfPageTopJob);
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
    const rowsFiltered = this.jobsBackingData.filter(function(d) {

      // Test if the Name  is like the filter text
      if (!!d.name) {
        if (d.name.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        }
      }
      if (!!d.plantOwner) {
        if (d.plantOwner.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        }
      }
      if (!!d.productName) {
        if (d.productName.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        }
      }

    });

    // update the rows
    this.jobs = rowsFiltered;

    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
    this.selectedJobIndex = 0;
    this.setupCleanSelectedJob(this.selectedJobIndex);
  }

  /**
 * Get the job data Form the input Controls
 */
  getProjectFormData(): void {

    const jobName = this.jobsForm.controls["jobName"];
    this.selectedJob.name = jobName.value;

    const plantOwner = this.jobsForm.controls["plantOwner"];
    this.selectedJob.plantOwner = plantOwner.value;

    const jobStatusId = this.jobsForm.controls["jobStatusId"];
    this.selectedJob.jobStatusId = jobStatusId.value;

    const moduleId = this.jobsForm.controls["moduleId"];
    this.selectedJob.moduleId = moduleId.value;

  }

  closeAlert(): void {
    // Reset the flag
    this.alertVisible = false;
  }

  debugToggleEnableModuleId(): void {
    if (isDevMode) {
      //This was causing irregular behaviour in ddev and test environment. 
     // if (this.moduleId.enabled) { this.moduleId.disable(); } else { this.jobHasModuleAccess = true; this.moduleId.enable();}
    }
  }

  public modalCallbackCancel() {
    console.log("Modal cancel button, do nothing!");
  }

  public modalCallbackOk() {
    console.log("Oh look, it's OK'd without this function calling anything!!");
  }
}
