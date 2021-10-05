import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { UserValidator } from "../../shared/validators/user.validator";
import { UserProfileService } from "./user-profile.service";
import { AdminService } from "../admin/admin.service";
import { SharedService } from "../../shared/shared.service";

import { User } from "../user-profile/user.model";
import { Language } from "../admin/language.model";
import { Country } from "../admin/country.model";

import { SizingSuiteModalComponent } from "../../shared/sizing-suite-modal/sizing-suite-modal.component";
import { IGenericChanges } from "../generic.changes.interface";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, IGenericChanges {

  public user: User;

  public languages: Language[] = [];
  public countries: Country[] = [];

  public selectedIndustry: string = "";
  private industryEnumFormControl: FormControl;

  userForm: FormGroup;
  passwordResetForm: FormGroup;

  isSuccess: boolean = false;
  userProfileFormSubmitted: boolean = false;
  changePasswordFormSubmitted: boolean = false;

  public parentSubmitIsDisabled = true; // Modal parent container component submit button state (enabled/disabled)

  theFormGroup: FormGroup; // to drive GenericChangesGuard
  hasUnsavedDataChanges: boolean; // to drive GenericChangesGuard

  @ViewChild("changePasswordModal", { static: false }) changePasswordModal: SizingSuiteModalComponent;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private adminService: AdminService,
    private sharedService: SharedService,
    private userValidator: UserValidator,
    private router: Router) {
  }

  ngOnInit() {
    this.userProfileService.getUserDetails().subscribe(user => {
      this.user = user;

      this.industryEnumFormControl = new FormControl(this.user.industryEnum);

      // The user form
      this.userForm = this.fb.group({
        username: new FormControl(this.user.username, { validators: [Validators.required, Validators.minLength(6)], asyncValidators: [this.userValidator.usernameValidator.bind(this)], updateOn: 'blur' }),
        firstname: new FormControl(this.user.firstname, Validators.compose([Validators.required])),
        lastname: new FormControl(this.user.lastname, Validators.compose([Validators.required])),
        email: new FormControl(this.user.email, { validators: [Validators.required, Validators.email], asyncValidators: [this.userValidator.emailValidator.bind(this)], updateOn: 'blur' }),
        memorableWord: new FormControl(this.user.memorableWord, Validators.compose([Validators.required])),
        operatingCompany: new FormControl({ value: this.user.operatingCompanyName, disabled: true }),
        company: new FormControl(this.user.company),
        address: new FormControl(this.user.address),
        telephone: new FormControl(this.user.telephone),
        companyPosition: new FormControl(this.user.companyPosition),
        industryEnum: this.industryEnumFormControl,
        tradeEnum: new FormControl(this.user.tradeEnum),
        hasAgreedDpa: new FormControl(this.user.hasAgreedDpa),
        languageIsoName: new FormControl(this.user.languageIsoName),
        countryCode: new FormControl({ value: this.user.countryCode, disabled: true })
      },
        { validator: [this.unsupportedUserNameCharacters] });

      // The password reset form
      this.passwordResetForm = this.fb.group({
        password: new FormControl('', Validators.compose([Validators.required])),
        newPassword: new FormControl('', Validators.compose([Validators.required])),
        confirmNewPassword: new FormControl('', Validators.compose([Validators.required]))
      },
        { validator: [this.passwordMatchValidator, this.unsupportedCharacters] }
      );

      // Do an initial load of the industry enum, based on the selected trade enum.
      this.onTradeChange(this.user.tradeEnum);

      this.theFormGroup = this.userForm; // to drive GenericChangesGuard

    });

    // Get the languages
    this.adminService.getLanguages().subscribe((languages: Language[]) => this.languages = languages);

    // Get the countries
    this.adminService.getCountries().subscribe((countries: Country[]) => this.countries = countries);
    
  }

  submitForm(event: Event) {
    event.preventDefault();

    // Before starting, reset the form submission flag
    this.userProfileFormSubmitted = false;
    
    const updatedUser = this.userForm.value as User;

    // Append the values that the form does not have.
    updatedUser.countryCode = this.user.countryCode;

    // Reset the flags
    this.isSuccess = false;
    this.userProfileFormSubmitted = false;

    if (this.userForm.valid) {
      this.userProfileService.updateUserDetails(updatedUser).subscribe((response: boolean) => {
        // Show / hide the success flag.
        this.isSuccess = response;
        this.userProfileFormSubmitted = true;

        // Set the form back to pristine only if the data has been saved successfully.
        if (this.isSuccess) {
          this.userForm.markAsPristine();
        }
      },
        // Error callback
        () => {
          this.isSuccess = false;
          this.userProfileFormSubmitted = true;
        }
      );
    }
  }

  passwordMatchValidator(valForm: FormGroup) {
    return valForm.controls['newPassword'].value === valForm.controls['confirmNewPassword'].value ? null : { 'mismatch': true };
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
    if (!unsupportedcharacters && !!valForm.controls['newPassword'].value && !!valForm.controls['newPassword'].value != null) {
      var theValue = valForm.controls['newPassword'].value;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('&') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('+') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('%') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('"') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('\\') > -1) ? true : false;
    }
    if (!unsupportedcharacters && !!valForm.controls['confirmNewPassword'].value && !!valForm.controls['confirmNewPassword'].value != null) {
      var theValue = valForm.controls['confirmNewPassword'].value;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('&') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('+') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('%') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('"') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('\\') > -1) ? true : false;
    }

    // set/clear the error
    return unsupportedcharacters ? { 'unsupportedcharacters': true } : null;
  }
  unsupportedUserNameCharacters(valForm: FormGroup) {

    let unsupportedcharacters: boolean = false;

    if (!unsupportedcharacters && !!valForm.controls['username'].value && !!valForm.controls['username'].value != null) {
      var theValue = valForm.controls['username'].value;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('&') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('+') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('%') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('"') > -1) ? true : false;
      unsupportedcharacters = (unsupportedcharacters || theValue.indexOf('\\') > -1) ? true : false;
    }    

    // set/clear the error
    return unsupportedcharacters ? { 'unsupportedUserNameCharacters': true } : null;
  }


  /**
  * Support this method is you require Modal Submit button state handling. ie. disable the submit button if any validation errors exist.
  */
  public checkIfSubmitIsDisabled(): boolean {

    return this.parentSubmitIsDisabled;
  }

  submitPasswordChangeForm() {
    const password = this.passwordResetForm.controls.password.value;
    const newPassword = this.passwordResetForm.controls.newPassword.value;
    const confirmNewPassword = this.passwordResetForm.controls.confirmNewPassword.value;

    // Reset the flags
    this.isSuccess = false;
    this.changePasswordFormSubmitted = false;

    this.userProfileService.resetPassword(this.user.username, password, newPassword, confirmNewPassword).subscribe(
      (response: boolean) => {
        this.isSuccess = response;
        this.changePasswordFormSubmitted = true;

        this.passwordResetForm.reset();
      },
      // Error callback
      () => {
        this.isSuccess = false;
        this.changePasswordFormSubmitted = true;

        this.passwordResetForm.reset();
      }
    );
  }

  public modalCallbackCancel() {
    console.log("Closing change password modal popup");

    this.passwordResetForm.reset();
  }

  /**
   * Event that is called when the selected trade value is changed.
   * @param selectedValue The selected Trade value.
   */
  onTradeChange(event: any) {
    const industry = this.sharedService.getIndustryEnumNameForProvidedTrade(event ? event.selectedValue : '');

    // Set the global industry item
    this.selectedIndustry = industry;
  }

  public onDeactivate(componentRef: IGenericChanges) {
    console.info(`Deactivating`);
  }


}
