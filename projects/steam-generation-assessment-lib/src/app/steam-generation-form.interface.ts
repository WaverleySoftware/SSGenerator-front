import { UnitConvert } from "sizing-shared-lib";

export interface SteamCalorificRequestInterface {
  energyUnitSelected: number
  smallWeightUnitSelected: number;
  inputFuelId: string;
  fuelUnitSelected: number;
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
  fuelUnitSelected: number;
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
  fuelUnitSelected: number;
}

export interface SteamGeneratorInputsInterface {
  hoursOfOperation?: number; // nullable: true
  isSteamFlowMeasured:	boolean;
  isAutoTdsControlPResent:	boolean;
  boilerSteamGeneratedPerYear?: number; // nullable: true
  boilerSteamGeneratedPerHour?: number; // nullable: true
  inputFuelId: string;
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
  BoilerHouseMassFlowUnits = 'massFlowUnitSelected',
  BoilerHouseSmallMassFlowUnits = 'smallMassFlowUnitSelected',
  PressureUnit = 'pressureUnitSelected',
  TemperatureUnit = 'temperatureUnitSelected',
  BoilerHouseTDSUnits = 'tdsUnitSelected'
}

export enum SelectedUnitsList {
  energyUnitSelected = 'BoilerHouseEnergyUnits',
  smallWeightUnitSelected = 'WeightUnit',
  emissionUnitSelected = 'BoilerHouseEmissionUnits',
  volumeUnitSelected = 'BoilerHouseVolumeUnits',
  smallVolumetricFlowUnitSelected = 'BoilerHouseSmallVolumetricFlowUnits',
  massFlowUnitSelected = 'BoilerHouseMassFlowUnits',
  smallMassFlowUnitSelected = 'BoilerHouseSmallMassFlowUnits',
  pressureUnitSelected = 'PressureUnit',
  temperatureUnitSelected = 'TemperatureUnit',
  tdsUnitSelected = 'BoilerHouseTDSUnits',
  fuelUnitSelected = 'FUEL_TYPE'
}

export enum SgaFuelTypes {
  BoilerHouseLiquidFuelUnits = 'BoilerHouseLiquidFuelUnits',
  BoilerHouseElectricalFuelUnits = 'BoilerHouseElectricalFuelUnits',
  BoilerHouseGasFuelUnits = 'BoilerHouseGasFuelUnits',
  BoilerHouseSolidFuelUnits = 'BoilerHouseSolidFuelUnits',
}

export enum FuelTypesEnum {
  L = 'BoilerHouseLiquidFuelUnits', // BoilerHouseLiquidFuelUnits
  E = 'BoilerHouseElectricalFuelUnits', // BoilerHouseElectricalFuelUnits
  G = 'BoilerHouseGasFuelUnits', // BoilerHouseGasFuelUnits
  O = 'BoilerHouseGasFuelUnits', // BoilerHouseGasFuelUnits
  S = 'BoilerHouseSolidFuelUnits', // BoilerHouseSolidFuelUnits
}

export interface CustomUnitConvert extends UnitConvert {
  targetUnitKey: string;
}

export interface BenchmarkDataInterface {
  "assessmentName": string,
  "o2ScavengingChemicalCostPerYear": number,
  "bdvCoolingWater": number,
  "bdvCoolingWaterUnit": number,
  "boilerEfficiency": number,
  "boilerFeedWaterFlow": number,
  "boilerFeedWaterFlowUnit": number,
  "boilerHouseWaterCost": number,
  "boilerHouseWaterCostUnit": 0,
  "boilerHouseWaterFlowTotal": number,
  "boilerHouseWaterFlowTotalUnit": number,
  "condensateReturnedPercentage": number,
  "condyCO2CostSaved": number,
  "condyWaterAndChemicalCostSaved": number,
  "totalCostSavedCondensateReturn": number,
  "condyFuelCost": number,
  "condyFuelAmount": number,
  "condyFuelAmountUnit": number,
  "costOfBoilerHouseEffluent": number,
  "condyCostEffluent": number,
  "costChemM3": number,
  "chemCostTotalPerYear": number,
  "costOfCO2PerkWh": number,
  "costOfCO2PerTonne": number,
  "costOfCO2PerTonneUnit": number,
  "costOfCO2PerYear": number,
  "costOfEffm3": number,
  "costOfTdsEffluent": number,
  "costOfFuelPerkWh": number,
  "costOfFuelPerUnit": number,
  "costOfFuelPerYear": number,
  "costTdsCo2": number,
  "costTdsFuel": number,
  "costTdsWater": number,
  "waterCostPerUnit": number,
  "waterCostPerUnitUnit": number,
  "energyInTdsBlowdown": number,
  "energyInTdsBlowdownUnit": number,
  "energyToGenerateUnitofSteam": number,
  "energyToGenerateUnitofSteamUnit": number,
  "feedTankPressureBarGauge": number,
  "feedTankPressureBarGaugeUnit": number,
  "flashVesselPressureTdsPaAbs": number,
  "flashVesselPressureTdsPaAbsUnit": number,
  "fuelCarbonContent": number,
  "fuelConsumptionPerYear": number,
  "fuelConsumptionPerYearUnit": number,
  "fuelConsumptionUnitId": number,
  "fuelCostPerYearIsKnown": boolean,
  "fuelEnergyInFlash": number,
  "fuelEnergyInFlashUnit": number,
  "fuelEnergyInHtx": number,
  "fuelEnergyInHtxUnit": number,
  "fuelEnergyInTds": number,
  "fuelEnergyInTdsUnit": number,
  "fuelEnergyPerUnit": number,
  "fuelEnergyPerUnitUnit": number,
  "fuelId": string,
  "fuelQtyPerYearIsKnown": boolean,
  "fuelUnitId": number,
  "fuelConsumptionPerYearM3": number,
  "fuelConsumptionPerYearM3Unit": number,
  "hfboiler": number,
  "hgDSI": number,
  "makeUpWaterDegC": number,
  "makeUpWaterDegCUnit": number,
  "makeUpWaterFlow": number,
  "makeUpWaterFlowUnit": number,
  "massFlowFlashSteam": number,
  "massFlowFlashSteamUnit": number,
  "mBoiler": number,
  "mBoilerUnit": number,
  "mBoilerKgPerHour": number,
  "mBoilerKgPerHourUnit": number,
  "mCondy": number,
  "mCondyUnit": number,
  "mCondyCO2": number,
  "mCondyCO2Unit": number,
  "mCondyWater": number,
  "mCondyWaterUnit": number,
  "mFlashTDS": number,
  "mFlashTDSUnit": number,
  "mTdsNet": number,
  "mTdsNetUnit": number,
  "mTdsWater": number,
  "mTdsWaterUnit": number,
  "mdsi": number,
  "mdsiUnit": number,
  "mtds": number,
  "mtdsUnit": number,
  "percentTdsBlowdown": number,
  "qFlashTds": number,
  "qFlashTdsUnit": number,
  "qfuel": number,
  "qfuelUnit": number,
  "qHtxTds": number,
  "qHtxTdsUnit": number,
  "qkWhtonne": number,
  "qkWhtonneUnit": number,
  "radiationLosses": number,
  "radiationLossesUnit": number,
  "costOfRadiationLosses": number,
  "costOfRadiationLossesUnit": number,
  "steamGeneratedkgPerHour": number,
  "steamGeneratedkgPerHourUnit": number,
  "tCondy": number,
  "tCondyUnit": number,
  "tfwDegC": number,
  "tfwDegCUnit": number,
  "thPerY": number,
  "thPerYUnit": number,
  "tonnesOfCO2": number,
  "tonnesOfCO2Unit": number,
  "tonnesOfCO2fromTds": number,
  "tonnesOfCO2fromTdsUnit": number,
  "totalCostOfSteamPerkWhOfFuel": number,
  "totalCostOfSteamPerTonne": number,
  "totalCostOfSteamPerTonneUnit": number,
  "totalCostOfSteamPerYear": number,
  "totCostTdsBlowdown": number,
  "volTdsAndBdv": number,
  "volTdsAndBdvUnit": number,
  "waterAndChemicalsCostTotalPerYear": number,
  "waterTreatmentEffluent": number,
  "waterTreatmentEffluentUnit": number,
  "waterTreatmentCostEffluent": number,
  "boilerHouseTotalVolumeOfWaterEffluent": number,
  "boilerHouseTotalVolumeOfWaterEffluentUnit": number,
  "proposalName": string,
  "selected": boolean,
  "available": boolean,
  "proposalType": string,
  "averageFeedWaterTDS": number,
  "averageFeedWaterTDSUnit": number,
  "averageBoilerTDS": number,
  "averageBoilerTDSUnit": number,
  "propFuelEnergySavings": number,
  "propFuelQuantitySavings": number,
  "propFuelValueSavings": number,
  "propCo2EmmissionsReducedQuantitySavings": number,
  "propCo2EmmissionsReducedValueSavings": number,
  "propWaterAndChemicalQuantitySavings": number,
  "propWaterAndChemicalValueSavings": number,
  "propEffluentQuantitySavings": number,
  "propEffluentValueSavings": number,
  "propTotalSavingsForProposal": number
}

export interface SgFormStructureInterface {
  utility_parameters: {
    status: boolean,
    panels: {
      fuel: {
        status: boolean,
        fields: string[]
      },
      co2_emission: {
        status: boolean,
        fields: string[]
      },
      water: {
        status: boolean,
        fields: string[]
      },
      water_treatment_chemicals: {
        status: boolean,
        fields: string[]
      },
      water_effluent: {
        status: boolean,
        fields: string[]
      }
    },
    fields: string[]
  },
  boiler_house_parameters: {
    status: boolean,
    panels: {
      boiler: {
        status: boolean,
        panels: {
          boiler_parameters: {
            status: boolean,
            fields: string[]
          }
        }
      },
      tds_blowdown: {
        status: boolean,
        panels: {
          blowdown_equipment: {
            status: boolean,
            fields: string[]
          },
          tds_blowdown_parameters: {
            status: boolean,
            fields: string[]
          }
        }
      },
      water_treatment: {
        status: boolean,
        panels: {
          make_up_water: {
            status: boolean,
            fields: string[]
          },
          water_treatment_parameters: {
            status: boolean,
            fields: string[]
          }
        }
      },
      feedwater_and_condensate: {
        status: boolean,
        panels: {
          deaerator_type: {
            status: boolean,
          },
          boiler_feedwater: {
            status: boolean,
            fields: string[]
          },
          condensate_return: {
            status: boolean,
            fields: string[]
          }
        }
      }
    }
  }
}
