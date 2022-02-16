export interface BenchmarkInputsInterface {
  hoursOfOperation?: number;
  isSteamFlowMeasured:	boolean;
  isAutoTdsControlPResent:	boolean;
  boilerSteamGeneratedPerYear?: number;
  boilerSteamGeneratedPerHour?: number;
  inputFuelId: string;
  costOfFuelPerUnit?: number;
  costOfFuelPerYear?: number;
  fuelQtyPerYearIsKnown:	boolean;
  fuelConsumptionPerYear?: number;
  fuelEnergyPerUnit?: number;
  fuelCarbonContent?: number;
  costOfWaterPerUnit?: number;
  costOfWaterPerYear?: number;
  costOfEffluentPerUnit?: number;
  boilerHouseWaterQtyPerYearIsKnown:	boolean;
  waterConsumptionPerYear?: number;
  waterConsumptionPerHour?: number;
  boilerWaterTreatmentChemicalCostsIsKnown:	boolean;
  totalChemicalCostPerYear?: number;
  o2ScavengingChemicalsCostSavings?: number;
  carbonTaxLevyCostPerUnit?: number;
  costOfCo2PerUnitMass?: number;
  isCo2OrCarbonEmissionsTaxed:	boolean;
  isBlowdownVesselPresent:	boolean;
  isCoolingWaterUsed:	boolean;
  isSuperheatedSteam:	boolean;
  boilerEfficiency?: number;
  isFeedWaterMeasured:	boolean;
  boilerSteamPressure?: number;
  boilerSteamTemperature?: number;
  isEconomizerPresent: boolean;
  boilerAverageTds?: number;
  boilerMaxTds?: number;
  boilerFeedwaterConsumptionPerYear?: number;
  boilerFeedwaterConsumptionPerHour?: number;
  isFlashVesselPresent:	boolean;
  isHeatExchangerPresent:	boolean;
  waterTemperatureLeavingHeatExchanger?: number;
  waterTreatmentMethod:	string;
  percentageWaterRejection?: number;
  tdsOfMakeupWater?: number;
  temperatureOfMakeupWater?: number;
  makeupWaterAmountPerHour?: number;
  makeupWaterAmountPerYear?: number;
  isMakeUpWaterMonitored:	boolean;
  atmosphericDeaerator:	boolean;
  pressurisedDeaerator:	boolean;
  temperatureOfFeedtank?: number;
  tdsOfFeedwaterInFeedtank?: number;
  tdsOfCondensateReturn?: number;
  temperatureOfCondensateReturn?: number;
  areChemicalsAddedDirectlyToFeedtank:	boolean;
  pressureOfFeedtank?: number;
  pressureOfSteamSupplyingDsi?: number;
  isCondensateReturnKnown:	boolean;
  percentageOfCondensateReturn?: number;
  volumeOfCondensateReturn?: number;
  isDsiPresent:	boolean;
}
