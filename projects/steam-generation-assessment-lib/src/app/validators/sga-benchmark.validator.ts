import { AbstractControl, AsyncValidatorFn, FormGroup, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SgaApiService } from '../services/sga-api.service';
import { BenchmarkInputsInterface } from '../interfaces/benchmarkInputs.interface';

const getNameFomControl = (control: AbstractControl): string => control.parent && control.parent.controls &&
  Object.keys(control.parent.controls).find(name => control.parent.controls[name] === control);

export const validateBenchmarkInput = (service: SgaApiService): AsyncValidatorFn =>
  (control: AbstractControl): Observable<ValidationErrors> => {
  const fg: FormGroup = control && control.root as FormGroup;
  const name = getNameFomControl(control);

  if (!fg || !name || !service || !control || !control.touched) { return of(null); }

  return service.benchmarkValidate(name as keyof BenchmarkInputsInterface, fg.getRawValue()).pipe(
    map(res => res && res.errors && res.errors[0] && res.errors[0].errorMessage && !res.isValid ? res.errors[0] : null),
    map((error) => error && ({error: error.errorMessage, message: error.customState && Math.round(error.customState * 100) / 100})),
    catchError((err: HttpErrorResponse) => err && of({message: err.error && err.error.title || 'Unknown error'})),
  );
};
