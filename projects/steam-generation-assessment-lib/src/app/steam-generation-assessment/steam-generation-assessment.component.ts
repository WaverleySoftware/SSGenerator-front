import { Component, OnInit } from '@angular/core';
import { BaseSizingModule, JobSizing, Project } from "sizing-shared-lib";
import { FormGroup } from "@angular/forms";

@Component({
  selector: 'app-steam-generation-assessment',
  templateUrl: './steam-generation-assessment.component.html',
  styleUrls: ['./steam-generation-assessment.component.scss']
})
export class SteamGenerationAssessmentComponent extends BaseSizingModule implements OnInit {
  readonly moduleGroupId: number = 9;
  readonly moduleName: string = 'steamGenerationAssessment';
  moduleId = 2;
  productName = 'Steam Generation Assessment';

  sizingModuleForm: FormGroup;

  public TEST_DATA = {
    CostOfFuelByYear: [
      {value: '', name: 'CostOfFuelByYear1', unit: '£/y', type: 'text'},
      {value: '', name: 'CostOfFuelByYear2', unit: 'kWh/y'}
    ],
    isWaterEntering: [
      {value: '', name: 'isWaterEntering1', unit: '£/y', type: 'text', label: 'Cost of Water / year'},
      {value: '', name: 'isWaterEntering2', unit: 'm3/h', label: 'Water Consumption / hour'},
      {value: '', name: 'isWaterEntering3', unit: 'm3/y', label: 'Water Consumption / year'},
    ],
  }

  public testClickEvent($event): void {
    console.log('--CLICK--', $event)
  }

  onCalculateSizing(formGroup: FormGroup): any {
    return true;
  }

  onEnterHeaderDetailsForm(): any {
    return true;
  }

  onExcelSubmit(): any {
    return true;
  }

  onGetTiSheet(): any {
    return true;
  }

  onNewSizingForm(): any {
    return true;
  }

  onPdfSubmit(): any {
    return true;
  }

  onResetModuleForm(): any {
    return true;
  }

  onSave(savedProjectDetails: Project): JobSizing {
    return undefined;
  }

  onSaveJob(): any {
    return true;
  }

  onUnitsChanged(): any {
    return true;
  }

  repackageSizing(): any {
    return true;
  }

  constructor() {
    super();
  }

  ngOnInit() {
    console.log('%c ----- ON INIT "SteamGenerationAssessment" MODULE ------', 'background: #222; color: #bada55; font-size: 16px;');
  }

}
