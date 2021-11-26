import { AbstractControl, AsyncValidatorFn, FormGroup, ValidationErrors } from "@angular/forms";
import { Observable, of, timer } from "rxjs";
import { map, first, switchMap, catchError } from "rxjs/operators";
import { SteamGenerationAssessmentService } from "./steam-generation-assessment.service";
import { SgaHttpValidationResponseInterface, SteamGeneratorInputsInterface } from "./steam-generation-form.interface";
import { HttpErrorResponse } from "@angular/common/http";

export class SgaValidator {

  static validateAsyncFn(service: SteamGenerationAssessmentService, name?: keyof SteamGeneratorInputsInterface): AsyncValidatorFn {
    return function (control): Observable<ValidationErrors> {
      if (!name) {
        name = SgaValidator._getControlName(control);
      }

      if (
        !name || !control || !service ||
        !service.checkSgaFieldIsFilled ||
        !service.validateSgInput ||
        (control && !control.touched)
      ) return of(null);


      return timer(500).pipe(
        switchMap(() => {
          const { root, value } = control;
          const isFilled = service.checkSgaFieldIsFilled(name);

          if (value === 0 || isFilled || !root || !root.value) return of(null);
          if (!value) return of({ required: true });

          return service.validateSgInput(name as keyof SteamGeneratorInputsInterface, root.value)
            .pipe(
              map((errors) => errors && SgaValidator._parseErrors(errors)),
              catchError((errors: HttpErrorResponse) => SgaValidator._parseSpecificErrors(errors))
            );
        }),
        first()
      );
    }
  }

  static validateCalculation(response: SgaHttpValidationResponseInterface, formGroup: FormGroup): any {
    const { errors, isValid } = response;

    if ((isValid || isValid === undefined) || !errors || !Array.isArray(errors)) return response;

    for (let error of errors) {
      if (error.propertyName && error.errorMessage) {
        const formControlName = error.propertyName.charAt(0).toLowerCase() + error.propertyName.slice(1);
        const control: AbstractControl = formGroup.get(formControlName);

        control && control.setErrors &&
        control.setErrors({ error: error.errorMessage }, { emitEvent: false });
      }
    }

    return response;
  }

  private static _getControlName(control: AbstractControl): keyof SteamGeneratorInputsInterface {
    if (!control || !control.parent || !control.parent.controls) return null;

    const fg = control.parent.controls;

    return Object.keys(fg).find(name => fg[name] === control) as keyof SteamGeneratorInputsInterface;
  }

  private static _parseErrors(response: SgaHttpValidationResponseInterface): ValidationErrors {
    const { errors, isValid } = response;
    let error = 'ERROR';

    if (isValid) return null;

    if (Array.isArray(errors)) {
      error = errors[0].errorMessage;
    }

    return { error: error, message: errors[0] && errors[0].customState && `(${errors[0].customState})` };
  }

  private static _parseSpecificErrors({ error }: HttpErrorResponse): Observable<ValidationErrors> {
    if (error.errors) {
      return of({ message: error.errors[Object.keys(error.errors)[0]] || 'ERROR'});
    }

    return of({ message: error && error.errorMessage || 'ERROR'});
  }
}
