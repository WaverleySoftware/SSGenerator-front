import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

interface FormFieldSelectOption {
  value: any;
  text?: string;
  index?: number;
  title?: string;
}

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FormFieldComponent),
    multi: true,
  }],
})
export class FormFieldComponent implements ControlValueAccessor, AfterContentChecked {
  @Input() type = 'text';
  @Input() label: string;
  @Input() unit?: string;
  @Input() name?: string;
  @Input() message?: string;
  @Input() placeholder?: string;
  @Input() group?: string;
  @Input() disabled: boolean;
  @Input() required?: boolean;
  @Input() multiple?: boolean;
  @Input() filled?: boolean;
  @Input() error: boolean | string;
  @Input() value: any = '';
  @Input() model?: any;
  @Output() modelChange: EventEmitter<any> = new EventEmitter<any>();
  private _options: string[] | FormFieldSelectOption[];
  get options(): string[] | FormFieldSelectOption[] {
    return this._options;
  }
  @Input() set options(val) {
    this._options = val.sort((a,b) => a.index - b.index);
  };

  @ViewChild('radioCheckRef', null) radioCheckRef: ElementRef<HTMLInputElement>;

  public baseInputRef: any;
  public isFocused: boolean;
  public classList: any;
  public checked: boolean;

  constructor(private cdref: ChangeDetectorRef) {
  }

  ngAfterContentChecked() {
    this.checkRadioInputStatus();
  }

  // fake functions
  private onChange = (value: any) => {};
  onTouched = () => { };

  // value accessor functions
  registerOnChange(fn: any) {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }
  writeValue(outsideValue: number) {
    this.value = outsideValue;
  }
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  // component functions
  updateValue(insideValue: number): void {
    this.value = insideValue;
    this.model = insideValue;
    this.modelChange.emit(insideValue);
    this.onChange(insideValue);
    this.onTouched();
  }

  changeRadioInputHandle(target: any): void {
    if (this.multiple) {
      this.checked = target.checked;
    }
  }

  private checkRadioInputStatus(): void {
    if (!this.multiple && this.radioCheckRef && this.radioCheckRef.nativeElement) {
      this.checked = this.radioCheckRef.nativeElement.checked;
      this.cdref.detectChanges();
    }
  }
}
