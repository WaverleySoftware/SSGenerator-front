
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
  massFlowUnitSelected: number;
  massFlowBoilerHouseUnitSelected: number;
  pressureUnitSelected: number;
  temperatureUnitSelected: number;
  tdsUnitSelected: number;
  carbonDioxideEmissionsUnitSelected: number;
}

export interface SteamGeneratorInputsInterface {
  hoursOfOperation: number;
  isSteamFlowMeasured: boolean;
  isAutoTdsControlPResent: boolean;
  boilerSteamGeneratedPerYear: number;
  boilerSteamGeneratedPerYearUnit: number;
  boilerSteamGeneratedPerHour: number;
  boilerSteamGeneratedPerHourUnit: number;
  inputFuelId: string;
  inputFuelUnit: number;
  costOfFuelPerUnit: number; // 0.02 khW
  costOfFuelPerYear: number;
  fuelQtyPerYearIsKnown: boolean;
  fuelConsumptionPerYear: number;
  fuelEnergyPerUnit: number;
  fuelCarbonContent: number;
  costOfWaterPerUnit: number;
  costOfEffluentPerUnit: number;
  boilerHouseWaterQtyPerYearIsKnown: boolean;
  costOfWaterPerYear: number; // COST_OF_WATER_PER_YEAR  --- NEW FIELD
  waterConsumptionPerHour: number; // WATER_CONSUMPTION_HOUR  --- NEW FIELD
  waterConsumptionPerYear: number;
  boilerWaterTreatmentChemicalCostsIsKnown: boolean;
  totalChemicalCostPerYear: number;
  costOfChemistsPerUnitOfWater: number;
  o2ScavengingChemicalsCostSavings: number;
  isCo2OrCarbonEmissionsTaxed: boolean; // ARE_CO2_OR_CARBON_EMISSIONS_TAXED   --- NEW FIELD
  carbonTaxLevyCostPerUnit: number;
  costOfCo2PerUnitMass: number;
  isBlowdownVesselPresent: boolean;
  isCoolingWaterUsed: boolean;
  isSuperheatedSteam: boolean;
  boilerEfficiency: number;
  isFeedWaterMeasured: boolean;
  boilerSteamPressure: number;
  boilerSteamTemperature: number;
  isEconomizerPresent: boolean;
  boilerAverageTds: number;
  boilerMaxTds: number;
  boilerFeedwaterConsumption: number;
  isFlashVesselPresent: boolean;
  isHeatExchangerPresent: boolean;
  waterTemperatureLeavingHeatExchanger: number;
  waterTreatmentMethod: string;
  percentageWaterRejection: number;
  // percentageWaterRejectionUnit --- PERCENTAGE WATER REJECTION (unit) --- REMOVED FIELD (need to remove unit only percentage %)
  tdsOfMakeupWater: number;
  tdsOfMakeupWaterUnit: number;
  isMakeUpWaterMonitored: boolean; // IS_MAKE_UP_WATER_MONITORED  --- NEW FIELD
  temperatureOfMakeupWater: number;
  temperatureOfMakeupWaterUnit: number;
  makeupWaterAmount: number;
  makeupWaterAmountUnit: number;
  atmosphericDeaerator: boolean;
  pressurisedDeaerator: boolean;
  temperatureOfFeedtank: number;
  temperatureOfFeedtankUnit: number;
  tdsOfFeedwaterInFeedtank: number;
  tdsOfFeedwaterInFeedtankUnit: number;
  tdsOfCondensateReturn: number;
  tdsOfCondensateReturnUnit: number;
  temperatureOfCondensateReturn: number;
  temperatureOfCondensateReturnUnit: number;
  areChemicalsAddedDirectlyToFeedtank: boolean;
  pressureOfFeedtank: number;
  pressureOfFeedtankUnit: number;
  pressureOfSteamSupplyingDsi: number;
  pressureOfSteamSupplyingDsiUnit: number;
  isCondensateReturnKnown: boolean;
  percentageOfCondensateReturn: number;
  percentageOfCondensateReturnUnit: number;
  volumeOfCondensateReturn: number;
  volumeOfCondensateReturnUnit: number;
  isDsiPresent: boolean;
  proposalTemperatureUnit: string;
  proposalTemperatureUnitUnit: number;
  isBoilerEfficiencySelected: boolean;
  isBoilerEfficiencyAvailable: boolean;
  proposalBoilerEfficiency: number;
  isIncreasingCondensateReturnSelected: boolean;
  isIncreasingCondensateReturnAvailable: boolean;
  proposalCondensateReturned: number;
  proposalCondensateReturnedUnit: number;
  proposalCondensateReturnedPercentage: number;
  proposalCondensateTemperature: number;
  proposalCondensateTemperatureUnit: number;
  changingWaterTreatmentMethodSelected: boolean;
  changingWaterTreatmentMethodAvailable: boolean;
  proposalMakeUpWaterTds: number;
  proposalMakeUpWaterTdsUnit: number;
  proposalPercentFeedwaterRejected: number;
  proposalPercentFeedwaterRejectedUnit: number;
  addingAutomaticTdsControlSelected: boolean;
  addingAutomaticTdsControlAvailable: boolean;
  addingFlashHeatRecoveryToAutoTdsControlSelected: boolean;
  addingFlashHeatRecoveryToAutoTdsControlAvailable: boolean;
  addingHeatExchangerforHeatRecoveryToTdsBlowdownSelected: boolean;
  addingHeatExchangerforHeatRecoveryToTdsBlowdownAvailable: boolean;
  effectOfDsiOnHotwellSelected: boolean;
  effectOfDsiOnHotwellAvailable: boolean;
  proposalDesiredHotwellTemperatureUsingDSI: number;
  proposalDesiredHotwellTemperatureUsingDSIUnit: number;
  proposalCostOfSodiumSulphite: number;
  proposalCostOfSodiumSulphiteUnit: number;
  proposalDSIPressure: number;
  proposalDSIPressureUnit: number;
}

export interface SgaSizingModuleFormInterface {
  selectedUnits: SteamGeneratorSelectedUnitsInterface,
  steamGeneratorInputs: SteamGeneratorInputsInterface
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

/* REMOVED ITEMS
FuelEnergyPerUnitUnit
FuelCarbonContentUnit
CostOfWaterUnit
CostOfEffluentUnit
WaterConsumptionPerYearUnit
TotalChemicalCostPerYearUnit
CostOfChemistsPerUnitOfWaterUnit
O2ScavengingChemicalsCostSavingsUnit
BoilerSteamPressureUnit
BoilerSteamTemperatureUnit
BoilerAverageTdsUnit
BoilerMaxTdsUnit
BoilerFeedwaterConsumptionUnit
WaterTemperatureLeavingHeatExchangerUnit
* */
