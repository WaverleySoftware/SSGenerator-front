import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { AbstractControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, takeUntil } from "rxjs/operators";
import { Preference } from "sizing-shared-lib";
import {
  FormFieldTypesInterface,
  SteamCalorificRequestInterface,
  SteamGeneratorInputsInterface
} from "../steam-generation-form.interface";
import { SteamGenerationAssessmentService } from "../steam-generation-assessment.service";

@Component({
  selector: 'app-sga-input-parameters',
  templateUrl: './sga-input-parameters.component.html',
  styleUrls: ['./sga-input-parameters.component.scss']
})
export class SgaInputParametersComponent implements OnDestroy {
  @Input() formGroup: FormGroup;
  @Input() moduleGroupId: number;
  @Output() changeFuelType: EventEmitter<SteamCalorificRequestInterface> = new EventEmitter<SteamCalorificRequestInterface>();

  public fuelType: Preference
  public fields: FormFieldTypesInterface;
  public carbonEmissionUpdate$ = new Subject<string>();
  public pressureTemperatureUpdate$ = new Subject<string>();
  public formGroupKey = 'steamGeneratorInputs'; // Form builder child formGroup key

  private _ngUnsubscribe = new Subject<void>();

  constructor(
    private steamGenerationAssessmentService: SteamGenerationAssessmentService,
    private elRef: ElementRef,
  ) {
    this.fields = this.steamGenerationAssessmentService.getSgaFormFields();

    // Calculate Carbon emission
    this.carbonEmissionUpdate$
      .pipe(
        takeUntil(this._ngUnsubscribe),
        debounceTime(800),
        distinctUntilChanged(),
        filter(v => !!v)
      )
      .subscribe(v => this._changeCarbonEmission(v));

    this.pressureTemperatureUpdate$
      .pipe(
        takeUntil(this._ngUnsubscribe),
        debounceTime(800),
        distinctUntilChanged(),
        filter(v => !!v)
      )
      .subscribe(v => this._changeSteamPressure(v));
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  /**
   * Clear fields value when user change radio or another variant
   * **/
  public clearValues(clearFields: Array<keyof SteamGeneratorInputsInterface>, setVal: any = 0, event?: any) {
    if (!clearFields.length) return;

    for (let fieldName of clearFields) {
      this.steamGenerationAssessmentService.setFormValue(fieldName, setVal);
    }
  }

  /**
   * by default - Set unit names to FormFieldTypesInterface
   * but you can change parameters and set another data to FormFieldTypesInterface
   * **/
  public setFuelType(
    fieldName: keyof FormFieldTypesInterface,
    index: 0 | 1 = 1,
    value: string = this.fuelType && this.fuelType.name,
    key: 'unitNames' | 'translations' = 'unitNames'
  ): [string, string?] {
    if (this.fields[fieldName]) {
      if (!this.fields[fieldName][key]) {
        this.fields[fieldName][key] = [null, null];
      }

      this.fields[fieldName][key][index] = value;
    }

    return this.fields[fieldName][key];
  }

  public changeFuelTypeHandle(preference: Preference): void {
    if (this.fuelType && preference) { // Not first init
      this.changeFuelType.emit({
        inputFuelId: this.formGroup.get(`${this.formGroupKey}.inputFuelId`).value,
        inputFuelUnit: this.formGroup.get(`${this.formGroupKey}.inputFuelUnit`).value,
        energyUnitSelected: null, // From preferences
        smallWeightUnitSelected: null, // From preferences
      });
    }

    this.fuelType = preference;
  }

  /**
   * form-input Component inputChangeEvent (change)
   * @pram { name: formControlName; value: input value }
   * **/
  public inputChangeHandle({ name, value }: { name: string, value: any }): void {
    this._disableFilled(name as keyof FormFieldTypesInterface);

    switch (name) {
      case 'fuelEnergyPerUnit': this.carbonEmissionUpdate$.next(value); break;
      case 'boilerSteamPressure': this.pressureTemperatureUpdate$.next(value); break;
    }
  }

  public focusOnField(formControlName: keyof SteamGeneratorInputsInterface, isFocused: boolean = true): void {
    if (isFocused) {
      const field = this.elRef.nativeElement
        .querySelector(`[ng-reflect-name="${formControlName}"] input[type="number"]`);

      if (field && field.focus) {
        setTimeout(() => field.focus(), 100);
      }
    }
  }

  /**
   * @name isRequired check is field has required validator
   * @param {string} controlName name of Inputs form field
   * @returns {boolean} is has Validators.required
   * */
  public isRequired(controlName: keyof SteamGeneratorInputsInterface): boolean {
    const control = this.formGroup.get(`${this.formGroupKey}.${controlName}`);
    const validator = control && control.validator && control.validator({} as AbstractControl);

    return validator && validator.required;
  }

  private _changeSteamPressure(boilerSteamPressureValue): void {
    const selectedUnits = this.steamGenerationAssessmentService.getSizingPreferenceValues({
      temperatureUnitSelected: 'TemperatureUnit',
      pressureUnitSelected: 'PressureUnit',
    }) as { temperatureUnitSelected: number; pressureUnitSelected: number; };
    const inputValues = this._getMultipleControlValues({
      isSuperheatedSteam: 'isSuperheatedSteam',
      boilerSteamPressure: 'boilerSteamPressure',
      boilerSteamTemperature: 'boilerSteamTemperature',
    }) as { isSuperheatedSteam: boolean; boilerSteamPressure: number; boilerSteamTemperature: number; };

    if (inputValues.isSuperheatedSteam && inputValues.boilerSteamPressure) {
      this.formGroup.get(`${this.formGroupKey}.boilerSteamTemperature`).clearValidators();
      this.formGroup.get(`${this.formGroupKey}.boilerSteamTemperature`).updateValueAndValidity()
    }

    this.steamGenerationAssessmentService.calculateSaturatedAndTemperature({...selectedUnits, ...inputValues, boilerSteamTemperature: null })
      .pipe(takeUntil(this._ngUnsubscribe), filter(res => res && (res.isValid === undefined || res.isValid)))
      .subscribe(({ boilerSteamTemperature }) => {
        if (boilerSteamTemperature && boilerSteamTemperature.boilerSteamTemperature) {

          this.steamGenerationAssessmentService
            .changeSgaFieldFilled('boilerSteamTemperature', true);
          this.steamGenerationAssessmentService
            .setFormValue('boilerSteamTemperature', boilerSteamTemperature.boilerSteamTemperature);
          this.formGroup
            .get(`${this.formGroupKey}.boilerSteamTemperature`)
            .setValidators([Validators.min(boilerSteamTemperature.boilerSteamTemperature)]);
          this.formGroup
            .get(`${this.formGroupKey}.boilerSteamTemperature`)
            .updateValueAndValidity({ onlySelf: true })
        }
        console.log(boilerSteamTemperature, '-----_changeSteamPressure() [RESPONSE]');
      });
  }

  private _changeCarbonEmission(fuelEnergyPerUnit): void {
    const { energyUnitSelected, smallWeightUnitSelected } = this.steamGenerationAssessmentService.getSizingPreferenceValues({
        energyUnitSelected: 'BoilerHouseEnergyUnits',
        smallWeightUnitSelected: 'WeightUnit'
      });

    const { inputFuelId, inputFuelUnit, fuelCarbonContent } = this._getMultipleControlValues({
      inputFuelId: 'inputFuelId',
      inputFuelUnit: 'inputFuelUnit',
      fuelCarbonContent: 'inputFuelUnit',
    });

    const req = {
      energyUnitSelected,
      smallWeightUnitSelected,
      inputFuelId,
      inputFuelUnit,
      fuelEnergyPerUnit,
      fuelCarbonContent
    }

    this.steamGenerationAssessmentService
      .calculateCarbonEmission(req)
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((res) => this._setInputFormFields(res));
  }

  private _setInputFormFields(data: Partial<Record<keyof FormFieldTypesInterface, any>>): void {
    for (let formKey in data) {
      this.steamGenerationAssessmentService.changeSgaFieldFilled(formKey as keyof FormFieldTypesInterface, true);
      this.steamGenerationAssessmentService.setFormValue(formKey, data[formKey]);
    }
  }

  private _disableFilled(fieldName: keyof FormFieldTypesInterface): void {
    if (this.fields[fieldName].filled) {
      this.steamGenerationAssessmentService.changeSgaFieldFilled(fieldName, false);
    }
  }

  private _getMultipleControlValues(obj: { [key: string]: string }): {[key: string]: any} {
    const result = {};

    for (let objKey in obj) {
      result[objKey] = this.formGroup.get(`${this.formGroupKey}.${obj[objKey]}`).value;
    }

    return result;
  }
}
