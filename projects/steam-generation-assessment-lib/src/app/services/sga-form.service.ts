import { Injectable } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputParametersCreateFormInterface, InputParametersTFormInterface, TForm } from '../interfaces/forms.interface';
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
        hoursOfOperation: [null, Validators.required, validateBenchmarkInput(this.apiService)],
        isSteamFlowMeasured: [false],
        isAutoTdsControlPResent: [false],
        boilerSteamGeneratedPerYear: [{value: null, disabled: true}],
        boilerSteamGeneratedPerHour: [{value: null, disabled: true}],
        inputFuelId: [null],
        costOfFuelPerUnit: [null],
        fuelQtyPerYearIsKnown: [false],
        costOfFuelPerYear: [{value: null, disabled: true}],
        fuelConsumptionPerYear: [{value: null, disabled: true}],
        fuelEnergyPerUnit: [null],
        fuelCarbonContent: [null],
        costOfWaterPerUnit: [null],
        costOfEffluentPerUnit: [null],
        boilerHouseWaterQtyPerYearIsKnown: [false],
        costOfWaterPerYear: [{value: null, disabled: true}],
        waterConsumptionPerHour: [{value: null, disabled: true}],
        waterConsumptionPerYear: [{value: null, disabled: true}],
        boilerWaterTreatmentChemicalCostsIsKnown: [false],
        totalChemicalCostPerYear: [{value: null, disabled: true}],
        o2ScavengingChemicalsCostSavings: [{value: null, disabled: true}],
        isCo2OrCarbonEmissionsTaxed: [false],
        carbonTaxLevyCostPerUnit: [{value: null, disabled: true}],
        costOfCo2PerUnitMass: [{value: null, disabled: true}],
        isBlowdownVesselPresent: [false],
        isCoolingWaterUsed: [false],
        isSuperheatedSteam: [false],
        boilerEfficiency: [null],
        isFeedWaterMeasured: [false],
        boilerSteamPressure: [null],
        boilerSteamTemperature: [null],
        isEconomizerPresent: [false],
        boilerAverageTds: [null],
        boilerMaxTds: [null],
        boilerFeedwaterConsumptionPerHour: [{value: null, disabled: true}],
        boilerFeedwaterConsumptionPerYear: [{value: null, disabled: true}],
        isFlashVesselPresent: [false],
        isHeatExchangerPresent: [false],
        waterTemperatureLeavingHeatExchanger: [{value: null, disabled: true}],
        waterTreatmentMethod: [null],
        percentageWaterRejection: [null],
        tdsOfMakeupWater: [null],
        isMakeUpWaterMonitored: [false],
        temperatureOfMakeupWater: [{value: null, disabled: true}],
        makeupWaterAmountPerHour: [null],
        makeupWaterAmountPerYear: [{value: null, disabled: true}],
        atmosphericDeaerator: [true],
        pressurisedDeaerator: [false],
        temperatureOfFeedtank: [null],
        tdsOfFeedwaterInFeedtank: [null],
        tdsOfCondensateReturn: [null],
        temperatureOfCondensateReturn: [null],
        areChemicalsAddedDirectlyToFeedtank: [false],
        pressureOfFeedtank: [{value: null, disabled: true}],
        pressureOfSteamSupplyingDsi: [{value: null, disabled: true}],
        isCondensateReturnKnown: [false],
        percentageOfCondensateReturn: [{value: null, disabled: true}],
        volumeOfCondensateReturn: [{value: null, disabled: true}],
        isDsiPresent: [false],
      }
    };
    this.inputParamsFg = this.createFormGroup<InputParametersTFormInterface>({
      selectedUnits: this.createFormGroup<SelectedUnitsInterface>(data.selectedUnits),
      benchmarkInputs: this.createFormGroup<BenchmarkInputsInterface>(data.benchmarkInputs)
    }, {updateOn: 'blur'}) as TForm<InputParametersTFormInterface>;

    return this.inputParamsFg;
  }

  createFormValueSetter<T>(formGroup: FormGroup | TForm<any>, subFormKey?: string):
    (name: keyof T, value: any, opt?: { onlySelf?: boolean; emitEvent?: boolean; disableFilled?: boolean; }) => AbstractControl {
    if (!formGroup) {
      return null;
    }

    const fg = subFormKey ? formGroup.get(subFormKey as string) : formGroup;

    return (name, value, opt) => {
      const control = fg.get(name as string);

      if (control) {
        if (!opt || !opt.disableFilled) {
          control.markAsPristine({onlySelf: true});
          control.markAsUntouched({onlySelf: true});
        }

        control.patchValue(value, opt);
      }

      return control;
    };
  }

  getInputParamsFg(): TForm<InputParametersTFormInterface> {
    return this.inputParamsFg;
  }
}


