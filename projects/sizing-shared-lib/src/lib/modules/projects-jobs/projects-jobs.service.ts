import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject, Subscriber } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import { ProjectsAndJobs, Project, Job, ProjectResponse, JobResponse, JobStatusesResponse, GetSizingJobRequest,
  SizingData, JobSizing
} from "./projects-jobs.model";


@Injectable(
 )
export class ProjectsJobsService {

  projectJobsChange: Subject<ProjectsAndJobs> = new Subject<ProjectsAndJobs>();
  private projectsJobsData: ProjectsAndJobs = new ProjectsAndJobs();

  get projectsJobs(): ProjectsAndJobs {
    return this.projectsJobsData;
  }
  set projectsJobs(projectsAndJobs: ProjectsAndJobs) {
    // Assign the new users to the subject.
    this.projectJobsChange.next(projectsAndJobs);
  }
  
  constructor(private http: HttpClient) {
    // When the class in constructed, initialise the subject so that whenever it is called, its subscriber resolves the result to the current projects and Jobss object.
    this.projectJobsChange.subscribe(projectsJobs => {
      this.projectsJobsData = projectsJobs; // subject
    });
  }


  /**
  * Gets the Projects and Jobs for this user.
  */
  getProjectsAndJobs(): Observable<void> {	  
    return this.http.get<ProjectsAndJobs>(`./Api/ProjectsAndJobs/GetProjectsAndJobs/`).map(
      // ToDo: This is hit twice, once from the Projects component and again from Jobs component. Optimise the "Subject" later!
      projectsJobsData => {
        // Assign the new users to the subject.
        this.projectJobsChange.next(projectsJobsData);
      });
  }

  /**
  *  Gets all job Statuses.
  */
  getAllJobStatuses(): Observable<JobStatusesResponse> {   
    return this.http.get<JobStatusesResponse>(`./Api/ProjectsAndJobs/GetAllJobStatuses`);
  }


  /**
  * Signal Data Has Changed, to all subject subscribers. 
  */
  signalProjectsAndJobsDataHasChanged(projectsAndJobs: ProjectsAndJobs) {
    this.projectsJobs = projectsAndJobs; // the setting fires .next on the Angular subject
  }

  /**
 * Insert a Project
 * @param project The Project.
 */
  insertProject(project: Project): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(`./Api/ProjectsAndJobs/InsertProject`, { project: project });
  }

/**
 * insertProjectInToServiceMemoryAndSignalChanges
 * Used in Save/Load from sizing pages
 */
  insertProjectInToServiceMemoryAndSignalChanges(project: Project) {
    if (!project.id) {
      debugger; // invalid data?
      return;
    }

    let newProject: Project = new Project();

    newProject.id = project.id;
    newProject.name = project.name;
    newProject.projectReference = project.projectReference;
    newProject.userId = project.userId;
    newProject.tradeEnum = project.tradeEnum
    newProject.industryEnum = project.industryEnum;
    newProject.customerName = project.customerName;
    newProject.customerLocation = project.customerLocation;
    newProject.quoteReference = project.quoteReference;
    newProject.isDeleted = project.isDeleted;
    newProject.created = project.created;
    newProject.updated = project.updated;
    newProject.jobs = []; // default

    this.projectsJobs[this.projectsJobs.projects.length] = newProject;
    this.signalProjectsAndJobsDataHasChanged(this.projectsJobs);
  }

/**
 * updateProjectInToServiceMemoryAndSignalChanges
 * Used in Save/Load from sizing pages
 */
  updateProjectInToServiceMemoryAndSignalChanges(project: Project) {
    if (!project.id) {
      debugger; // invalid data?
      return;
    }

    let theProjectIndex = this.projectsJobs.projects.findIndex(p => p.id === project.id);

    let updateProject: Project = new Project();
    updateProject = this.projectsJobs.projects[theProjectIndex];
    updateProject.name = project.name;
    updateProject.projectReference = project.projectReference;
    updateProject.tradeEnum = project.tradeEnum;
    updateProject.industryEnum = project.industryEnum;
    updateProject.customerName = project.customerName;
    updateProject.customerLocation = project.customerLocation;
    updateProject.quoteReference = project.quoteReference;
    updateProject.isDeleted = project.isDeleted;
    updateProject.updated = project.updated;
    // FYI:
    //updateProject.id = project.id; should not be changing!
    //updateProject.userId = project.userId; should not be changing!
    //updateProject.created = project.created; should not be changing!
    //updateProject.jobs = project.jobs; should not be changing! use update job methods

    this.projectsJobs[theProjectIndex] = updateProject;  // assign updated project
    this.signalProjectsAndJobsDataHasChanged(this.projectsJobs);  // signal changes
  }

  /**
 * Update a Project
 * @param project The Project.
 */
  updateProject(project: Project): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(`./Api/ProjectsAndJobs/UpdateProject`, { project: project });
  }

 /**
* Delete a Project
* @param project The Project.
*/
  deleteProject(project: Project): Observable<boolean> {
    return this.http.post<boolean>(`./Api/ProjectsAndJobs/DeleteProject`, { project: project });
  }

  /**
* Insert a Job
* @param job The Job.
*/
  insertJob(job: Job): Observable<JobResponse> {
    return this.http.post<JobResponse>(`./Api/ProjectsAndJobs/InsertJob`, { job: job });
  }

  /**
 * Update a Job
 * @param job The Job.
 */ 
  updateJob(job: Job): Observable<JobResponse> {
    return this.http.post<JobResponse>(`./Api/ProjectsAndJobs/UpdateJob`, { job: job });
  }


/**
 * insertJobInToServiceMemoryAndSignalChanges
 * Used in Save/Load from sizing pages
 */
  insertJobInToServiceMemoryAndSignalChanges(job: Job) {
    if (!job.projectId || !job.id) {
      debugger; // invalid data?
      return;
    }

    let theProjectIndex = this.projectsJobs.projects.findIndex(p => p.id === job.projectId);
    let theJobIndex = this.projectsJobs.projects[theProjectIndex].jobs.length;

    let newJob: Job = new Job();

    newJob.id = job.id;
    newJob.projectId = job.projectId;
    newJob.name = job.name;
    newJob.moduleId = job.moduleId;
    newJob.productName = job.productName;
    newJob.plantOwner = job.plantOwner;
    newJob.jobStatusId = job.jobStatusId;
    newJob.isDeleted = job.isDeleted;
    newJob.created = job.created;
    newJob.updated = job.updated;
    //newJob.jobSizing = new JobSizing; // default

    this.projectsJobs.projects[theProjectIndex].jobs[theJobIndex] = newJob; // assign updated job
    this.signalProjectsAndJobsDataHasChanged(this.projectsJobs); // signal changes
  }

/**
 * updateJobInToServiceMemoryAndSignalChanges
 * Used in Save/Load from sizing pages
 */
  updateJobInToServiceMemoryAndSignalChanges(job: Job) {
    if (!job.projectId || !job.id) {
      debugger; // invalid data?
      return;
    }

    let theProjectIndex = this.projectsJobs.projects.findIndex(p => p.id === job.projectId);
    let theJobIndex = this.projectsJobs.projects[theProjectIndex].jobs.findIndex(j => j.id === job.id);

    let updateJob: Job = new Job();
    updateJob = this.projectsJobs.projects[theProjectIndex].jobs[theJobIndex];
    updateJob.name = job.name;
    updateJob.moduleId = job.moduleId;
    updateJob.productName = job.productName;
    updateJob.plantOwner = job.plantOwner;
    updateJob.jobStatusId = job.jobStatusId;
    updateJob.isDeleted = job.isDeleted;
    updateJob.updated = job.updated;
    //updateJob.jobSizing = new JobSizing; // default

    // FYI:
    //updateJob.id = job.id; should not be changing!
    //updateJob.projectId = job.projectId; should not be changing!
    //updateJob.created = job.created; should not be changing!

    this.projectsJobs.projects[theProjectIndex].jobs[theJobIndex] = updateJob; // assign updated job
    this.signalProjectsAndJobsDataHasChanged(this.projectsJobs); // signal changes
  }

  /**
 * Delete a Job
 * @param job The Job.
 */
  deleteJob(job: Job): Observable<boolean> {
    return this.http.post<boolean>(`./Api/ProjectsAndJobs/DeleteJob`, { job: job });
  }
  
  saveJobSizing(jobSizing: JobSizing): Observable<GetSizingJobRequest> {
    return this.http.post<GetSizingJobRequest>(`./Api/ProjectsAndJobs/SaveJobSizing`, jobSizing);
  }

  getJobSizing(request: GetSizingJobRequest): Observable<SizingData> {
    return this.http.post<SizingData>(`./Api/ProjectsAndJobs/GetJobSizing`, request);
  }

  updateJobSizing(jobSizing: JobSizing): Observable<GetSizingJobRequest> {
    return this.http.post<GetSizingJobRequest>(`./Api/ProjectsAndJobs/UpdateJobSizing`, jobSizing);
  }
  
}
