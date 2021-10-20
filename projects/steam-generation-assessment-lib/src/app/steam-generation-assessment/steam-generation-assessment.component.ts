import { Component, OnInit } from '@angular/core';
import { BaseSizingModule, JobSizing, Project } from "sizing-shared-lib";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

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
  boilerParametersForm: FormGroup;

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.initForm();
  }

  public testClickEvent($event): void {
    console.log({
      $event,
      values: this.sizingModuleForm.getRawValue(),
    })
  }

  private initForm():void {
    this.sizingModuleForm = this.fb.group({
      test: ["", Validators.required],
      hoursOfOperation: ["", Validators.required],
      fuelType: ["Natural Gas", Validators.required],
      fuelCalorificValue: ["", Validators.required],
      cO2EmissionsUnitFuel: ["0.1850", Validators.required],
      costOfFuelUnit: ["0.025"],
      isFuelComsumptionMeasured: [false],
      costOfFuelYear: [""],
      fuelConsumptionYear: [""],
      areCO2OrCarbonEmissionsTaxed: [false],
      carbonLeviTaxUnit: [""],
      costOfCo2UnitMax: [""],
      costOfWaterUnt: [""],
      isWaterEnteringBoilerHouseMeasured: [false],
      costOfWaterYear: [""],
      waterConsumptionHour: [""],
      waterConsumptionYear: [""],
    })

    this.boilerParametersForm = this.fb.group({
      boilerEfficiency: [100, [Validators.required, Validators.max(100), Validators.min(10)]],
    })
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

  parseError(fieldName: string): string | null {
    const control = this.boilerParametersForm.get(fieldName);

    if (control && control.errors) {
      let errorsStr = '';
      Object.keys(control.errors).forEach((key) => {
        const error = control.errors[key];
        if (key === 'max') {
          errorsStr = `Max length is ${error.max} <br>`;
        }
        if (key === 'min') {
          errorsStr = `Min length is ${error.min} <br>`;
        }
        if (key === 'required') {
          errorsStr = 'Field is required <br>';
        }
        if (key === 'email') {
          errorsStr = 'Should be email';
        }
      })

      return errorsStr;
    }

    return null;
  }

}
