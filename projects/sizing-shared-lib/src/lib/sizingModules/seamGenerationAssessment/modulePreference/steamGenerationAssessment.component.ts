import { Component, OnDestroy, OnInit } from "@angular/core";
import { IGenericChanges } from "../../../modules/generic.changes.interface";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TranslatePipe } from "../../../shared/translation/translate.pipe";
import { ModulePreferenceService } from "../../../shared/module-preference/module-preference.service";
import { LocaleService } from "angular-l10n";
import { UserProfileService } from "../../../modules/user-profile/user-profile.service";
import { User } from "../../../modules/user-profile/user.model";
import { TranslationService } from "../../../shared/translation/translation.service";
import { ModulePreference } from "../../../shared/module-preference/module-preference.model";
import { map, switchMap, takeUntil, tap } from "rxjs/operators";
import { DisplayGroup, EnumerationDefinition } from "../../../shared/translation/translation.model";
import { Observable, Subject } from "rxjs";
import { PreferenceService } from "../../../shared/preference/preference.service";
import { UnitsService } from "../../../shared/units/units.service";
import { Unit } from "../../../shared/units/unit.model";
import { ModulePreferenceDetails } from "../../../shared/module-preference/module-preference-details.model";
import { AdminService } from "../../../modules/admin/admin.service";

interface SgaSettingsForm {
  SteamGenerationFuelType: string,
  SteamGenerationFuelCost: string,
  SteamGenerationFuelUnit: string,
  SteamGenerationWaterCost: string,
  SteamGenerationWaterCostUnit: string,
  SteamGenerationEffluentCost: string,
  SteamGenerationEffluentCostUnit: string,
  SteamGenerationWaterTreatmentCost: string,
  SteamGenerationWaterTreatmentCostUnit: string,
  SteamGenerationCO2Cost: string,
  SteamGenerationCO2CostUnit: string,
}

@Component({
  selector: 'steamGenerationAssessment-module-preferences',
  templateUrl: './steamGenerationAssessment.component.html',
  styleUrls: ['./steamGenerationAssessment.component.scss'],
})

export class SteamGenerationAssessmentModulePreferencesComponent implements OnInit, OnDestroy, IGenericChanges {
  readonly moduleId = "2";
  readonly moduleGroupId = 9;
  readonly moduleName = "Steam Generation Assessment";

  private ngUnsubscribe = new Subject<void>();
  hasUnsavedDataChanges: boolean;
  theFormGroup: FormGroup = this.fb.group({
    SteamGenerationFuelType: [null, Validators.required], // Fuel type
    SteamGenerationFuelCost: [null, Validators.required], // COST_OF_FUEL_PER_UNIT
    SteamGenerationFuelUnit: [null, Validators.required], // COST_OF_FUEL_PER_UNIT (unit)
    SteamGenerationWaterCost: [null, Validators.required], // COST_OF_WATER_FSLASH_UNIT
    SteamGenerationWaterCostUnit: [null, Validators.required], // COST_OF_WATER_FSLASH_UNIT (unit)
    SteamGenerationEffluentCost: [null, Validators.required], // COST_OF_EFFLUENT_FSLASH_UNIT
    SteamGenerationEffluentCostUnit: [null, Validators.required], // COST_OF_EFFLUENT_FSLASH_UNIT (unit)
    SteamGenerationWaterTreatmentCost: [null, Validators.required], // COST_OF_CHEMICALS_FSLASH_UNIT_OF_WATER
    SteamGenerationWaterTreatmentCostUnit: [null, Validators.required], // COST_OF_CHEMICALS_FSLASH_UNIT_OF_WATER (unit)
    SteamGenerationCO2Cost: [null, Validators.required], // COST_OF_CO2_PER_UNIT_MASS
    SteamGenerationCO2CostUnit: [null, Validators.required], // COST_OF_CO2_PER_UNIT_MASS (unit)
  });

  public fuelTypes$: Observable<EnumerationDefinition[]> = this.translationService.displayGroupChange
    .pipe(map(SteamGenerationAssessmentModulePreferencesComponent.getEnumerationDefinitions));
  public volumeUnits: Unit[];
  public emissionUnits: Unit[];
  public fuelUnits: Unit[];
  public allFuelUnitsByTypes: {G: Unit[], L: Unit[], E: Unit[], S: Unit[]};
  public alertData: { type: 'success' | 'danger' | 'warning'; visible: boolean; message: string; } = {
    type: 'success',
    visible: false,
    message: 'MODULE_PREFERENCES_SAVED_SUCCESSFULLY_MESSAGE'
  };
  public isLoading: boolean;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private translationService: TranslationService,
    private translatePipe: TranslatePipe,
    private localeService: LocaleService,
    private preferenceService: PreferenceService,
    private unitsService: UnitsService,
    private modulePreferenceService: ModulePreferenceService,
    private userProfileService: UserProfileService,
    private user: User,
  ) {
  }

  ngOnInit() {
    this.userProfileService
      .getUserDetails()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(v => this.setUser(v));

    this.modulePreferenceService
      .getOperatingCompanyModulePreferences(this.moduleId)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        map((v) => this.setFormValues(v)),
        switchMap((v) => this.unitsService.getAllUnitsByAllTypes()),
      )
      .subscribe((units) => {
        this.allFuelUnitsByTypes = {
          G: units.filter(u => u.unitType === 'BoilerHouseGasFuelUnits'),
          L: units.filter(u => u.unitType === 'BoilerHouseLiquidFuelUnits'),
          E: units.filter(u => u.unitType === 'BoilerHouseElectricalFuelUnits'),
          S: units.filter(u => u.unitType === 'BoilerHouseSolidFuelUnits'),
        };
        this.fuelUnits = this.getFuelUnitByValue(this.allFuelUnitsByTypes);
        this.volumeUnits = this.getUnitsByType('BoilerHouseVolumeUnits', units);
        this.emissionUnits = this.getUnitsByType('BoilerHouseEmissionUnits', units);
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public onSubmit(): void {
    if (this.theFormGroup.pristine || this.theFormGroup.invalid) {
      this.alertData.visible = true;
      this.alertData.type = 'warning';
      this.alertData.message = 'NO_DATA_TO_SAVE'
      return;
    }

    const data: ModulePreferenceDetails[] = Object.entries(this.theFormGroup.getRawValue()).map(([name, value]) => ({
      isDeleted: false,
      moduleId: Number(this.moduleId),
      OperatingCompanyId: this.user.operatingCompanyId,
      value: value && value.toString(),
      name
    }));

    this.theFormGroup.disable();
    this.adminService.manageModulePreferences(data)
      .pipe(takeUntil(this.ngUnsubscribe), tap(()=>{},()=>{
        this.alertData.visible = true;
        this.alertData.type = 'danger';
        this.alertData.message = 'MODULE_PREFERENCES_FAILED_TO_SAVE_MESSAGE';
      }, ()=>this.theFormGroup.enable()))
      .subscribe((done) => {
        this.alertData.visible = true;
        this.alertData.type = done ? 'success' : 'danger';
        this.alertData.message = done ?
          'MODULE_PREFERENCES_SAVED_SUCCESSFULLY_MESSAGE' :
          'MODULE_PREFERENCES_FAILED_TO_SAVE_MESSAGE';

        if (done) { this.theFormGroup.markAsPristine(); }
      });
  }

  public changeFuelType(fuelTypeValue: string): void {
    if (!fuelTypeValue || !this.fuelUnits) {
      return;
    }

    this.fuelUnits = this.getFuelUnitByValue(this.allFuelUnitsByTypes, fuelTypeValue);

    if (!this.fuelUnits || !this.fuelUnits[0]) {
      return;
    }

    this.theFormGroup.get('SteamGenerationFuelUnit')
      .setValue(this.fuelUnits[0].id, {onlySelf: true, emitEvent: false});
  }

  private setUser(user: User): void {
    this.user = user || null;
    console.log(user, '---getUserDetails')
  }

  private setFormValues(data: ModulePreference[]): SgaSettingsForm {
    console.log(data, '----getOperatingCompanyModulePreferences');
    if (!data || !data.length) {
      return null;
    }

    for (const {name, value} of data) {
      const ctrl = this.theFormGroup.get(name);

      if (ctrl) {
        ctrl.setValue(value);
      }
    }

    return this.theFormGroup.getRawValue() as SgaSettingsForm;
  }

  private getUnitsByType(type: string, units?: Unit[]): Unit[] {
    if (!type) {
      return null;
    }

    if (!units) {
      units = this.unitsService.units;
    }

    return units.filter(u => u.unitType === type);
  }

  private getFuelUnitByValue(allFuelUnitsByTypes: {[key: string]: Unit[]}, val?: string): Unit[] {
    const value = val || this.theFormGroup.get('SteamGenerationFuelType').value;

    if (!allFuelUnitsByTypes) {
      allFuelUnitsByTypes = this.allFuelUnitsByTypes;
    }

    if (!value || !allFuelUnitsByTypes) { return; }

    return allFuelUnitsByTypes[value.charAt(0).toUpperCase()] || allFuelUnitsByTypes['G'];
  }

  private static getEnumerationDefinitions(displayGroup: DisplayGroup): EnumerationDefinition[] {
    if (!displayGroup || !displayGroup.enumerations) {
      return null;
    }

    const enumeration = displayGroup.enumerations
      .find(({enumerationName}) => enumerationName === 'FuelTypeList_BoilerHouseInput');

    return enumeration && enumeration.enumerationDefinitions;
  }
}
