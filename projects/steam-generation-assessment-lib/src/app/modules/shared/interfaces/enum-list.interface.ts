
/**
 * The Enumeration model class.
 */
export class EnumListInterface {

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
  enumerationDefinitions: EnumListDefinitionInterface[];
}

/**
 * The EnumerationDefinition model class.
 */
export class EnumListDefinitionInterface {

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

	/**
	* Static value numbers for API request value
	* */
	fromValue?: number;
}

/**
 * The DisplayGroup model class.
 */
export class DisplayGroupInterface {

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
  translations: TranslationInterface[];

  /**
   * Gets or sets the Enumerations.
   */
  enumerations: EnumListInterface[];

}


/**
 * The Translation model class.
 */
export class TranslationInterface {

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
