import { ProposedFeaturesInterface } from "./proposed-features.interface";
import { ProposedSetupInterface } from "./proposed-setup.interface";

export interface ProposalCalculationInterface {
  "increaseBoilerEfficiency": ProposalCalculationItemInterface,
  "increaseCondensateReturn": ProposalCalculationItemInterface,
  "addWaterTreatmentPlant": ProposalCalculationItemInterface,
  "addTdsInstalled": ProposalCalculationItemInterface,
  "flashRecoveryAndTdsControlsInstalled": ProposalCalculationItemInterface,
  "heatExchangerFlashRecoveryAndTdsControlsInstalled": ProposalCalculationItemInterface,
  "addDirectSteamInjectionToFeedtank": ProposalCalculationItemInterface,
  "overallImpactOnProposal": ProposalCalculationItemInterface,
  "proposalSetup": ProposedSetupInterface,
  "proposalFeatures": ProposedFeaturesInterface,
  "finalImpactOfIncreasingBoilerEfficiency": ProposalCalculationItemInterface,
  "finalImpactOfIncreasingCondensateReturned": ProposalCalculationItemInterface,
  "finalImpactOfChangingWaterTreatment": ProposalCalculationItemInterface,
  "finalImpactOfAddingAutoTds": ProposalCalculationItemInterface,
  "finalImpactOfAddingAutoTDSAndFlashRecovery": ProposalCalculationItemInterface,
  "finalImpactOfAddingAutoTDSFlashRecoveryAndHeatWxchanger": ProposalCalculationItemInterface,
  "finalImpactOfAddingDsiToFeedtank": ProposalCalculationItemInterface
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
