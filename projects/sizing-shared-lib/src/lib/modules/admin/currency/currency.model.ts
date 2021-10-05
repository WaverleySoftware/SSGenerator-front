/**
 * The currency model class.
 */
export class Currency {

  /**
   * Gets or sets the currency Id.
   */
  id: number;

  /**
   * Gets or sets the currency code.
   */
  currencyCode: string;

  /**
   * Gets or sets the currency translation text.
   */
  translationText: string;

  /**
   * Gets or sets the currency master text key.
   */
  masterTextKey: string;

  /**
   * Gets or sets the currency symbol.
   */
  symbol: string;

  /**
   * Gets or sets the currency's rate to GBP.
   */
  rateToGbp: number;

  /**
   * Gets or sets the currency updated timestamp.
   */
  updated: Date;
}
