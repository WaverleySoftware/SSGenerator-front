import { AfterViewInit, Component, EventEmitter, forwardRef, Host, Input, Optional, Output, SkipSelf } from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DisplayGroup, EnumerationDefinition, PreferenceService, TranslationService } from 'sizing-shared-lib';
import { FuelTypesEnumerationLetter } from '../../interfaces/fuel-type.interface';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'fuel-type-selection',
  templateUrl: './fuel-type-selection.component.html',
  styleUrls: ['./fuel-type-selection.component.scss'],
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FuelTypeSelectionComponent), multi: true}]
})
export class FuelTypeSelectionComponent implements AfterViewInit, ControlValueAccessor {
  @Input() label: string;
  @Output() changeFuelTypeName = new EventEmitter<string>();
  @Input() disabled: boolean;
  value: EnumerationDefinition;
  list: EnumerationDefinition[] = FuelTypeSelectionComponent.getList(this.translationService.displayGroup);
  private fuelUnitSelected: AbstractControl;

  constructor(
    protected translationService: TranslationService,
    private preferenceService: PreferenceService,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer,
  ) {}

  private static getList({enumerations}: DisplayGroup): EnumerationDefinition[] {
    if (!enumerations) { return null; }

    const enumeration = enumerations.find(({ enumerationName, opCoOverride }) =>
      enumerationName === 'FuelTypeList_BoilerHouseInput' && !opCoOverride);

    return enumeration && enumeration.enumerationDefinitions
      .sort(({sequence}, b) => sequence > b.sequence ? 1 : sequence < b.sequence ? -1 : 0);
  }

  private onChange = () => {};

  private onTouched = () => {};

  private setFuelUnitControl() {
    if (this.controlContainer && this.controlContainer.control && this.controlContainer.control.root) {
      this.fuelUnitSelected = this.controlContainer.control.root.get(`selectedUnits.fuelUnitSelected`);
    }
  }

  ngAfterViewInit() {
    this.setFuelUnitControl();
  }

  setFuelUnit(enumValue: string) {
    const firstLetter = enumValue && enumValue.charAt(0).toUpperCase();

    if (firstLetter && FuelTypesEnumerationLetter[firstLetter]) {
      const fuelTypeName = FuelTypesEnumerationLetter[firstLetter];
      const sPreference = this.preferenceService.sizingUnitPreferences.find(({ preference }) => preference.name === fuelTypeName);

      this.changeFuelTypeName.emit(fuelTypeName);

      if (this.fuelUnitSelected && sPreference) {
        this.fuelUnitSelected.setValue(Number(sPreference.preference.value));
      }
    }
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

  writeValue(value: string): void {
    this.value = this.list.find(({id}) => id === value) || this.list[0];
    this.setFuelUnit(this.value && this.value.value);
  }
}
