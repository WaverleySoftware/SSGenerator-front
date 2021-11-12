import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { TranslatePipe } from "sizing-shared-lib";
import { PreferenceService } from "sizing-shared-lib";
import { SizingUnitPreference } from "../../../../sizing-shared-lib/src/lib/shared/preference/sizing-unit-preference.model";
import { SteamGenerationFormInterface } from "../steam-generation-form.interface";

@Component({
  selector: 'app-sga-input-parameters',
  templateUrl: './sga-input-parameters.component.html',
  styleUrls: ['./sga-input-parameters.component.scss']
})
export class SgaInputParametersComponent {
  @Input() formGroup: FormGroup;
  @Input() moduleGroupId: number;

  public deaeratorType: string = 'autmosphericDeaerator';

  get currency(): SizingUnitPreference {
    return this.preferenceService.sizingUnitPreferences.find((item) => item && item.unitType === 'BHCurrency');
  }

  constructor(private translatePipe: TranslatePipe, private preferenceService: PreferenceService) {}

  submitForm(): void {
    console.log(this.formGroup.valid, '----valid')
    console.log(this.formGroup.getRawValue());
  }

  public clearValues(clearFields: Array<keyof SteamGenerationFormInterface>, setVal: any = 0, event?: any) {
    if (!clearFields.length) return;

    for (let fieldName of clearFields) {
      if (this.formGroup.get(fieldName).value || this.formGroup.get(fieldName).value === "") {
        this.formGroup.get(fieldName).setValue(setVal);
      }
    }
  }
}
