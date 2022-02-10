import { Component, EventEmitter, forwardRef, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'spirax-toggle',
  templateUrl: './spirax-toggle.component.html',
  styleUrls: ['./spirax-toggle.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SpiraxToggleComponent),
    multi: true,
  }],
})
export class SpiraxToggleComponent implements ControlValueAccessor, OnInit, OnChanges {

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
    this.value = !!val;
    if (val === null) {
      this.onChange(this.value);
    }
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
