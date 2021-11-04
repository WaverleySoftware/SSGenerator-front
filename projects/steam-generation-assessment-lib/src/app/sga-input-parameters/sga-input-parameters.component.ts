import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { TranslatePipe } from "sizing-shared-lib";
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

  public clearValues({ group }: { ref: any; group: string }, clearFields: string[]) {
    for (let fieldName of clearFields) {
      if (this.formGroup.get(fieldName).value) {
        this.formGroup.get(fieldName).setValue(0);
      }
    }
  }
}
