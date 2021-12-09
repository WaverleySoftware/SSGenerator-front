import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { AbstractControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, takeUntil } from "rxjs/operators";
import { Preference } from "sizing-shared-lib";
import {
  FormFieldTypesInterface, SgaBoilerEfficiencyInterface,
  SteamCalorificRequestInterface,
  SteamGeneratorInputsInterface
} from "../steam-generation-form.interface";
import { SteamGenerationAssessmentService } from "../steam-generation-assessment.service";

@Component({
  selector: 'app-sga-input-parameters',
  templateUrl: './sga-input-parameters.component.html',
  styleUrls: ['./sga-input-parameters.component.scss']
})
export class SgaInputParametersComponent implements OnDestroy {
  @Input() formGroup: FormGroup;
  @Input() moduleGroupId: number;
  @Output() changeFuelType: EventEmitter<SteamCalorificRequestInterface> = new EventEmitter<SteamCalorificRequestInterface>();
  @Output() calculateEfficiency: EventEmitter<SgaBoilerEfficiencyInterface> = new EventEmitter<SgaBoilerEfficiencyInterface>();

  public fuelType: Preference
  public fields: FormFieldTypesInterface;
  public carbonEmissionUpdate$ = new Subject<string>();
  public pressureTemperatureUpdate$ = new Subject<string>();
  public formGroupKey = 'steamGeneratorInputs'; // Form builder child formGroup key

  private _ngUnsubscribe = new Subject<void>();

  boilerHouseParameters = {
    boiler: [
      // boiler_parameters
      'isSuperheatedSteam',
      'isSteamFlowMeasured',
      'boilerSteamGeneratedPerHour',
      'boilerSteamGeneratedPerYear',
      'boilerSteamTemperature',
      'boilerSteamPressure',
      'isEconomizerPresent',
      'boilerEfficiency'
    ],
    tdsBlowdown: [
      // blowdown_equipment
      'isBlowdownVesselPresent',
      'isCoolingWaterUsed',
      'isAutoTdsControlPResent',
      'isFlashVesselPresent',
      'isHeatExchangerPresent',
      'waterTemperatureLeavingHeatExchanger',
      // tds_blowdown_parameters
      'tdsOfFeedwaterInFeedtank',
      'boilerAverageTds',
      'boilerMaxTds',
    ],
    waterTreatment: [
      // make_up_water
      'isMakeUpWaterMonitored',
      'temperatureOfMakeupWater',
      'makeupWaterAmountPerHour',
      'makeupWaterAmountPerYear',
      // water_treatment_parameters
      'waterTreatmentMethod',
      'percentageWaterRejection',
      'tdsOfMakeupWater',
    ],
    feedwaterAndCondensate: [
      // deaerator_type
      'atmosphericDeaerator',
      'pressurisedDeaerator',
      // boiler_feedwater
      'isFeedWaterMeasured',
      'boilerFeedwaterConsumptionPerHour',
      'boilerFeedwaterConsumptionPerYear',
      'temperatureOfFeedtank',
      'tdsOfFeedwaterInFeedtank',
      'areChemicalsAddedDirectlyToFeedtank',
      'pressureOfSteamSupplyingDsi',
      'pressureOfFeedtank',
      // condensate_return
      'isCondensateReturnKnown',
      'percentageOfCondensateReturn',
      'volumeOfCondensateReturn',
      'temperatureOfCondensateReturn',
      'tdsOfCondensateReturn'
    ]
  };
  utilityParametersFields = [
    // Fuel
    'hoursOfOperation',
    'inputFuelId',
    'fuelEnergyPerUnit',
    'fuelCarbonContent',
    'costOfFuelPerUnit',
    'fuelQtyPerYearIsKnown',
    'costOfFuelPerYear',
    'fuelConsumptionPerYear',
    // CO2 Emission
    'isCo2OrCarbonEmissionsTaxed',
    'carbonTaxLevyCostPerUnit',
    'costOfCo2PerUnitMass',
    // Water
    'costOfWaterPerUnit',
    'boilerHouseWaterQtyPerYearIsKnown',
    'costOfWaterPerYear',
    'waterConsumptionPerHour',
    'waterConsumptionPerYear',
    // Water treatment chemicals
    'boilerWaterTreatmentChemicalCostsIsKnown',
    'totalChemicalCostPerYear',
    'o2ScavengingChemicalsCostSavings',
    // Water effluent
    'costOfEffluentPerUnit'
  ];

  constructor(
    private steamGenerationAssessmentService: SteamGenerationAssessmentService,
    private elRef: ElementRef,
  ) {
    this.fields = this.steamGenerationAssessmentService.getSgaFormFields();

    // Calculate Carbon emission
    this.carbonEmissionUpdate$
      .pipe(
        takeUntil(this._ngUnsubscribe),
        debounceTime(800),
        distinctUntilChanged(),
        filter(v => !!v)
      )
      .subscribe(v => this._changeCarbonEmission(v));

    this.pressureTemperatureUpdate$
      .pipe(
        takeUntil(this._ngUnsubscribe),
        debounceTime(800),
        distinctUntilChanged(),
        filter(v => !!v)
      )
      .subscribe(v => this._changeSteamPressure(v));
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  public checkUtilityParametersIsValid(): boolean {
    let isInvalid: boolean;

    for (let utilityParametersField of this.utilityParametersFields) {
      const inFieldInvalid = this.formGroup.get(`${this.formGroupKey}.${utilityParametersField}`).invalid &&
      this.formGroup.get(`${this.formGroupKey}.${utilityParametersField}`).touched

      if (inFieldInvalid) {
        isInvalid = inFieldInvalid;
        break;
      }
    }

    return isInvalid;
  }

  public checkBoilerHouseParametersIsValid(): {
    boiler: boolean;
    tdsBlowdown: boolean;
    waterTreatment: boolean;
    feedwaterAndCondensate: boolean;
    isInvalid: boolean;
  } {
    let isInvalid = {
      boiler: false,
      tdsBlowdown: false,
      waterTreatment: false,
      feedwaterAndCondensate: false,
      isInvalid: false,
    };

    for (let tabName in this.boilerHouseParameters) {
      for (let fieldName of this.boilerHouseParameters[tabName]) {
        const control = this.formGroup.get(`${this.formGroupKey}.${fieldName}`);
        const inFieldInvalid = (control.invalid && control.touched) || (control.touched && control.pending);

        if (inFieldInvalid) {
          isInvalid[tabName] = inFieldInvalid;
          isInvalid.isInvalid = true;
          break;
        }
      }
    }

    return isInvalid;
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
      const {inputFuelId, inputFuelUnit, isEconomizerPresent} = this._getMultipleControlValues({
        inputFuelId: 'inputFuelId',
        inputFuelUnit: 'inputFuelUnit',
        isEconomizerPresent: 'isEconomizerPresent',
      }) as {inputFuelId: string, inputFuelUnit: number, isEconomizerPresent: boolean};

      this.changeFuelType.emit({ inputFuelId, inputFuelUnit, energyUnitSelected: null, smallWeightUnitSelected: null });
      this.calculateEfficiency.emit({ inputFuelId, isEconomizerPresent })
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
      case 'fuelEnergyPerUnit': this.carbonEmissionUpdate$.next(value); break;
      case 'boilerSteamPressure': this.pressureTemperatureUpdate$.next(value); break;
    }
  }

  public focusOnField(formControlName: keyof SteamGeneratorInputsInterface, isFocused: boolean = true): void {
    if (isFocused) {
      const field = this.elRef.nativeElement
        .querySelector(`[ng-reflect-name="${formControlName}"] input[type="number"]`);

      if (field && field.focus) {
        setTimeout(() => field.focus(), 100);
      }
    }
  }

  /**
   * @name isRequired check is field has required validator
   * @param {string} controlName name of Inputs form field
   * @returns {boolean} is has Validators.required
   * */
  public isRequired(controlName: keyof SteamGeneratorInputsInterface): boolean {
    const control = this.formGroup.get(`${this.formGroupKey}.${controlName}`);
    const validator = control && control.validator && control.validator({} as AbstractControl);

    return validator && validator.required;
  }

  public disableField(fieldName: string | string[]): void {
    if (Array.isArray(fieldName)) {
      for (let name of fieldName) {
        this._disableControl(name);
      }
    } else {
      this._disableControl(fieldName);
    }
  }

  private _changeSteamPressure(boilerSteamPressureValue): void {
    const selectedUnits = this.steamGenerationAssessmentService.getSizingPreferenceValues({
      temperatureUnitSelected: 'TemperatureUnit',
      pressureUnitSelected: 'PressureUnit',
    }) as { temperatureUnitSelected: number; pressureUnitSelected: number; };
    const inputValues = this._getMultipleControlValues({
      isSuperheatedSteam: 'isSuperheatedSteam',
      boilerSteamPressure: 'boilerSteamPressure',
      boilerSteamTemperature: 'boilerSteamTemperature',
    }) as { isSuperheatedSteam: boolean; boilerSteamPressure: number; boilerSteamTemperature: number; };

    if (inputValues.isSuperheatedSteam && inputValues.boilerSteamPressure) {
      this.formGroup.get(`${this.formGroupKey}.boilerSteamTemperature`).clearValidators();
      this.formGroup.get(`${this.formGroupKey}.boilerSteamTemperature`).updateValueAndValidity()
    }

    this.steamGenerationAssessmentService.calculateSaturatedAndTemperature({...selectedUnits, ...inputValues, boilerSteamTemperature: null })
      .pipe(takeUntil(this._ngUnsubscribe), filter(res => res && (res.isValid === undefined || res.isValid)))
      .subscribe(({ boilerSteamTemperature }) => {
        const temperature = boilerSteamTemperature && boilerSteamTemperature.boilerSteamTemperature;

        if (temperature) {
          this.formGroup
            .get(`${this.formGroupKey}.boilerSteamTemperature`)
            .setValidators([Validators.required, Validators.min(temperature)]);

          if (
            !inputValues.isSuperheatedSteam || !inputValues.boilerSteamTemperature ||
            inputValues.boilerSteamTemperature < boilerSteamTemperature.boilerSteamTemperature
          ) {
            this.steamGenerationAssessmentService
              .changeSgaFieldFilled('boilerSteamTemperature', true);
            this.steamGenerationAssessmentService
              .setFormValue('boilerSteamTemperature', temperature);
            this.formGroup
              .get(`${this.formGroupKey}.boilerSteamTemperature`)
              .updateValueAndValidity({ onlySelf: true });
          }
        }
      });
  }

  private _changeCarbonEmission(fuelEnergyPerUnit): void {
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
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((res) => this._setInputFormFields(res));
  }

  private _setInputFormFields(data: Partial<Record<keyof FormFieldTypesInterface, any>>): void {
    for (let formKey in data) {
      this.steamGenerationAssessmentService.changeSgaFieldFilled(formKey as keyof FormFieldTypesInterface, true);
      this.steamGenerationAssessmentService.setFormValue(formKey, data[formKey]);
    }
  }

  private _disableFilled(fieldName: keyof FormFieldTypesInterface): void {
    if (this.fields[fieldName].filled) {
      this.steamGenerationAssessmentService.changeSgaFieldFilled(fieldName, false);
    }
  }

  private _disableControl(controlName: string): AbstractControl {
    const control = this.formGroup.get(`${this.formGroupKey}.${controlName}`);

    if (!control || control.disabled) return null;

    control.disable({ onlySelf: true });

    return control;
  }

  private _getMultipleControlValues(obj: { [key: string]: string }): {[key: string]: any} {
    const result = {};

    for (let objKey in obj) {
      result[objKey] = this.formGroup.get(`${this.formGroupKey}.${obj[objKey]}`).value;
    }

    return result;
  }
}
