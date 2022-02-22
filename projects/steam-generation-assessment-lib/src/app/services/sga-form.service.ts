import { Injectable } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  InputParametersCreateFormInterface,
  InputParametersTFormInterface,
  TForm,
  TFormValueGetterInterface
} from '../interfaces/forms.interface';
import { BenchmarkInputsInterface } from '../interfaces/benchmarkInputs.interface';
import { SelectedUnitsInterface } from '../interfaces/selectedUnits.interface';
import { validateBenchmarkInput } from '../validators/sga-benchmark.validator';
import { SgaApiService } from './sga-api.service';


@Injectable()
export class SgaFormService {
  private inputParamsFg: TForm<InputParametersTFormInterface>;

  constructor(private fb: FormBuilder, private apiService: SgaApiService) { }

  private createFormGroup<T>(data: { [key in keyof T]: T[key] }, opt?: AbstractControlOptions): TForm<T> {
    return this.fb.group(data, opt) as TForm<T>;
  }

  createInputParamsForm(): TForm<InputParametersTFormInterface> {
    const data: InputParametersCreateFormInterface = {
      selectedUnits: {
        energyUnitSelected: [null],
        smallWeightUnitSelected: [null],
        emissionUnitSelected: [null],
        volumeUnitSelected: [null],
        smallVolumetricFlowUnitSelected: [null],
        massFlowUnitSelected: [null],
        smallMassFlowUnitSelected: [null],
        pressureUnitSelected: [null],
        temperatureUnitSelected: [null],
        tdsUnitSelected: [null],
        fuelUnitSelected: [null]
      },
      benchmarkInputs: {
        hoursOfOperation: [8736, Validators.required, validateBenchmarkInput(this.apiService)],
        isSteamFlowMeasured: [false],
        isAutoTdsControlPResent: [false],
        boilerSteamGeneratedPerYear: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        boilerSteamGeneratedPerHour: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        inputFuelId: [null, Validators.required],
        costOfFuelPerUnit: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        fuelQtyPerYearIsKnown: [false],
        costOfFuelPerYear: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        fuelConsumptionPerYear: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        fuelEnergyPerUnit: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        fuelCarbonContent: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        costOfWaterPerUnit: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        costOfEffluentPerUnit: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        boilerHouseWaterQtyPerYearIsKnown: [false],
        costOfWaterPerYear: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        waterConsumptionPerHour: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        waterConsumptionPerYear: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        boilerWaterTreatmentChemicalCostsIsKnown: [false],
        totalChemicalCostPerYear: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        o2ScavengingChemicalsCostSavings: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        isCo2OrCarbonEmissionsTaxed: [false],
        carbonTaxLevyCostPerUnit: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        costOfCo2PerUnitMass: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        isBlowdownVesselPresent: [false],
        isCoolingWaterUsed: [false],
        isSuperheatedSteam: [false],
        boilerEfficiency: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        isFeedWaterMeasured: [false],
        boilerSteamPressure: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        boilerSteamTemperature: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        isEconomizerPresent: [false],
        boilerAverageTds: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        boilerMaxTds: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        boilerFeedwaterConsumptionPerHour: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        boilerFeedwaterConsumptionPerYear: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        isFlashVesselPresent: [{value: false, disabled: true}],
        isHeatExchangerPresent: [{value: false, disabled: true}, { updateOn: 'change' }],
        waterTemperatureLeavingHeatExchanger: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        waterTreatmentMethod: [null],
        percentageWaterRejection: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        tdsOfMakeupWater: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        isMakeUpWaterMonitored: [false],
        temperatureOfMakeupWater: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        makeupWaterAmountPerHour: [null, null, validateBenchmarkInput(this.apiService, true)],
        makeupWaterAmountPerYear: [{value: null, disabled: true}, null, validateBenchmarkInput(this.apiService, true)],
        atmosphericDeaerator: [true],
        pressurisedDeaerator: [false],
        temperatureOfFeedtank: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        tdsOfFeedwaterInFeedtank: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        tdsOfCondensateReturn: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        temperatureOfCondensateReturn: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        areChemicalsAddedDirectlyToFeedtank: [false],
        pressureOfFeedtank: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        pressureOfSteamSupplyingDsi: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        isCondensateReturnKnown: [false],
        percentageOfCondensateReturn: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        volumeOfCondensateReturn: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        isDsiPresent: [false],
      }
    };
    this.inputParamsFg = this.createFormGroup<InputParametersTFormInterface>({
      selectedUnits: this.createFormGroup<SelectedUnitsInterface>(data.selectedUnits),
      benchmarkInputs: this.createFormGroup<BenchmarkInputsInterface>(data.benchmarkInputs)
    }, {updateOn: 'blur'}) as TForm<InputParametersTFormInterface>;

    return this.inputParamsFg;
  }

  createFormValueSetter<T>(formGroup: FormGroup | TForm<any>, subFormKey?: string): (
    name: keyof T | Partial<{[key in keyof T]: any}>,
    value?: any,
    opt?: { onlySelf?: boolean; emitEvent?: boolean; disableFilled?: boolean; }
  ) => AbstractControl | {[key in keyof T]: AbstractControl} {
    if (!formGroup) {
      return null;
    }

    const fg = subFormKey ? formGroup.get(subFormKey as string) : formGroup;

    return (name, value, opt) => {
      if (typeof name === 'string') {
        const control = fg.get(name as string);

        if (control) {
          if (!opt || !opt.disableFilled) {
            control.markAsPristine({onlySelf: true});
            control.markAsUntouched({onlySelf: true});
          }

          control.patchValue(value, opt);
        }

        return control;
      } else if (typeof name === 'object') {
        let controls: {[key in keyof T]: AbstractControl};

        for (const key of Object.keys(name)) {
          const control = fg.get(key);

          if (control) {
            if (!opt || !opt.disableFilled) {
              control.markAsPristine({onlySelf: true});
              control.markAsUntouched({onlySelf: true});
            }

            control.patchValue(name[key], opt);

            controls = {
              ...controls,
              [key]: control
            };
          }
        }

        return controls;
      }
    };
  }

  createFormValueGetter(formGroup: FormGroup | TForm<any>, subFormKey?: string): TFormValueGetterInterface {
    if (!formGroup) { return null; }

    const fg = subFormKey ? formGroup.get(subFormKey as string) : formGroup;
    const getControlValues = (names, subForm?, separate?) => {
      if (typeof names === 'string') {
        const control = subForm ? fg.get(`${subForm}.${names}`) : fg.get(names);
        return control && {[names]: control.value};
      }

      if (Array.isArray(names)) {
        const values = {};
        for (const name of names) {
          const control = subForm ? fg.get(`${subForm}.${name}`) : fg.get(name);
          values[name] = control && control.value;
        }

        return values;
      }

      if (typeof names === 'object') {
        let values = {};
        for (const key of Object.keys(names)) {
          const result = getControlValues(names[key], key);
          if (separate) {
            values[key] = {...values[key], ...result };
          } else {
            values = { ...values, ...result };
          }
        }

        return values;
      }
    };

    return getControlValues;
  }

  getInputParamsFg(): TForm<InputParametersTFormInterface> {
    if (!this.inputParamsFg) {
      this.inputParamsFg = this.createInputParamsForm();
    }

    return this.inputParamsFg;
  }
}


