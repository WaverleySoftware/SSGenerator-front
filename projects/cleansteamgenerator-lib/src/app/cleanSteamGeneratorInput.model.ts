/**
 * The CSG input process conditions model.
 */
export class CleanSteamGeneratorProcessConditions {

  /**
   * Gets or sets the PlantSteamPressure.
   */
  plantSteamPressure: number;

  /**
    * Gets or sets the PlantSteamPressure.
    */
  cleanSteamPressure: number;

  /**
   * Gets or sets the FeedwaterPressure.
   */
  feedwaterPressure: number;

  /**
   * Gets or sets the FeedwaterTemperature.
   */
  feedwaterTemperature: number;

  /**
   * Gets or sets the RequiredCleanSteamFlowrate.
   */
  requiredCleanSteamFlowrate: number;

  /**
   * Gets or sets the TdsBlowDownPercentage.
   */
  tdsBlowDownPercentage: number;
  
  /**
   * Gets or sets the pressureUnitId.
   */
  pressureUnitId: number;

  /**
   * Gets or sets the pressureUnitMasterTextKey.
   */
  pressureUnitMasterTextKey: string;

  /**
   * Gets or sets the pressureUnitDecimalPlaces.
   */
  pressureUnitDecimalPlaces: number;

  /**
   * Gets or sets the temperatureUnitId.
   */
  temperatureUnitId: number;

  /**
   * Gets or sets the temperatureUnitMasterTextKey.
   */
  temperatureUnitMasterTextKey: string;

  /**
   * Gets or sets the temperatureUnitDecimalPlaces.
   */
  temperatureUnitDecimalPlaces: number;

  /**
   * Gets or sets the massFlowUnitId.
   */
  massFlowUnitId: number;

  /**
   * Gets or sets the massFlowUnitMasterTextKey.
   */
  massFlowUnitMasterTextKey: string;

  /**
   * Gets or sets the massFlowUnitDecimalPlaces.
   */
  massFlowUnitDecimalPlaces: number;

  /**
   * Gets or sets the loadUnitId.
   */
  loadUnitId: number;

  LengthUnitId: number;

  WeightUnitId: number;
}
