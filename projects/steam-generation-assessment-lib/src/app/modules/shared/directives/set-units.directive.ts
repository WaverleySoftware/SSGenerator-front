import { Directive, Input, OnInit } from "@angular/core";
import { PreferenceService, AdminService } from "sizing-shared-lib";
import { Preference } from "../../../../../../sizing-shared-lib/src/lib/shared/preference/preference.model";
import { SteamGenerationAssessmentService } from "../../../steam-generation-assessment.service";

@Directive({
  selector: '[set-units]',
  exportAs: 'preference-units'
})
export class SetUnitsDirective implements OnInit {
  @Input('set-units') private preferenceNames: [string, string?];
  @Input('unit-controls') private unitControls: [string, string?];
  @Input('unit-types') private unitTypes: [string, string?];
  @Input('masterText-Keys') private masterTextKeys: [string, string?];
  @Input('moduleGroupId') private moduleGroupId: number;

  get preferences(): Preference[] {
    if (!this.preferenceNames || !this.preferenceNames.length) {
      return null;
    }

    const preferences = [];

    for (const preferenceName of this.preferenceNames) {
      preferenceName && preferences.push(this.getSizingPreference(preferenceName));
    }

    return preferences;
  }

  constructor(
    private preferenceService: PreferenceService,
    private adminService: AdminService,
    private steamGenerationAssessmentService: SteamGenerationAssessmentService,
  ) { }

  ngOnInit() {
    this.checkIsPreferenceAdded();
  }

  private checkIsPreferenceAdded(): void {
    if (!this.preferenceNames || !this.preferenceNames.length) return;

    for (const i in this.preferenceNames) {
      const preferenceName = this.preferenceNames[i];
      const unitType = this.setUnitTypeFromPreferenceName(preferenceName, i);
      const masterTextKey = this.masterTextKeys && this.masterTextKeys[i];
      const sizingPreference = this.getSizingPreference(preferenceName);
      const formControlName = this.unitControls && this.unitControls[i];
      let newPreference = sizingPreference;

      if (!sizingPreference) {
        newPreference = this.addSizingPreference(preferenceName, unitType, masterTextKey);
      }

      this.setFormControlValues(formControlName, newPreference);
    }
  }

  private addSizingPreference(preferenceName: string, unitType: string, masterTextKey: string): Preference {
    const preference = this.getPreference(preferenceName);

    if (preference) {
      if (preferenceName === 'BHCurrency') {
        if (!this.adminService.currenciesPending) {
          this.adminService.getCurrencyData().subscribe((currencies) => {
            const unit = currencies.find(({ currencyCode }) => currencyCode === preference.value);
            const currencyPreference = {
              decimalPlaces: preference.decimalPlaces,
              isUnit: preference.isUnit,
              label: unit && unit.translationText,
              masterTextKey: unit && unit.masterTextKey,
              name: preference.name,
              unitName: unit && unit.symbol,
              value: unit && unit.currencyCode,
            };
            this.preferenceService.addSizingUnitPreference(
              currencyPreference,
              unitType || preferenceName,
              masterTextKey || preferenceName,
              this.moduleGroupId,
              undefined,
              currencies
            );
          });
        }
      } else {
        this.preferenceService.addSizingUnitPreference(
          preference,
          unitType || preferenceName,
          masterTextKey || preferenceName,
          this.moduleGroupId,
        );
      }
    }

    return preference;
  }

  private getSizingPreference(name?: string): Preference | null {
    if (
      !name ||
      !this.preferenceService.sizingUnitPreferences ||
      !this.preferenceService.sizingUnitPreferences.length
    ) {
      return null;
    }

    const preference = this.preferenceService.sizingUnitPreferences.find(({ preference }) => preference.name === name);

    return preference && preference.preference || null;
  }

  private getPreference(name: string): Preference {
    return this.preferenceService.allPreferences.find((preference) => preference.name === name);
  }

  private setUnitTypeFromPreferenceName(preferenceName: string, index: any): string {
    if (this.unitTypes && this.unitTypes.length) {
      return this.unitTypes[index];
    }

    const lastSymbol = preferenceName && preferenceName.substring(preferenceName.length - 1);

    return lastSymbol !== 's' ? `${preferenceName}s` : preferenceName;
  }

  private setFormControlValues(formControlName: string, preference: Preference):  void {
    if (formControlName && preference && preference.value) {
      this.steamGenerationAssessmentService.setFormValue(formControlName, preference.value);
    }
  }
}
