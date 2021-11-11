import { AfterViewInit, Directive, Input, OnInit } from "@angular/core";
import { PreferenceService, UnitsService } from "sizing-shared-lib";
import { NgControl } from "@angular/forms";

@Directive({
  selector: '[preferenceSizingUnit]'
})
export class PreferenceSizingUnitDirective implements OnInit, AfterViewInit{
  @Input('formControlName') formName: string;
  @Input('preferenceSizingUnit') preferenceName: string;

  constructor(
    private control: NgControl,
    private preferenceService: PreferenceService,
    private unitsService: UnitsService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.setValueFromPreference();
  }

  private setValueFromPreference(): void {
    // type: "BoilerHouseEnergy" unitType: "BoilerHouseEnergyUnits"
    // decimalPlaces: 2
    // isUnit: true
    // label: null
    // masterTextKey: "UNIT_MMBTU"
    // name: "BoilerHouseEnergyUnits"
    // unitName: "MMBtu"
    // value: "244"

    // this.preferenceService.addSizingUnitPreference();
    if (!this.unitsService.units || !this.unitsService.units.length) {
      this.unitsService.getAllUnitsByAllTypes().subscribe((units) => {
        if (this.preferenceService.allPreferences) {
          const preference = this.preferenceService.allPreferences
            && this.preferenceService.allPreferences.find(({ name }) => name === this.preferenceName);
          const activeUnit = preference
            && units.find(({ id, unitType }) => unitType === this.preferenceName && id === Number(preference.value));

          this.control && this.control.control && this.control.control.setValue(activeUnit.id);
        }
      });
    }
    // console.log(this.preferenceName, this.formName, this.unitsService.units, this.preferenceService.allPreferences, '-----PreferenceSizingUnitDirective')
  }
}
