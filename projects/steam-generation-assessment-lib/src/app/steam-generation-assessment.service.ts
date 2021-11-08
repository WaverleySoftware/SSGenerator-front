import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SteamGenerationFormInterface } from "./steam-generation-form.interface";

@Injectable()
export class SteamGenerationAssessmentService {
  steamGenerationForm: FormGroup;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
  ) {

    // --- No fields ---
    // COST_OF_WATER_PER_YEAR
    // WATER_CONSUMPTION_HOUR
    // STEAM_GENERATION_PER_HOUR
    // STEAM_GENERATION_PER_YEAR
    // IS_MAKE_UP_WATER_MONITORED
    // MAKE_UP_WATER_PER_HOUR
    // MAKE_UP_WATER_PER_YEAR
    // CONSUMPTION_PER_HR
    // CONSUMPTION_PER_YEAR
    this.steamGenerationForm = this.fb.group({
      hoursOfOperation: [{value: 0, disabled: false}, Validators.required], // HOURS_OF_OPERATION
      isSteamFlowMeasured: [null], // IS_STEAM_FLOW_MEASURED
      isAutoTdsControlPResent: [null], // IS_AUTO_TDS_PRESENT
      boilerSteamGeneratedPerYear: [0],
      boilerSteamGeneratedPerYearUnit: [0],
      inputFuelId: [null], // FUEL_TYPE
      inputFuelUnit: [{value: 1, disabled: false}, Validators.required],
      costOfFuelPerUnit: [{value: 1, disabled: false}, Validators.required], // COST_OF_FUEL_PER_UNIT
      costOfFuelUnit: [0],
      costOfFuelPerYear: [0], // FUEL_COSTS_PER_YEAR : Original "Fuel Costs per Year"
      fuelQtyPerYearIsKnown: [null], // IS_FUEL_CONSUMPTION_MEASURED
      fuelConsumptionPerYear: [0, Validators.required], // FUEL_CONSUMPTION_PER_YEAR
      fuelConsumptionPerYearUnit: [0],
      fuelEnergyPerUnit: [0], // FUEL_CALORIFIC_VALUE
      fuelCarbonContent: [0], // CO2_EMISSIONS_PER_UNIT_FUEL
      fuelCarbonContentUnit: [0],
      costOfWaterPerUnit: [0], // COST_OF_WATER_FSLASH_UNIT
      costOfWaterUnit: [0],
      costOfEffluentPerUnit: [0], // COST_OF_EFFLUENT_FSLASH_UNIT
      costOfEffluentUnit: [0],
      boilerHouseWaterQtyPerYearIsKnown: [null], // IS_WATER_ENTERING_THE_BOILER_HOUSE_MEASURED : Original IS_BOILER_HOUSE_WATER_MEASURED
      waterConsumptionPerYear: [0], // WATER_CONSUMPTION_YEAR : Original WATER_CONSUMPTION_PER_YEAR
      waterConsumptionPerYearUnit: [0],
      boilerWaterTreatmentChemicalCostsIsKnown: [null], // ARE_CHEMICAL_COST_KNOWN : Original IS_CHEMICAL_COSTS_PER_YEAR_KNOWN
      totalChemicalCostPerYear: [0], // TOTAL_CHEMICAL_COSTS_PER_YEAR : Original TOTAL_CHEMICAL_COST_PER_YEAR
      totalChemicalCostPerYearUnit: [0],
      costOfChemistsPerUnitOfWater: [0],
      costOfChemistsPerUnitOfWaterUnit: [0],
      o2ScavengingChemicalsCostSavings: [0], // O2_SCAVENGING_CHEMICALS_COST_SAVINGS
      o2ScavengingChemicalsCostSavingsUnit: [0],
      carbonTaxLevyCostPerUnit: [0], // CARBON_TAX_LEVY_COST_PER_UNIT
      carbonTaxLevyCostUnit: [0],
      costOfCo2PerUnitMass: [0], // COST_OF_CO2_PER_UNIT_MAX : Original "Cost of CO2 / Unit Mass"
      costOfCo2Unit: [0],
      isBlowdownVesselPresent: [null], // IS_BLOWDOWN_VESSEL_PRESENT
      isCoolingWaterUsed: [null], // IS_COOLING_WATER_USED
      isSuperheatedSteam: [null], // IS_SUPERHEATED_STEAM
      boilerEfficiency: [50], // BOILER_EFFICIENCY
      isFeedWaterMeasured: [null], // IS_FEEDWATER_FLOWRATE_MEASURED || IS_WATER_ENTERING_THE_BOILER_HOUSE_MEASURED
      boilerSteamPressure: [0], // STEAM_PRESSURE
      boilerSteamPressureUnit: [0],
      boilerSteamTemperature: [0], // STEAM_TEMPERATURE
      boilerSteamTemperatureUnit: [0],
      isEconomizerPresent: [null], // IS_ECONOMISER_PRESENT
      boilerAverageTds: [0], // AVERAGE_BOILER_TDS : Original BOILER_AVERAGE_TDS
      boilerAverageTdsUnit: [0],
      boilerMaxTds: [0], // MAXIMUM_ALLOWABLE_BOILER_TDS : Original BOILER_MAX_TDS
      boilerMaxTdsUnit: [0],
      boilerFeedwaterConsumption: [0],
      boilerFeedwaterConsumptionUnit: [0],
      isFlashVesselPresent: [null], // IS_FLASH_VESSEL_PRESENT
      isHeatExchangerPresent: [null], // IS_HEAT_EXCHANGER_PRESENT
      waterTemperatureLeavingHeatExchanger: [0], // WATER_TEMPERATURE_LEAVING_HEAT_EXCHANGER
      waterTemperatureLeavingHeatExchangerUnit: [0],
      waterTreatmentMethod: [null], // WATER_TREATMENT_METHOD
      percentageWaterRejection: [0], // PERCENTAGE_WATER_REJECTION
      percentageWaterRejectionUnit: [0],
      tdsOfMakeupWater: [0], // TDS_OF_MAKEUP_WATER
      tdsOfMakeupWaterUnit: [0],
      temperatureOfMakeupWater: [0], // TEMPERATURE_OF_MAKE_UP_WATER : Original TEMPERATURE_OF_MAKEUP_WATER
      temperatureOfMakeupWaterUnit: [0],
      makeupWaterAmount: [0],
      makeupWaterAmountUnit: [0],
      atmosphericDeaerator: [false], // AUTMOSPHERIC_DEAERATOR
      pressurisedDeaerator: [false], // PRESSURLSED_DEAERATOR
      temperatureOfFeedtank: [0], // TEMPERATURE_OF_FEEDTANK
      temperatureOfFeedtankUnit: [0],
      tdsOfFeedwaterInFeedtank: [0], // TDS_OF_FEEDWATER_IN_FEEDTANK
      tdsOfFeedwaterInFeedtankUnit: [0],
      tdsOfCondensateReturn: [0], // TDS_OF_CONDENSATE_RETURN
      tdsOfCondensateReturnUnit: [0],
      temperatureOfCondensateReturn: [0], // TEMPERATURE_OF_CONDENSATE_RETURN
      temperatureOfCondensateReturnUnit: [0],
      areChemicalsAddedDirectlyToFeedtank: [null], // ARE_CHEMICALS_ADDED_DIRECTLY_TO_FEEDTANK
      pressureOfFeedtank: [0],
      pressureOfFeedtankUnit: [0],
      pressureOfSteamSupplyingDsi: [0], // PRESSURE_OF_STEAM_SUPPLYING_DSI
      pressureOfSteamSupplyingDsiUnit: [0],
      isCondensateReturnKnown: [true], // IS_CONDENSATE_RETURN_KNOWN
      percentageOfCondensateReturn: [0], // PERCENTAGE_OF_CONDENSATE_RETURN
      percentageOfCondensateReturnUnit: [0],
      volumeOfCondensateReturn: [0], // VOLUME_OF_CONDENSATE_RETURN
      volumeOfCondensateReturnUnit: [0],
      isDsiPresent: [true], // IS_DSI_PRESENT
      proposalTemperatureUnit: ["string"],
      proposalTemperatureUnitUnit: [0],
      isBoilerEfficiencySelected: [true],
      isBoilerEfficiencyAvailable: [true],
      proposalBoilerEfficiency: [0],
      isIncreasingCondensateReturnSelected: [true],
      isIncreasingCondensateReturnAvailable: [true],
      proposalCondensateReturned: [0],
      proposalCondensateReturnedUnit: [0],
      proposalCondensateReturnedPercentage: [0],
      proposalCondensateTemperature: [0],
      proposalCondensateTemperatureUnit: [0],
      changingWaterTreatmentMethodSelected: [true],
      changingWaterTreatmentMethodAvailable: [true],
      proposalMakeUpWaterTds: [0],
      proposalMakeUpWaterTdsUnit: [0],
      proposalPercentFeedwaterRejected: [0],
      proposalPercentFeedwaterRejectedUnit: [0],
      addingAutomaticTdsControlSelected: [true],
      addingAutomaticTdsControlAvailable: [true],
      addingFlashHeatRecoveryToAutoTdsControlSelected: [true],
      addingFlashHeatRecoveryToAutoTdsControlAvailable: [true],
      addingHeatExchangerforHeatRecoveryToTdsBlowdownSelected: [true],
      addingHeatExchangerforHeatRecoveryToTdsBlowdownAvailable: [true],
      effectOfDsiOnHotwellSelected: [true],
      effectOfDsiOnHotwellAvailable: [true],
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

  public getUserUnits() {

  }

  public validateSgInput(field: keyof SteamGenerationFormInterface, form: Partial<SteamGenerationFormInterface>): Observable<any> {
    return this.http.post<any>(`./Api/SteamGenerator/validate-input/${field}`, form);
  }
}
