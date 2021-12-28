import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { AbstractControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, takeUntil } from "rxjs/operators";
import {
	BoilerHouseBoilerTabFields, BoilerHouseFeedwaterAndCondensateTabFields,
	BoilerHouseTdsBlowdownTabFields,
	BoilerHouseWaterTreatmentTabFields,
	FormFieldTypesInterface,
	SgaBoilerEfficiencyInterface, SgaFuelTypes,
	SteamCalorificRequestInterface,
	SteamCarbonEmissionInterface,
	SteamGeneratorInputsInterface,
	UtilityParametersFields
} from "../steam-generation-form.interface";
import { SteamGenerationAssessmentService } from "../steam-generation-assessment.service";
import { EnumerationDefinition } from "sizing-shared-lib";


@Component({
  selector: 'app-sga-input-parameters',
  templateUrl: './sga-input-parameters.component.html',
  styleUrls: ['./sga-input-parameters.component.scss']
})
export class SgaInputParametersComponent implements OnDestroy {
  @Input() formGroup: FormGroup;
  @Input() moduleGroupId: number;
  @Output() changeFuelType: EventEmitter<SteamCalorificRequestInterface> = new EventEmitter<SteamCalorificRequestInterface>();
  @Output() calculateEfficiency: EventEmitter<SgaBoilerEfficiencyInterface> = new EventEmitter<SgaBoilerEfficiencyInterface>();
  @Output() changeWaterTreatment: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeCarbonEmission: EventEmitter<SteamCarbonEmissionInterface> = new EventEmitter<SteamCarbonEmissionInterface>();

  public fields: FormFieldTypesInterface;
  public carbonEmissionUpdate$ = new Subject<string>();
  public pressureTemperatureUpdate$ = new Subject<string>();
  public formGroupKey = 'benchmarkInputs'; // Form builder child formGroup key

  public fuelTypeName: string;
  private _ngUnsubscribe = new Subject<void>();
	private _boilerHouseParametersTabs = {
		boiler: BoilerHouseBoilerTabFields,
		tdsBlowdown: BoilerHouseTdsBlowdownTabFields,
		waterTreatment: BoilerHouseWaterTreatmentTabFields,
		feedwaterAndCondensate: BoilerHouseFeedwaterAndCondensateTabFields,
	};

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

  public checkUtilityParametersIsValid(): boolean {
    let isInvalid: boolean;

    for (let utilityParametersField of SgaInputParametersComponent._enumToArray(UtilityParametersFields)) {
      const control = this.formGroup.get(`${this.formGroupKey}.${utilityParametersField}`);

			if (control) {
				const inFieldInvalid = (control.invalid && control.touched) || (control.touched && control.pending);

				if (inFieldInvalid) {
					isInvalid = inFieldInvalid;
					break;
				}
			}
    }

    return isInvalid;
  }

  public checkBoilerHouseParametersIsValid(): {
    boiler: boolean;
    tdsBlowdown: boolean;
    waterTreatment: boolean;
    feedwaterAndCondensate: boolean;
    isInvalid: boolean;
  } {
    let isInvalid = {
      boiler: false,
      tdsBlowdown: false,
      waterTreatment: false,
      feedwaterAndCondensate: false,
      isInvalid: false,
    };

	  for (let listKey in this._boilerHouseParametersTabs) {

		  for (let fieldName of SgaInputParametersComponent._enumToArray(this._boilerHouseParametersTabs[listKey])) {
			  const control = this.formGroup.get(`${this.formGroupKey}.${fieldName}`);
			  const inFieldInvalid = control && ((control.invalid && control.touched) || (control.touched && control.pending));

			  if (inFieldInvalid) {
			    isInvalid[listKey] = inFieldInvalid;
			    isInvalid.isInvalid = true;
			    break;
			  }
		  }
	  }

    return isInvalid;
  }

	public updateFuelUnit({item, name, value}: {name: string; value: number; item: EnumerationDefinition}) {
		if (!item || !item.value || !name || !value) return;

		if (item.value.charAt(0).toUpperCase() === 'O') {
			this.fields.fuelCarbonContent.unitNames = ['BoilerHouseEmissionUnits'];
		} else {
			this.steamGenerationAssessmentService.setFuelTypeForFields(SgaFuelTypes[name]);
		}

		// Check selected energy and fuel units
		const fuelEnergyPerUnit = this.formGroup.get(`${this.formGroupKey}.fuelEnergyPerUnit`);
		const energyUnitSelected = this.formGroup.get('selectedUnits.energyUnitSelected');

		if (energyUnitSelected.value === value) {
			fuelEnergyPerUnit.enabled && fuelEnergyPerUnit.disable();
		} else if (fuelEnergyPerUnit.disabled) {
			fuelEnergyPerUnit.enable()
		}
	}

  public changeFuelTypeHandle(fuelTypeId: string): void {
    const {inputFuelId, isEconomizerPresent} = this.steamGenerationAssessmentService.getMultipleControlValues({
      inputFuelId: 'inputFuelId',
      isEconomizerPresent: 'isEconomizerPresent'
    });
    const {energyUnitSelected, smallWeightUnitSelected, fuelUnitSelected} = this.steamGenerationAssessmentService.getMultipleControlValues({
      energyUnitSelected: 'energyUnitSelected',
      smallWeightUnitSelected: 'smallWeightUnitSelected',
      fuelUnitSelected: 'fuelUnitSelected'
    }, 'selectedUnits');

    this.changeFuelType.emit({inputFuelId, fuelUnitSelected, energyUnitSelected, smallWeightUnitSelected});
    this.calculateEfficiency.emit({ inputFuelId, isEconomizerPresent })
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

  public disableField(fieldName: string | string[]): void {
    if (Array.isArray(fieldName)) {
      for (let name of fieldName) {
        this._disableControl(name);
      }
    } else {
      this._disableControl(fieldName);
    }
  }

  public changeIsHeatExchangerPresent(isActive: boolean): void {
    if (isActive) {
      const temperatureUnitSelected = this.formGroup.get('selectedUnits.temperatureUnitSelected').value;

      if (!temperatureUnitSelected) return null;

      this.steamGenerationAssessmentService.calculateWaterTemperatureLeaving({temperatureUnitSelected})
        .pipe(takeUntil(this._ngUnsubscribe))
        .subscribe(({waterTemperatureLeavingHeatExchanger}) => {
          if (waterTemperatureLeavingHeatExchanger) {
            this.steamGenerationAssessmentService
              .changeSgaFieldFilled('waterTemperatureLeavingHeatExchanger', true);
            this.steamGenerationAssessmentService
              .setFormValue('waterTemperatureLeavingHeatExchanger', waterTemperatureLeavingHeatExchanger)
          }
        })
    }
  }

  public setPressureDeaerator(data): void {
    this.steamGenerationAssessmentService.calculateFeedTankAndPressure({
      isPressureDeaerator: true,
      pressureOfFeedtank: this.formGroup.get(`${this.formGroupKey}.pressureOfFeedtank`).value,
      pressureUnitSelected: this.formGroup.get('selectedUnits.pressureUnitSelected').value,
      temperatureOfFeedtank: this.formGroup.get(`${this.formGroupKey}.temperatureOfFeedtank`).value,
      temperatureUnitSelected: this.formGroup.get('selectedUnits.temperatureUnitSelected').value,
    })
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((res) => {
        const {
          dialogMessage = "",
          pressureOfFeedtank = 0.2,
          temperatureOfFeedtank = 105
        } = res;
        this.steamGenerationAssessmentService.changeSgaFieldFilled('pressureOfFeedtank', true)
        this.steamGenerationAssessmentService.changeSgaFieldFilled('temperatureOfFeedtank', true)

        this.steamGenerationAssessmentService.setFormValue('pressureOfFeedtank', pressureOfFeedtank);
        this.steamGenerationAssessmentService.setFormValue('temperatureOfFeedtank', temperatureOfFeedtank);
      })
  }

  private _changeSteamPressure(boilerSteamPressureValue): void {
    const selectedUnits = this.steamGenerationAssessmentService.getSizingPreferenceValues({
      temperatureUnitSelected: 'TemperatureUnit',
      pressureUnitSelected: 'PressureUnit',
    }) as { temperatureUnitSelected: number; pressureUnitSelected: number; };
    const inputValues = this.steamGenerationAssessmentService.getMultipleControlValues({
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
        const temperature = boilerSteamTemperature && boilerSteamTemperature.boilerSteamTemperature;

        if (temperature) {
          this.formGroup
            .get(`${this.formGroupKey}.boilerSteamTemperature`)
            .setValidators([Validators.required, Validators.min(temperature)]);

          if (
            !inputValues.isSuperheatedSteam || !inputValues.boilerSteamTemperature ||
            inputValues.boilerSteamTemperature < boilerSteamTemperature.boilerSteamTemperature
          ) {
            this.steamGenerationAssessmentService
              .changeSgaFieldFilled('boilerSteamTemperature', true);
            this.steamGenerationAssessmentService
              .setFormValue('boilerSteamTemperature', temperature);
            this.formGroup
              .get(`${this.formGroupKey}.boilerSteamTemperature`)
              .updateValueAndValidity({ onlySelf: true });
          }
        }
      });
  }

  private _changeCarbonEmission(fuelEnergyPerUnit): void {
    const { energyUnitSelected, smallWeightUnitSelected, fuelUnitSelected } = this.steamGenerationAssessmentService.getSizingPreferenceValues({
        energyUnitSelected: 'BoilerHouseEnergyUnits',
        smallWeightUnitSelected: 'WeightUnit'
      });
    const { inputFuelId, fuelCarbonContent } = this.steamGenerationAssessmentService.getMultipleControlValues({
      inputFuelId: 'inputFuelId',
      fuelCarbonContent: 'fuelCarbonContent'
    });

    this.changeCarbonEmission.emit({
      energyUnitSelected,
      smallWeightUnitSelected,
      inputFuelId,
      fuelUnitSelected,
      fuelEnergyPerUnit,
      fuelCarbonContent
    });
  }

  private _disableFilled(fieldName: keyof FormFieldTypesInterface): void {
    if (this.fields[fieldName].filled) {
      this.steamGenerationAssessmentService.changeSgaFieldFilled(fieldName, false);
    }
  }

  private _disableControl(controlName: string): AbstractControl {
    const control = this.formGroup.get(`${this.formGroupKey}.${controlName}`);

    if (!control || control.disabled) return null;

    control.disable({ onlySelf: true });

    return control;
  }

	private static _enumToArray(data: Object): any[] {
		const keys = Object.keys(data);
		return keys.slice(keys.length / 2);
	}
}
