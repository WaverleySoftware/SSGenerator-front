import { EnumerationDefinition } from 'sizing-shared-lib';

export interface FormListChangeInterface {
  selectedValue: string;
  itemsCount: number;
  item: any;
}

export interface FormListFuelTypeChangeInterface extends FormListChangeInterface {
  selectedValue: string;
  itemsCount: number;
  item: EnumerationDefinition;
}
