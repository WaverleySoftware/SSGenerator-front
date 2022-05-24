import { ProposedFeaturesInterface } from "./proposed-features.interface";
import { ProposedSetupInterface } from "./proposed-setup.interface";
import { BenchmarkResBenchmarkInterface } from "./calc-benchmark-res.interface";

export interface ProposalCalculationInterface {
  increaseBoilerEfficiency: ProposalCalculationItemInterface, // improvedBoilerEfficiency
  increaseCondensateReturn: ProposalCalculationItemInterface, // condensateReturnPlusCondensateTemperature
  addWaterTreatmentPlant: ProposalCalculationItemInterface, // changingWaterTreatment
  addTdsInstalled: ProposalCalculationItemInterface, // addingAutomaticTdsControl
  flashRecoveryAndTdsControlsInstalled: ProposalCalculationItemInterface, // addingFlashHeatRecoveryToAutoTdsControl
  heatExchangerFlashRecoveryAndTdsControlsInstalled: ProposalCalculationItemInterface, // addingHeatExchangerToHeatRecoveryToTdsBlowdown
  addDirectSteamInjectionToFeedtank: ProposalCalculationItemInterface, // effectOfDsiOnHotwell
  overallImpactOnProposal: BenchmarkResBenchmarkInterface, // overallImpactOnProposalsSelectedOnBoilerHouse
  proposalSetup: ProposedSetupInterface, // results.proposalInputs
  proposalFeatures: ProposedFeaturesInterface, // results.features
  finalImpactOfIncreasingBoilerEfficiency: ProposalCalculationItemInterface, // finalImpactOfIncreasingBoilerEfficiency
  finalImpactOfIncreasingCondensateReturned: ProposalCalculationItemInterface, // finalImpactOfIncreasingCondensateReturned
  finalImpactOfChangingWaterTreatment: ProposalCalculationItemInterface, // finalImpactOfChangingWaterTreatment
  finalImpactOfAddingAutoTds: ProposalCalculationItemInterface, // finalImpactOfAddingAutoTds
  finalImpactOfAddingAutoTDSAndFlashRecovery: ProposalCalculationItemInterface, // finalImpactOfAddingAutoTDSAndFlashRecovery
  finalImpactOfAddingAutoTDSFlashRecoveryAndHeatWxchanger: ProposalCalculationItemInterface, // finalImpactOfAddingAutoTDSFlashRecoveryAndHeatWxchanger
  finalImpactOfAddingDsiToFeedtank: ProposalCalculationItemInterface // finalImpactOfAddingDsiToFeedtank
}

export interface ProposalCalculationReducedResponseInterface {
  addingAutomaticTdsControl: ProposalCalculationItemInterface;
  addingFlashHeatRecoveryToAutoTdsControl: ProposalCalculationItemInterface;
  addingHeatExchangerToHeatRecoveryToTdsBlowdown: ProposalCalculationItemInterface;
  benchmark: BenchmarkResBenchmarkInterface;
  benchmarkView?: BenchmarkResBenchmarkInterface;
  changingWaterTreatment: ProposalCalculationItemInterface;
  condensateReturnPlusCondensateTemperature: ProposalCalculationItemInterface;
  effectOfDsiOnHotwell: ProposalCalculationItemInterface;
  finalImpactOfAddingAutoTds: ProposalCalculationItemInterface;
  finalImpactOfAddingAutoTDSAndFlashRecovery: ProposalCalculationItemInterface;
  finalImpactOfAddingAutoTDSFlashRecoveryAndHeatWxchanger: ProposalCalculationItemInterface;
  finalImpactOfAddingDsiToFeedtank: ProposalCalculationItemInterface;
  finalImpactOfChangingWaterTreatment: ProposalCalculationItemInterface;
  finalImpactOfIncreasingBoilerEfficiency: ProposalCalculationItemInterface;
  finalImpactOfIncreasingCondensateReturned: ProposalCalculationItemInterface;
  impactOfProposalsCombined: ProposalCalculationItemInterface;
  improvedBoilerEfficiency: ProposalCalculationItemInterface;
  overallImpactOnProposalsSelectedOnBoilerHouse: BenchmarkResBenchmarkInterface;
  overallImpactOnProposalsSelectedOnBoilerHouseView?: BenchmarkResBenchmarkInterface;
}

export interface ProposalCalculationItemInterface {
  "proposalName": string,
  "selected": boolean,
  "available": boolean,
  "proposalType": string,
  "propFuelEnergySavings": number,
  "propFuelQuantitySavings": number,
  "propFuelValueSavings": number,
  "propCO2emmissionsReducedQuantitySavings": number,
  "propCO2emmissionsReducedValueSavings": number,
  "propWaterAndChemicalQuantitySavings": number,
  "propWaterAndChemicalValueSavings": number,
  "propEffluentQuantitySavings": number,
  "propEffluentValueSavings": number,
  "propTotalSavingsForProposal": number,
}
