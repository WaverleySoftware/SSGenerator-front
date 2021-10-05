
/**
 * The ProjectsAndJobs model.
 */
import { Preference } from "../../shared/preference/preference.model";

export class ProjectsAndJobs {

  /**
   * Gets or sets the projects.
   */
  projects: Project[];
}

/**
 * The Projects model.
 */
export class Project {

  /**
 * Gets or sets the Guid Id.
 */
  id: string;

  /**
   * Gets or sets the name.
   */
  name: string;

  /**
    * Gets or sets the projectReference.
    */
  projectReference: string;

  /**
   * Gets or sets the userId.
   */
  userId: number;

  /**
 * Gets or sets the tradeEnum.
 */
  tradeEnum: number;

  /**
   * Gets or sets the industryEnum.
   */
  industryEnum: number;

  /**
   * Gets or sets the customerName.
   */
  customerName: string;

  /**
   * Gets or sets the customerLocation.
   */
  customerLocation: string;

  /**
   * Gets or sets the quoteReference.
   */
  quoteReference: string;

  /**
   * Gets or sets isDeleted.
   */
  isDeleted: boolean;

  /**
   * Gets or sets the created date.
   */
  created: Date;

  /**
   * Gets or sets the updated date.
   */
  updated: Date;

  /**
   * Gets or sets the Jobs.
   */
  jobs: Job[];

  /**
   * Gets or sets flag used by saveload modal pop up.
   */
  existingProjectSave: boolean;
}

/**
 * The ProjectResponse model.
 */
export class ProjectResponse {

  /**
  * Gets or sets a value indicating whether or not it has succeeded.
  */
  succeeded: boolean;

  /**
   * Gets or sets the projects.
   */
  project: Project;
}



export class Job {

  /**
 * Gets or sets the Guid Id.
 */
  id: string;

  /**
  * Gets or sets the Guid projectId.
  */
  projectId: string;

  /**
   * Gets or sets the name.
   */
  name: string;

  /**
   * Gets or sets the modueleId.
   */
  moduleId: number;

  /**
    * Gets or sets the productName.
    */
  productName: string;

  /**
  * Gets or sets the plantOwner.
  */
  plantOwner: string;

  /**
   * Gets or sets the jobStatusId.
   */
  jobStatusId: number;

  /**
   * Gets or sets the created date.
   */
  created: Date;

  /**
   * Gets or sets the updated date.
   */
  updated: Date;

  /**
   * Gets or sets isDeleted.
   */
  isDeleted: boolean;

  jobSizing: JobSizing;
}


/**
 * The JobResponse model.
 */
export class JobResponse {

  /**
  * Gets or sets a value indicating whether or not it has succeeded.
  */
  succeeded: boolean;

  /**
   * Gets or sets the jobs.
   */
  job: Job;
}


export class GetSizingJobRequest {
  jobId: string;
  projectId: string;
}


/**
 * The JobStatusesResponse model.
 */
export class JobStatusesResponse {

  /**
   * Gets or sets the JobStatuses.
   */
  jobStatuses: JobStatus[];
}

/**
 * The JobStatus model.
 */
export class JobStatus {
  /**
* Gets or sets the  Id.
*/
  id: number;

  /**
  * Gets or sets the name.
  */
  name: string;

  /**
   * Gets or sets the masterTextKey.
   */
  masterTextKey: string;

}

export class JobSizing {
  project: Project;
  sizingData: SizingData;
}

export class SizingData {

  processConditions: ProcessCondition[];
  sizingOutput: SizingOutput;
}

export class ProcessCondition {

  name: string;
  processInputs: ProcessInput[];
  unitPreferences: Preference[];
}

export class ProcessInput {
  name: string;
  value: string;
  unitId: number;
  listItemId: number;
  value2: string;
  childInputs: ProcessInput[];
}

export class SizingOutput {

  outputItems: OutputItem[];
  outputGrid: OutputGrid;

}

export class OutputGrid {
  outputGridRows: OutputGridRow[];
}

export class OutputGridRow {
  outputItems: OutputItem[];
  messages: OutputGridRowMessageItem[];
}

export class OutputItem {
  name: string;
  value: string;
  unitId: number;
  selected: boolean;
  listItemId: number;
  type: string;
}

export class OutputGridRowMessageItem {
  messageKey: string;
  value: number;
  unitKey: string;
  severity: number;
  displayValue: string;
}


