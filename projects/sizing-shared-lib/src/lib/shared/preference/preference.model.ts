/**
 * The Operating Company Preferences model.
 */
export class Preference {
  /**
   * Gets or sets the name.
   */
  name: string;

  /**
    * Gets or sets the label.
    */
  label: string;

  /**
   * Gets or sets the value.
   */
  value: string;

  /**
   * Gets or sets the number of decima places.
   */
  decimalPlaces: number;

  /**
   * Gets or sets a value indicating whether or not the current preference is a unit.
   */
  isUnit: boolean;

  /**
   * Gets or sets the unit name, if the preference is a unit.
   */
  unitName: string;

  /**
   * Gets or sets the master text key, if the preference is a unit.
   */
  masterTextKey: string;
}
