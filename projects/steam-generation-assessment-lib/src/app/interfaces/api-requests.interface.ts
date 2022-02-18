export interface SgaErrorInterface {
  attemptedValue: number;
  customState: any;
  errorCode: string;
  errorMessage: string;
  formattedMessagePlaceholderValues: {
    PropertyName: string,
    PropertyValue: number,
  };
  propertyName: string;
  severity: number;
}

export interface SgaValidationErrorResInterface {
  errors: SgaErrorInterface[];
  isValid: boolean;
  ruleSetsExecuted: string[];
}

export interface SgaCalcCalorificReqInterface {
  energyUnitSelected: number;
  smallWeightUnitSelected: number;
  inputFuelId: string;
  fuelUnitSelected: number;
}

export interface SgaCalcCalorificResInterface {
  fuelCarbonContent: number;
  fuelEnergyPerUnit: number;
}

export interface SgaCalcCarbonEmissionReqInterface {
  energyUnitSelected: number;
  smallWeightUnitSelected: number;
  inputFuelId: string;
  fuelUnitSelected: number;
  fuelEnergyPerUnit: number;
  fuelCarbonContent: number;
}

export interface SgaCalcCarbonEmissionResInterface {
  fuelCarbonContent: number;
}

export interface SgaCalcWaterTreatmentReqInterface {
  waterTreatmentMethodId: string;
  tdsUnitSelected: number;
}

export interface SgaCalcWaterTreatmentResInterface {
  percentageWaterRejection: number;
  tdsOfMakeupWater: number;
}

export interface SgaCalcBoilerEfficiencyReqInterface {
  isEconomizerPresent: boolean;
  inputFuelId: string;
}

export interface SgaCalcBoilerEfficiencyResInterface {
  boilerEfficiency: number;
}

export interface SgaCalcSaturatedAndFreezingTemperatureReqInterface {
  temperatureUnitSelected: number;
  pressureUnitSelected: number;
  isSuperheatedSteam: boolean;
  boilerSteamPressure: number;
  boilerSteamTemperature: number;
}

export interface SgaCalcSaturatedAndFreezingTemperatureResInterface {
  boilerSteamTemperature: {
    boilerSteamPressure: number;
    boilerSteamPressureUnit: number;
    boilerSteamTemperature: number;
    boilerSteamTemperatureUnit: number;
    dialogMessage: any;
    media: string;
    mediaState: string;
    meltingPoint: number;
  };
}

export interface SgaCalcFeedtankTemperatureAndPressureReqInterface {
  isPressureDeaerator: boolean;
  pressureOfFeedtank: number;
  pressureUnitSelected: number;
  temperatureOfFeedtank: number;
  temperatureUnitSelected: number;
}

export interface SgaCalcFeedtankTemperatureAndPressureResInterface {
  dialogMessage: string;
  pressureOfFeedtank: number;
  temperatureOfFeedtank: number;
}

export interface SgaCalcWaterTemperatureExchangerReqInterface {
  temperatureUnitSelected: number;
}

export interface SgaCalcWaterTemperatureExchangerResInterface {
  waterTemperatureLeavingHeatExchanger: number;
}

export interface SgaCalcProposalEfficiencyReqInterface {
  economiserRequired: boolean;
  benchmarkBoilerEfficiency: number;
  proposalBoilerEfficiency: number;
}

export interface SgaCalcProposalEfficiencyResInterface {
  proposalBoilerEfficiency: number;
}
