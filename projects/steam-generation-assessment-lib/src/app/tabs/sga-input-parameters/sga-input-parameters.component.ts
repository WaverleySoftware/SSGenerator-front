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
import { TabDirective } from "ngx-bootstrap/tabs/tab.directive";
import { SgaBoilerSchemeInterface } from "../../interfaces/sga-boiler-scheme.interface";
import { FormGroup } from "@angular/forms";


@Component({
  selector: 'app-sga-input-parameters',
  templateUrl: './sga-input-parameters.component.html',
  styleUrls: ['./sga-input-parameters.component.scss']
})
export class SgaInputParametersComponent {
  @Input() moduleGroupId: number;
  @Input() formGroup: TForm<InputParametersTFormInterface>;
  @Output() changeFuelType = new EventEmitter<SgaCalcCalorificReqInterface>();
  @Output() calculateEfficiency = new EventEmitter<SgaCalcBoilerEfficiencyReqInterface>();
  @Output() calculateWaterTreatment = new EventEmitter<SgaCalcWaterTreatmentReqInterface>();
  @Output() setTab: EventEmitter<number> = new EventEmitter<number>();

  private readonly formValueGetter: TFormValueGetterInterface = this.formService
    .createFormValueGetter(this.formService.getInputParamsFg());
  structure: SgFormStructureInterface = sgaFormStructure;
  sizingUnits$: Observable<{ [key: string]: {decimal: number, unit: string} }> = this.preferenceService.sizingUnitPreferencesUpdate
    .pipe(map(({list, updated}) => list.reduce((obj, item) => ({
      ...obj,
      [item.preference.name]: { decimal: item.preference.decimalPlaces, unit: item.preference.unitName }
    }), {})));

  constructor(private formService: SgaFormService, public preferenceService: PreferenceService) {}

  get getBoilerSchemeState(): SgaBoilerSchemeInterface {
    const fg = this.formGroup.get('benchmarkInputs') as FormGroup;
    const {
      isEconomizerPresent = false,
      isBlowdownVesselPresent = false,
      isCoolingWaterUsed = false,
      isAutoTdsControlPResent = false,
      isFlashVesselPresent = false,
      isHeatExchangerPresent = false,
      pressurisedDeaerator = false,
      isDsiPresent = false,
    } = fg && fg.getRawValue();

    return {
      isEconomizerPresent, isBlowdownVesselPresent,
      isCoolingWaterUsed, isAutoTdsControlPResent, isFlashVesselPresent,
      isHeatExchangerPresent, pressurisedDeaerator, isDsiPresent };
  }

  getInvalidBlock(structure): boolean {
    if (Array.isArray(structure)) {
      for (const el of structure) {
        if (el && typeof el === 'string') {
          const control = this.formGroup.get(`benchmarkInputs.${el}`);
          if (control && control.touched && control.invalid) {
            return true;
          }
        }
      }
    } else {
      let isInvalid = false;
      for (const key of Object.keys(structure)) {
        if (this.getInvalidBlock(structure[key])) {
          isInvalid = true;
        }
      }
      return isInvalid;
    }

    return false;
  }

  getValue(name: keyof BenchmarkInputsInterface): number {
    const control = this.formGroup.get(`benchmarkInputs.${name}`);
    return control && control.value;
  }

  toggleInput(enable: string | string[], disable: string | string[], patchValue?: any, isChange?: boolean) {
    if (isChange || isChange === undefined) {
      if (typeof enable === 'string') {
        const control = this.formGroup.get(`benchmarkInputs.${enable}`);
        if (control && control.disabled) { control.enable(); }
      } else if (Array.isArray(enable)) {
        for (const field of enable) {
          const control = this.formGroup.get(`benchmarkInputs.${field}`);
          if (control && control.disabled) { control.enable(); }
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

        const control = this.formGroup.get('selectedUnits.fuelUnitSelected');
        if (control && control.value !== fuelUnitSelected) {
          control.setValue(fuelUnitSelected);
        }
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

  setBoilerParamsTab(tab: number | TabDirective, el?: HTMLElement) {
    let tabIndex: number;

    if (typeof tab === 'number') {
      tabIndex = tab;
      el && typeof el.scrollIntoView === 'function' && el.scrollIntoView({behavior: 'smooth'});
    } else if (tab && tab instanceof TabDirective) {
      if (tab.tabset && tab.tabset.tabs) {
        tabIndex = tab.tabset.tabs.indexOf(tab) + 1;
      }
    }

    if (tabIndex && tabIndex !== -1) {
      this.structure.boiler_house_parameters.panels.boiler.status = tabIndex === 1;
      this.structure.boiler_house_parameters.panels.tds_blowdown.status = tabIndex === 2;
      this.structure.boiler_house_parameters.panels.water_treatment.status = tabIndex === 3;
      this.structure.boiler_house_parameters.panels.feedwater_and_condensate.status = tabIndex === 4;
    }
  }

  clearFieldsError(fields: string | string[]) {
    const clearErrFn = (name: string) => {
      const control = this.formGroup.get(`benchmarkInputs.${name}`);

      if (control && control.errors) {
        control.setErrors(null);
      }
    }

    if (typeof fields === 'string') {
      clearErrFn(fields);
    }

    if (Array.isArray(fields)) {
      for (const field of fields) {
        clearErrFn(field);
      }
    }
  }
}
