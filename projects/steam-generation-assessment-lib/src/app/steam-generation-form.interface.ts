
export interface SteamCalorificRequestInterface {
  energyUnitSelected: number
  smallWeightUnitSelected: number;
  inputFuelId: string;
  inputFuelUnit: number;
}

export interface SgaBoilerEfficiencyInterface {
  inputFuelId: string;
  isEconomizerPresent: boolean
}

export interface SgaFeedTankTemperatureRequestInterface {
  isPressureDeaerator: boolean;
  pressureOfFeedtank: number;
  pressureUnitSelected: number;
  temperatureOfFeedtank: number;
  temperatureUnitSelected: number;
}

export interface SteamCarbonEmissionInterface {
  energyUnitSelected: number;
  smallWeightUnitSelected: number;
  inputFuelId: string;
  inputFuelUnit: number;
  fuelEnergyPerUnit: number;
  fuelCarbonContent: number;
}

export interface SteamGeneratorSelectedUnitsInterface {
  energyUnitSelected: number;
  smallWeightUnitSelected: number;
  emissionUnitSelected: number;
  volumeUnitSelected: number;
  smallVolumetricFlowUnitSelected: number;
  massFlowUnitSelected: number;
  smallMassFlowUnitSelected: number;
  pressureUnitSelected: number;
  temperatureUnitSelected: number;
  tdsUnitSelected: number;
}

export interface SteamGeneratorInputsInterface {
  hoursOfOperation?: number; // nullable: true
  isSteamFlowMeasured:	boolean;
  isAutoTdsControlPResent:	boolean;
  boilerSteamGeneratedPerYear?: number; // nullable: true
  boilerSteamGeneratedPerHour?: number; // nullable: true
  inputFuelId: string;
  inputFuelUnit: number;
  costOfFuelPerUnit?: number; // nullable: true
  costOfFuelPerYear?: number; // nullable: true
  fuelQtyPerYearIsKnown:	boolean;
  fuelConsumptionPerYear?: number; // nullable: true
  fuelEnergyPerUnit?: number; // nullable: true
  fuelCarbonContent?: number; // nullable: true
  costOfWaterPerUnit?: number; // nullable: true
  costOfWaterPerYear?: number; //nullable: true // TODO: ask about this field
  costOfEffluentPerUnit?: number; // nullable: true
  boilerHouseWaterQtyPerYearIsKnown:	boolean;
  waterConsumptionPerYear?: number; // nullable: true
  waterConsumptionPerHour?: number; // nullable: true
  boilerWaterTreatmentChemicalCostsIsKnown:	boolean;
  totalChemicalCostPerYear?: number; // nullable: true
  o2ScavengingChemicalsCostSavings?: number; // nullable: true
  carbonTaxLevyCostPerUnit?: number; // nullable: true
  costOfCo2PerUnitMass?: number; // nullable: true
  isCo2OrCarbonEmissionsTaxed:	boolean;
  isBlowdownVesselPresent:	boolean;
  isCoolingWaterUsed:	boolean;
  isSuperheatedSteam:	boolean;
  boilerEfficiency?: number; // nullable: true
  isFeedWaterMeasured:	boolean;
  boilerSteamPressure?: number; // nullable: true
  boilerSteamTemperature?: number; // nullable: true
  isEconomizerPresent: boolean;
  boilerAverageTds?: number; // nullable: true
  boilerMaxTds?: number; // nullable: true
  boilerFeedwaterConsumptionPerYear?: number; // nullable: true
  boilerFeedwaterConsumptionPerHour?: number; // nullable: true
  isFlashVesselPresent:	boolean;
  isHeatExchangerPresent:	boolean;
  waterTemperatureLeavingHeatExchanger?: number; // nullable: true
  waterTreatmentMethod:	string;
  percentageWaterRejection?: number; // nullable: true
  tdsOfMakeupWater?: number; // nullable: true
  temperatureOfMakeupWater?: number; // nullable: true
  makeupWaterAmountPerHour?: number; // nullable: true
  makeupWaterAmountPerYear?: number; // nullable: true
  isMakeUpWaterMonitored:	boolean;
  atmosphericDeaerator:	boolean;
  pressurisedDeaerator:	boolean;
  temperatureOfFeedtank?: number; // nullable: true
  tdsOfFeedwaterInFeedtank?: number; // nullable: true
  tdsOfCondensateReturn?: number; // nullable: true
  temperatureOfCondensateReturn?: number; // nullable: true
  areChemicalsAddedDirectlyToFeedtank:	boolean;
  pressureOfFeedtank?: number; // nullable: true
  pressureOfSteamSupplyingDsi?: number; // nullable: true
  isCondensateReturnKnown:	boolean;
  percentageOfCondensateReturn?: number; // nullable: true
  volumeOfCondensateReturn?: number; // nullable: true
  isDsiPresent:	boolean;
}

export interface SgaSizingModuleFormInterface {
  selectedUnits: SteamGeneratorSelectedUnitsInterface,
  benchmarkInputs: SteamGeneratorInputsInterface
}

export type FormFieldTypesInterface = {
  [key in keyof Partial<SteamGeneratorInputsInterface>]: {
    formControlName: string;
    label: string;
    unitNames?: [string, string?];
    unitTypes?: [string, string?];
    translations?: [string, string?];
    controlNames?: [string, string?];
    required?: boolean;
    filled?: boolean;
  }
}

export interface SgaHttpValidationResponseInterface {
  errors: {
    attemptedValue: number;
    customState: any
    errorCode: string;
    errorMessage: string;
    formattedMessagePlaceholderValues: {
      ComparisonValue: number;
      ComparisonProperty: string;
      PropertyName: string;
      PropertyValue: number;
    };
    propertyName: string;
    severity: number;
  }[];
  isValid: boolean;
  ruleSetsExecuted: string[]
}

export interface SgaSaturatedTemperatureBodyInterface {
  temperatureUnitSelected: number;
  pressureUnitSelected: number;
  isSuperheatedSteam: boolean;
  boilerSteamPressure: number;
  boilerSteamTemperature: number;
}

export interface SgaSaturatedAndTemperatureRespInterface {
  boilerSteamPressure: number;
  boilerSteamPressureUnit: number;
  boilerSteamTemperature: number;
  boilerSteamTemperatureUnit: number;
  dialogMessage: string | null;
  media: string;
  mediaState: string;
  meltingPoint: number;
}

export enum BoilerHouseBoilerTabFields {
  'isSuperheatedSteam',
  'isSteamFlowMeasured',
  'boilerSteamGeneratedPerHour',
  'boilerSteamGeneratedPerYear',
  'boilerSteamTemperature',
  'boilerSteamPressure',
  'isEconomizerPresent',
  'boilerEfficiency'
}

export enum BoilerHouseTdsBlowdownTabFields {
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
}

export enum BoilerHouseWaterTreatmentTabFields {
  // make_up_water
  'isMakeUpWaterMonitored',
  'temperatureOfMakeupWater',
  'makeupWaterAmountPerHour',
  'makeupWaterAmountPerYear',
  // water_treatment_parameters
  'waterTreatmentMethod',
  'percentageWaterRejection',
  'tdsOfMakeupWater',
}

export enum BoilerHouseFeedwaterAndCondensateTabFields {
  // deaerator_type
  'atmosphericDeaerator',
  'pressurisedDeaerator',
  // boiler_feedwater
  'isFeedWaterMeasured',
  'boilerFeedwaterConsumptionPerHour',
  'boilerFeedwaterConsumptionPerYear',
  'temperatureOfFeedtank',
  // 'tdsOfFeedwaterInFeedtank', // duplicate
  'areChemicalsAddedDirectlyToFeedtank',
  'pressureOfSteamSupplyingDsi',
  'pressureOfFeedtank',
  // condensate_return
  'isCondensateReturnKnown',
  'percentageOfCondensateReturn',
  'volumeOfCondensateReturn',
  'temperatureOfCondensateReturn',
  'tdsOfCondensateReturn'
}

export enum UtilityParametersFields {
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
}

export enum SgaSelectedUnits {
  BoilerHouseEnergyUnits = 'energyUnitSelected',
  WeightUnit = 'smallWeightUnitSelected',
  BoilerHouseEmissionUnits = 'emissionUnitSelected',
  BoilerHouseVolumeUnits = 'volumeUnitSelected',
  BoilerHouseSmallVolumetricFlowUnits = 'smallVolumetricFlowUnitSelected',
  MassFlowUnit = 'massFlowUnitSelected',
  BoilerHouseSmallMassFlowUnits = 'smallMassFlowUnitSelected',
  PressureUnit = 'pressureUnitSelected',
  TemperatureUnit = 'temperatureUnitSelected',
  BoilerHouseTDSUnits = 'tdsUnitSelected',
}

export enum SgaFuelTypes {
  BoilerHouseLiquidFuelUnits,
  BoilerHouseElectricalFuelUnits,
  BoilerHouseGasFuelUnits,
  BoilerHouseSolidFuelUnits,
}

export enum FuelTypesEnum {
  L = 'BoilerHouseLiquidFuelUnits', // BoilerHouseLiquidFuelUnits
  E = 'BoilerHouseElectricalFuelUnits', // BoilerHouseElectricalFuelUnits
  G = 'BoilerHouseGasFuelUnits', // BoilerHouseGasFuelUnits
  O = 'BoilerHouseGasFuelUnits', // BoilerHouseGasFuelUnits
  S = 'BoilerHouseSolidFuelUnits', // BoilerHouseSolidFuelUnits
}

export interface SgaFieldUnit {
  name: string;
  value: any;
  unit: {
    value: number;
    selectedKey: string;
    preferenceKey: string;
  };
  unitNames?: [string?, string?],
  controlNames?: [string?, string?],
}
