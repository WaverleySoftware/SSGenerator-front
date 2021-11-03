import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { TranslatePipe } from "sizing-shared-lib";
import { SteamGenerationFormInterface } from "../steam-generation-form.interface";
import { PreferenceService } from "sizing-shared-lib";
import { SizingUnitPreference } from "../../../../sizing-shared-lib/src/lib/shared/preference/sizing-unit-preference.model";

@Component({
  selector: 'app-sga-input-parameters',
  templateUrl: './sga-input-parameters.component.html',
  styleUrls: ['./sga-input-parameters.component.scss']
})
export class SgaInputParametersComponent {
  @Input() formGroup: FormGroup;

  public deaeratorType: string = 'autmosphericDeaerator';

  get fuelEnergyUnit(): SizingUnitPreference {
    return this.preferenceService.sizingUnitPreferences.find((item) => item.unitType === "BoilerHouseGasFuelUnits");
  }

  constructor(private translatePipe: TranslatePipe, private preferenceService: PreferenceService) {}

  submitForm(): void {
    console.log(this.formGroup.valid, '----valid')
    console.log(this.formGroup.getRawValue());
  }

  public translateErrors(field: keyof SteamGenerationFormInterface): string | null {
    const {errors} = this.formGroup.get(field);

    if (!errors) {
      return null;
    }

    if (typeof errors === "string") {
      return errors;
    }

    if (errors && errors.validation) {
      return errors.validation.errorMessage
        ? this.translatePipe.transform(errors.validation.errorMessage)
        : errors.validation;
    }

    return null;
  }
}
