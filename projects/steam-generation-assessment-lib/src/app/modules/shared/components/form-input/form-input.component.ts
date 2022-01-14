import {
  AfterContentInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef, Host,
  Input, Optional,
  Output, SkipSelf,
  ViewChild
} from "@angular/core";
import { AbstractControl, ControlContainer, ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

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
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() defaultChecked: boolean;
  @Input() filled: boolean;
  @Output() filledChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() private: any;
  @Input() group: string;
  @Input() groupControls: string[];
  @Output() inputChange: EventEmitter<{ name: string, value: any }> = new EventEmitter();
  @Output() inputBlur: EventEmitter<{ name: string, value: any }> = new EventEmitter();
  @Output() changeRadio: EventEmitter<{ ref: any, group: string }> = new EventEmitter();
  @ViewChild('inputRef', { static: true }) inputRef: ElementRef<HTMLInputElement>;
  @ViewChild('radioInputRef', { static: true }) radioInputRef: ElementRef<HTMLInputElement>;

  @Input() value: any;
  touched: boolean;
  focus: boolean;
  public control: AbstractControl;
  public modelVal: any;

  constructor(@Optional() @Host() @SkipSelf() private controlContainer: ControlContainer) {}

  ngAfterContentInit() {
    this.getFormControl();
    this.initialDisableDefault();
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
      if ('value' in outsideValue) {
        this.value = outsideValue.value;
        this.modelVal = outsideValue.value;
      }
    } else {
      this.value = outsideValue;
      this.modelVal = outsideValue;
    }
  }

  updateValue(insideValue: any) {
    this.error = null;
    this.modelVal = insideValue;
    this.value = insideValue === "" ? null : Number.isNaN(Number(insideValue)) ? insideValue : (insideValue && +insideValue);
    this.inputChange.emit({ name: this.formControlName, value: this.value});
    this.onChange(this.value);
    this.onTouched();
    this.changeFilled();
  }

  changeRadioInput(emitData: { ref: any, group: string }): void {
    if (this.control && this.control.disabled) {
      this.control.enable();
    }

    this.disableNotUsedGroupFields();

    this.changeRadio.emit(emitData);

    if (this.inputRef && this.inputRef.nativeElement) { // Focus on input
      // setTimeout(() => this.inputRef.nativeElement.focus())
    }
  }

  blurHandle(): void {
    this.onTouched();
    this.inputBlur.emit({name: this.formControlName, value: this.value});
  }

  private getFormControl(): AbstractControl | null {
    if (this.controlContainer && this.formControlName) {
      this.control =  this.controlContainer.control.get(this.formControlName);

      return this.control;
    }

    return null;
  }

  private changeFilled(filled: boolean = false): void {
    this.filled = filled;
    this.filledChange.emit(this.filled);
  }

  private disableNotUsedGroupFields(): void {
    if (this.group && this.control && this.control.parent && this.groupControls && this.groupControls.length) {
      const fg = this.control.parent;

      for (let groupControl of this.groupControls) {
        const control = fg.get(groupControl);

        control && !control.disabled && control.disable({ onlySelf: true });
        control && (control.value || control.value === 0) && control.setValue(null);
      }
    }
  }

  private initialDisableDefault(control?: AbstractControl): void {
    if (this.defaultChecked && this.group && this.groupControls && this.groupControls.length) {
      this.disabled = false;

      for (let groupElement of this.groupControls) {
        const fg = this.control && this.control.parent;
        const control = fg && fg.get(groupElement);

        control && !control.disabled && control.disable({ onlySelf: true });
      }

      const existing = this.control;
      existing && existing.disabled && existing.enable({ onlySelf: true });
    }
  }
}
