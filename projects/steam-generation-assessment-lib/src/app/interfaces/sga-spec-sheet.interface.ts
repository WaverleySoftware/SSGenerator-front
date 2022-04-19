import { BenchmarkInputsInterface } from "./benchmarkInputs.interface";
import { BenchmarkResBenchmarkInterface } from "./calc-benchmark-res.interface";
import { KeyParametersChangedInterface } from "./key-parameters-changed.interface";
import { ProposalCalculationInterface } from "./proposal-calculation.interface";

export interface SgaSpecSheetInterface {
  "currency": string,
  "userLanguage": string,
  "moduleId": number,
  "customer": string,
  "projectName": string,
  "projectRef": string,
  "jobName": string,
  "date": string,
  "sheet": string,
  "revisionNo": string,
  "preparedBy": string,
  "email": string,
  "telephone": string,
  "selectedUnits": {
    "yearUnit": string,
    "currencyUnit": string,
    "energyUnit": string,
    "smallWeightUnit": string,
    "weightUnit": string,
    "emissionUnit": string,
    "volumeUnit": string,
    "smallVolumetricFlowUnit": string,
    "smallVolumetricFlowUnitSelected": number,
    "massFlowUnit": string,
    "smallMassFlowUnit": string,
    "pressureUnit": string,
    "temperatureUnit": string,
    "tdsUnit": string,
    "fuelUnitSelected": string,
    "specificEnergyUnit": string,
    "fuelCalorificUnit": string
  },
  "keyParametersChanged": KeyParametersChangedInterface,
  "inputParameters": BenchmarkInputsInterface,
  "benchmarkCalculation": BenchmarkResBenchmarkInterface,
  "proposalCalculation": ProposalCalculationInterface
}
