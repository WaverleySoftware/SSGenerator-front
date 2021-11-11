import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from "@angular/core";
import {
  BaseSizingModule,
  JobSizing,
  PreferenceService,
  Project,
  UnitsService,
  AdminService,
} from "sizing-shared-lib";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SteamGenerationAssessmentService } from "./steam-generation-assessment.service";
import { SteamGenerationFormInterface } from "./steam-generation-form.interface";
import { ActivatedRoute, Params } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

interface ErrorInterface {
  attemptedValue: any;
  customState: any;
  errorCode: string;
  errorMessage: string | null;
  formattedMessagePlaceholderValues: {
    PropertyName: string;
    PropertyValue: any
  }
  propertyName: string;
  severity: number;
}

@Component({
  selector: 'app-steam-generation-assessment',
  templateUrl: './steam-generation-assessment.component.html',
  styleUrls: ['./steam-generation-assessment.component.scss']
})
export class SteamGenerationAssessmentComponent extends BaseSizingModule implements OnInit, OnDestroy, AfterViewInit {
  readonly moduleGroupId: number = 9;
  readonly moduleName: string = 'steamGenerationAssessment';
  moduleId = 2;
  productName = 'Steam Generation Assessment';
  sizingModuleForm: FormGroup;

  public errors: ErrorInterface[];
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private steamGenerationAssessmentService: SteamGenerationAssessmentService,
    private preferenceService: PreferenceService,
    private unitsService: UnitsService,
    private elRef: ElementRef,
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    private fb: FormBuilder,
  ) {
    super();
    this.getSettings();
    // --- No fields ---
    // ARE_CO2_OR_CARBON_EMISSIONS_TAXED
    // COST_OF_WATER_PER_YEAR
    // WATER_CONSUMPTION_HOUR
    // IS_MAKE_UP_WATER_MONITORED
    // MAKE_UP_WATER_PER_HOUR
    // MAKE_UP_WATER_PER_YEAR
    // CONSUMPTION_PER_HR
    // CONSUMPTION_PER_YEAR
    this.sizingModuleForm = this.fb.group({
      hoursOfOperation: [8.736, { validators: [Validators.required], asyncValidators: [], updateOn: 'blur' }], // HOURS_OF_OPERATION
      isSteamFlowMeasured: [false], // IS_STEAM_FLOW_MEASURED
      isAutoTdsControlPResent: [false], // IS_AUTO_TDS_PRESENT
      boilerSteamGeneratedPerYear: [0], // STEAM_GENERATION_PER_HOUR && STEAM_GENERATION_PER_YEAR
      boilerSteamGeneratedPerYearUnit: [0], // UNIT
      inputFuelId: [5427], // FUEL_TYPE
      inputFuelUnit: [0, Validators.required], // UNIT type: "BoilerHouseEnergy" unitType: "BoilerHouseEnergyUnits"
      costOfFuelPerUnit: [0.025, Validators.required], // COST_OF_FUEL_PER_UNIT
      costOfFuelUnit: [0], // UNIT
      costOfFuelPerYear: [1337500, Validators.required], // FUEL_COSTS_PER_YEAR : Original "Fuel Costs per Year"
      fuelQtyPerYearIsKnown: [false], // IS_FUEL_CONSUMPTION_MEASURED
      fuelConsumptionPerYear: [0, Validators.required], // FUEL_CONSUMPTION_PER_YEAR
      fuelConsumptionPerYearUnit: [0], // UNIT
      fuelEnergyPerUnit: [0, Validators.required], // FUEL_CALORIFIC_VALUE
      fuelEnergyPerUnitUnit: [0], // UNIT
      fuelCarbonContent: [0, Validators.required], // CO2_EMISSIONS_PER_UNIT_FUEL
      fuelCarbonContentUnit: [0], // UNIT
      costOfWaterPerUnit: [0, Validators.required], // COST_OF_WATER_FSLASH_UNIT
      costOfWaterUnit: [0], // UNIT
      costOfEffluentPerUnit: [0, Validators.required], // COST_OF_EFFLUENT_FSLASH_UNIT
      costOfEffluentUnit: [0], // UNIT
      boilerHouseWaterQtyPerYearIsKnown: [false], // IS_WATER_ENTERING_THE_BOILER_HOUSE_MEASURED : Original IS_BOILER_HOUSE_WATER_MEASURED
      waterConsumptionPerYear: [0, Validators.required], // WATER_CONSUMPTION_YEAR : Original WATER_CONSUMPTION_PER_YEAR
      waterConsumptionPerYearUnit: [0], // UNIT
      boilerWaterTreatmentChemicalCostsIsKnown: [false], // ARE_CHEMICAL_COST_KNOWN : Original IS_CHEMICAL_COSTS_PER_YEAR_KNOWN
      totalChemicalCostPerYear: [0, Validators.required], // TOTAL_CHEMICAL_COSTS_PER_YEAR : Original TOTAL_CHEMICAL_COST_PER_YEAR
      totalChemicalCostPerYearUnit: [0], // UNIT
      costOfChemistsPerUnitOfWater: [0], // ------------
      costOfChemistsPerUnitOfWaterUnit: [0], // ------------
      o2ScavengingChemicalsCostSavings: [0], // O2_SCAVENGING_CHEMICALS_COST_SAVINGS
      o2ScavengingChemicalsCostSavingsUnit: [0], // UNIT
      carbonTaxLevyCostPerUnit: [0, Validators.required], // CARBON_TAX_LEVY_COST_PER_UNIT
      carbonTaxLevyCostUnit: [0], // UNIT
      costOfCo2PerUnitMass: [0, Validators.required], // COST_OF_CO2_PER_UNIT_MAX : Original "Cost of CO2 / Unit Mass"
      costOfCo2Unit: [0], // UNIT
      isBlowdownVesselPresent: [false], // IS_BLOWDOWN_VESSEL_PRESENT
      isCoolingWaterUsed: [false], // IS_COOLING_WATER_USED
      isSuperheatedSteam: [false], // IS_SUPERHEATED_STEAM
      boilerEfficiency: [50, Validators.required], // BOILER_EFFICIENCY
      isFeedWaterMeasured: [false], // IS_FEEDWATER_FLOWRATE_MEASURED
      boilerSteamPressure: [0, Validators.required], // STEAM_PRESSURE
      boilerSteamPressureUnit: [0], // UNIT
      boilerSteamTemperature: [0], // STEAM_TEMPERATURE
      boilerSteamTemperatureUnit: [0], // UNIT
      isEconomizerPresent: [false], // IS_ECONOMISER_PRESENT
      boilerAverageTds: [0], // AVERAGE_BOILER_TDS : Original BOILER_AVERAGE_TDS
      boilerAverageTdsUnit: [0], // UNIT
      boilerMaxTds: [0], // MAXIMUM_ALLOWABLE_BOILER_TDS : Original BOILER_MAX_TDS
      boilerMaxTdsUnit: [0], // UNIT
      boilerFeedwaterConsumption: [0], // CONSUMPTION_PER_HR && CONSUMPTION_PER_YEAR
      boilerFeedwaterConsumptionUnit: [0], // UNIT
      isFlashVesselPresent: [false], // IS_FLASH_VESSEL_PRESENT
      isHeatExchangerPresent: [false], // IS_HEAT_EXCHANGER_PRESENT
      waterTemperatureLeavingHeatExchanger: [0], // WATER_TEMPERATURE_LEAVING_HEAT_EXCHANGER
      waterTemperatureLeavingHeatExchangerUnit: [0],
      waterTreatmentMethod: [1], // WATER_TREATMENT_METHOD
      percentageWaterRejection: [0], // PERCENTAGE_WATER_REJECTION
      percentageWaterRejectionUnit: [0], // UNIT
      tdsOfMakeupWater: [0], // TDS_OF_MAKEUP_WATER
      tdsOfMakeupWaterUnit: [0], // UNIT
      temperatureOfMakeupWater: [0], // TEMPERATURE_OF_MAKE_UP_WATER : Original TEMPERATURE_OF_MAKEUP_WATER
      temperatureOfMakeupWaterUnit: [0], // UNIT
      makeupWaterAmount: [0], // ------------
      makeupWaterAmountUnit: [0], // ------------
      atmosphericDeaerator: [false], // AUTMOSPHERIC_DEAERATOR
      pressurisedDeaerator: [false], // PRESSURLSED_DEAERATOR
      temperatureOfFeedtank: [0], // TEMPERATURE_OF_FEEDTANK
      temperatureOfFeedtankUnit: [0], // UNIT
      tdsOfFeedwaterInFeedtank: [0], // TDS_OF_FEEDWATER_IN_FEEDTANK
      tdsOfFeedwaterInFeedtankUnit: [0], // UNIT
      tdsOfCondensateReturn: [0], // TDS_OF_CONDENSATE_RETURN
      tdsOfCondensateReturnUnit: [0], // UNIT
      temperatureOfCondensateReturn: [0], // TEMPERATURE_OF_CONDENSATE_RETURN
      temperatureOfCondensateReturnUnit: [0], // UNIT
      areChemicalsAddedDirectlyToFeedtank: [false], // ARE_CHEMICALS_ADDED_DIRECTLY_TO_FEEDTANK
      pressureOfFeedtank: [0], // ------------
      pressureOfFeedtankUnit: [0], // ------------
      pressureOfSteamSupplyingDsi: [0], // PRESSURE_OF_STEAM_SUPPLYING_DSI
      pressureOfSteamSupplyingDsiUnit: [0], // UNIT
      isCondensateReturnKnown: [false], // IS_CONDENSATE_RETURN_KNOWN
      percentageOfCondensateReturn: [0], // PERCENTAGE_OF_CONDENSATE_RETURN
      percentageOfCondensateReturnUnit: [0], // UNIT
      volumeOfCondensateReturn: [0], // VOLUME_OF_CONDENSATE_RETURN
      volumeOfCondensateReturnUnit: [0], // UNIT
      isDsiPresent: [false], // IS_DSI_PRESENT
      proposalTemperatureUnit: ["string"],
      proposalTemperatureUnitUnit: [0],
      isBoilerEfficiencySelected: [false],
      isBoilerEfficiencyAvailable: [false],
      proposalBoilerEfficiency: [0],
      isIncreasingCondensateReturnSelected: [false],
      isIncreasingCondensateReturnAvailable: [false],
      proposalCondensateReturned: [0],
      proposalCondensateReturnedUnit: [0],
      proposalCondensateReturnedPercentage: [0],
      proposalCondensateTemperature: [0],
      proposalCondensateTemperatureUnit: [0],
      changingWaterTreatmentMethodSelected: [false],
      changingWaterTreatmentMethodAvailable: [false],
      proposalMakeUpWaterTds: [0],
      proposalMakeUpWaterTdsUnit: [0],
      proposalPercentFeedwaterRejected: [0],
      proposalPercentFeedwaterRejectedUnit: [0],
      addingAutomaticTdsControlSelected: [false],
      addingAutomaticTdsControlAvailable: [false],
      addingFlashHeatRecoveryToAutoTdsControlSelected: [false],
      addingFlashHeatRecoveryToAutoTdsControlAvailable: [false],
      addingHeatExchangerforHeatRecoveryToTdsBlowdownSelected: [false],
      addingHeatExchangerforHeatRecoveryToTdsBlowdownAvailable: [false],
      effectOfDsiOnHotwellSelected: [false],
      effectOfDsiOnHotwellAvailable: [false],
      proposalDesiredHotwellTemperatureUsingDSI: [0],
      proposalDesiredHotwellTemperatureUsingDSIUnit: [0],
      proposalCostOfSodiumSulphite: [0],
      proposalCostOfSodiumSulphiteUnit: [0],
      proposalDSIPressure: [0],
      proposalDSIPressureUnit: [0]
    });
  }

  ngOnInit() {
    this.loadJob();
  }

  ngAfterViewInit() {
    this.setStaticFormFields();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onCalculateSizing(formGroup: FormGroup): any {
    this.steamGenerationAssessmentService
      .calculateResults(formGroup.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response) => {
        console.log(response, '-----response');
      });
    return true;
  }

  onEnterHeaderDetailsForm(): any {
    return true;
  }

  onExcelSubmit(): any {
    return true;
  }

  onGetTiSheet(): any {
    return true;
  }

  onNewSizingForm(): any {
    console.log('-----onNewSizingForm----')
    return true;
  }

  onPdfSubmit(): any {
    return true;
  }

  onResetModuleForm(): any {
    return true;
  }

  onSave(savedProjectDetails: Project): JobSizing {
    console.log('-----onSAve-----');
    return undefined;
  }

  onSaveJob(): any {
    console.log('-----onSaveJob-----');
    return true;
  }

  onUnitsChanged(): any {
    this.setStaticFormFields();
    return true;
  }

  repackageSizing(): any {
    return true;
  }

  private setStaticFormFields(): void {
    const staticFieldsArr: {controlName: string; preferenceName: string; modalMasterKey?: string;}[] = [
      {controlName: 'inputFuelUnit', preferenceName: 'BoilerHouseEnergyUnits', modalMasterKey: 'ENERGY'},
    ];

    for (const { controlName, preferenceName, modalMasterKey} of staticFieldsArr) {
      this.sizingModuleForm.get(controlName).setValue(this.getUnitValueByName(preferenceName, modalMasterKey));
    }

    console.log(this.preferenceService.sizingUnitPreferences, '-----');
  }

  private getUnitValueByName(name: string, newSizingItemKey?: string, units?: any[], currencies?: any[]): number | string {
    const sizingPreference = this.preferenceService.sizingUnitPreferences.find(({ unitType }) => unitType === name);
    let value = sizingPreference && sizingPreference.preference && sizingPreference.preference.value;

    if (!sizingPreference) {
      const preference = this.preferenceService.allPreferences.find((p) => p && p.name === name);
      if (preference) {
        this.preferenceService.addSizingUnitPreference(
          preference,
          name,
          newSizingItemKey || preference.masterTextKey,
          this.moduleGroupId,
          units,
          currencies
        );
        value = preference.value;
      }
    }

    return Number.isNaN(Number(value)) ? value : (value && +value);
  }

  private getSettings(): void {
    this.preferenceService.getAllPreferences().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      // console.log(data, '-----getAllPreferences')
    });
    this.preferenceService.getUserPreferences().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      // console.log(data, '----getUserPreferences');
    });
    this.unitsService.getAllUnitsByAllTypes().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      // console.log(data, '----getAllUnitsByAllTypes')
    });
    this.setSizingCurrencies();
  }

  private setSizingCurrencies() {
    this.adminService.getCurrencyData().subscribe((currencies) => {
      this.getUnitValueByName('BHCurrency', 'CURRENCY', null, currencies);
    });
  }

  // TODO: Function for focus on first invalid field (need to create toggle tabs to first invalid field)
  private focusFirstErrorField(formGroup: FormGroup): void {
    // check all fields
    for (const key of Object.keys(formGroup.controls)) {
      // get first invalid control
      if (formGroup.controls[key].invalid) {
        // get field by formcontrolname === name
        const field = this.elRef.nativeElement.querySelector(`[formcontrolname="${key}"] input[ng-reflect-model]`);
        // Focus on field
        field && field.focus();
        // loop stop
        break;
      }
    }
  }

  private validate(field: keyof SteamGenerationFormInterface): void {
    const control = this.sizingModuleForm.controls[field];
    if (!control) return null;

    const value = Number.isNaN(Number(control.value)) ? control.value : +control.value;

    this.steamGenerationAssessmentService
      .validateSgInput(field, { [field]: value || null })
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      () => control.setErrors(null),
      ({error}) => {
        const errors  = (error.errors[`$.${field}`] || error.errors);
        if (errors) {
          control.setErrors({ validation: errors[0] });
        }
      }
    );
  }

  private loadJob(): void {
    this.activatedRoute.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params: Params) => {
        const { projectId, jobId } = params;
        // TODO: Create projects/jobs functionality
        console.log(`projectId=${projectId}, jobId=${jobId}`);
      });
  }
}
