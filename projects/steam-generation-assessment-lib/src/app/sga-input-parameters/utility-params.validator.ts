import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";

export function checkValidator(control: AbstractControl): ValidationErrors {

  return null;
}

export function checkValidatorFn(fg: FormControl): ValidationErrors {
  const check = fg.get('IS_FUEL_COMSUMPTION_MEASURED').value;

  if (check) {
    fg.get('FUEL_CONSUMPTION_YEAR').setValidators(Validators.required);
    // fg.get('FUEL_CONSUMPTION_YEAR').updateValueAndValidity();
  } else {
    fg.get('FUEL_CONSUMPTION_YEAR').clearValidators();
  }

  return null;
}
