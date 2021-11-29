import {
  AfterContentInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Injector,
  Input,
  Output,
  ViewChild
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from "@angular/forms";

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
export class FormInputComponent implements ControlValueAccessor, AfterContentInit {
  @Input('unit-names') setUnits: [string, string?];
  @Input('unit-types') unitTypes: [string, string?];
  @Input('unit-controls') unitControls: [string, string?];
  @Input('unit-translations') masterTextKeys: [string, string?];
  @Input('module-group-id') moduleGroupId: number = 9;

  @Input() formControlName: string;
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
  @Output() inputChange: EventEmitter<{ name: string, value: any }> = new EventEmitter();
  @Output() inputBlur: EventEmitter<{ name: string, value: any }> = new EventEmitter();
  @Output() changeRadio: EventEmitter<{ ref: any, group: string }> = new EventEmitter();
  @ViewChild('inputRef', { static: true }) inputRef: ElementRef<HTMLInputElement>;

  value: any;
  touched: boolean;
  focus: boolean;
  public control: NgControl;

  constructor(private injector: Injector) { }

  ngAfterContentInit() {
    this.getFormControl();
  }

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
    if (outsideValue && typeof outsideValue === "object") {
      if ('disabled' in outsideValue) this.disabled = outsideValue.disabled;
      if ('required' in outsideValue) this.required = outsideValue.required;
      if ('value' in outsideValue) this.value = outsideValue.value;
    } else {
      this.value = outsideValue;
    }
  }

  updateValue(insideValue: any) {
    this.error = null;
    this.value = (Number.isNaN(Number(insideValue)) ? insideValue : (insideValue && +insideValue)) || null;
    this.inputChange.emit({ name: this.formControlName, value: this.value});
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

  blurHandle(): void {
    this.onTouched();
    if (!this.group) {
      this.error = this.required && !this.value && this.value !== 0 ? 'Required' : null;
    }
  }

  private getFormControl(): void {
    const ngControl: NgControl = this.injector.get(NgControl, null);
    if (ngControl && ngControl.control) {
      this.control = ngControl;
    }
  }
}
