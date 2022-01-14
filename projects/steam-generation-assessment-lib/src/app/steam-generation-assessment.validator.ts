import { AbstractControl, AsyncValidatorFn, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { Observable, of, timer } from "rxjs";
import { map, first, switchMap, catchError } from "rxjs/operators";
import { SteamGenerationAssessmentService } from "./steam-generation-assessment.service";
import { SgaHttpValidationResponseInterface, SteamGeneratorInputsInterface } from "./steam-generation-form.interface";
import { HttpErrorResponse } from "@angular/common/http";

export class SgaValidator {
  static fuelQtyPerYearIsKnown(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const costOfFuelPerYear = fg.get('costOfFuelPerYear');
      const fuelConsumptionPerYear = fg.get('fuelConsumptionPerYear');

      if (control.value) {
        SgaValidator.toggleFields(costOfFuelPerYear, true);
      } else {
        SgaValidator.toggleFields([costOfFuelPerYear, fuelConsumptionPerYear]);
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
        SgaValidator.toggleFields([
          costOfWaterPerYear,
          waterConsumptionPerHour,
          waterConsumptionPerYear
        ]);
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

      SgaValidator.toggleFields(boilerSteamTemperature, control.value);
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
      const boilerFeedwaterConsumptionPerHour = fg.get('boilerFeedwaterConsumptionPerHour');

      if (control.value) {
        SgaValidator.toggleFields(boilerFeedwaterConsumptionPerHour, true);
      } else {
        const boilerFeedwaterConsumptionPerYear = fg.get('boilerFeedwaterConsumptionPerYear');

        SgaValidator.toggleFields([boilerFeedwaterConsumptionPerHour, boilerFeedwaterConsumptionPerYear]);
      }
    }

    return null;
  }

  static isAutoTdsControlPResent(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const isFlashVesselPresent = fg.get('isFlashVesselPresent');

      if (control.value) {
        SgaValidator.toggleFields(isFlashVesselPresent, true);
      } else {
        const isHeatExchangerPresent = fg.get('isHeatExchangerPresent');
        const waterTemperatureLeavingHeatExchanger = fg.get('waterTemperatureLeavingHeatExchanger');

        SgaValidator.toggleFields([
          isFlashVesselPresent,
          isHeatExchangerPresent,
        ], false, false);
        SgaValidator.toggleFields(waterTemperatureLeavingHeatExchanger, false, null);
      }
    }

    return null;
  }

  static isFlashVesselPresent(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const isHeatExchangerPresent = fg.get('isHeatExchangerPresent');
      const waterTemperatureLeavingHeatExchanger = fg.get('waterTemperatureLeavingHeatExchanger');

      if (control.value) {
        SgaValidator.toggleFields(isHeatExchangerPresent, true);
      } else {
        SgaValidator.toggleFields(isHeatExchangerPresent, false, false);
        SgaValidator.toggleFields(waterTemperatureLeavingHeatExchanger, false, null);
      }
    }

    return null;
  }

  static isHeatExchangerPresent(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const waterTemperatureLeavingHeatExchanger = fg.get('waterTemperatureLeavingHeatExchanger');

      SgaValidator.toggleFields(waterTemperatureLeavingHeatExchanger, control.value, null);
    }

    return null;
  }

  static atmosphericDeaerator(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg && control.value) {
      const pressurisedDeaerator = fg.get('pressurisedDeaerator');

      pressurisedDeaerator && pressurisedDeaerator.patchValue(false, { selfOnly: true });
    }

    return null;
  }

  static pressurisedDeaerator(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const pressureOfFeedtank = fg.get('pressureOfFeedtank');
      const atmosphericDeaerator = fg.get('atmosphericDeaerator');
      const isDsiPresent = fg.get('isDsiPresent');

      SgaValidator.toggleFields(pressureOfFeedtank, control.value);
      SgaValidator.toggleFields(isDsiPresent, !control.value, false);
      control.value && atmosphericDeaerator && atmosphericDeaerator.patchValue(false, { selfOnly: true});

      if (!control.value) {
        pressureOfFeedtank.clearValidators();
      } else {
        pressureOfFeedtank.setValidators(Validators.required);
      }

      pressureOfFeedtank.updateValueAndValidity({ onlySelf: true });
    }

    return null;
  }

  static isDsiPresent(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const pressureOfSteamSupplyingDsi = fg.get('pressureOfSteamSupplyingDsi');

      SgaValidator.toggleFields(pressureOfSteamSupplyingDsi, control.value);
    }

    return null;
  }

  static isCondensateReturnKnown(control: AbstractControl): ValidationErrors {
    const fg = control && control.parent;

    if (fg) {
      const percentageOfCondensateReturn = fg.get('percentageOfCondensateReturn');
      const volumeOfCondensateReturn = fg.get('volumeOfCondensateReturn');

      if (control.value) {
        SgaValidator.toggleFields(percentageOfCondensateReturn, true);
      } else {
        SgaValidator.toggleFields([percentageOfCondensateReturn, volumeOfCondensateReturn]);
      }
    }

    return null;
  }

  /**
   * @param service service with request functions
   * @param {string} [name] keyof SteamGeneratorInputsInterface
   * @param {boolean} isNullable send validation request if value is "0"
   * */
  static validateAsyncFn(service: SteamGenerationAssessmentService, name?: keyof SteamGeneratorInputsInterface, isNullable?: boolean): AsyncValidatorFn {
    return function (control): Observable<ValidationErrors> {
      if (!name) {
        name = SgaValidator._getControlName(control);
      }

      if (
        !name || !control || !service ||
        !service.checkSgaFieldIsFilled ||
        !service.validateSgaBenchmarkInput ||
        !control.dirty && control.untouched
      ) return of(null);

      return timer(600).pipe(
        switchMap(() => {
          const { root, value } = control;
          const validator = control && control.validator && control.validator({} as AbstractControl);
          const isFilled = service.checkSgaFieldIsFilled(name);

          if (isFilled || !root || !root.value || control.disabled) return of(null);
          if (!value && !isNullable && validator && validator.required) return of({ required: true });

          return service.validateSgaBenchmarkInput(name as keyof SteamGeneratorInputsInterface, root.value).pipe(
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
        const fieldName = error.propertyName.split('.')[1];
        const formControlName = fieldName.charAt(0).toLowerCase()+fieldName.slice(1);
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

  private static toggleFields(fields: AbstractControl | AbstractControl[], isEnable: boolean = false, setValue?: any): void {
    if (!fields) return null;

    const toggleFn = (control: AbstractControl) => {
      if (isEnable) {
        control && (control.disabled || control.disabled === undefined) && control.enable({ onlySelf: true });
      } else {
        control && (control.enabled || control.enabled === undefined) && control.disable({ onlySelf: true });

        if (setValue !== undefined && control && control.value !== setValue) {
          control.setValue(setValue, { onlySelf: true });
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
