import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from "@angular/forms";

@Component({
  selector: 'app-sga-input-parameters',
  templateUrl: './sga-input-parameters.component.html',
  styleUrls: ['./sga-input-parameters.component.scss']
})
export class SgaInputParametersComponent implements OnInit {
  utilityParamsForm: FormGroup;
  boilerParamsForm: FormGroup;

  public deaeratorType: string = 'autmosphericDeaerator';

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit() {
  }

  submitForm(): void {
    console.log(this.utilityParamsForm.getRawValue());
  }

  private initForm():void {
    this.utilityParamsForm = this.fb.group({
      HOURS_OF_OPERATION: ["", Validators.required],
      FUEL_TYPE: ["Natural Gas", Validators.required],
      FUEL_CALORIFIC_VALUE: ["", [Validators.required, Validators.min(1), Validators.max(100)]],
      cO2EmissionsUnitFuel: ["0.1850", Validators.required],
      costOfFuelUnit: ["0.025"],
      IS_FUEL_COMSUMPTION_MEASURED: [false],
      COST_OF_FUEL_YEAR: [""],
      FUEL_CONSUMPTION_YEAR: [""],
      areCO2OrCarbonEmissionsTaxed: [false],
      carbonLeviTaxUnit: [""],
      costOfCo2UnitMax: [""],
      costOfWaterUnt: [""],
      isWaterEnteringBoilerHouseMeasured: [false],
      costOfWaterYear: [""],
      waterConsumptionHour: [""],
      waterConsumptionYear: [""],
    });

    this.boilerParamsForm = this.fb.group({
      boilerEfficiency: [100, [Validators.required, Validators.max(100), Validators.min(10)]],
    })
  }

  public fieldValidation(fieldName: string): string {
    let errors: string;
    const control: AbstractControl = this.utilityParamsForm.get(fieldName);
    const controlErrors: ValidationErrors = control.errors;

    if (control.invalid && control.touched && controlErrors !== null) {
      Object.keys(controlErrors).forEach(keyError => {
        switch (keyError) {
          case 'required': {
            errors = keyError;
            break;
          }
          case 'min': {
            errors = `Min: ${controlErrors[keyError].min}`;
            break;
          }
          case 'max': {
            errors = `Max: ${controlErrors[keyError].max}`;
            break;
          }
        }
      });
    }

    return errors;
  }

  public isRequired(fieldName: string): boolean {
    return this.utilityParamsForm.get(fieldName).errors
      && this.utilityParamsForm.get(fieldName).errors.required;
  }
}
