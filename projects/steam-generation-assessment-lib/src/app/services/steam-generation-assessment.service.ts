import { ElementRef, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  FormFieldTypesInterface,
  FuelTypesEnum, ProposedEfficiencyRequestInterface, ProposedSetupInterface,
  SelectedUnitsList,
  SgaFeedTankTemperatureRequestInterface,
  SgaFuelTypes,
  SgaHttpValidationResponseInterface,
  SgaSaturatedTemperatureBodyInterface,
  SgaSizingModuleFormInterface, SgFormStructureInterface,
  SteamCalorificRequestInterface,
  SteamCarbonEmissionInterface,
  SteamGeneratorInputsInterface,
  SteamGeneratorSelectedUnitsInterface,
} from '../interfaces/steam-generation-form.interface';
import {
  DisplayGroup,
  EnumerationDefinition,
  Preference,
  PreferenceService,
  TranslationService,
  UnitConvert
} from 'sizing-shared-lib';
import { SizingUnitPreference } from '../../../../sizing-shared-lib/src/lib/shared/preference/sizing-unit-preference.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SgaValidator } from '../validators/steam-generation-assessment.validator';
import { map, pairwise, startWith, tap } from 'rxjs/operators';

@Injectable()
export class SteamGenerationAssessmentService {
  private _sgaFormFields: FormFieldTypesInterface =  {
    hoursOfOperation: {
      formControlName: 'hoursOfOperation',
      label: 'HOURS_OF_OPERATION',
      filled: true
    },
    // FUEL
    inputFuelId: {
      formControlName: 'inputFuelId',
      label: 'FUEL_TYPE',
    },
    fuelEnergyPerUnit: {
      formControlName: 'fuelEnergyPerUnit',
      label: 'FUEL_CALORIFIC_VALUE',
      unitNames: ['BoilerHouseEnergyUnits', /*FUEL_TYPE*/],
      translations: ['ENERGY'],
    },
    fuelCarbonContent: {
      formControlName: 'fuelCarbonContent',
      label: 'CO2_EMISSIONS_PER_UNIT_FUEL',
      unitNames: ['WeightUnit', /*FUEL_TYPE*/],
      translations: ['SMALL_WEIGHT'],
    },
    costOfFuelPerUnit: {
      formControlName: 'costOfFuelPerUnit',
      label: 'COST_OF_FUEL_PER_UNIT',
      unitNames: ['BHCurrency', /*FUEL_TYPE*/],
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
      unitNames: [/*FUEL_TYPE*/null]
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
    },
    makeupWaterAmountPerHour: {
      formControlName: 'makeupWaterAmountPerHour',
      label: 'MAKE_UP_WATER_PER_HOUR',
      unitNames: ['BoilerHouseSmallVolumetricFlowUnits'],
      translations: ['SMALL_VOLUMETRIC_FLOW'],
    },
    makeupWaterAmountPerYear: {
      formControlName: 'makeupWaterAmountPerYear',
      label: 'MAKE_UP_WATER_PER_YEAR',
      unitNames: ['BoilerHouseVolumetricFlowUnits'],
      translations: ['VOLUMETRIC_FLOW'],
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
      translations: ['SMALL_VOLUMETRIC_FLOW'],
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
    },
    pressureOfFeedtank: {
      formControlName: 'pressureOfFeedtank',
      label: 'PRESSURE_OF_FEEDTANK',
      unitNames: ['PressureUnit'],
      unitTypes: ['PressureUnits'],
      translations: ['PRESSURE'],
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
    },
    temperatureOfCondensateReturn: {
      formControlName: 'temperatureOfCondensateReturn',
      label: 'TEMPERATURE_OF_CONDENSATE_RETURN',
      unitNames: ['TemperatureUnit'],
      unitTypes: ['TemperatureUnits'],
      translations: ['TEMPERATURE'],
    },
    tdsOfCondensateReturn: {
      formControlName: 'tdsOfCondensateReturn',
      label: 'TDS_OF_CONDENSATE_RETURN',
      unitNames: ['BoilerHouseTDSUnits'],
      translations: ['TDS'],
    }
  };
  private readonly _sizingFormGroupControls: {
    selectedUnits: Record<keyof SteamGeneratorSelectedUnitsInterface, any>;
    benchmarkInputs: Record<keyof SteamGeneratorInputsInterface, any>
  } = {
    selectedUnits: {
      energyUnitSelected: [null], // BoilerHouseEnergyUnits
      smallWeightUnitSelected: [null], // WeightUnit
      emissionUnitSelected: [null], // BoilerHouseEmissionUnits
      volumeUnitSelected: [null], // BoilerHouseVolumeUnits
      smallVolumetricFlowUnitSelected: [null], // BoilerHouseSmallVolumetricFlowUnits
      massFlowUnitSelected: [null], // BoilerHouseMassFlowUnits
      smallMassFlowUnitSelected: [null], // BoilerHouseSmallMassFlowUnits
      pressureUnitSelected: [null], // PressureUnit
      temperatureUnitSelected: [null], // TemperatureUnit
      tdsUnitSelected: [null], // BoilerHouseTDSUnits,
      fuelUnitSelected: [null] // FUEL_TYPE 'LiquidFuelUnits' / 'GaseousFuelUnits' / 'SolidFuelUnits'
    },
    benchmarkInputs: {
      hoursOfOperation: [8736, Validators.required, SgaValidator.validateAsyncFn(this, 'hoursOfOperation')], // HOURS_OF_OPERATION
      isSteamFlowMeasured: [false, SgaValidator.isSteamFlowMeasured], // IS_STEAM_FLOW_MEASURED
      isAutoTdsControlPResent: [false, SgaValidator.isAutoTdsControlPResent], // IS_AUTO_TDS_PRESENT
      boilerSteamGeneratedPerYear: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'boilerSteamGeneratedPerYear', true)
      ], // STEAM_GENERATION_PER_YEAR
      boilerSteamGeneratedPerHour: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'boilerSteamGeneratedPerHour', true)
      ],  // STEAM_GENERATION_PER_HOUR
      inputFuelId: [null, Validators.required], // FUEL_TYPE
      costOfFuelPerUnit: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'costOfFuelPerUnit', true)
      ], // COST_OF_FUEL_PER_UNIT
      fuelQtyPerYearIsKnown: [false, SgaValidator.fuelQtyPerYearIsKnown], // IS_FUEL_CONSUMPTION_MEASURED
      costOfFuelPerYear: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'costOfFuelPerYear', true)
      ], // FUEL_COSTS_PER_YEAR : Original "Fuel Costs per Year"
      fuelConsumptionPerYear: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'fuelConsumptionPerYear', true)
      ], // FUEL_CONSUMPTION_PER_YEAR
      fuelEnergyPerUnit: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'fuelEnergyPerUnit')], // FUEL_CALORIFIC_VALUE
      fuelCarbonContent: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'fuelCarbonContent')
      ], // CO2_EMISSIONS_PER_UNIT_FUEL
      costOfWaterPerUnit: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'costOfWaterPerUnit')
      ], // COST_OF_WATER_FSLASH_UNIT
      costOfEffluentPerUnit: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'costOfEffluentPerUnit')
      ], // COST_OF_EFFLUENT_FSLASH_UNIT
      boilerHouseWaterQtyPerYearIsKnown: [
        false,
        SgaValidator.boilerHouseWaterQtyPerYearIsKnown
      ], // IS_WATER_ENTERING_THE_BOILER_HOUSE_MEASURED : Original IS_BOILER_HOUSE_WATER_MEASURED
      costOfWaterPerYear: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'costOfWaterPerYear')
      ], // WATER_CONSUMPTION_HOUR : NEW FIELD
      waterConsumptionPerHour: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'waterConsumptionPerHour')
      ], // WATER_CONSUMPTION_HOUR : NEW FIELD
      waterConsumptionPerYear: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'waterConsumptionPerYear')
      ], // WATER_CONSUMPTION_YEAR : Original WATER_CONSUMPTION_PER_YEAR
      boilerWaterTreatmentChemicalCostsIsKnown: [
        false,
        SgaValidator.boilerWaterTreatmentChemicalCostsIsKnown], // ARE_CHEMICAL_COST_KNOWN : Original IS_CHEMICAL_COSTS_PER_YEAR_KNOWN
      totalChemicalCostPerYear: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'totalChemicalCostPerYear')
      ], // TOTAL_CHEMICAL_COSTS_PER_YEAR : Original TOTAL_CHEMICAL_COST_PER_YEAR
      o2ScavengingChemicalsCostSavings: [
        null,
        null,
        SgaValidator.validateAsyncFn(this, 'o2ScavengingChemicalsCostSavings')
      ], // O2_SCAVENGING_CHEMICALS_COST_SAVINGS
      isCo2OrCarbonEmissionsTaxed: [false, SgaValidator.isCo2OrCarbonEmissionsTaxed],
      carbonTaxLevyCostPerUnit: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'carbonTaxLevyCostPerUnit')
      ], // CARBON_TAX_LEVY_COST_PER_UNIT
      costOfCo2PerUnitMass: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'costOfCo2PerUnitMass')
      ], // COST_OF_CO2_PER_UNIT_MASS : Original "Cost of CO2 / Unit Mass"
      isBlowdownVesselPresent: [false], // IS_BLOWDOWN_VESSEL_PRESENT
      isCoolingWaterUsed: [false], // IS_COOLING_WATER_USED
      isSuperheatedSteam: [false, SgaValidator.isSuperheatedSteam], // IS_SUPERHEATED_STEAM
      boilerEfficiency: [
        null,
        [Validators.required, Validators.max(100)],
        SgaValidator.validateAsyncFn(this, 'boilerEfficiency')
      ], // BOILER_EFFICIENCY
      isFeedWaterMeasured: [false, SgaValidator.isFeedWaterMeasured], // IS_FEEDWATER_FLOWRATE_MEASURED
      boilerSteamPressure: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'boilerSteamPressure', true)], // STEAM_PRESSURE
      boilerSteamTemperature: [null, null, SgaValidator.validateAsyncFn(this, 'boilerSteamTemperature', true)], // STEAM_TEMPERATURE
      isEconomizerPresent: [false], // IS_ECONOMISER_PRESENT
      boilerAverageTds: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'boilerAverageTds')
      ], // AVERAGE_BOILER_TDS : Original BOILER_AVERAGE_TDS
      boilerMaxTds: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'boilerMaxTds')
      ], // MAXIMUM_ALLOWABLE_BOILER_TDS : Original BOILER_MAX_TDS
      boilerFeedwaterConsumptionPerHour: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'boilerFeedwaterConsumptionPerHour', true)
      ], // CONSUMPTION_PER_HR && CONSUMPTION_PER_YEAR
      boilerFeedwaterConsumptionPerYear: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'boilerFeedwaterConsumptionPerYear', true)
      ], // CONSUMPTION_PER_HR && CONSUMPTION_PER_YEAR
      isFlashVesselPresent: [false, SgaValidator.isFlashVesselPresent], // IS_FLASH_VESSEL_PRESENT
      isHeatExchangerPresent: [false, SgaValidator.isHeatExchangerPresent], // IS_HEAT_EXCHANGER_PRESENT
      waterTemperatureLeavingHeatExchanger: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'waterTemperatureLeavingHeatExchanger', null)], // WATER_TEMPERATURE_LEAVING_HEAT_EXCHANGER
      waterTreatmentMethod: [null, Validators.required], // WATER_TREATMENT_METHOD
      percentageWaterRejection: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'percentageWaterRejection')
      ], // PERCENTAGE_WATER_REJECTION
      tdsOfMakeupWater: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'tdsOfMakeupWater')], // TDS_OF_MAKEUP_WATER
      isMakeUpWaterMonitored: [false, SgaValidator.isMakeUpWaterMonitored],
      temperatureOfMakeupWater: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'temperatureOfMakeupWater', true)
      ], // TEMPERATURE_OF_MAKE_UP_WATER : Original TEMPERATURE_OF_MAKEUP_WATER
      makeupWaterAmountPerHour: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'makeupWaterAmountPerHour', true)],
      makeupWaterAmountPerYear: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'makeupWaterAmountPerYear', true)],
      atmosphericDeaerator: [true, SgaValidator.atmosphericDeaerator], // AUTMOSPHERIC_DEAERATOR (default)
      pressurisedDeaerator: [false, SgaValidator.pressurisedDeaerator], // PRESSURLSED_DEAERATOR
      temperatureOfFeedtank: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'temperatureOfFeedtank')
      ], // TEMPERATURE_OF_FEEDTANK
      tdsOfFeedwaterInFeedtank: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'tdsOfFeedwaterInFeedtank', true)
      ], // TDS_OF_FEEDWATER_IN_FEEDTANK
      tdsOfCondensateReturn: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'tdsOfCondensateReturn')
      ], // TDS_OF_CONDENSATE_RETURN
      temperatureOfCondensateReturn: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'temperatureOfCondensateReturn')
      ], // TEMPERATURE_OF_CONDENSATE_RETURN
      areChemicalsAddedDirectlyToFeedtank: [false], // ARE_CHEMICALS_ADDED_DIRECTLY_TO_FEEDTANK
      pressureOfFeedtank: [null, Validators.required, SgaValidator.validateAsyncFn(this, 'pressureOfFeedtank')], // PRESSURE_OF_FEEDTANK
      pressureOfSteamSupplyingDsi: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'pressureOfSteamSupplyingDsi')
      ], // PRESSURE_OF_STEAM_SUPPLYING_DSI
      isCondensateReturnKnown: [false, SgaValidator.isCondensateReturnKnown], // IS_CONDENSATE_RETURN_KNOWN
      percentageOfCondensateReturn: [
        null,
        Validators.required,
        SgaValidator.validateAsyncFn(this, 'percentageOfCondensateReturn')
      ], // PERCENTAGE_OF_CONDENSATE_RETURN
      volumeOfCondensateReturn: [null, null, SgaValidator.validateAsyncFn(this, 'volumeOfCondensateReturn')], // VOLUME_OF_CONDENSATE_RETURN
      isDsiPresent: [false, SgaValidator.isDsiPresent], // IS_DSI_PRESENT
    }
  };
  private readonly _sizingFormGroup: FormGroup;
  private readonly moduleGroupId = 9;
  private _requestLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _prevFuelTypeUnit;

  constructor(
    private http: HttpClient,
    private preferenceService: PreferenceService,
    protected translationService: TranslationService,
    private fb: FormBuilder,
    ) {
    // Initialize Sizing form
    this._sizingFormGroup = this.fb.group({
      selectedUnits: this.fb.group(this._sizingFormGroupControls.selectedUnits),
      benchmarkInputs: this.fb.group(this._sizingFormGroupControls.benchmarkInputs)
    });

    this._sizingFormGroup.get('selectedUnits.fuelUnitSelected').valueChanges
      .pipe(startWith(null), pairwise())
      .subscribe(([prev, next]) => {
        this._prevFuelTypeUnit = prev;
      });
  }

  private static _getFuelTypesList({enumerations}: DisplayGroup): EnumerationDefinition[] {
    if (!enumerations) { return null; }

    const {enumerationDefinitions} = enumerations
      .find(({ enumerationName, opCoOverride }) => enumerationName === 'FuelTypeList_BoilerHouseInput' && !opCoOverride);
    return enumerationDefinitions
      .sort(({sequence}, b) => sequence > b.sequence ? 1 : sequence < b.sequence ? -1 : 0);
  }

  private static _checkIsHaveField(obj, key: string): boolean {
    if (obj && typeof obj === 'object') {
      if (obj.fields && obj.fields.length && obj.fields.indexOf(key) !== -1) {
        return true;
      } else {
        let isHasKey = false;

        for (const objKey in obj) {
          if (this._checkIsHaveField(obj[objKey], key)) {
            isHasKey = true;
            break;
          }
        }

        return isHasKey;
      }
    }

    return false;
  }

  private static _expandFormPanels(fieldsTree: any, fieldName: string) {
    if (fieldsTree && typeof fieldsTree === 'object') {
      for (const key in fieldsTree) {
        if (fieldsTree.hasOwnProperty(key)) {
          const item = fieldsTree[key];
          const hasField = this._checkIsHaveField(item, fieldName);

          // Close all panels without first errored
          if (item.hasOwnProperty('status') && item.status) {
            item.status = false;
          }

          // If field has error open panel
          if (hasField) {
            if (item.hasOwnProperty('status') && item.status === false) {
              setTimeout(() => item.status = true);
            }
            this._expandFormPanels(item, fieldName);

            break;
          }
        }
      }
    }
  }

  static focusFirstErrorField(formGroup: FormGroup, elementRef: ElementRef, settingObj: SgFormStructureInterface): any {
    // Set all field touched
    formGroup.markAllAsTouched();
    // check all fields
    for (const key of Object.keys(formGroup.controls)) {
      // get first invalid control
      if (formGroup.controls[key].status === 'INVALID') {
        // get field by data-form-name === name
        const field = elementRef.nativeElement.querySelector(`[data-form-name="${key}"]`);

        if (field && field.focus && typeof field.focus === 'function') {
          // Open panel wit with invalid field
          this._expandFormPanels(settingObj, key);
          // Focus on field
          setTimeout(() => field.focus(), 200);
          // loop stop
          return { field, key, control: formGroup.controls[key] };
        }
      }
    }
  }

  calculateResults(form: SgaSizingModuleFormInterface): Observable<any> {
    this.toggleLoading(true);
    return this.http.post<any>(`./Api/SteamGenerator/calculate-benchmark`, form)
      .pipe(
        tap(null, null, () => this.toggleLoading(false)),
        map((res) => {
          // Get child formGroup
          const fg = this._sizingFormGroup.get('benchmarkInputs') as FormGroup;
          // Validate if has errors
          return SgaValidator.validateCalculation(res, fg);
        }),
      );
  }

  calculateProposed(body): Observable<any> {
    this.toggleLoading(true);
    return this.http.post('./Api/SteamGenerator/calculate-proposal', body)
      .pipe(tap(null, null, () => this.toggleLoading(false)));
  }

  validateSgaBenchmarkInput(
    field: keyof SteamGeneratorInputsInterface,
    form: SgaSizingModuleFormInterface
  ): Observable<SgaHttpValidationResponseInterface | null> {
    return this.http.post<any>(`./Api/SteamGenerator/validate-benchmark-input/${field}`, form);
  }

  validateProposedInput(field: keyof ProposedSetupInterface, form: any): Observable<any> {
    return this.http.post(`./Api/SteamGenerator/validate-proposal-input/${field}`, form);
  }

  calculateCalorific(
    calorificData: SteamCalorificRequestInterface
  ): Observable<{fuelCarbonContent: number; fuelEnergyPerUnit: number; }> {
    this.toggleLoading(true);
    return this.http.post<any>('./Api/SteamGenerator/calculate-carbon-and-calorific-value', calorificData)
      .pipe(tap(null, null, () => this.toggleLoading(false)));
  }

  calculateCarbonEmission(data: SteamCarbonEmissionInterface): Observable<{ fuelCarbonContent: number }> {
    this.toggleLoading(true);
    return this.http.post<any>('./Api/SteamGenerator/calculate-carbon-emission-value', data)
      .pipe(tap(null, null, () => this.toggleLoading(false)));
  }

  calculateSaturatedAndTemperature(data: SgaSaturatedTemperatureBodyInterface): Observable<any> {
    this.toggleLoading(true);
    return this.http.post<any>('./Api/SteamGenerator/calculate-saturated-and-freezing-temperature', data)
      .pipe(tap(null, null, () => this.toggleLoading(false)));
  }

  calculateBoilerEfficiency(data: {isEconomizerPresent: boolean; inputFuelId: string; }): Observable<{boilerEfficiency: number}> {
    this.toggleLoading(true);
    return this.http.post<{boilerEfficiency: number}>('./Api/SteamGenerator/calculate-boiler-efficiency', data)
      .pipe(tap(null, null, () => this.toggleLoading(false)));
  }

  calcProposedBoilerEfficiency(data: ProposedEfficiencyRequestInterface): Observable<any> {
    this.toggleLoading(true);
    return this.http.post('./Api/SteamGenerator/calculate-proposal-boiler-efficiency', data)
      .pipe(tap(null, null, () => this.toggleLoading(false)));
  }

  calculateWaterTemperatureLeaving(data: { temperatureUnitSelected: number }): Observable<any> {
    this.toggleLoading(true);
    return this.http.post('./Api/SteamGenerator/calculate-water-temperature-leaving-heat-exchanger', data)
      .pipe(tap(null, null, () => this.toggleLoading(false)));
  }

  calculateWaterTreatmentMethod(data: { waterTreatmentMethodId: string, tdsUnitSelected: number; }): Observable<any> {
    this.toggleLoading(true);
    return this.http.post('./Api/SteamGenerator/calculate-water-treatment-method-parameters', data)
      .pipe(tap(null, null, () => this.toggleLoading(false)));
  }

  calculateFeedTankAndPressure(data: SgaFeedTankTemperatureRequestInterface): Observable<any> {
    this.toggleLoading(true);
    return this.http.post('./Api/SteamGenerator/calculate-feedtank-temperature-and-pressure', data)
      .pipe(tap(null, null, () => this.toggleLoading(false)));
  }

  public setFuelTypeForFields(fuelType: SgaFuelTypes): void {
    if (this._sgaFormFields.fuelEnergyPerUnit.unitNames[1] !== fuelType) {
      this._sgaFormFields.fuelEnergyPerUnit.unitNames = ['BoilerHouseEnergyUnits', fuelType];
    }
    if (this._sgaFormFields.fuelCarbonContent.unitNames[1] !== fuelType) {
      this._sgaFormFields.fuelCarbonContent.unitNames = ['WeightUnit', fuelType];
    }
    if (this._sgaFormFields.costOfFuelPerUnit.unitNames[1] !== fuelType) {
      this._sgaFormFields.costOfFuelPerUnit.unitNames = ['BHCurrency', fuelType];
    }
    if (this._sgaFormFields.fuelConsumptionPerYear.unitNames[0] !== fuelType) {
      this._sgaFormFields.fuelConsumptionPerYear.unitNames = [fuelType];
    }
  }

  public toggleLoading(enable?: boolean): void {
    const fn = () => {
      if (this._requestLoading$.value !== enable) {
        this._requestLoading$.next(!!enable);
      }
    };

    // Fix multiple changes in one tik
    setTimeout(fn, 0);
  }

  public getLoading(): BehaviorSubject<boolean> {
    return this._requestLoading$;
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

  public changeSizingUnits(): { unitsConverter: UnitConvert[], unitsConverterAfter: UnitConvert[] } {
    this._changeSgaFieldsFromSizingPref();
    const changedSelectedUnits = this.setSelectedValues();
    const convertedUnitsArr = this._getConverterUnits(changedSelectedUnits);

    return { unitsConverter: convertedUnitsArr[0], unitsConverterAfter: convertedUnitsArr[1] };
  }

  private _getConverterUnits(data: {unitKey: any; preferenceKey: any; next: number; prev: number; }[]): [UnitConvert[], UnitConvert[]] {
    const result: [UnitConvert[], UnitConvert[]] = [[], []];

    if (!data || !data.length) { return result; }

    const isFuelChanged = data.find(({unitKey}) => unitKey === 'fuelUnitSelected');
    const formattedFields = Object.values(this._sgaFormFields).reduce((obj, item) => ({
      ...obj,
      ...item.unitNames && item.unitNames.reduce((names, name) => ({
        [name]: [...obj[name] || [], item.formControlName]
      }), {})
    }), {});

    for (const {prev, next, preferenceKey} of data) {
      if (formattedFields[preferenceKey] && formattedFields[preferenceKey].length) {
        for (const key of formattedFields[preferenceKey]) {
          if (
            this._sgaFormFields[key].filled &&
            this._sgaFormFields[key].unitNames &&
            this._sgaFormFields[key].unitNames.includes(preferenceKey) &&
            (!isFuelChanged || (key !== 'fuelEnergyPerUnit' && key !== 'fuelCarbonContent'))
          ) {
            const control = this._sizingFormGroup.get(`benchmarkInputs.${key}`);

            if (control && control.value) {
              const isExist = result[0].find(({propertyName}) => key === propertyName);

              result[isExist ? 1 : 0].push({
                initialUnitId: prev,
                targetUnitId: next,
                initialValue: control && control.value,
                propertyName: key
              });
            }
          }
        }
      }
    }

    return result;
  }

  public getSizingPreferenceValues(obj: { [key: string]: string }): {[key: string]: number} {
    const res: { [key: string]: number } = {};

    for (const sizingUnitPreference of this.preferenceService.sizingUnitPreferences) {
      for (const nameKey in obj) {
        if (
          obj[nameKey] &&
          sizingUnitPreference &&
          sizingUnitPreference.preference &&
          sizingUnitPreference.preference.name === obj[nameKey]
        ) {
          res[nameKey] = parseInt(sizingUnitPreference.preference.value, 10);

          break;
        }
      }
    }

    return res;
  }

  public getSizingPreferenceByName(name: string): SizingUnitPreference {
    return this.preferenceService.sizingUnitPreferences
      .find(({ unitType, preference }) => {
        return unitType === name || unitType === `${name}s` || (preference && preference.name === name);
      });
  }

  public getMultipleControlValues<T>(
    obj: { [key: string]: string },
    formGroupKey: keyof SgaSizingModuleFormInterface = 'benchmarkInputs'
  ): {[key: string]: any} {
    const result = {};

    for (const objKey in obj) {
      if (obj.hasOwnProperty(objKey)) {
        const control = this._sizingFormGroup.get(`${formGroupKey}.${obj[objKey]}`);
        result[objKey] = control && control.value;
      }
    }

    return result;
  }

  public setSelectedValues(): {unitKey: any; preferenceKey: any; next: number; prev: number; }[] {
    const sizingPreferences = this.preferenceService.sizingUnitPreferences;
    const changedSelectedUnits: {unitKey: any; preferenceKey: any; next: number; prev: number; }[] = [];

    if (!sizingPreferences || !sizingPreferences.length) { return null; }

    const selectedUnitsByPreferences = Object.assign(SelectedUnitsList) as {[p: string]: string};

    const selectedUnits = this.getSizingPreferenceValues(selectedUnitsByPreferences);

    for (const key in selectedUnitsByPreferences) {
      if (selectedUnitsByPreferences.hasOwnProperty(key)) {
        let unit = selectedUnits[key];
        let prevValue = this._sizingFormGroup.get(`selectedUnits.${key}`) && this._sizingFormGroup.get(`selectedUnits.${key}`).value;
        let preferenceKey = selectedUnitsByPreferences[key];

        if (selectedUnitsByPreferences[key] === 'FUEL_TYPE' && this.translationService.displayGroup) {
          const item = SteamGenerationAssessmentService._getFuelTypesList(this.translationService.displayGroup)
            .find(({ id }) => id === this._sizingFormGroup.get('benchmarkInputs.inputFuelId').value);
          const sPreference = this.preferenceService.sizingUnitPreferences
            .find(({ unitType }) => item && item.value && unitType === FuelTypesEnum[item.value.charAt(0)]);

          const preference = sPreference && sPreference.preference;
          preferenceKey = preference && preference.name;
          unit = preference && parseInt(preference.value, 10);
          prevValue = this._prevFuelTypeUnit;
        } else if (unit === undefined) {
          const preferenceName = selectedUnitsByPreferences[key];

          const preference = this._getPreferenceByName(preferenceName);
          const unitType = preferenceName.charAt(preferenceName.length - 1) === 's' ? preferenceName : `${preferenceName}s`;
          const sizingPreference = this._addSizingPreference(preference, unitType, preferenceName);

          if (sizingPreference && sizingPreference.preference && sizingPreference.preference.value) {
            unit = parseInt(sizingPreference.preference.value, 10);
          }
        }

        if (prevValue !== unit) {
          changedSelectedUnits.push({unitKey: key, preferenceKey, next: unit, prev: prevValue});
          this.setFormValue(key, unit, 'selectedUnits', { emitEvent: false });
          if (preferenceKey === SgaFuelTypes[preferenceKey]) {
            this._prevFuelTypeUnit = unit;
          }
        }
      }
    }

    return changedSelectedUnits;
  }

  public setFormValue(
    formControlName: string,
    value: any,
    formGroupName: keyof SgaSizingModuleFormInterface = 'benchmarkInputs',
    opt?: { emitEvent?: boolean, onlySelf?: boolean }
  ): void {
    if (!formControlName) { return null; }

    const control = this._sizingFormGroup.get(`${formGroupName}.${formControlName}`);
    const parsedValue = Number.isNaN(Number(value)) || typeof value === 'boolean' ? value : (value && +value);

    if (control && (control.value !== parsedValue)) {
      console.log(
        `%c CHANGE FIELD {name:"${formControlName}", value: ${parsedValue}}`,
        'background-color:#edf2f4;color:#002D72;padding:5px;'
      );
      control.patchValue(parsedValue, opt);
    }
  }

  public setFormValues(values: {[key: string]: any}, formGroupName: keyof SgaSizingModuleFormInterface = 'benchmarkInputs', ): void {
    if (!values || !Object.keys(values).length) { return null; }

    for (const fieldName in values) {
      if (values.hasOwnProperty(fieldName)) {
        this.setFormValue(fieldName, values[fieldName], formGroupName);
      }
    }
  }

  public updateTreeValidity(group: FormGroup | FormArray): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.controls[key];

      if (abstractControl instanceof FormGroup || abstractControl instanceof FormArray) {
        this.updateTreeValidity(abstractControl);
      } else {
        abstractControl.updateValueAndValidity();
      }
    });
  }

  private _changeSgaFieldsFromSizingPref(): void {
    if (!this.preferenceService.sizingUnitPreferences) { return null; }

    const sizingUnitPreference = this.preferenceService.sizingUnitPreferences;
    const result = {};

    for (const key in this._sgaFormFields) {
      if (this._sgaFormFields.hasOwnProperty(key)) {
        const preferenceNames = this._sgaFormFields[key].unitNames;
        const controlNames = this._sgaFormFields[key].controlNames;

        if (preferenceNames && preferenceNames[0] && controlNames && controlNames[0]) {
          const sPreference = sizingUnitPreference
            .find(({ preference }) => preference && preference.name === preferenceNames[0]);

          if (sPreference && sPreference.preference && sPreference.preference.value) {
            result[controlNames[0]] = parseInt(sPreference.preference.value, 10);
          }
        }

        if (preferenceNames && preferenceNames[1] && controlNames && controlNames[1]) {
          const sPreference = sizingUnitPreference
            .find(({ preference }) => preference && preference.name === preferenceNames[1]);

          if (sPreference && sPreference.preference && sPreference.preference.value) {
            result[controlNames[1]] = parseInt(sPreference.preference.value, 10);
          }
        }
      }
    }

    if (result && Object.keys(result).length) {
      this._sizingFormGroup.get('benchmarkInputs').patchValue(result, { emitEvent: false });
    }
  }

  private _getPreferenceByName(preferenceName: string): Preference {
    return this.preferenceService.allPreferences
      .find(({ name }) => (name === preferenceName) || name === preferenceName + 's');
  }

  private _addSizingPreference(preference: Preference, unitType: string, masterTextKey: string): SizingUnitPreference {
    if (!preference) { return null; }

    this.preferenceService.addSizingUnitPreference(preference, unitType, masterTextKey, this.moduleGroupId);

    return this.preferenceService.sizingUnitPreferences.find(({ preference: { name }}) => name === preference.name);
  }
}
