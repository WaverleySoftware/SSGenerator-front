export class UnitsConverter {

  unitsConverter: UnitConvert[];
}

/**
 * Defines the UnitConvert model class.
 */
export class UnitConvert {

  /**
   * Gets or sets the propertyName.
   */
  propertyName: string;

  /**
   * Gets or sets the initialValue.
   */
  initialValue: number;


  /**
   * Gets or sets the initialUnitId.
   */
  initialUnitId: number;


  /**
   * Gets or sets the targetUnitId.
   */
  targetUnitId: number;


  /**
    * Gets or sets the destinationUnitId.
    */
  convertedValue?: number;


}
