import {
  Component, EventEmitter,
  forwardRef,
  Host,
  Input,
  OnInit,
  Optional, Output,
  SkipSelf
} from "@angular/core";
import { AbstractControl, ControlContainer, ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { TranslationService, PreferenceService, Enumeration, EnumerationDefinition, Preference } from "sizing-shared-lib";
import { SteamGenerationAssessmentService } from "../../steam-generation-assessment.service";

@Component({
  selector: 'fuel-type-field',
  templateUrl: './fuel-type-field.component.html',
  styleUrls: ['./fuel-type-field.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FuelTypeFieldComponent),
    multi: true,
  }],
})
export class FuelTypeFieldComponent implements ControlValueAccessor, OnInit {
  @Input("filter-by") filterBy: string[];
  @Input("opco-override") opCoOverride: boolean = false;
  @Input("module-group-id") moduleGroupId: number = 9;
  @Input() label: string = 'FUEL_TYPE';

  get list(): EnumerationDefinition[] {
    const enumeration: Enumeration = this.translationService.displayGroup
      && this.translationService.displayGroup.enumerations.find(({ enumerationName, opCoOverride }) => {
        return enumerationName === 'FuelTypeList_BoilerHouseInput' && opCoOverride === this.opCoOverride;
      });

    let list = enumeration && enumeration.enumerationDefinitions && enumeration.enumerationDefinitions
      .sort((a, b) => {
        return a.sequence > b.sequence ? 1 : a.sequence < b.sequence ? -1 : 0;
      });

    if (list && this.filterBy) {
      list = list.filter(({ value }) => this.filterBy && this.filterBy.includes(value));
    }

    return list;
  }

  private _preference: Preference;
  get preference(): Preference {
    return this.getSizingPreferenceByName(this.fuelTypeName);
  }

  @Input() set preference(preference) {
    this._preference = preference;
  }
  @Output() preferenceChange: EventEmitter<Preference> = new EventEmitter<Preference>();

  public isDisabled: boolean;
  public isTouched: boolean;
  public ngModel: EnumerationDefinition;
  private control;
  private unitControl;
  private formControlName: string = 'inputFuelId';
  private formControlUnitName: string = 'inputFuelUnit';
  private fuelTypeName: string;

  onTouched = () => {};
  onChanged = (_: any) => {};

  constructor(
    protected translationService: TranslationService,
    private preferenceService: PreferenceService,
    private steamGenerationAssessmentService: SteamGenerationAssessmentService,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer,
  ) { }

  ngOnInit() {
    // Initial settings
    this.setSizingPreference();
    this.control = this.getControlByName(this.formControlName);
    this.unitControl = this.getControlByName(this.formControlUnitName);
    this.ngModel = (this.control && this.control.value && this.list &&
      this.list.find((item) => item['value'] === this.control.value)) || this.list[0];

    this.ngModel && this.updateValue(this.ngModel);
  }

  public compareWith(a: any, b: any): boolean {
    const fieldName: keyof EnumerationDefinition = 'id';

    return a && a[fieldName] && b && b[fieldName] && a[fieldName] === b[fieldName];
  }

  public updateValue(item: EnumerationDefinition): void {
    this.fuelTypeName = SteamGenerationAssessmentService.getFuelTypeName(item && item.value);
    this.setFormValue(item.id, this.preference && this.preference.value);
    this.preference && this.preferenceChange.emit(this.preference);
  }

  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(val: any): void {
    // console.log(val, '----val') // not logic
  }

  private getPreferenceByName(name: string): Preference {
    return name && this.preferenceService.allPreferences.find((p) => p && p.name === name);
  }

  private getSizingPreferenceByName(name: string): Preference {
    const sPreference = name && this.preferenceService.sizingUnitPreferences &&
      this.preferenceService.sizingUnitPreferences.find(p => p && p.unitType === name);

    return sPreference && sPreference.preference;
  }

  private getControlByName(controlName?: string): AbstractControl {
    if (this.controlContainer) {
      return this.controlContainer.control.get(controlName || this.formControlName);
    }

    return null;
  }

  private setFormValue(value: any, unitValue: any): void {
    value && this.steamGenerationAssessmentService.setFormValue(this.formControlName, value);
    unitValue && this.steamGenerationAssessmentService.setFormValue(this.formControlUnitName, unitValue);
  }

  private setSizingPreference(): void {
    const fuelCategories = [
      {unitType: 'BoilerHouseLiquidFuelUnits', masterTextKey: 'LIQUID_FUEL'},
      {unitType: 'BoilerHouseElectricalFuelUnits', masterTextKey: 'ELECTRICAL_FUEL'},
      {unitType: 'BoilerHouseGasFuelUnits', masterTextKey: 'GASEOUS_FUEL'},
      {unitType: 'BoilerHouseSolidFuelUnits', masterTextKey: 'SOLID_FUEL'}
    ];

    for (const { unitType, masterTextKey } of fuelCategories) {
      const sPreference = this.getSizingPreferenceByName(unitType);

      if (!sPreference) {
        const preference = this.getPreferenceByName(unitType);

        preference && this.preferenceService.addSizingUnitPreference(
          preference,
          unitType,
          masterTextKey,
          this.moduleGroupId
        );
      }

    }
  }
}
