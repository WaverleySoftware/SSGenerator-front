import {
  AfterViewInit,
  Component,
  EventEmitter,
  forwardRef,
  Host,
  Input,
  OnInit,
  Optional,
  Output,
  SkipSelf
} from "@angular/core";
import { AbstractControl, ControlContainer, ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
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
export class FormListComponent implements ControlValueAccessor, AfterViewInit {
  @Input("enumeration-name") enumerationName: string;
  @Input("filter-by") filterBy: string[];
  @Input("opco-override") opCoOverride: boolean = false;
  @Input('value') internalValue: any;
  @Input() label: string;
  @Input() formControlName: string;
  @Output("on-change") externalOnChange = new EventEmitter<{ selectedValue: string, itemsCount: number }>();

  public isDisabled: boolean;
  public cloneDeep = cloneDeep_;
  private control: AbstractControl;

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
  private onChange: any = (val: any) => {};
  public onTouched: any = () => {};

  constructor(
    protected translationService: TranslationService,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer,
  ) { }

  ngAfterViewInit() {
    if (this.controlContainer && this.formControlName) {
      this.control = this.controlContainer.control.get(this.formControlName);
      if (!this.control.value && this.list && this.list.length) {
        this.control.patchValue(this.list[0].id, { emitEvent: false });
      }
    }
  }

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
    this.internalValue = val && val.value || val;
  }

  updateValue(val: any): void {
    console.log(this.internalValue, '----this.internalValue')
    this.internalValue = val;
    this.onChange(this.internalValue);
    this.onTouched();
  }
}
