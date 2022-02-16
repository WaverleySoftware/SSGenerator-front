import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { SgaFormService } from '../../services/sga-form.service';
import { InputParametersTFormInterface, TForm } from '../../interfaces/forms.interface';


@Component({
  selector: 'app-sga-input-parameters',
  templateUrl: './sga-input-parameters.component.html',
  styleUrls: ['./sga-input-parameters.component.scss']
})
export class SgaInputParametersComponent implements OnInit, OnDestroy {
  @Input() moduleGroupId: number;
  @Input() sizingUnits: any;
  private ngUnsubscribe = new Subject<void>();
  formGroup: TForm<InputParametersTFormInterface> = this.formService.getInputParamsFg();
  fuelTypeName = '';

  constructor(private formService: SgaFormService) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  toggleInput(enable: string | string[], disable: string | string[], patchValue?: any) {
    if (typeof enable === 'string') {
      const control = this.formGroup.get(`benchmarkInputs.${enable}`);
      if (control && control.disabled) { control.enable({onlySelf: true}); }
    } else if (Array.isArray(enable)) {
      for (const field of enable) {
        const control = this.formGroup.get(`benchmarkInputs.${field}`);
        if (control && control.disabled) { control.enable({onlySelf: true}); }
      }
    }

    if (typeof disable === 'string') {
      const control = this.formGroup.get(`benchmarkInputs.${disable}`);
      if (control && control.enabled) {
        control.disable();
        control.markAsUntouched({onlySelf: true});

        if (patchValue !== undefined) { control.patchValue(patchValue); }
      }
    } else if (Array.isArray(disable)) {
      for (const field of disable) {
        const control = this.formGroup.get(`benchmarkInputs.${field}`);
        if (control && control.enabled) {
          control.disable();
          control.markAsUntouched({onlySelf: true});

          if (patchValue !== undefined) { control.patchValue(patchValue); }
        }
      }
    }
  }

  setFormValue(name: string | string[] | {[key: string]: any}, value?: any) {
    if (typeof name === 'string') {
      const control = this.formGroup.get(`benchmarkInputs.${name}`);
      if (control) { control.patchValue(value !== undefined ? value : null); }
    } else if (Array.isArray(name)) {
      for (const field of name) {
        const control = this.formGroup.get(`benchmarkInputs.${field}`);
        if (control) { control.patchValue(value !== undefined ? value : null); }
      }
    } else if (typeof name === 'object') {
      for (const key of Object.keys(name)) {
        const control = this.formGroup.get(`benchmarkInputs.${key}`);
        if (control) { control.patchValue(value !== undefined ? value : name[key]); }
      }
    }
  }

  calculateEfficiencyHandle(value) {
    console.log({
      isEconomizerPresent: value,
      inputFuelId: this.formGroup.get('benchmarkInputs.inputFuelId').value
    }, '-----calculateEfficiencyHandle');
  }
  heatExchangerPresentHandle(value) {
    console.log(value, '-----heatExchangerPresentHandle');
  }
  waterTreatmentHandle(value) {
    console.log(value, '-----waterTreatmentHandle');
  }
  pressureDeaeratorHandle(value) {
    console.log(value, '-----pressureDeaeratorHandle');
  }
}
