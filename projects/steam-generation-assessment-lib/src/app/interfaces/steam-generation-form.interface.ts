import { BenchmarkInputsInterface } from "./benchmarkInputs.interface";
import { ProposedFeaturesInterface } from "./proposed-features.interface";
import { ProposedSetupInterface } from "./proposed-setup.interface";

export type FormFieldTypesInterface = { [key in keyof Partial<BenchmarkInputsInterface>]: {
  formControlName: string;
  label: string;
  unitNames?: [string, string?];
  unitTypes?: [string, string?];
  translations?: [string, string?];
  controlNames?: [string, string?];
  required?: boolean;
  filled?: boolean;
} };

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
