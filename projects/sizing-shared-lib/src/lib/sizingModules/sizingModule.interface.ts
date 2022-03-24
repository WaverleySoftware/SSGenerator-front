import { FormGroup } from "@angular/forms";
import { Project, JobSizing, GetSizingJobRequest } from "../modules/projects-jobs/projects-jobs.model";

export interface ISizingModule {

  readonly moduleGroupId: number;
  readonly moduleName: string;

  sizingModuleForm: FormGroup;

  onCalculateSizing(formGroup: FormGroup);

  onResetModuleForm();

  //onNewSizingForm();

  onSave(savedProjectDetails: Project): JobSizing;

  saveJobToNewProject?: (data: GetSizingJobRequest) => void;

//  onEnterHeaderDetailsForm();

//  onGetTiSheet();
}
