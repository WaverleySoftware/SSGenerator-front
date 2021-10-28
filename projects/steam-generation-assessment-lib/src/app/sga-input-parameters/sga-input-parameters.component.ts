import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-sga-input-parameters',
  templateUrl: './sga-input-parameters.component.html',
  styleUrls: ['./sga-input-parameters.component.scss']
})
export class SgaInputParametersComponent implements OnInit {

  utilityParamsForm: FormGroup;
  boilerParamsForm: FormGroup;

  public deaeratorType: string = 'autmosphericDeaerator';

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
  }

  private initForm():void {
    this.utilityParamsForm = this.fb.group({
      HOURS_OF_OPERATION: ["", Validators.required],
      FUEL_TYPE: ["Natural Gas", Validators.required],
      FUEL_CALORIFIC_VALUE: ["", Validators.required],
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
    });

    this.boilerParamsForm = this.fb.group({
      boilerEfficiency: [100, [Validators.required, Validators.max(100), Validators.min(10)]],
    })
  }

}
