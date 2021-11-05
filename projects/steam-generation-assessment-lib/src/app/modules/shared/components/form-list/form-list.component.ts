import { Component, EventEmitter, forwardRef, Input, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import * as cloneDeep_ from 'lodash/cloneDeep';
import { TranslationService } from "sizing-shared-lib";
import { EnumListDefinitionInterface, EnumListInterface } from "../../interfaces/enum-list.interface";

@Component({
  selector: 'form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => FormListComponent),
  }]
})
export class FormListComponent implements ControlValueAccessor {
  @Input("enumeration-name") enumerationName: string;
  @Input("filter-by") filterBy: string[];
  @Input("opco-override") opCoOverride: boolean = false;
  @Input('value') internalValue: string;
  @Input() label: string;
  @Output("on-change") externalOnChange = new EventEmitter<{ selectedValue: string, itemsCount: number }>();

  public isDisabled: boolean;
  public cloneDeep = cloneDeep_;

  get list(): EnumListDefinitionInterface[] {
    const enumeration: EnumListInterface = this.enumerationName && this.translationService.displayGroup
      && this.translationService.displayGroup.enumerations.find(({ enumerationName, opCoOverride }) => {
        return enumerationName === this.enumerationName && opCoOverride === this.opCoOverride;
      });

    let list = enumeration && enumeration.enumerationDefinitions && enumeration.enumerationDefinitions
      .sort((a, b) => {
        return a.sequence > b.sequence ? 1 : a.sequence < b.sequence ? -1 : 0;
      });

    if (list && this.filterBy) {
      list = list.filter(({ value }) => this.filterBy && this.filterBy.includes(value));
    }

    return list;
  }

  // Help functions
  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(protected translationService: TranslationService) { }

  registerOnChange(fn: any): void {
    this.onChange = (newValue: string) => {
      this.internalValue = newValue;
      this.onTouched();

      fn(this.internalValue);

      this.externalOnChange.emit({
        selectedValue: newValue,
        itemsCount: (this.list ? this.list.length : 0)
      });
    };
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(val: any): void {
    this.internalValue = val;
  }

}