import { AbstractControl, AsyncValidatorFn, FormGroup, ValidationErrors } from "@angular/forms";
import { Observable, of, timer } from "rxjs";
import { map, first, switchMap, catchError } from "rxjs/operators";
import { SteamGenerationAssessmentService } from "./steam-generation-assessment.service";
import { SgaHttpValidationResponseInterface, SteamGeneratorInputsInterface } from "./steam-generation-form.interface";
import { HttpErrorResponse } from "@angular/common/http";

export class SgaValidator {
  static beforeValue = {};

  static fuelQtyPerYearIsKnown(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const costOfFuelPerYear = fg.get('costOfFuelPerYear');
      const fuelConsumptionPerYear = fg.get('fuelConsumptionPerYear');

      if (control.value) {
        SgaValidator.toggleFields(costOfFuelPerYear, true);
      } else {
        SgaValidator.toggleFields([costOfFuelPerYear, fuelConsumptionPerYear]);
        costOfFuelPerYear.value && costOfFuelPerYear.setValue(null, { onlySelf: true });
        fuelConsumptionPerYear.value && fuelConsumptionPerYear.setValue(null, { onlySelf: true });
      }
    }

    return null;
  }

  static boilerHouseWaterQtyPerYearIsKnown(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const costOfWaterPerYear = fg.get('costOfWaterPerYear');
      const waterConsumptionPerHour = fg.get('waterConsumptionPerHour');
      const waterConsumptionPerYear = fg.get('waterConsumptionPerYear');

      if (control.value) {
        SgaValidator.toggleFields(costOfWaterPerYear, true);
      } else {
        SgaValidator.toggleFields([costOfWaterPerYear, waterConsumptionPerHour, waterConsumptionPerYear]);
      }
    }

    return null;
  }

  static boilerWaterTreatmentChemicalCostsIsKnown(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const totalChemicalCostPerYear = fg.get('totalChemicalCostPerYear');
      const o2ScavengingChemicalsCostSavings = fg.get('o2ScavengingChemicalsCostSavings');

      SgaValidator.toggleFields([totalChemicalCostPerYear, o2ScavengingChemicalsCostSavings], control.value);
    }

    return null;
  }

  static isSuperheatedSteam(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const boilerSteamTemperature = fg.get('boilerSteamTemperature');

      SgaValidator.toggleFields(boilerSteamTemperature, control.value, false);
    }

    return null;
  }

  static isMakeUpWaterMonitored(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const temperatureOfMakeupWater = fg.get('temperatureOfMakeupWater');

      SgaValidator.toggleFields(temperatureOfMakeupWater, control.value);
    }

    return null;
  }

  static isSteamFlowMeasured(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const boilerSteamGeneratedPerHour = fg.get('boilerSteamGeneratedPerHour');
      const boilerSteamGeneratedPerYear = fg.get('boilerSteamGeneratedPerYear');

      if (control.value) {
        SgaValidator.toggleFields(boilerSteamGeneratedPerHour, true);
      } else {
        SgaValidator.toggleFields([boilerSteamGeneratedPerHour, boilerSteamGeneratedPerYear]);
      }
    }

    return null;
  }

  static isCo2OrCarbonEmissionsTaxed(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const carbonTaxLevyCostPerUnit = fg.get('carbonTaxLevyCostPerUnit');

      if (control.value) {
        SgaValidator.toggleFields(carbonTaxLevyCostPerUnit, true);
      } else {
        const costOfCo2PerUnitMass = fg.get('costOfCo2PerUnitMass');

        SgaValidator.toggleFields([carbonTaxLevyCostPerUnit, costOfCo2PerUnitMass]);
      }
    }

    return null;
  }

  static isFeedWaterMeasured(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const boilerFeedwaterConsumption = fg.get('boilerFeedwaterConsumption');
      // TODO: need to create new separate fields for "boilerFeedwaterConsumptionPreHour" && "boilerFeedwaterConsumptionPerYear"
      SgaValidator.toggleFields(boilerFeedwaterConsumption, control.value);
    }

    return null;
  }

  static validateAsyncFn(service: SteamGenerationAssessmentService, name?: keyof SteamGeneratorInputsInterface, isNullable?: boolean): AsyncValidatorFn {
    return function (control): Observable<ValidationErrors> {
      if (control && !SgaValidator.beforeValue[name] && !control.dirty && control.untouched) {
        SgaValidator.beforeValue[name] = control && control.value;
      }

      if (!name) {
        name = SgaValidator._getControlName(control);
      }

      if (
        !name || !control || !service ||
        !service.checkSgaFieldIsFilled ||
        !service.validateSgInput ||
        !control.dirty && control.untouched
      ) return of(null);

      return timer(500).pipe(
        switchMap(() => {
          const { root, value } = control;
          const validator = control && control.validator && control.validator({} as AbstractControl);
          const isFilled = service.checkSgaFieldIsFilled(name);
          const isTheSameValue = SgaValidator._checkSameValues(value, SgaValidator.beforeValue[name]);

          if (isFilled || !root || !root.value || isTheSameValue || control.disabled) return of(null);
          if (!value && !isNullable && validator && validator.required) return of({ required: true });

          SgaValidator.beforeValue[name] = value;

          return service.validateSgInput(name as keyof SteamGeneratorInputsInterface, root.value).pipe(
            map((errors) => errors && SgaValidator._parseErrors(errors)),
            catchError((errors: HttpErrorResponse) => SgaValidator._parseSpecificErrors(errors)),
          );
        })
      ).pipe(first());
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
        control.setErrors({
          error: error.errorMessage,
          message: (error.customState || error.customState === 0)&& `(${error.customState})`
        }, { emitEvent: false });
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

    return { error: error, message: errors[0] && (errors[0].customState || errors[0].customState === 0) && `(${errors[0].customState})` };
  }

  private static _parseSpecificErrors({ error }: HttpErrorResponse): Observable<ValidationErrors> {
    if (error.errors) {
      return of({ message: error.errors[Object.keys(error.errors)[0]] || 'ERROR'});
    }

    return of({ message: error && error.errorMessage || 'ERROR'});
  }

  private static _checkSameValues(value: any, prevValue: any): boolean {
    if (!prevValue) return false;
    return (value === prevValue);
  }

  private static toggleFields(fields: AbstractControl | AbstractControl[], isEnable: boolean = false, isClearValue: boolean = true): void {
    if (!fields) return null;

    const toggleFn = (control: AbstractControl) => {
      if (isEnable) {
        control && (control.disabled || control.disabled === undefined) && control.enable({ onlySelf: true });
      } else {
        control && (control.enabled || control.enabled === undefined) && control.disable({ onlySelf: true });

        if (isClearValue && control && control.value) {
          control.setValue(null, { onlySelf: true });
        }
      }
    }

    if (Array.isArray(fields)) {
      for (let field of fields) {
        toggleFn(field);
      }
    } else {
      toggleFn(fields);
    }
  }
}
