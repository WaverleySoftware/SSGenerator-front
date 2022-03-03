import { Preference } from "./preference.model";
import { Unit } from "../units/unit.model";
import { Currency } from "../../modules/admin/currency/currency.model";

export class SizingUnitPreference {

  /**
   * Gets or sets the preference.
   */
  preference: Preference;

  /**
   * Gets or sets the unit type.
   */
  unitType: string;

  /**
   * Gets or sets the units.
   */
  units: Unit[];

  /**
   * Gets or sets the currencies.
   */
  currencies: Currency[];

  /**
   * Gets or sets the masterTextKey.
   * Defined in the parent html template [display-masterTextKey], used to extract the translated UI label.
   */
  masterTextKey: string;

  /**
   * Gets or sets the moduleGroupId.
   */
  moduleGroupId: number;
}
