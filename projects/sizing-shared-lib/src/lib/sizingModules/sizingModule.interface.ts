import { FormGroup } from "@angular/forms";
import { Project, JobSizing } from "../modules/projects-jobs/projects-jobs.model";

export interface ISizingModule {

  readonly moduleGroupId: number;
  readonly moduleName: string;
  
  sizingModuleForm: FormGroup;
  
  onCalculateSizing(formGroup: FormGroup);

  onResetModuleForm();

  //onNewSizingForm();

  onSave(savedProjectDetails: Project): JobSizing;

//  onEnterHeaderDetailsForm();

//  onGetTiSheet();
}
