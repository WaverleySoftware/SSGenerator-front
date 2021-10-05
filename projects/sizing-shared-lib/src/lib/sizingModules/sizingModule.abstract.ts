import { ISizingModule } from "./sizingModule.interface";
import { FormGroup } from "@angular/forms";
import { Project, JobSizing } from "../modules/projects-jobs/projects-jobs.model";

export abstract class BaseSizingModule implements ISizingModule {

  saveJobSuccess = false;
  saveJobError = false;

  isSpecSheetEnabled = false;
  isTiEnabled = false;
  isCalculating = false;

  showJobExportBtn = false;
  enableJobExportBtn = false;

  jobId: string;
  productName: string;
  moduleId: number;
  jobStatusId: number;
  jobName: string;
  projectName: string;
  projectId: string;

  abstract readonly moduleGroupId: number;
  abstract readonly moduleName: string;

  abstract sizingModuleForm: FormGroup;

  abstract onCalculateSizing(formGroup: FormGroup);

  abstract onResetModuleForm();

  abstract onSave(savedProjectDetails: Project): JobSizing;

  abstract onExcelSubmit();

  abstract onPdfSubmit();

  abstract onUnitsChanged();

  abstract onSaveJob();

  abstract repackageSizing();

  abstract onNewSizingForm();

  abstract onEnterHeaderDetailsForm();

  abstract onGetTiSheet();
}
