export interface SteamGenerationFormInterface {
  hoursOfOperation: number;
  isSteamFlowMeasured: boolean;
  isAutoTdsControlPResent: boolean;
  boilerSteamGeneratedPerYear: number;
  boilerSteamGeneratedPerYearUnit: number;
  inputFuelId: number;
  inputFuelUnit: number;
  costOfFuelPerUnit: number;
  costOfFuelUnit: number;
  costOfFuelPerYear: number;
  fuelQtyPerYearIsKnown: boolean;
  fuelConsumptionPerYear: number;
  fuelConsumptionPerYearUnit: number;
  fuelEnergyPerUnit: number;
  fuelCarbonContent: number;
  fuelCarbonContentUnit: number;
  costOfWaterPerUnit: number;
  costOfWaterUnit: number;
  costOfEffluentPerUnit: number;
  costOfEffluentUnit: number;
  boilerHouseWaterQtyPerYearIsKnown: boolean;
  waterConsumptionPerYear: number;
  waterConsumptionPerYearUnit: number;
  boilerWaterTreatmentChemicalCostsIsKnown: boolean;
  totalChemicalCostPerYear: number;
  totalChemicalCostPerYearUnit: number;
  costOfChemistsPerUnitOfWater: number;
  costOfChemistsPerUnitOfWaterUnit: number;
  o2ScavengingChemicalsCostSavings: number;
  o2ScavengingChemicalsCostSavingsUnit: number;
  carbonTaxLevyCostPerUnit: number;
  carbonTaxLevyCostUnit: number;
  costOfCo2PerUnitMass: number;
  costOfCo2Unit: number;
  isBlowdownVesselPresent: boolean;
  isCoolingWaterUsed: boolean;
  isSuperheatedSteam: boolean;
  boilerEfficiency: number;
  isFeedWaterMeasured: boolean;
  boilerSteamPressure: number;
  boilerSteamPressureUnit: number;
  boilerSteamTemperature: number;
  boilerSteamTemperatureUnit: number;
  isEconomizerPresent: boolean;
  boilerAverageTds: number;
  boilerAverageTdsUnit: number;
  boilerMaxTds: number;
  boilerMaxTdsUnit: number;
  boilerFeedwaterConsumption: number;
  boilerFeedwaterConsumptionUnit: number;
  isFlashVesselPresent: boolean;
  isHeatExchangerPresent: boolean;
  waterTemperatureLeavingHeatExchanger: number;
  waterTemperatureLeavingHeatExchangerUnit: number;
  waterTreatmentMethod: number;
  percentageWaterRejection: number;
  percentageWaterRejectionUnit: number;
  tdsOfMakeupWater: number;
  tdsOfMakeupWaterUnit: number;
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