import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import {
  FormFieldTypesInterface,
  SgaHttpValidationResponseInterface,
  SgaSaturatedTemperatureBodyInterface,
  SgaSizingModuleFormInterface,
  SteamCalorificRequestInterface,
  SteamCarbonEmissionInterface,
  SteamGeneratorInputsInterface,
  SteamGeneratorSelectedUnitsInterface,
} from "./steam-generation-form.interface";
import { PreferenceService, Preference } from "sizing-shared-lib";
import { SizingUnitPreference } from "../../../sizing-shared-lib/src/lib/shared/preference/sizing-unit-preference.model";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SgaValidator } from "./steam-generation-assessment.validator";
import { catchError, map, tap } from "rxjs/operators";

@Injectable()
export class SteamGenerationAssessmentService {
  private _sgaFormFields: FormFieldTypesInterface =  {
    hoursOfOperation: {
      formControlName: 'hoursOfOperation',
      label: 'HOURS_OF_OPERATION',
      filled: true
    },
    // FUEL
    fuelEnergyPerUnit: {
      formControlName: 'fuelEnergyPerUnit',
      label: 'FUEL_CALORIFIC_VALUE',
      unitNames: ['BoilerHouseEnergyUnits', /*inputFuelUnit*/],
      translations: ['ENERGY'],
      controlNames: [null, 'inputFuelUnit'],
    },
    fuelCarbonContent: {
      formControlName: 'fuelCarbonContent',
      label: 'CO2_EMISSIONS_PER_UNIT_FUEL',
      unitNames: ['WeightUnit'],
      translations: ['SMALL_WEIGHT'],
    },
    costOfFuelPerUnit: {
      formControlName: 'costOfFuelPerUnit',
      label: 'COST_OF_FUEL_PER_UNIT',
      unitNames: ['BHCurrency'],
      translations: ['CURRENCY'],
    },
    fuelQtyPerYearIsKnown: {
      formControlName: 'fuelQtyPerYearIsKnown',
      label: 'IS_FUEL_CONSUMPTION_MEASURED'
    },
    costOfFuelPerYear: {
      formControlName: 'costOfFuelPerYear',
      label: 'FUEL_COSTS_PER_YEAR',
      unitNames: ['BHCurrency'],
      translations: ['CURRENCY'],
    },
    fuelConsumptionPerYear: {
      formControlName: 'fuelConsumptionPerYear',
      label: 'FUEL_CONSUMPTION_PER_YEAR',
    },
    // CO2 EMISSION
    isCo2OrCarbonEmissionsTaxed: {
      formControlName: 'isCo2OrCarbonEmissionsTaxed',
      label: 'ARE_CO2_OR_CARBON_EMISSIONS_TAXED'
    },
    carbonTaxLevyCostPerUnit: {
      formControlName: 'carbonTaxLevyCostPerUnit',
      label: 'CARBON_TAX_LEVY_COST_PER_UNIT',
      unitNames: ['BHCurrency', 'BoilerHouseEnergyUnits'],
      translations: ['CURRENCY', 'ENERGY'],
    },
    costOfCo2PerUnitMass: {
      formControlName: 'costOfCo2PerUnitMass',
      label: 'COST_OF_CO2_PER_UNIT_MASS',
      unitNames: ['BHCurrency', 'BoilerHouseEmissionUnits'],
      translations: ['CURRENCY', 'CO2_EMISSIONS'],
    },
    // WATER
    costOfWaterPerUnit: {
      formControlName: 'costOfWaterPerUnit',
      label: 'COST_OF_WATER_FSLASH_UNIT',
      unitNames: ['BHCurrency', 'BoilerHouseVolumeUnits'],
      translations: ['CURRENCY', 'VOLUME'],
    },
    boilerHouseWaterQtyPerYearIsKnown: {
      formControlName: 'boilerHouseWaterQtyPerYearIsKnown',
      label: 'IS_WATER_ENTERING_THE_BOILER_HOUSE_MEASURED'
    },
    costOfWaterPerYear: {
      formControlName: 'costOfWaterPerYear',
      label: 'COST_OF_WATER_PER_YEAR',
      unitNames: ['BHCurrency'],
      translations: ['CURRENCY']
    },
    waterConsumptionPerHour: {
      formControlName: 'waterConsumptionPerHour',
      label: 'WATER_CONSUMPTION_HOUR',
      unitNames: ['BoilerHouseVolumeUnits'],
      translations: ['VOLUME'],
    },
    waterConsumptionPerYear: {
      formControlName: 'waterConsumptionPerYear',
      label: 'WATER_CONSUMPTION_YEAR',
      unitNames: ['BoilerHouseVolumeUnits'],
      translations: ['VOLUME'],
    },
    // WATER TREATMENT CHEMICALS
    boilerWaterTreatmentChemicalCostsIsKnown: {
      formControlName: 'boilerWaterTreatmentChemicalCostsIsKnown',
      label: 'ARE_CHEMICAL_COST_KNOWN'
    },
    totalChemicalCostPerYear: {
      formControlName: 'totalChemicalCostPerYear',
      label: 'TOTAL_CHEMICAL_COSTS_PER_YEAR',
      unitNames: ['BHCurrency'],
      translations: ['CURRENCY'],
    },
    o2ScavengingChemicalsCostSavings: {
      formControlName: 'o2ScavengingChemicalsCostSavings',
      label: 'O2_SCAVENGING_CHEMICALS_COST_SAVINGS',
      unitNames: ['BHCurrency'],
      translations: ['CURRENCY'],
    },
    // WATER EFFLUENT
    costOfEffluentPerUnit: {
      formControlName: 'costOfEffluentPerUnit',
      label: 'COST_OF_EFFLUENT_FSLASH_UNIT',
      unitNames: ['BHCurrency', 'BoilerHouseVolumeUnits'],
      translations: ['CURRENCY', 'VOLUME'],
    },
    // BOILER
    isSuperheatedSteam: {
      formControlName: 'isSuperheatedSteam',
      label: 'IS_SUPERHEATED_STEAM'
    },
    isSteamFlowMeasured: {
      formControlName: 'isSteamFlowMeasured',
      label: 'IS_STEAM_FLOW_MEASURED'
    },
    boilerSteamGeneratedPerHour: {
      formControlName: 'boilerSteamGeneratedPerHour',
      label: 'STEAM_GENERATION_PER_HOUR',
      unitNames: ['BoilerHouseSmallMassFlowUnits'],
      translations: ['BOILER_HOUSE_SMALL_MASS_FLOW_UNITS'],
    },
    boilerSteamGeneratedPerYear: {
      formControlName: 'boilerSteamGeneratedPerYear',
      label: 'STEAM_GENERATION_PER_YEAR',
      unitNames: ['BoilerHouseMassFlowUnits'],
      translations: ['BOILER_HOUSE_MASS_FLOW_UNITS'],
    },
    boilerSteamTemperature: {
      formControlName: 'boilerSteamTemperature',
      label: 'STEAM_TEMPERATURE',
      unitNames: ['TemperatureUnit'],
      unitTypes: ['TemperatureUnits'],
      translations: ['TEMPERATURE'],
    },
    boilerSteamPressure: {
      formControlName: 'boilerSteamPressure',
      label: 'STEAM_PRESSURE',
      unitNames: ['PressureUnit'],
      unitTypes: ['PressureUnits'],
      translations: ['PRESSURE'],
    },
    isEconomizerPresent: {
      formControlName: 'isEconomizerPresent',
      label: 'IS_ECONOMISER_PRESENT'
    },
    boilerEfficiency: {
      formControlName: 'boilerEfficiency',
      label: 'BOILER_EFFICIENCY',
    },
    // TDS BLOWDOWN
    isBlowdownVesselPresent: {
      formControlName: 'isBlowdownVesselPresent',
      label: 'IS_BLOWDOWN_VESSEL_PRESENT'
    },
    isCoolingWaterUsed: {
      formControlName: 'isCoolingWaterUsed',
      label: 'IS_COOLING_WATER_USED'
    },
    isAutoTdsControlPResent: {
      formControlName: 'isAutoTdsControlPResent',
      label: 'IS_AUTO_TDS_PRESENT'
    },
    isFlashVesselPresent: {
      formControlName: 'isFlashVesselPresent',
      label: 'IS_FLASH_VESSEL_PRESENT'
    },
    isHeatExchangerPresent: {
      formControlName: 'isHeatExchangerPresent',
      label: 'IS_HEAT_EXCHANGER_PRESENT'
    },
    waterTemperatureLeavingHeatExchanger: {
      formControlName: 'waterTemperatureLeavingHeatExchanger',
      label: 'WATER_TEMPERATURE_LEAVING_HEAT_EXCHANGER',
      unitNames: ['TemperatureUnit'],
      unitTypes: ['TemperatureUnits'],
      translations: ['TEMPERATURE'],
    },
    tdsOfFeedwaterInFeedtank: {
      formControlName: 'tdsOfFeedwaterInFeedtank',
      label: 'TDS_OF_FEEDWATER_IN_FEEDTANK',
      unitNames: ['BoilerHouseTDSUnits'],
      translations: ['TDS'],
      controlNames: ['tdsOfFeedwaterInFeedtankUnit'],
    },
    boilerAverageTds: {
      formControlName: 'boilerAverageTds',
      label: 'AVERAGE_BOILER_TDS',
      unitNames: ['BoilerHouseTDSUnits'],
      translations: ['TDS'],
    },
    boilerMaxTds: {
      formControlName: 'boilerMaxTds',
      label: 'MAXIMUM_ALLOWABLE_BOILER_TDS',
      unitNames: ['BoilerHouseTDSUnits'],
      translations: ['TDS'],
    },
    // WATER_TREATMENT
    isMakeUpWaterMonitored: {
      formControlName: 'isMakeUpWaterMonitored',
      label: 'IS_MAKE_UP_WATER_MONITORED'
    },
    temperatureOfMakeupWater: {
      formControlName: 'temperatureOfMakeupWater',
      label: 'TEMPERATURE_OF_MAKE_UP_WATER',
      unitNames: ['TemperatureUnit'],
      unitTypes: ['TemperatureUnits'],
      translations: ['TEMPERATURE'],
      controlNames: ['temperatureOfMakeupWaterUnit'],
    },
    makeupWaterAmountPerHour: {
      formControlName: 'makeupWaterAmountPerHour',
      label: 'MAKE_UP_WATER_PER_HOUR',
      unitNames: ['BoilerHouseSmallVolumetricFlowUnits'],
      translations: ['SMALL_VOLUME'],
      controlNames: ['makeupWaterAmountUnit'],
    },
    makeupWaterAmountPerYear: {
      formControlName: 'makeupWaterAmountPerYear',
      label: 'MAKE_UP_WATER_PER_YEAR',
      unitNames: ['BoilerHouseSmallVolumetricFlowUnits'],
      translations: ['SMALL_VOLUME'],
      controlNames: ['makeupWaterAmountUnit'],
    },
    // WATER_TREATMENT_PARAMETERS
    percentageWaterRejection: {
      formControlName: 'percentageWaterRejection',
      label: 'PERCENTAGE_WATER_REJECTION',
    },
    tdsOfMakeupWater: {
      formControlName: 'tdsOfMakeupWater',
      label: 'TDS_OF_MAKEUP_WATER',
      unitNames: ['BoilerHouseTDSUnits'],
      translations: ['TDS'],
      controlNames: ['tdsOfMakeupWaterUnit'],
    },
    // FEEDWATER_AND_CONDENSATE
    atmosphericDeaerator: {
      formControlName: 'atmosphericDeaerator',
      label: 'AUTMOSPHERIC_DEAERATOR'
    },
    pressurisedDeaerator: {
      formControlName: 'pressurisedDeaerator',
      label: 'PRESSURLSED_DEAERATOR'
    },
    isFeedWaterMeasured: {
      formControlName: 'isFeedWaterMeasured',
      label: 'IS_FEEDWATER_FLOWRATE_MEASURED',
    },
    boilerFeedwaterConsumptionPerHour: {
      formControlName: 'boilerFeedwaterConsumptionPerHour',
      label: 'CONSUMPTION_PER_HR',
      unitNames: ['BoilerHouseSmallVolumetricFlowUnits'],
      translations: ['SMALL_VOLUME'],
    },
    boilerFeedwaterConsumptionPerYear: {
      formControlName: 'boilerFeedwaterConsumptionPerYear',
      label: 'CONSUMPTION_PER_YEAR',
      unitNames: ['BoilerHouseVolumeUnits'],
      translations: ['VOLUME'],
    },
    temperatureOfFeedtank: {
      formControlName: 'temperatureOfFeedtank',
      label: 'TEMPERATURE_OF_FEEDTANK',
      unitNames: ['TemperatureUnit'],
      unitTypes: ['TemperatureUnits'],
      translations: ['TEMPERATURE'],
      controlNames: ['temperatureOfFeedtankUnit'],
    },
    areChemicalsAddedDirectlyToFeedtank: {
      formControlName: 'areChemicalsAddedDirectlyToFeedtank',
      label: 'ARE_CHEMICALS_ADDED_DIRECTLY_TO_FEEDTANK'
    },
    isDsiPresent: {
      formControlName: 'isDsiPresent',
      label: 'IS_DSI_PRESENT'
    },
    pressureOfSteamSupplyingDsi: {
      formControlName: 'pressureOfSteamSupplyingDsi',
      label: 'PRESSURE_OF_STEAM_SUPPLYING_DSI',
      unitNames: ['PressureUnit'],
      unitTypes: ['PressureUnits'],
      translations: ['PRESSURE'],
      controlNames: ['pressureOfSteamSupplyingDsiUnit'],
    },
    isCondensateReturnKnown: {
      formControlName: 'isCondensateReturnKnown',
      label: 'IS_CONDENSATE_RETURN_KNOWN'
    },
    percentageOfCondensateReturn: {
      formControlName: 'percentageOfCondensateReturn',
      label: 'PERCENTAGE_OF_CONDENSATE_RETURN',
    },
    volumeOfCondensateReturn: {
      formControlName: 'volumeOfCondensateReturn',
      label: 'VOLUME_OF_CONDENSATE_RETURN',
      unitNames: ['BoilerHouseVolumeUnits'],
      translations: ['VOLUME'],
      controlNames: ['volumeOfCondensateReturnUnit'],
    },
    temperatureOfCondensateReturn: {
      formControlName: 'temperatureOfCondensateReturn',
      label: 'TEMPERATURE_OF_CONDENSATE_RETURN',
      unitNames: ['TemperatureUnit'],
      unitTypes: ['TemperatureUnits'],
      translations: ['TEMPERATURE'],
      controlNames: ['temperatureOfCondensateReturnUnit'],
    },
    tdsOfCondensateReturn: {
      formControlName: 'tdsOfCondensateReturn',
      label: 'TDS_OF_CONDENSATE_RETURN',
      unitNames: ['BoilerHouseTDSUnits'],
      translations: ['TDS'],
      controlNames: ['tdsOfCondensateReturnUnit'],
    }
  };
  private readonly _sizingFormGroupControls: {
    selectedUnits: Record<keyof SteamGeneratorSelectedUnitsInterface, any>;
    steamGeneratorInputs: Record<keyof SteamGeneratorInputsInterface, any>
  } = {
    selectedUnits: {
      energyUnitSelected: [null], // BoilerHouseEnergyUnits
      smallWeightUnitSelected: [null], // WeightUnit
      emissionUnitSelected: [null], // BoilerHouseEmissionUnits
      volumeUnitSelected: [null], // BoilerHouseVolumeUnits
      smallVolumetricFlowUnitSelected: [null], // BoilerHouseSmallVolumetricFlowUnits
      massFlowUnitSelected: [null], // MassFlowUnit
      smallMassFlowUnitSelected: [null], // BoilerHouseSmallMassFlowUnits
      pressureUnitSelected: [null], // PressureUnit
      temperatureUnitSelected: [null], // TemperatureUnit
      tdsUnitSelected: [null], // BoilerHouseTDSUnits
    },
    steamGeneratorInputs: {
      hoursOfOperation: [8736, Validators.required, SgaValidator.validateAsyncFn(this, 'hoursOfOperation')], // HOURS_OF_OPERATION
      isSteamFlowMeasured: [false, SgaValidator.isSteamFlowMeasured], // IS_STEAM_FLOW_MEASURED
      isAutoTdsControlPResent: [false, SgaValidator.isAutoTdsControlPResent], // IS_AUTO_TDS_PRESENT
      boilerSteamGeneratedPerYear: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'boilerSteamGeneratedPerYear', true)], // STEAM_GENERATION_PER_YEAR
      boilerSteamGeneratedPerHour: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'boilerSteamGeneratedPerHour', true)],  // STEAM_GENERATION_PER_HOUR
      inputFuelId: [null, Validators.required], // FUEL_TYPE
      inputFuelUnit: [null, Validators.required], // UNIT 'LiquidFuelUnits' / 'GaseousFuelUnits' / 'SolidFuelUnits'
      costOfFuelPerUnit: [null, Validators.required, SgaValidator.validateAsyncFn(this,'costOfFuelPerUnit')], // COST_OF_FUEL_PER_UNIT
      fuelQtyPerYearIsKnown: [false, SgaValidator.fuelQtyPerYearIsKnown], // IS_FUEL_CONSUMPTION_MEASURED
      costOfFuelPerYear: [null, Validators.required, SgaValidator.validateAsyncFn(this,'costOfFuelPerYear', true)], // FUEL_COSTS_PER_YEAR : Original "Fuel Costs per Year"
      fuelConsumptionPerYear: [null, Validators.required, SgaValidator.validateAsyncFn(this,'fuelConsumptionPerYear', true)], // FUEL_CONSUMPTION_PER_YEAR
      fuelEnergyPerUnit: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'fuelEnergyPerUnit')], // FUEL_CALORIFIC_VALUE
      fuelCarbonContent: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'fuelCarbonContent')], // CO2_EMISSIONS_PER_UNIT_FUEL
      costOfWaterPerUnit: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'costOfWaterPerUnit')], // COST_OF_WATER_FSLASH_UNIT
      costOfEffluentPerUnit: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'costOfEffluentPerUnit')], // COST_OF_EFFLUENT_FSLASH_UNIT
      boilerHouseWaterQtyPerYearIsKnown: [false, SgaValidator.boilerHouseWaterQtyPerYearIsKnown], // IS_WATER_ENTERING_THE_BOILER_HOUSE_MEASURED : Original IS_BOILER_HOUSE_WATER_MEASURED
      costOfWaterPerYear: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'costOfWaterPerYear')], // WATER_CONSUMPTION_HOUR : NEW FIELD
      waterConsumptionPerHour: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'waterConsumptionPerHour')], // WATER_CONSUMPTION_HOUR : NEW FIELD
      waterConsumptionPerYear: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'waterConsumptionPerYear')], // WATER_CONSUMPTION_YEAR : Original WATER_CONSUMPTION_PER_YEAR
      boilerWaterTreatmentChemicalCostsIsKnown: [false, SgaValidator.boilerWaterTreatmentChemicalCostsIsKnown], // ARE_CHEMICAL_COST_KNOWN : Original IS_CHEMICAL_COSTS_PER_YEAR_KNOWN
      totalChemicalCostPerYear: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'totalChemicalCostPerYear')], // TOTAL_CHEMICAL_COSTS_PER_YEAR : Original TOTAL_CHEMICAL_COST_PER_YEAR
      costOfChemistsPerUnitOfWater: [null], // ------------ NO FIELD
      o2ScavengingChemicalsCostSavings: [null, null, SgaValidator.validateAsyncFn(this, 'o2ScavengingChemicalsCostSavings')], // O2_SCAVENGING_CHEMICALS_COST_SAVINGS
      isCo2OrCarbonEmissionsTaxed: [false, SgaValidator.isCo2OrCarbonEmissionsTaxed],
      carbonTaxLevyCostPerUnit: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'carbonTaxLevyCostPerUnit')], // CARBON_TAX_LEVY_COST_PER_UNIT
      costOfCo2PerUnitMass: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'costOfCo2PerUnitMass')], // COST_OF_CO2_PER_UNIT_MASS : Original "Cost of CO2 / Unit Mass"
      isBlowdownVesselPresent: [false], // IS_BLOWDOWN_VESSEL_PRESENT
      isCoolingWaterUsed: [false], // IS_COOLING_WATER_USED
      isSuperheatedSteam: [false, SgaValidator.isSuperheatedSteam], // IS_SUPERHEATED_STEAM
      boilerEfficiency: [null, [Validators.required, Validators.max(100)], SgaValidator.validateAsyncFn(this, 'boilerEfficiency')], // BOILER_EFFICIENCY
      isFeedWaterMeasured: [false, SgaValidator.isFeedWaterMeasured], // IS_FEEDWATER_FLOWRATE_MEASURED
      boilerSteamPressure: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'boilerSteamPressure', true)], // STEAM_PRESSURE
      boilerSteamTemperature: [null, null, SgaValidator.validateAsyncFn(this, 'boilerSteamTemperature', true)], // STEAM_TEMPERATURE
      isEconomizerPresent: [false], // IS_ECONOMISER_PRESENT
      boilerAverageTds: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'boilerAverageTds')], // AVERAGE_BOILER_TDS : Original BOILER_AVERAGE_TDS
      boilerMaxTds: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'boilerMaxTds')], // MAXIMUM_ALLOWABLE_BOILER_TDS : Original BOILER_MAX_TDS
      boilerFeedwaterConsumptionPerHour: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'boilerFeedwaterConsumptionPerHour', true)], // CONSUMPTION_PER_HR && CONSUMPTION_PER_YEAR
      boilerFeedwaterConsumptionPerYear: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'boilerFeedwaterConsumptionPerYear', true)], // CONSUMPTION_PER_HR && CONSUMPTION_PER_YEAR
      isFlashVesselPresent: [false, SgaValidator.isFlashVesselPresent], // IS_FLASH_VESSEL_PRESENT
      isHeatExchangerPresent: [false, SgaValidator.isHeatExchangerPresent], // IS_HEAT_EXCHANGER_PRESENT
      waterTemperatureLeavingHeatExchanger: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'waterTemperatureLeavingHeatExchanger', null)], // WATER_TEMPERATURE_LEAVING_HEAT_EXCHANGER
      waterTreatmentMethod: [null, Validators.required], // WATER_TREATMENT_METHOD
      percentageWaterRejection: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'percentageWaterRejection')], // PERCENTAGE_WATER_REJECTION
      tdsOfMakeupWater: [0, Validators.required], // TDS_OF_MAKEUP_WATER
      tdsOfMakeupWaterUnit: [0, Validators.required], // UNIT
      isMakeUpWaterMonitored: [false, SgaValidator.isMakeUpWaterMonitored],
      temperatureOfMakeupWater: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'temperatureOfMakeupWater', true)], // TEMPERATURE_OF_MAKE_UP_WATER : Original TEMPERATURE_OF_MAKEUP_WATER
      temperatureOfMakeupWaterUnit: [null], // UNIT TemperatureUnit
      makeupWaterAmountPerHour: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'makeupWaterAmountPerHour', true)],
      makeupWaterAmountPerYear: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'makeupWaterAmountPerYear', true)],
      makeupWaterAmountUnit: [0, Validators.required], // UNIT BoilerHouseVolumeUnits
      atmosphericDeaerator: [true], // AUTMOSPHERIC_DEAERATOR (default)
      pressurisedDeaerator: [false], // PRESSURLSED_DEAERATOR
      temperatureOfFeedtank: [0, Validators.required], // TEMPERATURE_OF_FEEDTANK
      temperatureOfFeedtankUnit: [0, Validators.required], // UNIT
      tdsOfFeedwaterInFeedtank: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'tdsOfFeedwaterInFeedtank')], // TDS_OF_FEEDWATER_IN_FEEDTANK
      tdsOfFeedwaterInFeedtankUnit: [0, Validators.required], // UNIT BoilerHouseTDSUnits
      tdsOfCondensateReturn: [0, Validators.required], // TDS_OF_CONDENSATE_RETURN
      tdsOfCondensateReturnUnit: [0, Validators.required], // UNIT "BoilerHouseTDSUnits"
      temperatureOfCondensateReturn: [0, Validators.required], // TEMPERATURE_OF_CONDENSATE_RETURN
      temperatureOfCondensateReturnUnit: [0, Validators.required], // UNIT TemperatureUnit
      areChemicalsAddedDirectlyToFeedtank: [false], // ARE_CHEMICALS_ADDED_DIRECTLY_TO_FEEDTANK
      pressureOfFeedtank: [0], // ------------
      pressureOfFeedtankUnit: [0], // ------------
      pressureOfSteamSupplyingDsi: [0, Validators.required], // PRESSURE_OF_STEAM_SUPPLYING_DSI
      pressureOfSteamSupplyingDsiUnit: [0, Validators.required], // UNIT
      isCondensateReturnKnown: [false], // IS_CONDENSATE_RETURN_KNOWN
      percentageOfCondensateReturn: [0, Validators.required], // PERCENTAGE_OF_CONDENSATE_RETURN
      percentageOfCondensateReturnUnit: [0, Validators.required], // UNIT ???????
      volumeOfCondensateReturn: [0], // VOLUME_OF_CONDENSATE_RETURN
      volumeOfCondensateReturnUnit: [0], // UNIT "BoilerHouseVolumeUnits"
      isDsiPresent: [false], // IS_DSI_PRESENT
      proposalTemperatureUnit: [''],
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
    }
  };
  private readonly _sizingFormGroup: FormGroup;
  private readonly moduleGroupId = 9;
  public requestLoading: Subject<boolean> = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private preferenceService: PreferenceService,
    private fb: FormBuilder,
    ) {
    // Initialize Sizing form
    this._sizingFormGroup = this.fb.group({
      selectedUnits: this.fb.group(this._sizingFormGroupControls.selectedUnits),
      steamGeneratorInputs: this.fb.group(this._sizingFormGroupControls.steamGeneratorInputs)
    });
  }

  calculateResults(form: SgaSizingModuleFormInterface): Observable<any> {
    this.requestLoading.next(true);
    return this.http.post<any>(`./Api/SteamGenerator/calculate-benchmark`, form)
      .pipe(
        tap(() => this.requestLoading.next(false)),
        map((res) => {
          // Get child formGroup
          const fg = this._sizingFormGroup.get('steamGeneratorInputs') as FormGroup;
          // Validate if has errors
          return SgaValidator.validateCalculation(res, fg);
        }));
  }

  validateSgInput(
    field: keyof SteamGeneratorInputsInterface,
    form: SgaSizingModuleFormInterface
  ): Observable<SgaHttpValidationResponseInterface | null> {
    return this.http.post<any>(`./Api/SteamGenerator/validate-input/${field}`, form);
  }

  calculateCalorific(
    calorificData: SteamCalorificRequestInterface
  ): Observable<{fuelCarbonContent: number; fuelEnergyPerUnit: number;} | HttpErrorResponse> {
    this.requestLoading.next(true);
    return this.http.post<any>('./Api/SteamGenerator/calculate-carbon-and-calorific-value', calorificData)
      .pipe(tap(() => this.requestLoading.next(false)));
  }

  calculateCarbonEmission(data: SteamCarbonEmissionInterface): Observable<{ fuelCarbonContent: number }> {
    this.requestLoading.next(true);
    return this.http.post<any>('./Api/SteamGenerator/calculate-carbon-emission-value', data)
      .pipe(tap(() => this.requestLoading.next(false)));
  }

  calculateSaturatedAndTemperature(data: SgaSaturatedTemperatureBodyInterface): Observable<any> {
    this.requestLoading.next(true);
    return this.http.post<any>('./Api/SteamGenerator/calculate-saturated-and-freezing-temperature', data)
      .pipe(tap(() => this.requestLoading.next(false)), catchError((e, c) => {
        this.requestLoading.next(false);
        return c;
      }));
  }

  calculateBoilerEfficiency(data: {isEconomizerPresent: boolean; inputFuelId: string;}): Observable<{boilerEfficiency: number}> {
    this.requestLoading.next(true);
    return this.http.post<{boilerEfficiency: number}>('./Api/SteamGenerator/calculate-boiler-efficiency', data)
      .pipe(tap(() => this.requestLoading.next(false)));
  }

  calculateWaterTemperature(data: { temperatureUnitSelected: number }): Observable<any> {
    this.requestLoading.next(true);
    return this.http.post('./Api/SteamGenerator/calculate-water-temperature-leaving-heat-exchanger', data)
      .pipe(tap(() => this.requestLoading.next(false)));
  }

  public getSizingFormGroup(): FormGroup {
    return this._sizingFormGroup;
  }

  public getSgaFormFields(): FormFieldTypesInterface {
    return this._sgaFormFields;
  }

  public changeSgaFieldFilled(fieldName: keyof SteamGeneratorInputsInterface, value?: boolean): void {
    if (this._sgaFormFields[fieldName]) {
      let filledValue = !this._sgaFormFields[fieldName].filled;
      if (value === true || value === false) {
        filledValue = value;
      }

      this._sgaFormFields[fieldName].filled = filledValue;
    }
  }

  public checkSgaFieldIsFilled(fieldName: string): boolean {
    return this._sgaFormFields[fieldName] && this._sgaFormFields[fieldName].filled;
  }

  public changeSizingUnits(): void {
    this._changeSgaFieldsFromSizingPref();
    this.setSelectedValues();
  }

  /**
   * Get multiple Sizing preferences values
   * @param obj { Object }  object where [key] is returned obj key and 'value' is returned sizing preference value
   * @returns { {[key: string]: number} } object of Sizing preferences values
   * **/
  public getSizingPreferenceValues(obj: { [key: string]: string }): {[key: string]: number} {
    let res: { [key: string]: number } = {};

    for (let sizingUnitPreference of this.preferenceService.sizingUnitPreferences) {
      for (let nameKey in obj) {
        if (
          obj[nameKey] &&
          sizingUnitPreference &&
          sizingUnitPreference.preference &&
          sizingUnitPreference.preference.name === obj[nameKey]
        ) {
          res[nameKey] = parseInt(sizingUnitPreference.preference.value);

          break;
        }
      }
    }

    return res;
  }

  /**
   * Get sizing preference from sizing preferences
   * @param name { string } sizing preference name
   * @returns 'SizingUnitPreference' interface
   * **/
  public getSizingPreferenceByName(name: string): SizingUnitPreference {
    return this.preferenceService.sizingUnitPreferences
      .find(({ unitType, preference }) => {
        return unitType === name || unitType === `${name}s` || (preference && preference.name === name);
      });
  }

  /**
   * Set selected form values from sizing preferences
   @listens: {
    energyUnitSelected: BoilerHouseEnergyUnits
    smallWeightUnitSelected: WeightUnit
    emissionUnitSelected: BoilerHouseEmissionUnits
    volumeUnitSelected: BoilerHouseVolumeUnits
    smallVolumetricFlowUnitSelected: BoilerHouseSmallVolumetricFlowUnits
    massFlowUnitSelected: MassFlowUnit
    smallMassFlowUnitSelected: BoilerHouseSmallMassFlowUnits
    pressureUnitSelected: PressureUnit
    temperatureUnitSelected: TemperatureUnit
    tdsUnitSelected: BoilerHouseTDSUnits
   }
  **/
  public setSelectedValues(): void {
    const sizingPreferences = this.preferenceService.sizingUnitPreferences;

    if (!sizingPreferences || !sizingPreferences.length) return null;

    const selectedUnitsByPreferences = {
      energyUnitSelected: 'BoilerHouseEnergyUnits',
      smallWeightUnitSelected: 'WeightUnit',
      emissionUnitSelected: 'BoilerHouseEmissionUnits',
      volumeUnitSelected: 'BoilerHouseVolumeUnits',
      smallVolumetricFlowUnitSelected: 'BoilerHouseSmallVolumetricFlowUnits',
      massFlowUnitSelected: 'MassFlowUnit',
      smallMassFlowUnitSelected: 'BoilerHouseSmallMassFlowUnits',
      pressureUnitSelected: 'PressureUnit',
      temperatureUnitSelected: 'TemperatureUnit',
      tdsUnitSelected: 'BoilerHouseTDSUnits',
    };

    const selectedUnits = this.getSizingPreferenceValues(selectedUnitsByPreferences);

    for (let key in selectedUnitsByPreferences) {
      let unit = selectedUnits[key];

      if (unit === undefined) {
        const preferenceName = selectedUnitsByPreferences[key];

        const preference = this._getPreferenceByName(preferenceName);
        const sizingPreference = this._addSizingPreference(preference, preferenceName, 'MY_MASS_FLOW');

        if (sizingPreference && sizingPreference.preference && sizingPreference.preference.value) {
          unit = parseInt(sizingPreference.preference.value);
        }
      }

      this.setFormValue(key, unit, 'selectedUnits', { emitEvent: false });
    }
  }

  /**
   * Set FormGroup values - Sizing form
   * @param {string} formControlName name of form control field
   * @param {any} value value
   * @param {string} [formGroupName = 'steamGeneratorInputs'] key-name of parent formGroup
   * @param {emitEvent?: true, onlySelf?: false} [opt] form control options
   * */
  public setFormValue(
    formControlName: string,
    value: any,
    formGroupName: keyof SgaSizingModuleFormInterface = 'steamGeneratorInputs',
    opt?: { emitEvent?: boolean, onlySelf?: boolean }
  ): void {
    if (!formControlName) return null;

    const control = this._sizingFormGroup.get(`${formGroupName}.${formControlName}`);
    const parsedValue = Number.isNaN(Number(value)) ? value : (value && +value);

    if (control && (control.value !== parsedValue)) {
      console.groupCollapsed('%c  %c CHANGE FIELD:' + formControlName, 'background-color:green;margin-right:10px', 'background-color:transparent');
      console.table({
        Name: { value: formControlName },
        Value: { value: parsedValue }
      });
      console.groupEnd();
      control.patchValue(parsedValue, opt);
    }
  }

  public setFormValues(values: {[key: string]: any}, formGroupName: keyof SgaSizingModuleFormInterface = 'steamGeneratorInputs',): void {
    const fg = this._sizingFormGroup.get(formGroupName) as FormGroup;
    fg.patchValue(values);
  }

  private _changeSgaFieldsFromSizingPref(): void {
    if (!this.preferenceService.sizingUnitPreferences) return null;

    const sizingUnitPreference = this.preferenceService.sizingUnitPreferences;
    const result = {};

    for (const key in this._sgaFormFields) {
      const preferenceNames = this._sgaFormFields[key].unitNames;
      const controlNames = this._sgaFormFields[key].controlNames;

      if (preferenceNames && preferenceNames[0] && controlNames && controlNames[0]) {
        const sPreference = sizingUnitPreference
          .find(({ preference }) => preference && preference.name === preferenceNames[0]);
        if (sPreference && sPreference.preference && sPreference.preference.value) {
          result[controlNames[0]] = parseInt(sPreference.preference.value);
        }
      }

      if (preferenceNames && preferenceNames[1] && controlNames && controlNames[1]) {
        const sPreference = sizingUnitPreference
          .find(({ preference }) => preference && preference.name === preferenceNames[1]);
        if (sPreference && sPreference.preference && sPreference.preference.value) {
          result[controlNames[1]] = parseInt(sPreference.preference.value);
        }
      }
    }

    if (result && Object.keys(result).length) {
      this._sizingFormGroup.get('steamGeneratorInputs').patchValue(result, { emitEvent: false });
    }
  }

  private _getPreferenceByName(preferenceName: string): Preference {
    return this.preferenceService.allPreferences
      .find(({ name }) => (name === preferenceName) || name === preferenceName + 's');
  }

  private _addSizingPreference(preference: Preference, unitType: string, masterTextKey: string): SizingUnitPreference {
    if (!preference) return null;

    this.preferenceService.addSizingUnitPreference(preference, unitType, masterTextKey, this.moduleGroupId);

    return this.preferenceService.sizingUnitPreferences.find(({ preference: { name }}) => name === preference.name);
  }

  static getFuelTypeName(fuelTypeValue: string): string {
    // L, E, G, O, S
    const firstLetter = fuelTypeValue && fuelTypeValue.charAt(0);
    switch (firstLetter) {
      case 'L': return 'BoilerHouseLiquidFuelUnits';
      case 'E': return 'BoilerHouseElectricalFuelUnits';
      case 'G': return 'BoilerHouseGasFuelUnits';
      case 'O': return 'BoilerHouseGasFuelUnits';
      case 'S': return 'BoilerHouseSolidFuelUnits';
      default: return null;
    }
  }
}
