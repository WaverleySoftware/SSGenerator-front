/**
 * The DisplayGroup model class.
 */
export class DisplayGroup {

  /**
   * Gets or sets the DisplayGroup Id.
   */
  id: number;

  /**
   * Gets or sets the DisplayGroup name.
   */
  name: string;

  /**
  * Gets or sets the Language Id.
  */
  languageId: number;

  /**
  * Gets or sets the Translations.
  */
  translations: Translation[];

  /**
 * Gets or sets the Enumerations.
 */
  enumerations: Enumeration[];

}

/**
 * The Translation model class.
 */
export class Translation {

  /**
    * Gets or sets the masterTextKey.
    */
  masterTextKey: string;

  /**
   * Gets or sets the translationText.
   */
  translationText: string;

  /**
    * Gets or sets the translationText.
    */
  defaultText: string;

  /**
     * Gets or sets the textTypeId (Enum).
     */
  textTypeId: number;
}



/**
 * The Enumeration model class.
 */
export class Enumeration {

  /**
    * Gets or sets the enumerationName.
    */
  enumerationName: string;

  /**
    * Gets or sets the opCoOverride.
    */
  opCoOverride: boolean;

  /**
     * Gets or sets the enumerationDefinitions.
     */
  enumerationDefinitions: EnumerationDefinition[];
}


/**
 * The EnumerationDefinition model class.
 */
export class EnumerationDefinition {

  /**
     * Gets or sets the masterTextKey.
     */
  masterTextKey: string;

  /**
    * Gets or sets the defaultText.
    */
  defaultText: string;

  /**
   * Gets or sets the translationText.
   */
  translationText: string;

  /**
   * Gets or sets the extraPostText.
   * Usefull to augment append data, such as pricing helpers in list items (CSG).
   */
  extraPostText: string; 

  /**
  * Gets or sets the value.
  */
  value: string;

  /**
   * Gets or sets the sequence.
   */
  sequence: number;

  /**
   * Gets or sets the isDeleted.
   */
  isDeleted: boolean;
}

