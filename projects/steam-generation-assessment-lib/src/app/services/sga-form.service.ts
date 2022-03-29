import { Injectable } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  InputParametersCreateFormInterface, InputParametersFormInterface,
  InputParametersTFormInterface, ProposedSetupCreateFormInterface, ProposedSetupTFormInterface,
  TForm,
  TFormValueGetterInterface
} from "../interfaces/forms.interface";
import { BenchmarkInputsInterface } from '../interfaces/benchmarkInputs.interface';
import { SelectedUnitsInterface } from '../interfaces/selectedUnits.interface';
import { validateBenchmarkInput } from '../validators/sga-benchmark.validator';
import { SgaApiService } from './sga-api.service';
import { ProposedSetupInterface } from '../interfaces/proposed-setup.interface';
import { ProposedFeaturesInterface } from '../interfaces/proposed-features.interface';
import { disableControl, validateProposed } from '../validators/sga-proposed-setup.validator';


@Injectable()
export class SgaFormService {
  private inputParamsFg: TForm<InputParametersTFormInterface>;
  private proposedSetupFg: TForm<ProposedSetupTFormInterface>;

  constructor(private fb: FormBuilder, private apiService: SgaApiService) { }

  private createFormGroup<T>(data: { [key in keyof T]: T[key] }, opt?: AbstractControlOptions): TForm<T> {
    return this.fb.group(data, opt) as TForm<T>;
  }

  private createInputParamsForm(): TForm<InputParametersTFormInterface> {
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
        isSteamFlowMeasured: [false, { updateOn: 'change' }],
        isAutoTdsControlPResent: [false, { updateOn: 'change' }],
        boilerSteamGeneratedPerYear: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        boilerSteamGeneratedPerHour: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        inputFuelId: [null, Validators.required],
        costOfFuelPerUnit: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        fuelQtyPerYearIsKnown: [false, { updateOn: 'change' }],
        costOfFuelPerYear: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        fuelConsumptionPerYear: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        fuelEnergyPerUnit: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        fuelCarbonContent: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        costOfWaterPerUnit: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        costOfEffluentPerUnit: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        boilerHouseWaterQtyPerYearIsKnown: [false, { updateOn: 'change' }],
        costOfWaterPerYear: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        waterConsumptionPerHour: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        waterConsumptionPerYear: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        boilerWaterTreatmentChemicalCostsIsKnown: [false, { updateOn: 'change' }],
        totalChemicalCostPerYear: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        o2ScavengingChemicalsCostSavings: [{value: null, disabled: true}, null, validateBenchmarkInput(this.apiService)],
        isCo2OrCarbonEmissionsTaxed: [false, { updateOn: 'change' }],
        carbonTaxLevyCostPerUnit: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        costOfCo2PerUnitMass: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        isBlowdownVesselPresent: [false, { updateOn: 'change' }],
        isCoolingWaterUsed: [false, { updateOn: 'change' }],
        isSuperheatedSteam: [false, { updateOn: 'change' }],
        boilerEfficiency: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        isFeedWaterMeasured: [false, { updateOn: 'change' }],
        boilerSteamPressure: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        boilerSteamTemperature: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        isEconomizerPresent: [false, { updateOn: 'change' }],
        boilerAverageTds: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        boilerMaxTds: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        boilerFeedwaterConsumptionPerHour: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        boilerFeedwaterConsumptionPerYear: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        isFlashVesselPresent: [{value: false, disabled: true}, { updateOn: 'change' }],
        isHeatExchangerPresent: [{value: false, disabled: true}, { updateOn: 'change' }],
        waterTemperatureLeavingHeatExchanger: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        waterTreatmentMethod: [null],
        percentageWaterRejection: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        tdsOfMakeupWater: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        isMakeUpWaterMonitored: [false, { updateOn: 'change' }],
        temperatureOfMakeupWater: [{value: null, disabled: false}, Validators.required, validateBenchmarkInput(this.apiService)],
        makeupWaterAmountPerHour: [{value: null, disabled: true}, null, validateBenchmarkInput(this.apiService, true)],
        makeupWaterAmountPerYear: [{value: null, disabled: true}, null, validateBenchmarkInput(this.apiService, true)],
        atmosphericDeaerator: [true, { updateOn: 'change' }],
        pressurisedDeaerator: [false, { updateOn: 'change' }],
        temperatureOfFeedtank: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        tdsOfFeedwaterInFeedtank: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        tdsOfCondensateReturn: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        temperatureOfCondensateReturn: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        areChemicalsAddedDirectlyToFeedtank: [false, { updateOn: 'change' }],
        pressureOfFeedtank: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        pressureOfSteamSupplyingDsi: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        isCondensateReturnKnown: [false, { updateOn: 'change' }],
        percentageOfCondensateReturn: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        volumeOfCondensateReturn: [{value: null, disabled: true}, Validators.required, validateBenchmarkInput(this.apiService)],
        isDsiPresent: [false, { updateOn: 'change' }],
      }
    };

    return this.createFormGroup<InputParametersTFormInterface>({
      selectedUnits: this.createFormGroup<SelectedUnitsInterface>(data.selectedUnits),
      benchmarkInputs: this.createFormGroup<BenchmarkInputsInterface>(data.benchmarkInputs)
    }, {updateOn: 'blur'}) as TForm<InputParametersTFormInterface>;
  }

  private createProposedSetupForm(): TForm<ProposedSetupTFormInterface> {
    const fgUnits = this.getInputParamsFg().get('selectedUnits') as FormGroup;
    const data: ProposedSetupCreateFormInterface = {
      proposedSetup: {
        benchmarkBoilerEfficiency: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        benchmarkCondensateReturn: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        benchmarkCondensateReturnedPercentage: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        benchmarkCondensateTemperature: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        benchmarkDsiPressure: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        benchmarkTemperatureOfFeedtank: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        benchmarkWaterRejectionRate: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        condensateReturnUnit: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        condensateTemperatureUnit: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        dsiPressureUnit: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        economiserRequired: [false, {updateOn: 'change'}],
        proposalBoilerEfficiency: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        proposalCondensateReturned: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        proposalCondensateReturnedPercentage: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        proposalCondensateTemperature: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        proposalCostOfSodiumSulphite: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        proposalDsiPressure: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        proposalTemperatureOfFeedtank: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        proposalWaterRejectionRate: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
        temperatureOfFeedtankUnit: [0, Validators.required, validateProposed(this.apiService, fgUnits)],
      },
      features: {
        boilerEfficiencyImprovements: [false, {updateOn: 'change'}],
        increaseCondensateReturn: [false, {updateOn: 'change'}],
        addWaterTreatmentPlant: [false, {updateOn: 'change'}],
        addAutoTdsControls: [false, {
          updateOn: 'change',
          validators: disableControl(['addAutoTdsAndFlashRecovery', 'addAutoTdsAndFlashRecoveryPlusHearExchanger'])
        }],
        addAutoTdsAndFlashRecovery: [false, {
          updateOn: 'change',
          validators: disableControl(['addAutoTdsControls', 'addAutoTdsAndFlashRecoveryPlusHearExchanger'])
        }],
        addAutoTdsAndFlashRecoveryPlusHearExchanger: [false, {
          updateOn: 'change',
          validators: disableControl(['addAutoTdsControls', 'addAutoTdsAndFlashRecovery'])
        }],
        addDirectSteamInjectionToFeedtank: [false, {updateOn: 'change'}],
      },
    };

    return this.createFormGroup<ProposedSetupTFormInterface>({
      proposedSetup: this.createFormGroup<ProposedSetupInterface>(data.proposedSetup),
      features: this.createFormGroup<ProposedFeaturesInterface>(data.features),
    }, {updateOn: 'blur'}) as TForm<ProposedSetupTFormInterface>;
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

        if (control && control.value !== value) {
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

          if (control && control.value !== name[key]) {
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

  resetInputParamsFg(
    selectedUnits?: Partial<SelectedUnitsInterface>,
    benchmark?: Partial<BenchmarkInputsInterface>
  ): TForm<InputParametersTFormInterface> {

    const benchmarkInputs = {
      ...benchmark,
      hoursOfOperation: 8736,
      isSteamFlowMeasured: false,
      isAutoTdsControlPResent: false,
      fuelQtyPerYearIsKnown: false,
      boilerHouseWaterQtyPerYearIsKnown: false,
      boilerWaterTreatmentChemicalCostsIsKnown: false,
      isCo2OrCarbonEmissionsTaxed: false,
      isBlowdownVesselPresent: false,
      isCoolingWaterUsed: false,
      isSuperheatedSteam: false,
      isFeedWaterMeasured: false,
      isEconomizerPresent: false,
      isFlashVesselPresent: false,
      isHeatExchangerPresent: false,
      isMakeUpWaterMonitored: false,
      atmosphericDeaerator: true,
      pressurisedDeaerator: false,
      areChemicalsAddedDirectlyToFeedtank: false,
      isCondensateReturnKnown: false,
      isDsiPresent: false,
    };

    this.inputParamsFg.reset({benchmarkInputs, selectedUnits}, {onlySelf: true, emitEvent: false});

    return this.inputParamsFg;
  }

  getProposedSetupForm(): TForm<ProposedSetupTFormInterface> {
    if (!this.proposedSetupFg) {
      this.proposedSetupFg = this.createProposedSetupForm();
    }

    return this.proposedSetupFg;
  }
}


