export class VettedUser {
  /**
   * Gets or sets the user Id.
   */
  userId: number;

  /**
   * Gets or sets the username.
   */
  username: string;

  /**
   * Gets or sets the firstname.
   */
  firstname: string;

  /**
   * Gets or sets the lastname.
   */
  lastname: string;

  /**
   * Gets or sets the email.
   */
  email: string;

  /**
   * Gets or sets the access level.
   */
  accessLevel: number;

  /**
   * Gets or sets a value indicating whether or not the user is deleted.
   */
  isDeleted: boolean;

  /**
   * Gets or sets a value indicating whether or not the user is vetted.
   */
  isVetted: boolean;

  /**
   * Gets or sets a value indicating whether or not the user is internal.
   */
  isInternal: boolean;

  /**
   * Gets or sets a value indicating whether or not the user is hidden from display.
   */
  hideFromDisplay: boolean;
}
