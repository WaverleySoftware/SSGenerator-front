import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { CustomValidators } from 'ng2-validation';
import { UserValidator } from "sizing-shared-lib";

import { Country } from "sizing-shared-lib";
import { Language } from "sizing-shared-lib";

import { AdminService } from "sizing-shared-lib";
import { User } from "sizing-shared-lib";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements  OnInit {
  registerForm: FormGroup;
  isSuccess: boolean = false;
  attemptedToRegister: boolean = false;

  public languages: Language[] = [];
  public countries: Country[] =  [];

  private user: User;

  constructor(private fb: FormBuilder, private adminService: AdminService, private userValidator: UserValidator) {
    this.user = new User();

    this.user.password = "";
    this.user.email = "";

    this.registerForm = this.fb.group({
      username: new FormControl('', { validators: [Validators.required, Validators.minLength(6)], asyncValidators: [this.userValidator.usernameValidator.bind(this)], updateOn: 'blur' }),
      password: new FormControl(this.user.password, Validators.compose([Validators.required])),
      firstname: new FormControl(this.user.firstname, Validators.compose([Validators.required])),
      lastname: new FormControl(this.user.lastname, Validators.compose([Validators.required])),
      email: new FormControl(this.user.email, { validators: [Validators.required, Validators.email], asyncValidators: [this.userValidator.emailValidator.bind(this)], updateOn: 'blur' }),
      memorableWord: new FormControl(this.user.memorableWord, Validators.compose([Validators.required])),
      company: new FormControl(this.user.company),
      address: new FormControl(this.user.address),
      telephone: new FormControl(this.user.telephone),
      companyPosition: new FormControl(this.user.companyPosition),
      industryEnum: new FormControl(this.user.industryEnum),
      tradeEnum: new FormControl(this.user.tradeEnum),
      hasAgreedDpa: new FormControl(this.user.hasAgreedDpa),
      languageIsoName: new FormControl(this.user.languageIsoName),
      countryCode: new FormControl(this.user.countryCode, Validators.compose([Validators.required]))
    }, { updateOn: "blur" });

    // Only once the registerForm FormBuilder has been instantiated can the equalTo validator be used between password and confirmPassword.
    this.registerForm.addControl("confirmPassword", new FormControl(this.user.confirmPassword, CustomValidators.equalTo(this.registerForm.controls["password"])));
    this.registerForm.validator = this.unsupportedCharacters;
  }

  unsupportedCharacters(valForm: FormGroup) {

    let unsupportedcharacters: boolean = false;

    if (!unsupportedcharacters && !!valForm.controls['password'].value && !!valForm.controls['password'].value != null) {
      var theValue = valForm.controls['password'].value;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('&') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('+') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('%') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('"') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('\\') > -1) ? true : false;
    }
    if (!unsupportedcharacters && !!valForm.controls['username'].value && !!valForm.controls['username'].value != null) {
      var theValue = valForm.controls['username'].value;
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

    // set/clear the error
    return unsupportedcharacters ? { 'unsupportedcharacters': true } : null;
  }

  ngOnInit() {

    // Set the dropdown defaults.
    this.user.languageIsoName = navigator.language.toLowerCase();

    // Set the language to the control.
    this.registerForm.controls["languageIsoName"].setValue(this.user.languageIsoName);

    // Get the languages
    this.adminService.getLanguages().subscribe((languages: Language[]) => this.languages = languages);

    // Get the countries
    this.adminService.getCountries().subscribe((countries: Country[]) => {
      this.countries = countries;

      // Now that countries have been loaded, see if we can't find the country by guessing it.
      this.user.countryCode = this.getDerivedCountryCodeFromLanguage(this.user.languageIsoName);
      this.registerForm.controls["countryCode"].setValue(this.user.countryCode);
    });

    // TODO: Get the trades

    // TODO: Get the industries



  }
  submitForm($ev) {
    $ev.preventDefault();

    this.user = this.registerForm.value as User;

    console.info(this.user);

    if (this.registerForm.valid) {
      // Register the user
      this.adminService.registerUser(this.user).subscribe((res: boolean) => {

        // Show / hide the success flag.
        this.isSuccess = res;
        this.attemptedToRegister = true;
      });
    }
  }

  private getDerivedCountryCodeFromLanguage(language: string): string {

    // Set the default
    var countryCode = "gb";

    var splitCodes = language.split("-");

    // The last item in the split is usually the country code.
    var newCountryCode = splitCodes[splitCodes.length - 1];

    // See if the new code matches any countries
    var matchedCountry = this.countries.find(c => c.countryCode === newCountryCode);

    if (!!matchedCountry) {
      return matchedCountry.countryCode;
    }

    // Otherwise return the default
    return countryCode;
  }
}
