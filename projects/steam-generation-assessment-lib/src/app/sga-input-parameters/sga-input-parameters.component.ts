import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormFieldTypesInterface, SteamGenerationFormInterface } from "../steam-generation-form.interface";
import { Preference } from "../../../../sizing-shared-lib/src/lib/shared/preference/preference.model";

@Component({
  selector: 'app-sga-input-parameters',
  templateUrl: './sga-input-parameters.component.html',
  styleUrls: ['./sga-input-parameters.component.scss']
})
export class SgaInputParametersComponent implements OnInit{
  @Input() formGroup: FormGroup;
  @Input() moduleGroupId: number;

  public fuelType: Preference
  public formFieldNames: FormFieldTypesInterface =  {
    hoursOfOperation: {
      formControlName: 'hoursOfOperation',
      label: 'HOURS_OF_OPERATION',
      required: true
    },
    fuelEnergyPerUnit: {
      formControlName: 'fuelEnergyPerUnit',
      label: 'FUEL_CALORIFIC_VALUE',
      unitNames: ['BoilerHouseEnergyUnits'],
      translations: ['ENERGY'],
      required: true
    },
    fuelCarbonContent: {
      formControlName: 'fuelCarbonContent',
      label: 'CO2_EMISSIONS_PER_UNIT_FUEL',
      unitNames: ['WeightUnit'],
      translations: ['SMALL_WEIGHT'],
      controlNames: ['fuelCarbonContentUnit'],
      required: true,
    },
    costOfFuelPerUnit: {
      formControlName: 'costOfFuelPerUnit',
      label: 'COST_OF_FUEL_PER_UNIT',
      unitNames: ['BHCurrency'],
      translations: ['CURRENCY'],
      required: true
    },
    costOfFuelPerYear: {
      formControlName: 'costOfFuelPerYear',
      label: 'FUEL_COSTS_PER_YEAR',
      unitNames: ['BHCurrency'],
      translations: ['CURRENCY'],
      required: true,
    },
    fuelConsumptionPerYear: {
      formControlName: 'fuelConsumptionPerYear',
      label: 'FUEL_CONSUMPTION_PER_YEAR',
      required: true
    }
  };

  constructor() {}

  ngOnInit() {}

  public clearValues(clearFields: Array<keyof SteamGenerationFormInterface>, setVal: any = 0, event?: any) {
    if (!clearFields.length) return;

    for (let fieldName of clearFields) {
      if (this.formGroup.get(fieldName).value || this.formGroup.get(fieldName).value === "") {
        this.formGroup.get(fieldName).setValue(setVal);
      }
    }
  }

  public setFuelType(
    fieldName: keyof FormFieldTypesInterface,
    index: 0 | 1 = 1,
    value: string = this.fuelType && this.fuelType.name,
    key: 'unitNames' | 'translations' = 'unitNames'
  ): [string, string?] {
    if (this.formFieldNames[fieldName]) {
      if (!this.formFieldNames[fieldName][key]) {
        this.formFieldNames[fieldName][key] = [null, null];
      }

      this.formFieldNames[fieldName][key][index] = value;
    }

    return this.formFieldNames[fieldName][key];
  }
}
