import { TestBed, ComponentFixture, async, inject } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClientModule } from "@angular/common/http";
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { Observable } from "rxjs/Rx";


// import { RoutesModule } from '../routes.module';

import { RegisterComponent } from './register.component';
import { SettingsService } from '../../core/settings/settings.service';
import { AdminService } from "../admin/admin.service";
import { UserValidator } from "../../shared/validators/user.validator";

describe('Component: Register', () => {

  let comp: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let adminService: AdminService;
  let userValidator: UserValidator;

  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      // Note: Don't declare compoent if it is already decalred in the imported module
      // https://stackoverflow.com/questions/45764202/angular-test-fails-because-component-is-part-of-the-declarations-of-2-modules
      //declarations: [RegisterComponent],
      imports: [ReactiveFormsModule, RouterTestingModule,
         // RoutesModule,
         HttpClientModule],
      // Note: Footer depends on the SettingsService
      providers: [FormBuilder, AdminService, UserValidator, SettingsService]
    }).compileComponents(); // compile template and css
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    comp = fixture.componentInstance;

    //get the injected service from component's fixture.debugElement
    //if the service doesn't have a dependency, you can try Testbed.get()
    adminService = fixture.debugElement.injector.get(AdminService);
  });

  it('should have a Component', () => {
    expect(comp).toBeTruthy();
    console.log(comp);
  });


  function updateForm(username, firstname, lastname, email, password, confirmPassword, memorableword, language, country) {
    comp.registerForm.controls['username'].setValue(username);
    comp.registerForm.controls['firstname'].setValue(firstname);
    comp.registerForm.controls['lastname'].setValue(lastname);
    comp.registerForm.controls['email'].setValue(email);
    comp.registerForm.controls['password'].setValue(password);
    comp.registerForm.controls['confirmPassword'].setValue(confirmPassword);
    comp.registerForm.controls['memorableword'].setValue(memorableword);
    comp.registerForm.controls['language'].setValue(language);
    comp.registerForm.controls['country'].setValue(country);
  }

  it('validations', (done) => {
    fixture.detectChanges();
    let registerForm = comp.registerForm;

    //username is required
    // TODO: Need to figure out a way for testing the async validator.
    expect(registerForm.get('username').valid).toEqual(false);
    registerForm.get('username').setValue('test1234');

    userValidator = TestBed.get(UserValidator);
    let spy = spyOn(userValidator, 'usernameValidator').and.returnValue(Promise.resolve(false));
    spy.calls.mostRecent().returnValue.then(() => {
      expect(registerForm.get('username').valid).toEqual(true);
      done();
    });

    ////firstname is required
    expect(registerForm.get('firstname').valid).toEqual(false);
    registerForm.get('firstname').setValue('test');
    expect(registerForm.get('firstname').valid).toEqual(true);

    ////lastname is required
    expect(registerForm.get('lastname').valid).toEqual(false);
    registerForm.get('lastname').setValue('test');
    expect(registerForm.get('lastname').valid).toEqual(true);

    //// email is required
    // TODO: Need to figure out a way for testing the async validator.
    //expect(registerForm.get('email').valid).toEqual(false);
    //registerForm.get('email').setValue('test@gmail.com');
    //expect(registerForm.get('email').valid).toEqual(true);

    ////password is required
    expect(registerForm.get('password').valid).toEqual(false);
    registerForm.get('password').setValue('test');
    expect(registerForm.get('password').valid).toEqual(true);

    ////confirmPassword is required
    //expect(registerForm.get('confirmPassword').valid).toEqual(false);
    //registerForm.get('confirmPassword').setValue('test');
    //expect(registerForm.get('confirmPassword').valid).toEqual(true);

    ////memorableword is required
    expect(registerForm.get('memorableword').valid).toEqual(false);
    registerForm.get('memorableword').setValue('test');
    expect(registerForm.get('memorableword').valid).toEqual(true);

    ////language is required
    //expect(registerForm.get('language').valid).toEqual(false);
    //registerForm.get('language').setValue('test');
    //expect(registerForm.get('language').valid).toEqual(true);

    ////country is required
    //expect(registerForm.get('country').valid).toEqual(false);
    //registerForm.get('country').setValue('test');
    //expect(registerForm.get('country').valid).toEqual(true);
  });
});
