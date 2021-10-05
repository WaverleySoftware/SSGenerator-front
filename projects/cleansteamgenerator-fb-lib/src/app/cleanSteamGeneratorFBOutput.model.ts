/**
 * The CSG output F&B data model.
 */
import { Message } from "sizing-shared-lib";

export class CleanSteamGeneratorFBOutput {

  /**
   * Gets or sets the plateId.
   */
  plateId: number;

  /**
   * Gets or sets the numberOfPlates.
   */
  numberOfPlates: number;

  /**
   * Gets or sets the cleanSteamFlowrate.
   */
  cleanSteamFlowrate: number;
  displayCleanSteamFlowrate: string;

  /**
   * Gets or sets the plantSteamFlowrate.
   */
  plantSteamFlowrate: number;
  displayPlantSteamFlowrate: string;

  /**
   * Gets or sets the feedwaterFlowrate.
   */
  feedwaterFlowrate: number;
  displayFeedwaterFlowrate: string;

  /**
   * Gets or sets the blowDownFlowrate.
   */
  blowDownFlowrate: number;
  displayBlowDownFlowrate: string;

  /**
   * Gets or sets the enthalpyOfWaterAtHotsideOutletTemperature.
   */
  enthalpyOfWaterAtHotsideOutletTemperature: number;
  displayEnthalpyOfWaterAtHotsideOutletTemperature: string;
    
  /**
   * Gets or sets the heatExchangerDuty.
   */
  heatExchangerDuty: number;
  displayHeatExchangerDuty: string;

  /**
   * Gets or sets the overdesign.
   */
  overdesign: number;
  displayOverdesign: string;

  ///**
  // * Gets or sets the isPumpMandatory.
  // */
  //isPumpMandatory: boolean;

  /**
   * Gets or sets the modelSizingMessages.
   */
  modelSizingMessages: Message[];

  //length: number;
  //height: number;
  //width: number;
  //dryWeight: number;
  //plantSteamInletConnection: string;
  //condensateOutletConnection: string;
  //cleanSteamOutletConnection: string;
  //feedwaterInletConnection: string;
  //safetyValveDischarge: string;
  //notCondensableVentConnection: string;
  //drainConnection: string;
  //plantSteamCondensateDrainConnection: string;
  //tdsBlowdownConnection: string;
  //samplingSystem: string;
  //minAirSupply: number;
}
