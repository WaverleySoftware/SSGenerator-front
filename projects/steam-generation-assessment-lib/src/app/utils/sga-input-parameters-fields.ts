import { FormFieldTypesInterface } from '../interfaces/steam-generation-form.interface';

export default {
  hoursOfOperation: {
    formControlName: 'hoursOfOperation',
    label: 'HOURS_OF_OPERATION',
  },
  // FUEL
  inputFuelId: {
    formControlName: 'inputFuelId',
    label: 'FUEL_TYPE',
  },
  fuelEnergyPerUnit: {
    formControlName: 'fuelEnergyPerUnit',
    label: 'FUEL_CALORIFIC_VALUE',
    unitNames: ['BoilerHouseEnergyUnits', 'FUEL_TYPE_NAME'],
    translations: ['ENERGY'],
  },
  fuelCarbonContent: {
    formControlName: 'fuelCarbonContent',
    label: 'CO2_EMISSIONS_PER_UNIT_FUEL',
    unitNames: ['WeightUnit', 'FUEL_TYPE_NAME'],
    translations: ['SMALL_WEIGHT'],
  },
  costOfFuelPerUnit: {
    formControlName: 'costOfFuelPerUnit',
    label: 'COST_OF_FUEL_PER_UNIT',
    unitNames: ['BHCurrency', 'FUEL_TYPE_NAME'],
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
    unitNames: ['FUEL_TYPE_NAME']
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
} as FormFieldTypesInterface;
