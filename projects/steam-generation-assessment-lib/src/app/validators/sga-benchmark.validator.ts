import { AbstractControl, AsyncValidatorFn, FormGroup, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SgaApiService } from '../services/sga-api.service';
import { BenchmarkInputsInterface } from '../interfaces/benchmarkInputs.interface';
import { CalcBenchmarkResInterface } from '../interfaces/calc-benchmark-res.interface';
import { SgaErrorInterface, SgaValidationErrorResInterface } from '../interfaces/api-requests.interface';
import { ElementRef } from '@angular/core';
import sgaFormStructure from '../utils/sga-form-structure';
import { FocusOnFirstErrorField } from '../utils/focusOnFirstErrorField';

const getNameFomControl = (control: AbstractControl): string => control.parent && control.parent.controls &&
  Object.keys(control.parent.controls).find(name => control.parent.controls[name] === control);

const getControlNameFromReqError = (error: SgaErrorInterface): {name: string, error: string} => {
  if (!error) { return null; }

  const propertyName = error.propertyName && error.propertyName.slice(16, error.propertyName.length);

  return {
    name: propertyName ? propertyName.charAt(0).toLocaleLowerCase() + propertyName.slice(1) : 'UNKNOWN',
    error: error.errorMessage || 'UNKNOWN_ERROR'
  };
};

export const validateBenchmarkInput = (service: SgaApiService, isNull?: boolean): AsyncValidatorFn =>
  (control: AbstractControl): Observable<ValidationErrors> => {
  const fg: FormGroup = control && control.root as FormGroup;
  const name = getNameFomControl(control);

  if (!fg || !name || !service || !control || (control.pristine && !control.touched) || (isNull && !control.value)) {
    return of(null);
  }

  return service.benchmarkValidate(name as keyof BenchmarkInputsInterface, {
    selectedUnits: fg.get('selectedUnits').value,
    benchmarkInputs: { ...fg.get('benchmarkInputs').value, [name]: control.value },
  }).pipe(
    map(res => res && res.errors && res.errors[0] && res.errors[0].errorMessage && !res.isValid ? res.errors[0] : null),
    map((error) => error && ({error: error.errorMessage, message: error.customState && Math.round(error.customState * 100) / 100})),
    catchError((err: HttpErrorResponse) => err && of({message: err.error && err.error.title || 'Unknown error'})),
  );
};

export const benchmarkCalculationValidator = (res, form: FormGroup, {nativeElement}: ElementRef): CalcBenchmarkResInterface => {
  const err = res as SgaValidationErrorResInterface;

  if (err && err.errors && err.errors.length) {
    let firstErrorFieldName: string;

    for (const error of err.errors) {
      const controlError = getControlNameFromReqError(error);
      const control = form.get(`benchmarkInputs.${controlError.name}`);

      if (control && control.status === 'VALID') {
        if (!firstErrorFieldName) {
          firstErrorFieldName = controlError.name;
        }
        control.setErrors({error: controlError.error});
      }
    }

    if (firstErrorFieldName) {
      const element: HTMLInputElement = nativeElement.querySelector(`[ng-reflect-name="${firstErrorFieldName}"]`);
      FocusOnFirstErrorField(sgaFormStructure, firstErrorFieldName, element);
    }

    return null;
  }

  return res as CalcBenchmarkResInterface;
};
