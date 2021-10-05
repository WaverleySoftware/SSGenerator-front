import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ResetService } from './reset.service';
import { ActivatedRoute } from '@angular/router';

import { PasswordResetResponse } from '../recover/passwordReset.model';

@Component({
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})

export class ResetComponent implements OnInit {
  valForm: FormGroup;
  route: ActivatedRoute;
  isSuccess: boolean = false;
  message: string;
  passwordResetResponse: PasswordResetResponse;
  isTokenExpired: boolean;


  constructor(private fb: FormBuilder, private resetService: ResetService, route: ActivatedRoute) {

    this.resetService = resetService;
    this.valForm = fb.group({
      'password': [null, Validators.compose([Validators.required])],
      'confirmPassword': [null, Validators.compose([Validators.required])]
    },
      { validator: [this.passwordMatchValidator, this.unsupportedCharacters] }
    );
    this.route = route;
  }

  passwordMatchValidator(valForm: FormGroup) {
    return valForm.controls['password'].value === valForm.controls['confirmPassword'].value ? null : { 'mismatch': true };
  }
  //READ BELOW!!!!!!!!
  //This is no longer used. Please refer to ssv2/src/app/modules/reset
  ngOnInit() {
debugger;
    let uniqueCode = this.route.snapshot.params['uniqueCode'];
    this.resetService.verifyPasswordToken(uniqueCode).subscribe((result: boolean) => {
      if (result === null) {
        this.isTokenExpired = true;
      } else {
        this.isTokenExpired = result; // UserControler.cs VerifyPasswordToken() returns bool IsTokenExpired
      }
    });

   
    this.valForm = this.fb.group({
      password: new FormControl('', Validators.compose([Validators.required])),
      confirmPassword: new FormControl('', Validators.compose([Validators.required]))
      //confirmNewPassword: new FormControl('', Validators.compose([Validators.required]))
    },
      { validator: [this.unsupportedCharacters] }
    );


  }

  unsupportedCharacters(valForm: FormGroup) {
    debugger;
    let unsupportedcharacters: boolean = false;

    if (!unsupportedcharacters && !!valForm.controls['password'].value && !!valForm.controls['password'].value != null) {
      var theValue = valForm.controls['password'].value;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('&') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('+') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('%') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('"') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('\\') > -1) ? true : false;
    }
    if (!unsupportedcharacters && !!valForm.controls['confirmPassword'].value && !!valForm.controls['confirmPassword'].value != null) {
      var theValue = valForm.controls['confirmPassword'].value;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('&') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('+') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('%') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('"') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('\\') > -1) ? true : false;
    }
    //if (!unsupportedcharacters && !!valForm.controls['confirmNewPassword'].value && !!valForm.controls['confirmNewPassword'].value != null) {
    //  var theValue = valForm.controls['confirmNewPassword'].value;
    //  unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('&') > -1) ? true : false;
    //  unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('+') > -1) ? true : false;
    //  unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('%') > -1) ? true : false;
    //  unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('"') > -1) ? true : false;
    //  unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('\\') > -1) ? true : false;
    //}

    // set/clear the error
    return unsupportedcharacters ? { 'unsupportedcharacters': true } : null;
  }

  submitForm($ev, value: any) {
    $ev.preventDefault();
    for (let c in this.valForm.controls) {
      this.valForm.controls[c].markAsTouched();
    }

    if (this.valForm.valid) {
      var uniqueCode = this.route.snapshot.params["uniqueCode"];
      this.resetService.changePassword(uniqueCode, this.valForm.value.password, this.valForm.value.confirmPassword).subscribe((res: PasswordResetResponse) => {
        this.passwordResetResponse = res;
        this.isSuccess = true;
      }, error => {
        if (error.error.message.indexOf("found") >= 0) { //"TokenDoesNotExist") { // from SecurityAdapter.cs ChangePassword()
          this.isSuccess = false;
          this.passwordResetResponse = { message: error.error };
          return;
        }
        if (error.error.message.indexOf("expired") >= 0) { // "TokenExpired") {  // from SecurityAdapter.cs ChangePassword()
          this.isSuccess = false;
          this.isTokenExpired = true;
          this.passwordResetResponse = { message: error.error };
          return;
        }
        this.isSuccess = false;
        this.passwordResetResponse = { message: error.error }; //throw new Error(error);
      });
    }
  }
}
