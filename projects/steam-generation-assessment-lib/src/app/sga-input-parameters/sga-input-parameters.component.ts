import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { FormGroup } from "@angular/forms";
import {
  FormFieldTypesInterface,
  SteamCalorificRequestInterface, SteamCarbonEmissionInterface,
  SteamGenerationFormInterface
} from "../steam-generation-form.interface";
import { Preference } from "sizing-shared-lib";
import { SteamGenerationAssessmentService } from "../steam-generation-assessment.service";
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { fromEvent, Observable, Subject } from "rxjs";
import { SizingUnitPreference } from "../../../../sizing-shared-lib/src/lib/shared/preference/sizing-unit-preference.model";
import { number } from "ng2-validation/dist/number";

@Component({
  selector: 'app-sga-input-parameters',
  templateUrl: './sga-input-parameters.component.html',
  styleUrls: ['./sga-input-parameters.component.scss']
})
export class SgaInputParametersComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() moduleGroupId: number;
  @Output() changeFuelType: EventEmitter<SteamCalorificRequestInterface> = new EventEmitter<SteamCalorificRequestInterface>()

  public fuelType: Preference
  public fields: FormFieldTypesInterface;
  public carbonEmissionUpdate = new Subject<string>();

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
  public clearValues(clearFields: Array<keyof SteamGenerationFormInterface>, setVal: any = 0, event?: any) {
    if (!clearFields.length) return;

    for (let fieldName of clearFields) {
      if (this.formGroup.get(fieldName).value || this.formGroup.get(fieldName).value === "") {
        this.formGroup.get(fieldName).setValue(setVal);
      }
    }
  }

  /**
   * Set some FormGroup value from view
   * **/
  public setFormValue(name: string, value: any): void {
    this.formGroup.get(name).setValue(value);
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
        inputFuelId: this.formGroup.get('inputFuelId').value,
        inputFuelUnit: this.formGroup.get('inputFuelUnit').value,
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
  public inputChangeHandle({ name, value }: { name: keyof SteamGenerationFormInterface, value: any }): void {
    this._disableFilled(name);

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
      .subscribe(res => {
        this.steamGenerationAssessmentService.changeSgaFieldFilled('fuelCarbonContent', true);
        this.formGroup.get('fuelCarbonContent').patchValue(res, { emitEvent: false, onlySelf: true });
      });
  }

  private _disableFilled(fieldName: keyof FormFieldTypesInterface): void {
    if (this.fields[fieldName].filled) {
      this.steamGenerationAssessmentService.changeSgaFieldFilled(fieldName, false);
    }
  }

  private _getMultipleControlValues(obj: { [key: string]: string }): {[key: string]: any} {
    const result = {};

    for (let objKey in obj) {
      result[objKey] = this.formGroup.controls[obj[objKey]].value;
    }

    return result;
  }
}
