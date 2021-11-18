import { Injectable } from "@angular/core";
import { Observable, of, timer } from "rxjs";
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { SteamGenerationFormInterface } from "./steam-generation-form.interface";
import { catchError, map, switchMap } from "rxjs/operators";
import { SteamGenerationAssessmentService } from "./steam-generation-assessment.service";
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { TranslatePipe } from "sizing-shared-lib";

interface HttpApiResponseInterface {
  errors: {
    attemptedValue: number;
    customState: any
    errorCode: string;
    errorMessage: string;
    formattedMessagePlaceholderValues: {
      ComparisonValue: number;
      ComparisonProperty: string;
      PropertyName: string;
      PropertyValue: number;
    };
    propertyName: string;
    severity: number;
  }[];
  isValid: boolean;
  ruleSetsExecuted: string[]
}

@Injectable()
export class SteamGenerationValidator {
  constructor(
    private translatePipe: TranslatePipe,
    private steamGenerationAssessmentService: SteamGenerationAssessmentService
  ){}

  validateField(name?: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors> => this.validate(control, name);
  }

  private validate(control: AbstractControl, name: string): Observable<ValidationErrors> {
    if (!name) {
      name = SteamGenerationValidator.getControlName(control);
    }

    if (!name) return of(null);

    return timer(500).pipe(
      switchMap(() => {
        const { value } = control;
        if (value === 0) return of(null);
        if (!value) return of({ required: true });

        return this.steamGenerationAssessmentService
          .validateSgInput(name as keyof SteamGenerationFormInterface, { [name]: value })
          .pipe(
            map((res) => res ? SteamGenerationValidator.parseErrors(res) : null),
            catchError((res: HttpErrorResponse, caught) =>
              SteamGenerationValidator.handleResponseErrors(res)
            )
          );
      })
    )
  }

  private static parseErrors(response: HttpApiResponseInterface): ValidationErrors {
    const { errors, isValid } = response;
    let error = 'ERROR';

    if (isValid) return null;

    if (Array.isArray(errors)) {
      error = errors[0].errorMessage;
    }

    return { error: error };
  }

  private static handleResponseErrors({ error }: HttpErrorResponse): Observable<ValidationErrors> {
    if (error.errors) {
      return of({ message: error.errors[Object.keys(error.errors)[0]] || 'ERROR'});
    }

    return of({ message: error && error.errorMessage || 'ERROR'});
  }

  private static getControlName(control: AbstractControl): string {
    if (!control || !control.parent || !control.parent.controls) return null;

    const fg = control.parent.controls;

    return Object.keys(fg).find(name => fg[name] === control)
  }
}
