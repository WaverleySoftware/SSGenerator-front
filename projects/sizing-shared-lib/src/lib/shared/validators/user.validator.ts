import { Injectable } from '@angular/core';
import { AsyncValidatorFn, AbstractControl } from '@angular/forms';

import { AdminService } from "../../modules/admin/admin.service";

import { Observable } from 'rxjs';

import 'rxjs/add/operator/map';

@Injectable()
export class UserValidator {
  constructor(private adminService: AdminService) { }

  isEmptyInputValue(value: any): boolean {
    // we don't check for string here so it also works with arrays
    return value == null || value.length === 0;
  }

  usernameValidator(control: AbstractControl) {
    return this.adminService.checkUsernameExists(control.value).map((userExists: boolean) => {
      if (!!userExists) {
        console.log("Username Validator status: " + control.status);
        return { existingUserByUsername: true };
      } else {
        return null;
      }
    });
  }

  emailValidator(control: AbstractControl) {
    return this.adminService.checkEmailExists(control.value).map((userExists: boolean) => {
      if (!!userExists) {
        console.log("Email Validator status: " + control.status);
        return { existingUserByEmail: true };
      } else {
        return null;
      }
    });
  }

  countryValidator(control: AbstractControl): AsyncValidatorFn {
    return () => {
      console.log(control);

      if (!control.dirty) {
        return Observable.of(null);
      }

      if (control.value === '0') {
        return Observable.of({ 'countrySelected': true });
      }
      return Observable.of(null);
    };
  }
}
