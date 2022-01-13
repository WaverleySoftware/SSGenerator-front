import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'form-radio[name]',
  templateUrl: './form-radio.component.html',
  styleUrls: ['./form-radio.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FormRadioComponent),
    multi: true,
  }],
})
export class FormRadioComponent implements ControlValueAccessor {
  @Input() value: any = true;
  @Input() defaultChecked: boolean;
  @Input() inputValue: any;
  @Input() name: string;
  @Input() label: string;
  @Input() required: boolean;
  @Input() disabled: boolean;
  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('inputRef', { static: false }) inputRef: ElementRef<HTMLInputElement>;

  private onChange = (value: any) => {};
  public onTouched = () => {};

  constructor() { }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(val: any): void {
    this.value = val;
  }

  public updateValue(val: any): void {
    // If fields from one group has different formGroupNames
    this.value = this.inputValue || val;

    this.onTouched();
    this.onChange(this.value);
    this.valueChange.emit({ ref: this.inputRef, value: this.value, group: this.name });
  }
}
