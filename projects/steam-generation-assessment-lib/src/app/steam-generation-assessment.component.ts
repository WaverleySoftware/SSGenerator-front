import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {
  AdminService,
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
  SgaBoilerEfficiencyInterface, SgaFuelTypes, SgaSizingModuleFormInterface, SgFormStructureInterface,
  SteamCalorificRequestInterface, SteamCarbonEmissionInterface,
  SteamGeneratorInputsInterface
} from "./steam-generation-form.interface";
import { TabsetComponent } from "ngx-bootstrap";

@Component({
  selector: 'app-steam-generation-assessment',
  templateUrl: './steam-generation-assessment.component.html',
  styleUrls: ['./steam-generation-assessment.component.scss']
})
export class SteamGenerationAssessmentComponent extends BaseSizingModule implements OnInit, OnDestroy, AfterViewInit {
  readonly moduleGroupId: number = 9;
  readonly moduleName: string = 'steamGenerationAssessment';
  private readonly fieldsGroupName: keyof SgaSizingModuleFormInterface = 'benchmarkInputs';
  private readonly unitsGroupName: keyof SgaSizingModuleFormInterface = 'selectedUnits';
  public moduleId = 2;
  public readonly requestLoading$ = this.sgaService.getLoading();
  public productName = 'Steam Generation Assessment';
  public sizingModuleForm: FormGroup = this.sgaService.getSizingFormGroup();
  public benchmarkData: any;
  private ngUnsubscribe = new Subject<void>();
  public fieldsTree: SgFormStructureInterface = {
    utility_parameters: {
      status: true,
      panels: {
        fuel: {
          status: true,
          fields: ['fuelEnergyPerUnit', 'fuelCarbonContent', 'costOfFuelPerUnit', 'costOfFuelPerYear', 'fuelConsumptionPerYear']
        },
        co2_emission: {
          status: true,
          fields: ['carbonTaxLevyCostPerUnit', 'costOfCo2PerUnitMass']
        },
        water: {
          status: true,
          fields: ['costOfWaterPerUnit', 'costOfWaterPerYear', 'waterConsumptionPerHour', 'waterConsumptionPerYear']
        },
        water_treatment_chemicals: {
          status: true,
          fields: ['totalChemicalCostPerYear', 'o2ScavengingChemicalsCostSavings']
        },
        water_effluent: {
          status: true,
          fields: ['costOfEffluentPerUnit']
        }
      },
      fields: ['hoursOfOperation']
    },
    boiler_house_parameters: {
      status: false,
      panels: {
        boiler: {
          status: true,
          panels: {
            boiler_parameters: {
              status: true,
              fields: [
                'boilerSteamGeneratedPerHour',
                'boilerSteamGeneratedPerYear',
                'boilerSteamPressure',
                'boilerSteamTemperature',
                'boilerEfficiency'
              ]
            }
          }
        },
        tds_blowdown: {
          status: false,
          panels: {
            blowdown_equipment: {
              status: true,
              fields: ['waterTemperatureLeavingHeatExchanger']
            },
            tds_blowdown_parameters: {
              status: true,
              fields: ['tdsOfFeedwaterInFeedtank', 'boilerAverageTds', 'boilerMaxTds']
            }
          }
        },
        water_treatment: {
          status: false,
          panels: {
            make_up_water: {
              status: true,
              fields: [
                'temperatureOfMakeupWater',
                'makeupWaterAmountPerHour',
                'makeupWaterAmountPerYear'
              ]
            },
            water_treatment_parameters: {
              status: true,
              fields: [
                'percentageWaterRejection',
                'tdsOfMakeupWater'
              ]
            }
          }
        },
        feedwater_and_condensate: {
          status: false,
          panels: {
            deaerator_type: {
              status: true,
            },
            boiler_feedwater: {
              status: true,
              fields: [
                'boilerFeedwaterConsumptionPerHour',
                'boilerFeedwaterConsumptionPerYear',
                'temperatureOfFeedtank',
                'pressureOfSteamSupplyingDsi',
                'pressureOfFeedtank'
              ]
            },
            condensate_return: {
              status: true,
              fields: [
                'percentageOfCondensateReturn',
                'volumeOfCondensateReturn',
                'temperatureOfCondensateReturn',
                'tdsOfCondensateReturn'
              ]
            }
          }
        }
      }
    }
  }

  @ViewChild('tabsRef', {static: true}) tabsRef: TabsetComponent;

  constructor(
    private sgaService: SteamGenerationAssessmentService,
    private preferenceService: PreferenceService,
    private unitsService: UnitsService,
    private elRef: ElementRef,
    private activatedRoute: ActivatedRoute,
    private modulePreferenceService: ModulePreferenceService,
    protected translationService: TranslationService,
    private adminService: AdminService,
  ) {
    super();
  }

  ngOnInit() {
    this.sizingModuleForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      if (this.benchmarkData) {
        this.benchmarkData = null;
      }
    });
  }

  ngAfterViewInit() {
    const converterUnits = this._getDefaultConvertedUnits();

    this._convertUnits(converterUnits);
    this.sgaService.setSelectedValues();
    this._calculateWaterTreatment();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.preferenceService.clearUnitPreferences();
    this.sgaService.toggleLoading(false);
  }

  onCalculateSizing(formGroup: FormGroup): any {
    this.sgaService
      .calculateResults(formGroup.getRawValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        if (res && res.benchmark) {
          this.benchmarkData = res.benchmark;
          setTimeout(() => this.setActiveTab(1));
        } else {
          // focus on first errored field
          this.focusOnField();
        }
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
    setTimeout(() => {
      this._convertUnits(this._getDefaultConvertedUnits());

      this.sgaService.setSelectedValues()
      this.sgaService.setFormValues({ atmosphericDeaerator: true, hoursOfOperation: 8736 });
      this.sgaService.updateTreeValidity(this.sizingModuleForm);

      this._calculateCalorificValue();
      this._calculateWaterTreatment();
    },0)

    this._resetCurrencies();

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
    const {unitsConverter, unitsConverterAfter} = this.sgaService.changeSizingUnits();

    this._convertUnits(unitsConverter, (results) => {
      if (unitsConverterAfter.length) {
        for (let unitConvert of unitsConverterAfter) {
          unitConvert.initialValue = results.find(({propertyName}) => unitConvert.propertyName === propertyName).convertedValue;
        }

        this._convertUnits(unitsConverterAfter);
      }
    });
    this._calculateCalorificValue();

    return true;
  }

  repackageSizing(): any {
    console.log('-----repackageSizing-----')
    return true;
  }

  public setActiveTab(tabIndex: number): void {
    if (this.tabsRef && this.tabsRef.tabs && this.tabsRef.tabs[tabIndex] && !this.tabsRef.tabs[tabIndex].active) {
      this.tabsRef.tabs[tabIndex].active = true;
    }
  }

  public changeFuelType(fuelTypeData: SteamCalorificRequestInterface): void {
    this._calculateCalorificValue(fuelTypeData);
  }

  public changeWaterTreatment({ selectedValue }: { selectedValue: string }): void {
    selectedValue && this._calculateWaterTreatment(selectedValue);
  }

  public calculateBoilerEfficiency(data?: Partial<SgaBoilerEfficiencyInterface>): void {
    const params: SgaBoilerEfficiencyInterface = {
      inputFuelId: data && data.inputFuelId || this._getControlValue('inputFuelId'),
      isEconomizerPresent: data && data.isEconomizerPresent || this._getControlValue('isEconomizerPresent'),
    }

    if (!params.inputFuelId || params.isEconomizerPresent === undefined || params.isEconomizerPresent === null) return null;

    this.sgaService.calculateBoilerEfficiency(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ boilerEfficiency }) => {
        this.sgaService.changeSgaFieldFilled('boilerEfficiency', true);
        this.sgaService.setFormValue('boilerEfficiency', boilerEfficiency);
      });
  }

  public calculateCarbonEmission(data?: Partial<SteamCarbonEmissionInterface>): void {
    const params: SteamCarbonEmissionInterface = {
      energyUnitSelected: data && data.energyUnitSelected || this._getControlValue('energyUnitSelected', this.unitsGroupName),
      smallWeightUnitSelected: data && data.smallWeightUnitSelected || this._getControlValue('smallWeightUnitSelected', this.unitsGroupName),
      inputFuelId: data && data.inputFuelId || this._getControlValue('inputFuelId'),
      fuelUnitSelected: data && data.fuelUnitSelected || this._getControlValue('fuelUnitSelected', this.unitsGroupName),
      fuelCarbonContent: data && data.fuelCarbonContent || this._getControlValue('fuelCarbonContent'),
      fuelEnergyPerUnit: data && data.fuelEnergyPerUnit || this._getControlValue('fuelEnergyPerUnit'),
    }

    if (
      !params.inputFuelId || !params.fuelUnitSelected || !params.fuelEnergyPerUnit || !params.fuelCarbonContent ||
      !params.energyUnitSelected || !params.smallWeightUnitSelected
    ) return null;

    this.sgaService.calculateCarbonEmission(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => this._setInputFormFields(res));
  }

  private _calculateCalorificValue(data?: Partial<SteamCalorificRequestInterface>, isCalculateEmission?: boolean): void {
    const prams: SteamCalorificRequestInterface = {
      energyUnitSelected: data && data.energyUnitSelected || this._getSizingValue('BoilerHouseEnergyUnits'),
      smallWeightUnitSelected: data && data.smallWeightUnitSelected || this._getSizingValue('WeightUnit'),
      inputFuelId: data && data.inputFuelId || this._getControlValue('inputFuelId'),
      fuelUnitSelected: data && data.fuelUnitSelected || this._getControlValue('fuelUnitSelected', 'selectedUnits')
    };

    if (!prams.inputFuelId || !prams.fuelUnitSelected || !prams.energyUnitSelected || !prams.smallWeightUnitSelected) {
      return null;
    }

    this.sgaService
      .calculateCalorific(prams)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ fuelCarbonContent, fuelEnergyPerUnit }) => {
        this._setInputFormFields({ fuelEnergyPerUnit, fuelCarbonContent });

        isCalculateEmission && this.calculateCarbonEmission({fuelEnergyPerUnit, fuelCarbonContent});
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
    const fuelUnitTypeId = this._getControlValue('fuelUnitSelected', 'selectedUnits') || parseInt(this.preferenceService.allPreferences
      .find(({ name }) => name === SgaFuelTypes.BoilerHouseGasFuelUnits).value);
    const obj: {[key: string]: UnitConvert} = {
      costOfCo2PerUnitMass: {
        convertedValue: this._getControlValue('costOfCo2PerUnitMass'),
        propertyName: 'costOfCo2PerUnitMass',
        initialValue: 0,
        initialUnitId: null,
        targetUnitId: emissionUnitSelected,
      },
      costOfEffluentPerUnit: {
        convertedValue: this._getControlValue('costOfEffluentPerUnit'),
        propertyName: 'costOfEffluentPerUnit',
        initialValue: 0,
        initialUnitId: null,
        targetUnitId: volumeUnitSelected,
      },
      costOfFuelPerUnit: {
        convertedValue: this._getControlValue('costOfFuelPerUnit'),
        propertyName: 'costOfFuelPerUnit',
        initialValue: 0,
        initialUnitId: null,
        targetUnitId: fuelUnitTypeId,
      },
      costOfWaterPerUnit: {
        convertedValue: this._getControlValue('costOfWaterPerUnit'),
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
          fuelTypeId && this.sgaService.setFormValue('inputFuelId', fuelTypeId);
          break;
        }
        case 'SteamGenerationFuelUnit': { // fuelUnitSelected
          value && this.sgaService.setFormValue('fuelUnitSelected', Number(value), 'selectedUnits');
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
    const params = {
      tdsUnitSelected: tdsUnitSelected || this._getControlValue('tdsUnitSelected', this.unitsGroupName),
      waterTreatmentMethodId: waterTreatmentMethodId || this._getControlValue('waterTreatmentMethod'),
    };

    if (!params.waterTreatmentMethodId || !params.tdsUnitSelected) return null;

    this.sgaService.calculateWaterTreatmentMethod(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => this._setInputFormFields(res));
  }

  private _convertUnits(data: UnitConvert[], callback?: (data: UnitConvert[]) => void): void {
    if (!data || !data.length) return null;
    this.sgaService.toggleLoading(true);
    this.unitsService.unitsConverter({ unitsConverter: data }).pipe(
      takeUntil(this.ngUnsubscribe),
      tap(null, null, () => this.sgaService.toggleLoading(false))
    ).subscribe(({ unitsConverter}) => {
      if (!unitsConverter || !unitsConverter.length) return null;

      if (callback && typeof callback === "function") callback(unitsConverter);

      const newValues = unitsConverter.reduce((accum, item) => {
        this.sgaService.changeSgaFieldFilled(item.propertyName as keyof SteamGeneratorInputsInterface, true);

        return {...accum, [item.propertyName]: item.convertedValue};
      }, {});

      this.sgaService.setFormValues(newValues);
    });
  }

  private _setInputFormFields(data: Partial<Record<keyof FormFieldTypesInterface, any>>): void {
    for (let formKey in data) {
      this.sgaService.changeSgaFieldFilled(formKey as keyof FormFieldTypesInterface, true);
      this.sgaService.setFormValue(formKey, data[formKey]);
    }
  }

  private _getControlValue(field: string, group: keyof SgaSizingModuleFormInterface = this.fieldsGroupName): any {
    const control = this.sizingModuleForm.get(`${group}.${field}`);

    return control && control.value;
  }

  private _getSizingValue(name: string): any {
    const sizingPreference = this.preferenceService.sizingUnitPreferences
      .find(({ preference }) => preference.name === name);

    return sizingPreference && sizingPreference.preference && parseInt(sizingPreference.preference.value);
  }

  private _resetCurrencies(): void {
    const preference = this.preferenceService.sizingUnitPreferences.find(({ unitType }) => unitType === 'BHCurrencys');
    this.adminService.getCurrencyData().subscribe((currencies) => {
      this.preferenceService.addSizingUnitPreference(
        preference.preference,
        preference.unitType,
        'CURRENCY',
        this.moduleGroupId,
        undefined,
        currencies
      );
    });
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

  private focusOnField() {
    const fg = this.sizingModuleForm.get('benchmarkInputs') as FormGroup;
    SteamGenerationAssessmentService.focusFirstErrorField(fg, this.elRef, this.fieldsTree);
  }
}
