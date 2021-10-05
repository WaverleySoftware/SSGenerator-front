import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { TranslatePipe } from 'sizing-shared-lib';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-process-conditions',
  templateUrl: './process-conditions.component.html',
  styleUrls: [ './process-conditions.component.scss' ]
})
export class ProcessConditionsComponent implements OnInit {
  @Input() moduleGroupId: number;
  @Input() form: FormGroup;

  // @BlockUI('process-conditions-section') blockUi: NgBlockUI;
  // private blockUiTimeout;

  get inletPressure() {
    return this.form.get('processConditions.inletPressure');
  }

  get inletPressureErrors() {
    if (this.form.get('processConditions').hasError('InletPressure')) {
      return this.translateErrors(this.form.get('processConditions').getError('InletPressure'));
    }

    if (this.inletPressure.hasError('InletPressure')) {
      return this.translateErrors(this.inletPressure.getError('InletPressure'));
    }

    return null;
  }

  get temperature() {
    return this.form.get('processConditions.temperature');
  }

  get temperatureErrors() {
    if (this.form.get('processConditions').hasError('InletTemperature')) {
      return this.translateErrors(this.form.get('processConditions').getError('InletTemperature'));
    }

    if (this.temperature.hasError('InletTemperature')) {
      return this.translateErrors(this.temperature.getError('InletTemperature'));
    }

    return null;
  }

  get massFlow() {
    return this.form.get('processConditions.massFlow');
  }

  get massFlowErrors() {   

    if (this.form.get('processConditions').hasError('MassFlow')) {
      return this.translateErrors(this.form.get('processConditions').getError('MassFlow'));
    }

    if (this.massFlow.hasError('MassFlow')) {
      return this.translateErrors(this.massFlow.getError('MassFlow'));
    }

    return null;
  }

  get volumetricFlow() {
    return this.form.get('processConditions.volumetricFlow');
  }

  get volumetricFlowErrors() {
    if (this.form.get('processConditions').hasError('VolumetricFlow')) {
      return this.translateErrors(this.form.get('processConditions').getError('VolumetricFlow'));
    }

    if (this.volumetricFlow.hasError('VolumetricFlow')) {
      return this.translateErrors(this.volumetricFlow.getError('VolumetricFlow'));
    }

    return null;
  }

  get normalTemperature() {
    return this.form.get('processConditions.normalTemperature');
  }

  get normalTemperatureErrors() {
    if (this.form.get('processConditions').hasError('NormalTemperature')) {
      return this.translateErrors(this.form.get('processConditions').getError('NormalTemperature'));
    }

    if (this.normalTemperature.hasError('NormalTemperature')) {
      return this.translateErrors(this.normalTemperature.getError('NormalTemperature'));
    }

    return null;
  }

  private translateErrors(errors: string[]): string {
    const translated = errors.map(error => this.translatePipe.transform(error));
    return translated.join('\n');
  }

  constructor(
    public translatePipe: TranslatePipe,
  ) {
  }

  ngOnInit() {
  }

}
