import {
	Component,
	EventEmitter,
	forwardRef, Injector,
	Input, OnChanges, OnInit,
	Output, SimpleChanges
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from "@angular/forms";

@Component({
  selector: 'form-toggle',
  templateUrl: './form-toggle.component.html',
  styleUrls: ['./form-toggle.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FormToggleComponent),
    multi: true,
  }],
})
export class FormToggleComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() name: string;
  @Input() formControlName: string;
  @Input() label: string;
  @Input() value: boolean;
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Output() valueChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	private ngControl: NgControl;
  // fake functions
  private onChange = (value: boolean) => {};
  public onTouched = () => { };

  constructor(private inj: Injector) {}

	ngOnInit() {
		this.ngControl = this.inj.get(NgControl);
	}

	ngOnChanges(changes: SimpleChanges) {
		this._setFalseToDisabledControls();
	}

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

	private _setFalseToDisabledControls(): void {
		if (this.ngControl && this.disabled && this.ngControl.control && !this.ngControl.disabled) {
			this.ngControl.control.patchValue(false);
		}
	}
}
