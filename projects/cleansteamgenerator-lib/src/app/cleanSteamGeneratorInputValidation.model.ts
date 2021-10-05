
export class CleanSteamGeneratorInputValidation {
  /**
   * Gets or sets the controlName.
   */
  controlName: string;

  /**
   * Gets or sets the value.
   */
  value: number;

  /**
   * Gets or sets the unitId.
   */
  unitId: number;
}

export class CleanSteamGeneratorProcessConditionsValidation {
  /**
   * Gets or sets the controlName.
   */
  controlName: string;

  /**
   * Gets or sets the value1.
   */
  value1: number;

  /**
   * Gets or sets the value2.
   */
  value2: number;

  /**
   * Gets or sets the unitId.
   */
  unitId: number;
}

export class CleanSteamGeneratorValidationMessage {  
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
export class CleanSteamGeneratorValidationErrorMessage {
  /**
   * Gets or sets the value.
   */
  value: string;
}
