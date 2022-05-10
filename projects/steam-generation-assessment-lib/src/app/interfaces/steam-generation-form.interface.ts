import { BenchmarkResBenchmarkInterface } from "./calc-benchmark-res.interface";

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
  costOfWaterPerYear?: number; // TODO: ask about this field
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
};

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
  ruleSetsExecuted: string[];
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
  };
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
  };
}

export interface ProposedSetupInterface {
  benchmarkBoilerEfficiency: number;
  benchmarkCondensateReturn: number;
  benchmarkCondensateReturnedPercentage: number;
  benchmarkCondensateTemperature: number;
  benchmarkDsiPressure: number;
  benchmarkTemperatureOfFeedtank: number;
  benchmarkWaterRejectionRate: number;
  condensateReturnUnit: number;
  condensateTemperatureUnit: number;
  dsiPressureUnit: number;
  economiserRequired: boolean;
  proposalBoilerEfficiency: number;
  proposalCondensateReturned: number;
  proposalCondensateReturnedPercentage: number;
  proposalCondensateTemperature: number;
  proposalCostOfSodiumSulphite: number;
  proposalDsiPressure: number;
  proposalTemperatureOfFeedtank: number;
  proposalWaterRejectionRate: number;
  temperatureOfFeedtankUnit: number;
}

export interface ProposedFeaturesInterface {
  addAutoTdsAndFlashRecovery: boolean;
  addAutoTdsAndFlashRecoveryPlusHearExchanger: boolean;
  addAutoTdsControls: boolean;
  addDirectSteamInjectionToFeedtank: boolean;
  addWaterTreatmentPlant: boolean;
  boilerEfficiencyImprovements: boolean;
  increaseCondensateReturn: boolean;
}

export interface ProposedDataInterface {
    features: ProposedFeaturesInterface;
    proposedSetup: ProposedSetupInterface;
}

export enum ProposedSetupChartLabels { // ProposedSetupChartIndex
  improvedBoilerEfficiency = 'Increase boiler effiency',
  condensateReturnPlusCondensateTemperature = 'Increase condensate return',
  changingWaterTreatment = 'water treatment plant (RO)',
  addingAutomaticTdsControl = 'auto tds control',
  addingFlashHeatRecoveryToAutoTdsControl = 'auto TDS and Flash Heat Recovery',
  addingHeatExchangerToHeatRecoveryToTdsBlowdown = 'Auto tds flash recovery + heat exchanger',
  effectOfDsiOnHotwell = 'Direct steam injection feedtank',
}

export enum ProposedSetupChartElements {
  'Fuel',
  'Water and Chemicals',
  'Effluent',
  'Carbon tax',
}

export interface ProposalInputsReqInterface extends ProposedFeaturesInterface {
  benchmarkBoilerEfficiency: number;
  proposalBoilerEfficiency: number;
  benchmarkCondensateReturn: number;
  proposalCondensateReturned: number;
  benchmarkCondensateReturnedPercentage: number;
  proposalCondensateReturnedPercentage: number;
  benchmarkCondensateTemperature: number;
  proposalCondensateTemperature: number;
  proposalMakeUpWaterTds: number;
  proposalWaterRejectionRate: number;
  benchmarkWaterRejectionRate: number;
  proposalDesiredHotwellTemperatureUsingDSI: number;
  proposalDSIPressure: number;
}
