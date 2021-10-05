/**
 * The Module Group model.
 */
export class ModuleGroup {
  /**
   * Gets or sets the Module Group Id.
   */
  moduleGroupId: number;

  /**
   * Gets or sets the name of the Module Group.
   */
  name: string;

  /**
   * Gets or sets the master text key for translation.
   */
  masterTextKey: string;

  /**
   * Gets or sets a value indicating whether or not this Module has vetted access.
   */
  isVetted: boolean;

  /**
   * Gets or sets a value indicating whether or not this Module has a requirement for preferences.
   */
  requiresPreferences: boolean;

  /**
   * Gets or sets a value indicating whether or not this Module needs to show pricing.
   */
  showPricing: boolean;

  /**
   * Gets or sets a value indicating whether or not this Module allows selection of products.
   */
  allowsProductSelection: boolean;

  /**
   * Gets or sets the image source.
   */
  imageSrc: string;

  /**
     * Gets or sets the image source.
     */
  modules: Module[];


}


/**
 * The Module model.
 */
export class Module {
  /**
   * Gets or sets the Module Group Id.
   */
  id: number;

  /**
   * Gets or sets the name of the Module Group.
   */
  name: string;

  /**
   * Gets or sets the master text key for translation.
   */
  masterTextKey: string;

  /**
   * Gets or sets the Module Group Id.
   */
  moduleGroupId: number;

  /**
   * Gets or sets a value indicating whether or not this Module IsDeleted.
   */
  isDeleted: boolean;

}


/**
 * The ModuleList model, normally uses for UI binding.
 */
export class ModuleListItem {

  /**
   * Gets or sets the Module Group Id.
   */
  moduleGroupId: number;

  /**
  * Gets or sets the master text key for translation.
  */
  moduleGroupMasterTextKey: string;

  /**
   * Gets or sets the Module Group Id.
   */
  moduleId: number;
  
  /**
  * Gets or sets the master text key for translation.
  */
  moduleMasterTextKey: string;

}
