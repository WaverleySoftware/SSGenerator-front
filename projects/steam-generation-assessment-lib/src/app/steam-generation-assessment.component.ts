import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from "@angular/core";
import {
  BaseSizingModule,
  JobSizing,
  PreferenceService,
  Project,
  UnitsService,
  UnitConvert,
  ModulePreferenceService,
  TranslationService
} from "sizing-shared-lib";
import { FormGroup } from "@angular/forms";
import { SteamGenerationAssessmentService } from "./steam-generation-assessment.service";
import { ActivatedRoute, Params } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import {
  FormFieldTypesInterface, SgaBoilerEfficiencyInterface,
  SteamCalorificRequestInterface,
  SteamGeneratorInputsInterface
} from "./steam-generation-form.interface";

@Component({
  selector: 'app-steam-generation-assessment',
  templateUrl: './steam-generation-assessment.component.html',
  styleUrls: ['./steam-generation-assessment.component.scss']
})
export class SteamGenerationAssessmentComponent extends BaseSizingModule implements OnInit, OnDestroy, AfterViewInit {
  readonly moduleGroupId: number = 9;
  readonly moduleName: string = 'steamGenerationAssessment';
  public moduleId = 2;
  public requestLoading: Subject<boolean> = this.steamGenerationAssessmentService.requestLoading;
  public productName = 'Steam Generation Assessment';
  public sizingModuleForm: FormGroup = this.steamGenerationAssessmentService.getSizingFormGroup();
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private steamGenerationAssessmentService: SteamGenerationAssessmentService,
    private preferenceService: PreferenceService,
    private unitsService: UnitsService,
    private elRef: ElementRef,
    private activatedRoute: ActivatedRoute,
    private modulePreferenceService: ModulePreferenceService,
    protected translationService: TranslationService,
  ) {
    super();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this._initializedData(); // Load start module data
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.preferenceService.clearUnitPreferences();
  }

  onCalculateSizing(formGroup: FormGroup): any {
    this.steamGenerationAssessmentService
      .calculateResults(formGroup.value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response) => {
        console.log(response, '-----response');
      });
    return true;
  }

  onEnterHeaderDetailsForm(): any {
    return true;
  }

  onExcelSubmit(): any {
    return true;
  }

  onGetTiSheet(): any {
    return true;
  }

  onNewSizingForm(): any {
    console.log('-----onNewSizingForm----')
    return true;
  }

  onPdfSubmit(): any {
    return true;
  }

  onResetModuleForm(): any {
    return true;
  }

  onSave(savedProjectDetails: Project): JobSizing {
    console.log('-----onSAve-----');
    return undefined;
  }

  onSaveJob(): any {
    console.log('-----onSaveJob-----');
    return true;
  }

  onUnitsChanged(): any {
    console.log('----- CHANGE_UNITS -----');
    this.steamGenerationAssessmentService.changeSizingUnits();
    this._calculateCalorificValue(); // Calculate CALORIFIC VALUE request on unit changed
    return true;
  }

  repackageSizing(): any {
    return true;
  }

  public changeFuelType(fuelTypeData: SteamCalorificRequestInterface): void {
    this._calculateCalorificValue(fuelTypeData);
  }

  public calculateBoilerEfficiency(data: SgaBoilerEfficiencyInterface = {inputFuelId: null, isEconomizerPresent: undefined}): void {
    if (!data.inputFuelId) {
      data.inputFuelId = this.sizingModuleForm.get('steamGeneratorInputs.inputFuelId').value;
    }

    if (!data || data.isEconomizerPresent === undefined) {
      data.isEconomizerPresent = this.sizingModuleForm.get('steamGeneratorInputs.isEconomizerPresent').value;
    }

    if (!data.inputFuelId || data.isEconomizerPresent === undefined) return null;

    this.steamGenerationAssessmentService.calculateBoilerEfficiency(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ boilerEfficiency }) => {
        this.steamGenerationAssessmentService.changeSgaFieldFilled('boilerEfficiency', true);
        this.steamGenerationAssessmentService.setFormValue('boilerEfficiency', boilerEfficiency);
      });
  }

  private _initializedData(): void {
    // this.loadJob();
    this._setDefaultValues();
    this.steamGenerationAssessmentService.setSelectedValues();
  }

  private getFuelTypeData(staticData?: SteamCalorificRequestInterface): SteamCalorificRequestInterface {
    let energyUnitSelected = staticData && staticData.energyUnitSelected;
    let smallWeightUnitSelected = staticData && staticData.smallWeightUnitSelected ||
      this.sizingModuleForm.get('selectedUnits.smallWeightUnitSelected').value;

    if (!energyUnitSelected) {
      energyUnitSelected = this.steamGenerationAssessmentService
        .getSizingPreferenceValues({energyUnitSelected: 'BoilerHouseEnergyUnits'})
        .energyUnitSelected;
    }

    if (!smallWeightUnitSelected) {
      smallWeightUnitSelected = this.steamGenerationAssessmentService
        .getSizingPreferenceValues({smallWeightUnitSelected: 'WeightUnit'})
        .smallWeightUnitSelected;
    }

    return {
      energyUnitSelected,
      smallWeightUnitSelected,
      inputFuelId: (staticData && staticData.inputFuelId) ||
        this.sizingModuleForm.get('steamGeneratorInputs.inputFuelId').value,
      inputFuelUnit: (staticData && staticData.inputFuelUnit) ||
        this.sizingModuleForm.get('steamGeneratorInputs.inputFuelUnit').value,
    };
  }

  private _calculateCalorificValue(data?: SteamCalorificRequestInterface): void {
    const fuelTypeData = this.getFuelTypeData(data);

    this.steamGenerationAssessmentService
      .calculateCalorific(fuelTypeData)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response) => {
        if (response && typeof response === "object") {
          for (let responseKey in response) {
            this.steamGenerationAssessmentService
              .changeSgaFieldFilled(responseKey as keyof FormFieldTypesInterface, true);
            this.steamGenerationAssessmentService
              .setFormValue(responseKey, response[responseKey]);
          }
        }
      });
  }

  private _setDefaultValues(): void {
    if (!this.modulePreferenceService.allModulePreferences ||
      !this.modulePreferenceService.allModulePreferences.length) return null;

    const defPreferences = this.modulePreferenceService.allModulePreferences;
    const { emissionUnitSelected, volumeUnitSelected } = this.steamGenerationAssessmentService
      .getSizingPreferenceValues({
        emissionUnitSelected: 'BoilerHouseEmissionUnits',
        volumeUnitSelected: 'BoilerHouseVolumeUnits'
      });
    const fuelUnitTypeId = this.sizingModuleForm.get('steamGeneratorInputs.inputFuelUnit').value;
    const obj: {[key: string]: UnitConvert} = {
      costOfCo2PerUnitMass: {
        convertedValue: null,
        propertyName: 'costOfCo2PerUnitMass',
        initialValue: 0,
        initialUnitId: null,
        targetUnitId: emissionUnitSelected,
      },
      costOfEffluentPerUnit: {
        convertedValue: null,
        propertyName: 'costOfEffluentPerUnit',
        initialValue: 0,
        initialUnitId: null,
        targetUnitId: volumeUnitSelected,
      },
      costOfFuelPerUnit: {
        convertedValue: null,
        propertyName: 'costOfFuelPerUnit',
        initialValue: 0,
        initialUnitId: null,
        targetUnitId: fuelUnitTypeId,
      },
      costOfWaterPerUnit: {
        convertedValue: null,
        propertyName: 'costOfWaterPerUnit',
        initialValue: 0,
        initialUnitId: null,
        targetUnitId: volumeUnitSelected,
      },
    };

    for (let {name, value} of defPreferences) {
      switch (name) {
        case 'SteamGenerationCO2Cost': { // costOfCo2PerUnitMass
          obj.costOfCo2PerUnitMass['initialValue'] = Number(value);
          break;
        }
        case 'SteamGenerationCO2CostUnit': { // emissionUnitSelected
          obj.costOfCo2PerUnitMass['initialUnitId'] = Number(value);
          break;
        }
        case 'SteamGenerationEffluentCost': { // costOfEffluentPerUnit
          obj.costOfEffluentPerUnit['initialValue'] = Number(value);
          break;
        }
        case 'SteamGenerationEffluentCostUnit': { // volumeUnitSelected
          obj.costOfEffluentPerUnit['initialUnitId'] = Number(value);
          break;
        }
        case 'SteamGenerationFuelCost': { // costOfFuelPerUnit
          obj.costOfFuelPerUnit['initialValue'] = Number(value);
          break;
        }
        case 'SteamGenerationFuelType': { // inputFuelId
          const fuelTypeId = this._getFuelTypeListItemId(value);
          this.steamGenerationAssessmentService.setFormValue('inputFuelId', fuelTypeId);
          break;
        }
        case 'SteamGenerationFuelUnit': { // inputFuelUnit
          this.steamGenerationAssessmentService.setFormValue('inputFuelUnit', Number(value));
          obj.costOfFuelPerUnit['initialUnitId'] = Number(value);
          break;
        }
        case 'SteamGenerationWaterCost': { // costOfWaterPerUnit
          obj.costOfWaterPerUnit['initialValue'] = Number(value);
          break;
        }
        case 'SteamGenerationWaterCostUnit': { // volumeUnitSelected
          obj.costOfWaterPerUnit['initialUnitId'] = Number(value);
          break;
        }
        case 'SteamGenerationWaterTreatmentCost': break;
        case 'SteamGenerationWaterTreatmentCostUnit': break;
      }
    }

    const unitsConverterValues: UnitConvert[] = Object.keys(obj)
      .filter((key) => {
        const { initialUnitId, targetUnitId, initialValue } = obj[key];

        if (!initialUnitId || !targetUnitId) return false;

        if (initialUnitId === targetUnitId) {
          this.steamGenerationAssessmentService.changeSgaFieldFilled(key as keyof SteamGeneratorInputsInterface, true);
          this.steamGenerationAssessmentService.setFormValue(key, initialValue);
          return false;
        }

        return true;
      })
      .map((key) => obj[key]);


    this.unitsService.unitsConverter({unitsConverter: unitsConverterValues})
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ unitsConverter }) => {
        if (unitsConverter && unitsConverter.length) {
          const newValues = unitsConverter
            .reduce((accum, item) => {
              this.steamGenerationAssessmentService
                .changeSgaFieldFilled(item.propertyName as keyof SteamGeneratorInputsInterface, true);
              return {...accum, [item.propertyName]: item.convertedValue};
            }, {});

          this.steamGenerationAssessmentService.setFormValues(newValues);
          this._calculateCalorificValue(); // Calculate CALORIFIC VALUE request on init
        }
      });

    this.calculateBoilerEfficiency();
  }

  private _getFuelTypeListItemId(value: string): string | number {
    if (!value || !this.translationService.displayGroup.enumerations) return null;

    const enumeration = this.translationService.displayGroup.enumerations.find(({enumerationName, opCoOverride}) =>
      enumerationName === 'FuelTypeList_BoilerHouseInput' && opCoOverride === false
    );

    if (!enumeration || !enumeration.enumerationDefinitions) return null;

    const item = enumeration.enumerationDefinitions.find((v) => v.value === value);

    return item && item.id;
  }

  // TODO: Function for focus on first invalid field (need to create toggle tabs to first invalid field)
  private _focusFirstErrorField(formGroup: FormGroup): void {
    // check all fields
    for (const key of Object.keys(formGroup.controls)) {
      // get first invalid control
      if (formGroup.controls[key].invalid) {
        // get field by formcontrolname === name
        const field = this.elRef.nativeElement.querySelector(`[formcontrolname="${key}"] input[ng-reflect-model]`);
        // Focus on field
        field && field.focus();
        // loop stop
        break;
      }
    }
  }

  private _loadJob(): void {
    this.activatedRoute.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params: Params) => {
        const { projectId, jobId } = params;
        // TODO: Create projects/jobs functionality
        console.log(`projectId=${projectId}, jobId=${jobId}`);
      });
  }
}
