import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from "@angular/core";
import {
  BaseSizingModule,
  JobSizing,
  ModulePreferenceService,
  PreferenceService,
  Project,
  TranslationService,
  UnitConvert,
  UnitsService
} from "sizing-shared-lib";
import { FormGroup } from "@angular/forms";
import { SteamGenerationAssessmentService } from "./steam-generation-assessment.service";
import { ActivatedRoute, Params } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil, tap } from "rxjs/operators";
import {
  FormFieldTypesInterface,
  SgaBoilerEfficiencyInterface,
  SteamCalorificRequestInterface, SteamCarbonEmissionInterface,
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
  public requestLoading: Subject<boolean> = this.sgaService.requestLoading;
  public productName = 'Steam Generation Assessment';
  public sizingModuleForm: FormGroup = this.sgaService.getSizingFormGroup();
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private sgaService: SteamGenerationAssessmentService,
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
    const converterUnits = this._getDefaultConvertedUnits();

    this._convertUnits(converterUnits);
    this.sgaService.setSelectedValues();
    this.calculateBoilerEfficiency();
    this._calculateWaterTreatment();


  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.preferenceService.clearUnitPreferences();
  }

  onCalculateSizing(formGroup: FormGroup): any {
    this.sgaService
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
    const unitsConverter = this.sgaService.changeSizingUnits();
    this._convertUnits(unitsConverter);

    return true;
  }

  repackageSizing(): any {
    return true;
  }

  public changeFuelType(fuelTypeData: SteamCalorificRequestInterface): void {
    this._calculateCalorificValue(fuelTypeData);
  }

  public changeWaterTreatment({ selectedValue }: { selectedValue: string }): void {
    selectedValue && this._calculateWaterTreatment(selectedValue);
  }

  public calculateBoilerEfficiency(data: SgaBoilerEfficiencyInterface = {inputFuelId: null, isEconomizerPresent: undefined}): void {
    if (!data.inputFuelId) {
      data.inputFuelId = this.sizingModuleForm.get('steamGeneratorInputs.inputFuelId').value;
    }

    if (!data || data.isEconomizerPresent === undefined) {
      data.isEconomizerPresent = this.sizingModuleForm.get('steamGeneratorInputs.isEconomizerPresent').value;
    }

    if (!data.inputFuelId || data.isEconomizerPresent === undefined) return null;

    this.sgaService.calculateBoilerEfficiency(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ boilerEfficiency }) => {
        this.sgaService.changeSgaFieldFilled('boilerEfficiency', true);
        this.sgaService.setFormValue('boilerEfficiency', boilerEfficiency);
      });
  }

  public calculateCarbonEmission(data: SteamCarbonEmissionInterface): void {
    this.sgaService.calculateCarbonEmission(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => this._setInputFormFields(res));
  }

  private _getFuelTypeData(staticData?: SteamCalorificRequestInterface): SteamCalorificRequestInterface {
    let energyUnitSelected = staticData && staticData.energyUnitSelected;
    let smallWeightUnitSelected = staticData && staticData.smallWeightUnitSelected ||
      this.sizingModuleForm.get('selectedUnits.smallWeightUnitSelected').value;

    if (!energyUnitSelected) {
      energyUnitSelected = this.sgaService.getSizingPreferenceValues({energyUnitSelected: 'BoilerHouseEnergyUnits'})
        .energyUnitSelected;
    }

    if (!smallWeightUnitSelected) {
      smallWeightUnitSelected = this.sgaService.getSizingPreferenceValues({smallWeightUnitSelected: 'WeightUnit'})
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

  private _calculateCalorificValue(data?: SteamCalorificRequestInterface, disableEmissionCalculation?: boolean): void {
    const fuelTypeData = this._getFuelTypeData(data);

    this.sgaService
      .calculateCalorific(fuelTypeData)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ fuelCarbonContent, fuelEnergyPerUnit }) => {
        if (fuelCarbonContent && fuelEnergyPerUnit) {
          this._setInputFormFields({ fuelEnergyPerUnit, fuelCarbonContent });

          if (!disableEmissionCalculation) {
            const { energyUnitSelected, smallWeightUnitSelected } = this.sgaService.getSizingPreferenceValues({
              energyUnitSelected: 'BoilerHouseEnergyUnits',
              smallWeightUnitSelected: 'WeightUnit'
            });
            const { inputFuelId, inputFuelUnit } = this.sgaService.getMultipleControlValues({
              inputFuelId: 'inputFuelId',
              inputFuelUnit: 'inputFuelUnit',
              fuelCarbonContent: 'inputFuelUnit',
            });

            this.calculateCarbonEmission({
              energyUnitSelected,
              smallWeightUnitSelected,
              fuelEnergyPerUnit,
              fuelCarbonContent,
              inputFuelId,
              inputFuelUnit
            });
          }
        }
      });
  }

  private _getDefaultConvertedUnits(): UnitConvert[] {
    if (!this.modulePreferenceService.allModulePreferences ||
      !this.modulePreferenceService.allModulePreferences.length) return null;

    const defPreferences = this.modulePreferenceService.allModulePreferences;
    const { emissionUnitSelected, volumeUnitSelected } = this.sgaService.getSizingPreferenceValues({
      emissionUnitSelected: 'BoilerHouseEmissionUnits',
      volumeUnitSelected: 'BoilerHouseVolumeUnits'
    });
    const fuelUnitTypeId = this.sizingModuleForm.get('steamGeneratorInputs.inputFuelUnit').value;
    const obj: {[key: string]: UnitConvert} = {
      costOfCo2PerUnitMass: {
        convertedValue: this.sizingModuleForm.get('steamGeneratorInputs.costOfCo2PerUnitMass').value,
        propertyName: 'costOfCo2PerUnitMass',
        initialValue: 0,
        initialUnitId: null,
        targetUnitId: emissionUnitSelected,
      },
      costOfEffluentPerUnit: {
        convertedValue: this.sizingModuleForm.get('steamGeneratorInputs.costOfEffluentPerUnit').value,
        propertyName: 'costOfEffluentPerUnit',
        initialValue: 0,
        initialUnitId: null,
        targetUnitId: volumeUnitSelected,
      },
      costOfFuelPerUnit: {
        convertedValue: this.sizingModuleForm.get('steamGeneratorInputs.costOfFuelPerUnit').value,
        propertyName: 'costOfFuelPerUnit',
        initialValue: 0,
        initialUnitId: null,
        targetUnitId: fuelUnitTypeId,
      },
      costOfWaterPerUnit: {
        convertedValue: this.sizingModuleForm.get('steamGeneratorInputs.costOfWaterPerUnit').value,
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
          this.sgaService.setFormValue('inputFuelId', fuelTypeId);
          break;
        }
        case 'SteamGenerationFuelUnit': { // inputFuelUnit
          this.sgaService.setFormValue('inputFuelUnit', Number(value));
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

    return Object.keys(obj)
      .filter((key) => {
        const {initialUnitId, targetUnitId, initialValue} = obj[key];

        if (!initialUnitId || !targetUnitId) return false;

        if (initialUnitId === targetUnitId) {
          this.sgaService.changeSgaFieldFilled(key as keyof SteamGeneratorInputsInterface, true);
          this.sgaService.setFormValue(key, initialValue);
          return false;
        }

        return true;
      })
      .map((key) => obj[key]);
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

  private _calculateWaterTreatment(waterTreatmentMethodId?: string, tdsUnitSelected?: number): void {
    this.sgaService.calculateWaterTreatmentMethod({
      tdsUnitSelected: tdsUnitSelected || this.sizingModuleForm.get('selectedUnits.tdsUnitSelected').value,
      waterTreatmentMethodId: waterTreatmentMethodId || this.sizingModuleForm.get('steamGeneratorInputs.waterTreatmentMethod').value,
    }).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        const {percentageWaterRejection, tdsOfMakeupWater} = res;

        this.sgaService.changeSgaFieldFilled('percentageWaterRejection', true);
        this.sgaService.changeSgaFieldFilled('tdsOfMakeupWater', true);
        this.sgaService.setFormValue('percentageWaterRejection', percentageWaterRejection);
        this.sgaService.setFormValue('tdsOfMakeupWater', tdsOfMakeupWater);
      });
  }

  private _convertUnits(
    unitsConverter: UnitConvert[],
    calculation: {calorific: boolean; emission: boolean;} = {calorific: true, emission: true}
  ): void {
    if (unitsConverter && unitsConverter.length) {
      this.requestLoading.next(true);
      this.unitsService.unitsConverter({ unitsConverter }).pipe(
        takeUntil(this.ngUnsubscribe),
        tap(null, null, () => this.requestLoading.next(false))
      ).subscribe((response) => {
        const results = response.unitsConverter;

        if (results && results.length) {
          const newValues = results.reduce((accum, item) => {
            this.sgaService.changeSgaFieldFilled(item.propertyName as keyof SteamGeneratorInputsInterface, true);

            return {...accum, [item.propertyName]: item.convertedValue};
          }, {});

          this.sgaService.setFormValues(newValues);
          if (calculation.calorific) {
            this._calculateCalorificValue(null, calculation.emission);
          }
        }
      });
    }
  }

  private _setInputFormFields(data: Partial<Record<keyof FormFieldTypesInterface, any>>): void {
    for (let formKey in data) {
      this.sgaService.changeSgaFieldFilled(formKey as keyof FormFieldTypesInterface, true);
      this.sgaService.setFormValue(formKey, data[formKey]);
    }
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
