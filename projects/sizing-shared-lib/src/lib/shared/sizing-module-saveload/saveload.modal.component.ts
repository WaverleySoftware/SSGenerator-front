import { Component, ViewChild, OnInit } from '@angular/core';

import { SaveLoadService } from "./saveload.modal.service";
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { SaveLoad } from "./saveload.modal.model";
import { Project, Job, ProjectsAndJobs } from "../../modules/projects-jobs/projects-jobs.model";
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ProjectsJobsService } from "../../modules/projects-jobs/projects-jobs.service";


import { TranslatePipe } from "../translation/translate.pipe";

import { Observable } from 'rxjs';

import swal from 'sweetalert';

import { Validators } from '@angular/forms';

@Component({
  selector: 'saveload-modal',
  templateUrl: './saveload.modal.component.html',
  styleUrls: ['./saveload.modal.component.scss']
})
export class SaveLoadModalComponent implements OnInit {

  public nameDuplicate = false;

  public saveLoadForm: FormGroup;

  public parentSubmitIsDisabled = true; // Modal parent container component submit button state (enabled/disabled)
  isExistingProjectDisabled: boolean = false;
  isNewProjectDisabled: boolean = false;

  projectName: FormControl;
  customer: FormControl;
  projectReference: FormControl;
  jobName: FormControl;
  plantOwner: FormControl;
  showHideNewProject: FormControl;
  showHideExistingProject: FormControl;

  existingProjectDataRows: Project[] = [];
  selectedExistingProjectData: Project[] = [];

  @ViewChild("existingProjectDataTable", { static: false }) existingProjectDataTable: DatatableComponent;

  constructor(private saveloadService: SaveLoadService, private fb: FormBuilder, private projectsJobsService: ProjectsJobsService, private translatePipe: TranslatePipe) {

    this.projectName = new FormControl('', [Validators.required]);
    this.customer = new FormControl('');
    this.projectReference = new FormControl('');
    this.jobName = new FormControl('', [Validators.required]);
    this.plantOwner = new FormControl('');

    this.showHideNewProject = new FormControl(false);
    this.showHideExistingProject = new FormControl(false);

    this.saveLoadForm = this.fb.group({
      projectname: this.projectName,
      customer: this.customer,
      projectreference: this.projectReference,
      jobname: this.jobName,
      plantowner: this.plantOwner,
      showHideNewProject: this.showHideNewProject,
      showHideExistingProject: this.showHideExistingProject
      
  });

  }
  
  ngOnInit() {    
    this.saveLoadForm.valueChanges.subscribe(val => {
      this.setSubmitButtonStatus();
    });

    // default to new project mode, quicker for user.
    this.onClickNewProject();
  }

  /*
  * Enable/Disable submit button based on the requird fields validations and projects selection.
  */
  setSubmitButtonStatus() {    
    if ((this.showHideNewProject.value && this.projectName.valid && this.jobName.valid)
      || (this.showHideExistingProject.value && this.jobName.valid && this.selectedExistingProjectData && this.selectedExistingProjectData.length > 0)) {
      this.parentSubmitIsDisabled = false;
    } else {
      this.parentSubmitIsDisabled = true;
    }
  }

  /**
 * Support this method is you require Modal Submit button state handling. ie. disable the submit button if any validation errors exist.
 */
  public checkIfSubmitIsDisabled(): boolean {
    return this.parentSubmitIsDisabled;
  }

  onClickNewProject() {
    
    this.showHideNewProject.setValue(true);
    this.showHideExistingProject.setValue(false);
    this.isExistingProjectDisabled = false;
    this.isNewProjectDisabled = true;

    //need existing project data for name check
    this.projectsJobsService.getProjectsAndJobs().subscribe(() => {
      this.existingProjectDataRows = this.projectsJobsService.projectsJobs.projects;

    });

  }

  onClickExistingProject() {

    this.showHideExistingProject.setValue(true);
    this.showHideNewProject.setValue(false);
    this.isExistingProjectDisabled = true;
    this.isNewProjectDisabled = false;
    
    this.projectsJobsService.getProjectsAndJobs().subscribe(() => {
      this.existingProjectDataRows = this.projectsJobsService.projectsJobs.projects;
      
    });

  }

  onSelect(event: any) {
    
    var selectedRow = event.selected as Project[];
    this.selectedExistingProjectData = selectedRow;

    this.setSubmitButtonStatus();
  }

  /**
   * Callback function that is dynamically called by a modal popup when "Save/Submit/Ok" is clicked.
   */
  modalSubmitCallback(): Promise<Project> { // Project {
    
    let someObservable: Observable<Project> = Observable.of(null);

    let project: Project;
    let projecttest: Project;
    // Saving to a new project
    if (this.showHideNewProject.value === true) {
      
      //check project name
      if (!!this.existingProjectDataRows && this.existingProjectDataRows.find(x => x.name === this.saveLoadForm.controls["projectname"].value)) {
        // name exists - display warning popup

        const title = this.translatePipe.transform("DUPLICATE_PROJECT", true);
        const text = this.translatePipe.transform("A_PROJECT_WITH_THE_SAME_NAME_ALREADY_EXISTS_CLICK_YES_TO_SAVE_ANYWAY_OR_NO_TO_CHANGE_THE_NAME_OF_THE_PROJECT_YOU_ARE_SAVING_MESSAGE", false);

        const saveDuplicateProject = this.translatePipe.transform("YES", true);
        const noButtonText = this.translatePipe.transform("NO", true);

        return swal({
          title: title,
          text: text,
          icon: "warning",
          dangerMode: true,
          buttons: [saveDuplicateProject, noButtonText]
        }).then((discardChanges?: boolean) => {

          // The parameter can also enter as null
          const returnVal = !(discardChanges === null);

          let project: Project = null;

          if (!returnVal) {
            // Go ahead and save anyway
            project = this.createNewProject();
          }

          console.info(`SaveLoad Modal Sweet Alert has resolved. Project ${!!project ? 'exists!' : 'is empty.'}`);

          return project;
        });

      }

      // Go ahead and save anyway.
      someObservable = Observable.of(this.createNewProject());

    } else {
      
      someObservable = Observable.of(this.createFromExistingProject());
    }
   
    return someObservable.toPromise();
  }

  private createFromExistingProject() : Project {
    const project = this.selectedExistingProjectData[0];

    const newJob = this.createNewJob(project);

    project.jobs.push(newJob);
    project.existingProjectSave = true;

    return project;
  }

  private createNewProject(): Project {

    // Create a new project instance.
    const project = new Project();
    project.name = this.saveLoadForm.controls["projectname"].value;
    project.customerName = this.saveLoadForm.controls["customer"].value;
    project.projectReference = this.saveLoadForm.controls["projectreference"].value;

    project.jobs = [];

    const newJob = this.createNewJob(project);

    project.jobs.push(newJob);
    project.existingProjectSave = false;

    return project;
  }

  private createNewJob(project: Project): Job {
   
    const newJob = new Job();
    newJob.projectId = project.id;
    //newJob.moduleId = project.
    newJob.name = this.saveLoadForm.controls["jobname"].value;
    newJob.plantOwner = this.saveLoadForm.controls["plantowner"].value;
    
    return newJob;
  }

  onChange(newValue: string) {
    
  }

  

}
