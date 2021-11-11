import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from "@angular/forms";
import { SteamGenerationFormInterface } from "./steam-generation-form.interface";
import { debounceTime, distinctUntilChanged, map, take } from "rxjs/operators";

@Injectable()
export class SteamGenerationAssessmentService {
  steamGenerationForm: FormGroup;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
  ) {
    // --- No fields ---
    // ARE_CO2_OR_CARBON_EMISSIONS_TAXED
    // COST_OF_WATER_PER_YEAR
    // WATER_CONSUMPTION_HOUR
    // IS_MAKE_UP_WATER_MONITORED
    // MAKE_UP_WATER_PER_HOUR
    // MAKE_UP_WATER_PER_YEAR
    // CONSUMPTION_PER_HR
    // CONSUMPTION_PER_YEAR
    this.steamGenerationForm = this.fb.group({
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

  public getForm(): FormGroup {
    return this.steamGenerationForm;
  }

  public calculateResults(form: Partial<SteamGenerationFormInterface>): Observable<any> {
    console.log(form, '-------CALCULATE--- SERVICE calculateResults()');
    return this.http.post<any>(`./Api/SteamGenerator/calculate-benchmark`, form);
  }

  public validateSgInput(field: keyof SteamGenerationFormInterface, form: Partial<SteamGenerationFormInterface>): Observable<any> {
    return this.http.post<any>(`./Api/SteamGenerator/validate-input/${field}`, form);
  }
}
