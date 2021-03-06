import { AbstractControl, AsyncValidatorFn, FormGroup, ValidationErrors } from '@angular/forms';
import { SgaApiService } from '../services/sga-api.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProposedSetupInterface } from '../interfaces/steam-generation-form.interface';

const disableControl = (fields: string[] | string) => (control: AbstractControl): ValidationErrors => {
  if (control && control.value) {
    const fg = control.parent as FormGroup;

    const disable = (name: string) => {
      if (fg) {
        const field = fg.get(name);
        if (field && field.value) {
          field.patchValue(false, {emitEvent: false});
        }
      }
    };

    if (fg) {
      if (typeof fields === 'string') {
        disable(fields);
      } else {
        for (const fieldName of fields) { disable(fieldName); }
      }
    }
  }

  return null;
};

const validateProposed = (service: SgaApiService, isNull?: boolean): AsyncValidatorFn =>
  (control: AbstractControl): Observable<ValidationErrors> => {
    const fg: FormGroup = control && control.root as FormGroup;
    const name = control.parent && control.parent.controls && Object.keys(control.parent.controls)
      .find(v => control.parent.controls[v] === control);

    if (!fg || !name || !service || !control || (control.pristine && !control.touched) || (isNull && !control.value)) {
      return of(null);
    }

    const proposedResults = fg.get('proposedSetup') as FormGroup;

    return service.proposalValidate(name as keyof ProposedSetupInterface, {...proposedResults.getRawValue(), [name]: control.value})
      .pipe(map(res => {
        if (!res || !res.hasOwnProperty('isValid') || res.isValid) { return null; }

        let error = 'Some Error';

        if (res.errors && Array.isArray(res.errors)) {
          error = res.errors[0].errorMessage;
        }

        return {
          error,
          message: res.errors[0] &&
            (res.errors[0].customState || res.errors[0].customState === 0) &&
            `(${res.errors[0].customState})`
        };
      }));
};

export { disableControl, validateProposed };
