import {
  AfterViewInit,
  Component,
  EventEmitter,
  forwardRef,
  Host,
  Input, OnDestroy,
  Optional,
  Output,
  SkipSelf
} from "@angular/core";
import { EnumerationDefinition, PreferenceService, TranslationService, DisplayGroup } from "sizing-shared-lib";
import { AbstractControl, ControlContainer, ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { FuelTypesEnum, SgaFuelTypes } from "../../steam-generation-form.interface";
import { filter, map } from "rxjs/operators";
import { Subscription } from "rxjs";
import { SizingUnitPreference } from "sizing-shared-lib/lib/shared/preference/sizing-unit-preference.model";

@Component({
  selector: 'type-of-fuel',
  templateUrl: './type-of-fuel.component.html',
  styleUrls: ['./type-of-fuel.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TypeOfFuelComponent),
    multi: true,
  }],
})
export class TypeOfFuelComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Input() label: string;
  @Input() disabled: boolean;
  @Input() unitFormControlName: string;
  @Input() moduleGroupId: number;
  @Input() fuelTypeName: string;
  @Output() fuelTypeNameChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() changeUnit: EventEmitter<{name: string; value: number; item: EnumerationDefinition}> = new EventEmitter<{name: string; value: number; item: EnumerationDefinition}>();
  @Output() changeType: EventEmitter<EnumerationDefinition> = new EventEmitter<EnumerationDefinition>();

  list: EnumerationDefinition[];
  value: EnumerationDefinition;

  private _updateSizing$: Subscription;
  private _unitControl: AbstractControl;
  private _unitValue: number;

  onChange: Function = () => {};
  onTouched: Function = () => {};

  constructor(
    protected translationService: TranslationService,
    private preferenceService: PreferenceService,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer,
  ) {
    this.list = TypeOfFuelComponent._getList(translationService.displayGroup);

    this._updateSizing$ = this.preferenceService.sizingUnitPreferencesUpdate
      .pipe(
				filter((data) => {
					return data && data.updated && data.updated.unitType && data.updated.preference &&
						this.value && SgaFuelTypes[data.updated.unitType] &&
						SgaFuelTypes[data.updated.unitType] === FuelTypesEnum[this.value.value.charAt(0).toUpperCase()] &&
						this._unitValue !== parseInt(data.updated.preference.value);
	      }),
	      map(({ updated }) => updated)
      )
      .subscribe(({ unitType, preference: { value } }: SizingUnitPreference) => this._setUnitControlValue(parseInt(value), unitType));

    if (this.preferenceService.allPreferences && this.preferenceService.allPreferences.length) {
      this._setSizingPreferences();
    }
  }

  ngOnInit() {
    this._setSizingPreferences();
    this._getUnitControl();
  }

  ngAfterViewInit() {
    this._getUnitControl();
  }

  ngOnDestroy() {
    this._updateSizing$.unsubscribe();
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

  writeValue(outsideValue: any): void {
    this.value = this.list.find(({id}) => id === outsideValue) || this.list[0];
    this._updateFuelUnit();
  }

  updateValue(insideValue: EnumerationDefinition) {
    this.value = insideValue;
    this._updateFuelUnit();
    this.onChange(insideValue.id);
    this.onTouched();
    this.changeType.emit(this.value);
  }

  private _setUnitControlValue(value: number, name?: string): void {
    if (this._unitControl && value && this._unitControl.value !== value) {
      this._unitValue = value;
      this._unitControl.setValue(this._unitValue);
    }

    this.changeUnit.emit({name: name, value: this._unitValue, item: this.value});
  }

  private _setSizingPreferences(): any {
    for (let key of Object.keys(SgaFuelTypes)) {
      if (!this.preferenceService.sizingUnitPreferences.find(p => p && p.unitType === key)) {
        const preference = this.preferenceService.allPreferences.find(({ name }) => name === key);

        preference && this.preferenceService.addSizingUnitPreference(
          preference,
          key,
          TypeOfFuelComponent._getTranslationForTypes(key),
          this.moduleGroupId
        );
      }
    }

    return this.preferenceService.sizingUnitPreferences;
  }

  private _updateFuelUnit(): void {
    if (!this.value || !this.value.value) return null;

    const preferenceName = FuelTypesEnum[this.value.value.charAt(0).toUpperCase()];
    const sizing = this.preferenceService.sizingUnitPreferences.find(({unitType}) => unitType === preferenceName);

    if (sizing) {
      const newUnitValue = sizing && sizing.preference && sizing.preference.value && parseInt(sizing.preference.value);

	    this._setUnitControlValue(newUnitValue, preferenceName);
      this._emitUnitTypeName(sizing);
    }
  }

  private _emitUnitTypeName(data: SizingUnitPreference): void {
    if (!data || !data.unitType) return null;

    this.fuelTypeName = data.unitType;
    this.fuelTypeNameChange.emit(this.fuelTypeName);
  }

  private _getUnitControl(): AbstractControl | undefined {
    if (!this.controlContainer) return null;

    this._unitControl = this.controlContainer.control.root.get(`selectedUnits.${this.unitFormControlName}`);

    return this._unitControl
  }

  private static _getList({enumerations}: DisplayGroup): EnumerationDefinition[] {
    if (!enumerations) return null;

    const {enumerationDefinitions} = enumerations
      .find(({ enumerationName, opCoOverride }) => enumerationName === 'FuelTypeList_BoilerHouseInput' && !opCoOverride);
    return enumerationDefinitions
      .sort(({sequence}, b) => sequence > b.sequence ? 1 : sequence < b.sequence ? -1 : 0);
  }

  private static _getTranslationForTypes(key: string): string {
    switch (key) {
      case 'BoilerHouseLiquidFuelUnits': return 'LIQUID_FUEL';
      case 'BoilerHouseElectricalFuelUnits': return 'ELECTRICAL_FUEL';
      case 'BoilerHouseGasFuelUnits': return 'GASEOUS_FUEL';
      case 'BoilerHouseSolidFuelUnits': return 'SOLID_FUEL';
    }

    return null;
  }
}
