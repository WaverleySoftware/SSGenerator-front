import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Preference } from "sizing-shared-lib";
import {
  FormFieldTypesInterface,
  SteamCalorificRequestInterface,
  SteamGeneratorInputsInterface
} from "../steam-generation-form.interface";
import { SteamGenerationAssessmentService } from "../steam-generation-assessment.service";

@Component({
  selector: 'app-sga-input-parameters',
  templateUrl: './sga-input-parameters.component.html',
  styleUrls: ['./sga-input-parameters.component.scss']
})
export class SgaInputParametersComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() moduleGroupId: number;
  @Output() changeFuelType: EventEmitter<SteamCalorificRequestInterface> = new EventEmitter<SteamCalorificRequestInterface>();

  public fuelType: Preference
  public fields: FormFieldTypesInterface;
  public carbonEmissionUpdate = new Subject<string>();
  public formGroupKey = 'steamGeneratorInputs'; // Form builder child formGroup key

  constructor(private steamGenerationAssessmentService: SteamGenerationAssessmentService) {
    this.fields = this.steamGenerationAssessmentService.getSgaFormFields();

    // Calculate Carbon emission
    this.carbonEmissionUpdate
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(v => this._changeCarbonEmission(v));
  }

  ngOnInit() {}

  /**
   * Clear fields value when user change radio or another variant
   * **/
  public clearValues(clearFields: Array<keyof SteamGeneratorInputsInterface>, setVal: any = 0, event?: any) {
    if (!clearFields.length) return;

    for (let fieldName of clearFields) {
      const childFieldName = `${this.formGroupKey}.${fieldName}`;
      if (this.formGroup.get(childFieldName).value || this.formGroup.get(childFieldName).value === "") {
        this.formGroup
          .get(childFieldName)
          .patchValue(setVal, { emitEvent: false, onlySelf: true });
      }
    }
  }

  /**
   * Set some FormGroup value from view
   * **/
  public setFormValue(name: string, value: any): void {
    this.formGroup
      .get(`${this.formGroupKey}.${name}`)
      .patchValue(value, { emitEvent: false, onlySelf: true });
  }

  /**
   * by default - Set unit names to FormFieldTypesInterface
   * but you can change parameters and set another data to FormFieldTypesInterface
   * **/
  public setFuelType(
    fieldName: keyof FormFieldTypesInterface,
    index: 0 | 1 = 1,
    value: string = this.fuelType && this.fuelType.name,
    key: 'unitNames' | 'translations' = 'unitNames'
  ): [string, string?] {
    if (this.fields[fieldName]) {
      if (!this.fields[fieldName][key]) {
        this.fields[fieldName][key] = [null, null];
      }

      this.fields[fieldName][key][index] = value;
    }

    return this.fields[fieldName][key];
  }

  public changeFuelTypeHandle(preference: Preference): void {
    if (this.fuelType && preference) { // Not first init
      this.changeFuelType.emit({
        inputFuelId: this.formGroup.get(`${this.formGroupKey}.inputFuelId`).value,
        inputFuelUnit: this.formGroup.get(`${this.formGroupKey}.inputFuelUnit`).value,
        energyUnitSelected: null, // From preferences
        smallWeightUnitSelected: null, // From preferences
      });
    }

    this.fuelType = preference;
  }

  /**
   * form-input Component inputChangeEvent (change)
   * @pram { name: formControlName; value: input value }
   * **/
  public inputChangeHandle({ name, value }: { name: string, value: any }): void {
    this._disableFilled(name as keyof FormFieldTypesInterface);

    switch (name) {
      case "fuelEnergyPerUnit": this.carbonEmissionUpdate.next(value); break;
    }
  }

  private _changeCarbonEmission(fuelEnergyPerUnit): void {
    if (!fuelEnergyPerUnit || fuelEnergyPerUnit === 0) return null;

    const { energyUnitSelected, smallWeightUnitSelected } = this.steamGenerationAssessmentService.getSizingPreferenceValues({
        energyUnitSelected: 'BoilerHouseEnergyUnits',
        smallWeightUnitSelected: 'WeightUnit'
      });

    const { inputFuelId, inputFuelUnit, fuelCarbonContent } = this._getMultipleControlValues({
      inputFuelId: 'inputFuelId',
      inputFuelUnit: 'inputFuelUnit',
      fuelCarbonContent: 'inputFuelUnit',
    });

    const req = {
      energyUnitSelected,
      smallWeightUnitSelected,
      inputFuelId,
      inputFuelUnit,
      fuelEnergyPerUnit,
      fuelCarbonContent
    }

    this.steamGenerationAssessmentService
      .calculateCarbonEmission(req)
      .subscribe((res) => this._setInputFormFields(res));
  }

  private _setInputFormFields(data: Partial<Record<keyof FormFieldTypesInterface, any>>): void {
    for (let formKey in data) {
      this.steamGenerationAssessmentService
        .changeSgaFieldFilled(formKey as keyof FormFieldTypesInterface, true);
      this.formGroup
        .get(`${this.formGroupKey}.${formKey}`)
        .patchValue(data[formKey], { emitEvent: false, onlySelf: true });
    }
  }

  private _disableFilled(fieldName: keyof FormFieldTypesInterface): void {
    if (this.fields[fieldName].filled) {
      this.steamGenerationAssessmentService.changeSgaFieldFilled(fieldName, false);
    }
  }

  private _getMultipleControlValues(obj: { [key: string]: string }): {[key: string]: any} {
    const result = {};

    for (let objKey in obj) {
      result[objKey] = this.formGroup.get(`${this.formGroupKey}.${obj[objKey]}`).value;
    }

    return result;
  }
}
