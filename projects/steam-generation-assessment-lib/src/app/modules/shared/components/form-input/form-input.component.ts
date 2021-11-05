import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FormInputComponent),
    multi: true,
  }],
})
export class FormInputComponent implements ControlValueAccessor {
  @Input('module-group-id') moduleGroupId: number = 9;
  @Input('preference-name') preferenceName: string;
  @Input('preference-unitType') preferenceUnitType: string;
  @Input('preference-masterTextKey') masterTextKey: string;
  @Input() unit: string;
  @Input() label: string;
  @Input() error: string;
  @Input() message: string;
  @Input() type: 'text' | 'number' | 'email' | 'password' | "radio" | string = 'number';
  @Input() required: boolean;
  @Input() disabled: boolean;
  @Input() filled: boolean;
  @Input() private: any;
  @Input() group: string;
  @Output() changeRadio: EventEmitter<{ ref: any, group: string }> = new EventEmitter();
  @ViewChild('inputRef', { static: true }) inputRef: ElementRef<HTMLInputElement>;

  value: any;
  touched: boolean;
  focus: boolean;

  constructor() { }

  // fake functions
  private onChange = (value: any) => {};
  public onTouched = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(outsideValue: any): void {
    this.value = outsideValue;
  }

  updateValue(insideValue: any) {
    this.value = Number.isNaN(Number(insideValue)) ? insideValue : (insideValue && +insideValue);
    this.onChange(this.value);
    this.onTouched();
  }

  changeRadioInput(emitData: { ref: any, group: string }): void {
    this.changeRadio.emit(emitData);
    // Focus on input
    if (this.inputRef && this.inputRef.nativeElement) {
      setTimeout(() => this.inputRef.nativeElement.focus())
    }
  }
}
