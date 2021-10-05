import { Message } from "sizing-shared-lib";
/**
 * The CleanSteamGeneratorFBMiniPricing model.
 */
export class CleanSteamGeneratorFBMiniPricing {  
  /**
   * Gets or sets the modelId.
   */
  modelId: number;

  /**
   * Gets or sets the manufacturerId.
   */
  manufacturerId: number;

  /**
   * Gets or sets the basePriceOption.
   */
  basePriceOption: number;

  /**
   * Gets or sets the localRecommendedSalesPriceOption.
   */
  localRecommendedSalesPriceOption: number;

  /**
   * Gets or sets the landedCostIncreaseFactor.
   */
  landedCostIncreaseFactor: number;

  /**
   * Gets or sets the pricingOptions.
   */
  pricingOptions: CSGPricingOption[];

  /**
   * Gets or sets the sizingMessages.
   */
  sizingMessages: Message[];
}

export class CSGPricingOption {
  /**
   * Gets or sets the enumerationName.
   */
  enumerationName: string;

  /**
   * Gets or sets the selectedValue.
   */
  selectedValue: string;
}

export class CleanSteamGeneratorFBMiniPricingOutput {

  /**
   * Gets or sets the totalPrice.
   */
  totalSalesPrice: number;

  /**
   * Gets or sets the totalRecommendedSalesPrice.
   */
  totalRecommendedSalesPrice: number;
}

export class CleanSteamGeneratorFBMiniBOMPriceOutput {

  /**
 * Gets or sets the BOMItems.
 */
  bomItems: BOMItem[];
}


export class BOMItem {

  /**
   * Gets or sets the rowOrder.
   */
  rowOrder: number;

  /**
    * Gets or sets the itemType.
    */
  itemType: string;

  /**
    * Gets or sets the modelId.
    */
  modelId: number;

  /**
    * Gets or sets the parent.
    */
  parent: string;

  /**
    * Gets or sets the parentMasterTextKey.
    */
  parentMasterTextKey: string;

  /**
    * Gets or sets the parentTranslation.
    */
  parentTranslation: string;

  /**
    * Gets or sets the item.
    */
  item: string;

  /**
    * Gets or sets the itemTranslation.
    */
  itemTranslation: string;

  /**
  * Gets or sets the itemMasterTextKey.
  */
  itemMasterTextKey: string;

  /**
  * Gets or sets the sequenceDefault.
  */
  sequenceDefault: number;

  /**
   * Gets or sets the sequenceOverride.
   */
  sequenceOverride: number;

  /**
  * Gets or sets the landedAdjusted.
  */
  landedAdjusted: number;

  /**
    * Gets or sets the ssp.
    */
  ssp: number;

  /**
    * Gets or sets the ssPtoRSPfactor.
    */
  ssPtoRSPfactor: number;

  /**
    * Gets or sets the recommendedSalesPrice.
    */
  recommendedSalesPrice: number;

  /**
    * Gets or sets the rsPtoRSPOfactor.
    */
  rsPtoRSPOfactor: number;

  /**
    * Gets or sets the recommendedSalesPriceOverride.
    */
  recommendedSalesPriceOverride: number;

  /**
    * Gets or sets the displayedRSP.
    */
  displayedRSP: number;

  /**
    * Gets or sets the manCurrency.
    */
  manCurrency: string;

  /**
    * Gets or sets the displayedRSP.
    */
  manRateToGBP: number;

  /**
    * Gets or sets the displayedRSP.
    */
  manCurrencyId: number;

  /**
    * Gets or sets the priceDataUTCDate.
    */
  priceDataUTCDate: Date;

  /**
    * Gets or sets the sLandedAdjusted.
    */
  sLandedAdjusted: number;

  /**
    * Gets or sets the sSSP.
    */
  sSSP: number;

  /**
    * Gets or sets the sRecommendedSalesPrice.
    */
  sRecommendedSalesPrice: number;

  /**
    * Gets or sets the sRecommendedSalesPriceOverride.
    */
  sRecommendedSalesPriceOverride: number;

  /**
    * Gets or sets the sDisplayedRSP.
    */
  sDisplayedRSP: string;

  /**
    * Gets or sets the sellingCurrency.
    */
  sellingCurrency: string;

  /**
    * Gets or sets the sellingRateToGBP.
    */
  sellingRateToGBP: number;

  /**
    * Gets or sets the sellingCurrencyId.
    */
  sellingCurrencyId: number;

  /**
  * Gets or sets the isEnabled.
  */
  isEnabled: boolean = true;
}
