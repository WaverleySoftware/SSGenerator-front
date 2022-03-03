
export class EasiheatInputValidation {
  /**
  *Gets or sets the ControlName
  */
  controlName: string;

  /**
   * Gets or sets the value.
   */
  value: number;

  /**
   * Gets or sets the unitId.
   */
  //unitId: number;
  units: number;
}

export class EasiheatProcessConditionsInputValidation {
  /**
  *Gets or sets the ControlName
  */
  ControlName: string;

  /**
   * Gets or sets the value.
   */
  Value: number;

  /**
   * Gets or sets the unitId.
   */
  //unitId: number;
  UnitId: number;
}

export class EasiheatProcessConditionsValidation {
  /**
   * Gets or sets the processConditions.
  */
  ProcessConditionsValidationRequest: EasiheatProcessConditionsInputValidation[];

  /**
   * Gets or sets the HTG check box.
  */
  HTGChecked: boolean;

  /**
   * Gets or sets the InputCondensateControl.
  */
  InputCondensateControl: boolean;

  /**
   * Gets or sets the InputPRV.
  */
  InputPRV: boolean;
}

export class EasiheatBackPressureValidation {

  /**
   * Gets or sets the Inlet Pressure.
   */
  LinePressure: number;

  /**
   * Gets or sets the Back Pressure.
   */
  BackPressure: number;

  /**
  * Gets or sets the Back Pressure.
  */
  EhUnitType: string;

  /**
   * Gets or sets the unitId.
   */
  Units: number;
}

export class EasiheatDiffTempValidation {

  /**
   * Gets or sets the Inlet Temperature.
   */
  InletTemperature: number;

  /**
   * Gets or sets the Outlet Temperature.
   */
  OutletTemperature: number;

  /**
   * Gets or sets the unitId.
   */
  Units: number;
}

export class EasiheatFlowRateValidation {

  /**
   * Gets or sets the Entered Water Flow.
   */
  EnteredFlow: number;

  /**
   * Gets or sets the unitId.
   */
  FlowUnits: number;

  /**
   * Gets or sets the TemperatureRise.
   */
  TemperatureRise: number;

/**
* Gets or sets the unitId.
*/
  TemperatureUnits: number;
}

export class EasiheatValidationMessage {
  /**
   * Gets or sets the messageKey.
   */
  messageKey: string;

  /**
   * Gets or sets the value.
   */
  value: number;

  /**
   * Gets or sets the unitId.
   */
  unitId: number;

  /**
   * Gets or sets the severity.
   */
  severity: number;
}

/**
* Container for the csg validation error message.
*/
export class EasiheatValidationErrorMessage {
  /**
   * Gets or sets the value.
   */
  value: string;
}

/**
* Container for the easiHeat flow or load calc.
*/
export class EasiheatFlowOrLoad {
/**
* Gets or sets the inletTemperature
*/
  inletTemperature: number;
/**
* Gets or sets the outletTemperature
*/
  outletTemperature: number;
/**
* Gets or sets the Id value for temperatureUnits
*/
  temperatureUnits: number;
/**
* Gets or sets the value for either Load or Water Flow
*/
  value: number;
/**
* Gets or sets the units Id value for Load
*/
  loadUnits: number;

/**
* Gets or sets the units Id value for Water Flow
*/
  flowUnits: number;

}

/**
* Container for the easiHeat Process Conditions Validation.
*/
export class EasiheatProcessConditions {

  /**
   * Gets or sets the Inlet Pressure.
   */
  inletPressure: number;

  /**
    * Gets or sets the Total Back Pressure.
    */
  totalBackPressure: number;

  /**
 * Gets or sets the Inlet Temperature.
 */
  inletTemperature: number;

  /**
* Gets or sets the Outlet Temperature.
*/
  outletTemperature: number;

  /**
* Gets or sets the Water Flow Rate.
*/
  waterFlowRate: number;

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
