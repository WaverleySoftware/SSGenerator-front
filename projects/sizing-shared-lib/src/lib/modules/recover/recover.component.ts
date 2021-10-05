import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { RecoverService } from './recover.service';
import { PasswordResetResponse } from './passwordReset.model';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.scss']
})
export class RecoverComponent {

  valForm: FormGroup;
  passwordResetResponse: PasswordResetResponse;
  isSuccess: boolean;
  isEmailError: boolean;
  isFormSubmitted: boolean;

  constructor(fb: FormBuilder, private recoverService: RecoverService) {
    this.valForm = fb.group({
      'email': [null, Validators.compose([Validators.required, CustomValidators.email])],
    });
  }

  submitForm($ev, value: any) {
    $ev.preventDefault();

    this.isEmailError = false;
    this.isSuccess = false;
    this.isFormSubmitted = false;

    for (let c in this.valForm.controls) {
      this.valForm.controls[c].markAsTouched();
    }

    if (this.valForm.valid) {

      this.isFormSubmitted = true;

      this.recoverService.sendForgotPasswordEmail(this.valForm.value.email).subscribe((r: PasswordResetResponse) => {
        this.passwordResetResponse = r;
        this.isSuccess = true;
      },
        error => {
          this.isEmailError = true;
          this.isSuccess = false;
          this.isFormSubmitted = false; // reset the submission
          this.passwordResetResponse = { "message": error.error };  //error.error === "UserDoesNotExist" API always returns regardless?                              
        });
    }
    else {
      // form and inputs are not valid!
    }

  }
}
