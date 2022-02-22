import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SgaFormService } from '../../services/sga-form.service';
import { InputParametersTFormInterface, TForm, TFormValueGetterInterface } from '../../interfaces/forms.interface';
import { PreferenceService } from 'sizing-shared-lib';
import { FuelTypesEnumerationLetter } from '../../interfaces/fuel-type.interface';
import {
  SgaCalcBoilerEfficiencyReqInterface,
  SgaCalcCalorificReqInterface,
  SgaCalcWaterTreatmentReqInterface
} from '../../interfaces/api-requests.interface';
import { FormListFuelTypeChangeInterface } from '../../interfaces/e-emiters.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import sgaFormStructure from '../../utils/sga-form-structure';
import { SgFormStructureInterface } from '../../interfaces/steam-generation-form.interface';
import { BenchmarkInputsInterface } from '../../interfaces/benchmarkInputs.interface';


@Component({
  selector: 'app-sga-input-parameters',
  templateUrl: './sga-input-parameters.component.html',
  styleUrls: ['./sga-input-parameters.component.scss']
})
export class SgaInputParametersComponent {
  @Input() moduleGroupId: number;
  @Output() changeFuelType = new EventEmitter<SgaCalcCalorificReqInterface>();
  @Output() calculateEfficiency = new EventEmitter<SgaCalcBoilerEfficiencyReqInterface>();
  @Output() calculateWaterTreatment = new EventEmitter<SgaCalcWaterTreatmentReqInterface>();

  private readonly formValueGetter: TFormValueGetterInterface;
  structure: SgFormStructureInterface = sgaFormStructure;
  formGroup: TForm<InputParametersTFormInterface> = this.formService.getInputParamsFg();
  sizingUnits$: Observable<{ [key: string]: {decimal: number, unit: string} }> = this.preferenceService.sizingUnitPreferencesUpdate
    .pipe(map(({list, updated}) => list.reduce((obj, item) => ({
      ...obj,
      [item.preference.name]: { decimal: item.preference.decimalPlaces, unit: item.preference.unitName }
    }), {})));

  constructor(private formService: SgaFormService, public preferenceService: PreferenceService) {
    this.formValueGetter = this.formService.createFormValueGetter(this.formGroup);
  }

  getValue(name: keyof BenchmarkInputsInterface): number {
    const control = this.formGroup.get(`benchmarkInputs.${name}`);
    return control && control.value;
  }

  toggleInput(enable: string | string[], disable: string | string[], patchValue?: any, isChange?: boolean) {
    if (isChange || isChange === undefined) {
      if (typeof enable === 'string') {
        const control = this.formGroup.get(`benchmarkInputs.${enable}`);
        if (control && control.disabled) { control.enable({onlySelf: true}); }
      } else if (Array.isArray(enable)) {
        for (const field of enable) {
          const control = this.formGroup.get(`benchmarkInputs.${field}`);
          if (control && control.disabled) { control.enable({onlySelf: true}); }
        }
      }
    }

    if (isChange === false || isChange === undefined) {
      if (typeof disable === 'string') {
        const control = this.formGroup.get(`benchmarkInputs.${disable}`);
        if (control && control.enabled) {
          control.disable();
          control.markAsUntouched({onlySelf: true});

          if (patchValue !== undefined) { control.patchValue(patchValue); }
        }
      } else if (Array.isArray(disable)) {
        for (const field of disable) {
          const control = this.formGroup.get(`benchmarkInputs.${field}`);
          if (control && control.enabled) {
            control.disable();
            control.markAsUntouched({onlySelf: true});

            if (patchValue !== undefined) { control.patchValue(patchValue); }
          }
        }
      }
    }
  }

  setFormValue(name: string | string[] | {[key: string]: any}, value?: any) {
    if (typeof name === 'string') {
      const control = this.formGroup.get(`benchmarkInputs.${name}`);
      if (control) { control.patchValue(value !== undefined ? value : null); }
    } else if (Array.isArray(name)) {
      for (const field of name) {
        const control = this.formGroup.get(`benchmarkInputs.${field}`);
        if (control) { control.patchValue(value !== undefined ? value : null); }
      }
    } else if (typeof name === 'object') {
      for (const key of Object.keys(name)) {
        const control = this.formGroup.get(`benchmarkInputs.${key}`);
        if (control) { control.patchValue(value !== undefined ? value : name[key]); }
      }
    }
  }

  getFuelTypeName(value: string): string {
    const firstLetter = value && value.charAt(0).toUpperCase();

    if (firstLetter && FuelTypesEnumerationLetter[firstLetter]) {
      return FuelTypesEnumerationLetter[firstLetter];
    }
  }

  fuelTypeHandle(data: FormListFuelTypeChangeInterface) {
    if (data && data.item && data.item.value) {
      const fuelTypeName = this.getFuelTypeName(data.item.value);
      const sPreference = this.preferenceService.sizingUnitPreferences && this.preferenceService.sizingUnitPreferences
        .find(({preference}) => preference.name === fuelTypeName);

      if (sPreference) {
        const emitData = this.formValueGetter({selectedUnits: ['energyUnitSelected', 'smallWeightUnitSelected']});
        const fuelUnitSelected = Number(sPreference.preference.value);

        this.formGroup.get('selectedUnits.fuelUnitSelected').setValue(fuelUnitSelected);
        this.changeFuelType.emit({
          energyUnitSelected: emitData.energyUnitSelected,
          smallWeightUnitSelected: emitData.smallWeightUnitSelected,
          inputFuelId: data.item.id as string,
          fuelUnitSelected,
        });
      }
    }
  }

  boilerEfficiencyHandle(value) {
    this.calculateEfficiency.emit({
      isEconomizerPresent: value,
      inputFuelId: this.formGroup.get('benchmarkInputs.inputFuelId').value,
    });
  }

  waterTreatmentHandle({selectedValue}) {
    this.calculateWaterTreatment.emit({
      waterTreatmentMethodId: selectedValue,
      tdsUnitSelected: this.formGroup.get('selectedUnits.tdsUnitSelected').value
    });
  }
}
