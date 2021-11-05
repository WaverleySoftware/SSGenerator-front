import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'form-toggle[name]',
  templateUrl: './form-toggle.component.html',
  styleUrls: ['./form-toggle.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FormToggleComponent),
    multi: true,
  }],
})
export class FormToggleComponent implements ControlValueAccessor {
  @Input() name: string;
  @Input() label: string;
  @Input() value: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Output() valueChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  // fake functions
  private onChange = (value: boolean) => {};
  public onTouched = () => { };

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

  writeValue(val: boolean): void {
    this.value = val;
  }

  public updateValue(val: boolean): void {
    this.value = val;
    this.onTouched();
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }
}
