import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AdminService,
  BaseSizingModule,
  JobSizing,
  ModulePreferenceService,
  PreferenceService,
  Project,
  TranslationService,
  UnitConvert,
  UnitsService,
  EnumerationDefinition
} from 'sizing-shared-lib';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { BenchmarkDataInterface, ProposedDataInterface } from './interfaces/steam-generation-form.interface';
import { TabsetComponent } from 'ngx-bootstrap';
import { ChartBarDataInterface } from './interfaces/chart-bar.interface';
import { TabDirective } from 'ngx-bootstrap/tabs/tab.directive';
import { SgaFormService } from './services/sga-form.service';
import { SizingUnitPreference } from '../../../sizing-shared-lib/src/lib/shared/preference/sizing-unit-preference.model';
import { FuelTypesEnumerationLetter } from './interfaces/fuel-type.interface';
import { BenchmarkInputsInterface } from './interfaces/benchmarkInputs.interface';
import {
  SgaCalcBoilerEfficiencyReqInterface,
  SgaCalcCalorificReqInterface,
  SgaCalcCarbonEmissionReqInterface, SgaCalcFeedtankTemperatureAndPressureReqInterface,
  SgaCalcSaturatedAndFreezingTemperatureReqInterface, SgaCalcWaterTemperatureExchangerReqInterface,
  SgaCalcWaterTreatmentReqInterface
} from './interfaces/api-requests.interface';
import { SgaApiService } from './services/sga-api.service';
import { TFormBenchmarkValueSetterInterface, TFormValueGetterInterface } from './interfaces/forms.interface';
import sgaInputParametersFields from './utils/sga-input-parameters-fields';
import { benchmarkCalculationValidator } from './validators/sga-benchmark.validator';
import { SelectedUnitPreferenceEnum } from './interfaces/selectedUnits.interface';
import sizingFormDefValues from './utils/sizing-form-def-values';


@Component({
  selector: 'app-steam-generation-assessment',
  templateUrl: './steam-generation-assessment.component.html',
  styleUrls: ['./steam-generation-assessment.component.scss']
})
export class SteamGenerationAssessmentComponent extends BaseSizingModule implements OnInit, OnDestroy, AfterViewInit {
  readonly moduleGroupId: number = 9;
  readonly moduleName: string = 'steamGenerationAssessment';
  private ngUnsubscribe = new Subject<void>();
  moduleId = 2;
  productName = 'Steam Generation Assessment';
  sizingModuleForm: FormGroup = this.formService.getInputParamsFg();
  requestLoading$ = this.apiService.requestLoading$;
  setBenchmarkInputValue: TFormBenchmarkValueSetterInterface;
  getSizingFormValues: TFormValueGetterInterface;
  benchmarkData: BenchmarkDataInterface;
  benchmarkChartData: ChartBarDataInterface[];
  proposedSetupData: ProposedDataInterface;
  proposedSetupResults: any[];
  nextTab: TabDirective;
  currency: string;
  public units$: Observable<{ [key: number]: string }> = this.unitsService.unitsChange
    .pipe(map((data) => data.reduce((obj, item) => ({...obj, [item.id]: item.units}), {})));

  @ViewChild('tabsRef', {static: true}) tabsRef: TabsetComponent;

  constructor(
    private preferenceService: PreferenceService,
    private unitsService: UnitsService,
    private elRef: ElementRef,
    private activatedRoute: ActivatedRoute,
    private modulePreferenceService: ModulePreferenceService,
    protected translationService: TranslationService,
    private adminService: AdminService,
    private formService: SgaFormService,
    private apiService: SgaApiService,
  ) {
    super();
    this.setBenchmarkInputValue = this.formService.createFormValueSetter<BenchmarkInputsInterface>(
      this.sizingModuleForm,
      'benchmarkInputs'
    );
    this.getSizingFormValues = this.formService.createFormValueGetter(this.sizingModuleForm);
  }
  ngOnInit() {
    this.createOrUpdateSizingPref();
    this.convertUnits(this.getDefaultConvertedUnits());
  }

  ngAfterViewInit() {
    const val = this.getSizingFormValues({
      selectedUnits: ['fuelUnitSelected', 'energyUnitSelected', 'tdsUnitSelected', 'smallWeightUnitSelected'],
      benchmarkInputs: ['waterTreatmentMethod', 'isEconomizerPresent', 'inputFuelId']
    });
    this.calculateWaterTreatment({waterTreatmentMethodId: val.waterTreatmentMethod, tdsUnitSelected: val.tdsUnitSelected});
    this.calculateBoilerEfficiency({isEconomizerPresent: val.isEconomizerPresent, inputFuelId: val.inputFuelId});
    this.calculateCalorificValue({
      energyUnitSelected: val.energyUnitSelected, fuelUnitSelected: val.fuelUnitSelected,
      inputFuelId: val.inputFuelId, smallWeightUnitSelected: val.smallWeightUnitSelected
    });

    // Calculate Steam Pressure
    combineLatest([
      this.sizingModuleForm.get('benchmarkInputs.boilerSteamPressure').statusChanges,
      this.sizingModuleForm.get('benchmarkInputs.boilerSteamPressure').valueChanges,
    ]).pipe(
      takeUntil(this.ngUnsubscribe),
      filter(([v1]) => v1 === 'VALID'),
      distinctUntilChanged(([a1, a2], [b1, b2]) => JSON.stringify(a2) === JSON.stringify(b2)),
      map(() => this.getSizingFormValues({
        selectedUnits: ['temperatureUnitSelected', 'pressureUnitSelected'],
        benchmarkInputs: ['isSuperheatedSteam', 'boilerSteamPressure', 'boilerSteamPressure']
      })),
      switchMap((data: SgaCalcSaturatedAndFreezingTemperatureReqInterface) => this.apiService.calculateSaturatedAndTemperature(data)),
      filter((res) => !!res && !!res.boilerSteamTemperature && !!res.boilerSteamTemperature.boilerSteamTemperature),
      map(({boilerSteamTemperature: { boilerSteamTemperature }}) => {
        const control = this.sizingModuleForm.get('benchmarkInputs.boilerSteamTemperature');
        control.setValidators([Validators.required, Validators.min(Math.floor(boilerSteamTemperature * 100) / 100)]);
        return {next: boilerSteamTemperature, prev: control.value };
      }),
      filter(({prev, next}) => prev < next)
    ).subscribe(({next}) => this.setBenchmarkInputValue({boilerSteamTemperature: next}));

    // Calculate CO2 Emission
    this.sizingModuleForm.get('benchmarkInputs.fuelEnergyPerUnit').statusChanges.pipe(
      takeUntil(this.ngUnsubscribe),
      filter(v => v === 'VALID'),
      map(() => this.getSizingFormValues({
        selectedUnits: ['energyUnitSelected', 'smallWeightUnitSelected', 'fuelUnitSelected'],
        benchmarkInputs: ['inputFuelId', 'fuelEnergyPerUnit', 'fuelCarbonContent']
      })),
      filter((v) => v.energyUnitSelected && v.fuelCarbonContent && v.fuelEnergyPerUnit &&
        v.fuelUnitSelected && v.inputFuelId && v.smallWeightUnitSelected),
    ).subscribe((data: SgaCalcCarbonEmissionReqInterface) => this.calculateCarbonEmission(data));

    // Set Pressure Deaerator type
    this.sizingModuleForm.get('benchmarkInputs.pressurisedDeaerator').valueChanges.pipe(
      takeUntil(this.ngUnsubscribe),
      filter((value: boolean) => value),
      map(() => {
        const values = this.getSizingFormValues({
          selectedUnits: ['temperatureUnitSelected', 'pressureUnitSelected'],
          benchmarkInputs: ['pressureOfFeedtank', 'pressurisedDeaerator'],
        });
        return {isPressureDeaerator: values.pressurisedDeaerator, ...values};
      }),
      switchMap((values: SgaCalcFeedtankTemperatureAndPressureReqInterface) => this.apiService.calculateTemperatureAndPressure(values))
    ).subscribe(({pressureOfFeedtank, temperatureOfFeedtank}) => this.setBenchmarkInputValue({pressureOfFeedtank, temperatureOfFeedtank}));
    // Calculate Water Temperature leaving Heat Exchanger
    this.sizingModuleForm.get('benchmarkInputs.isHeatExchangerPresent').valueChanges.pipe(
      takeUntil(this.ngUnsubscribe),
      filter((value: boolean) => value),
      map(() => this.getSizingFormValues({selectedUnits: 'temperatureUnitSelected'}) as SgaCalcWaterTemperatureExchangerReqInterface),
      switchMap(values => this.apiService.calculateWaterTemperatureLeaving(values))
    ).subscribe(({waterTemperatureLeavingHeatExchanger}) => this.setBenchmarkInputValue({waterTemperatureLeavingHeatExchanger}));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.preferenceService.clearUnitPreferences();
    this.sizingModuleForm.reset(sizingFormDefValues);
  }

  onCalculateSizing(formGroup: FormGroup): any {
    this.apiService.calculateBenchmark(formGroup.getRawValue())
      .pipe(
        takeUntil(this.ngUnsubscribe),
        map(res => benchmarkCalculationValidator(res, this.sizingModuleForm, this.elRef)),
        filter((v) => !!v)
      )
      .subscribe((res) => {
        this.sizingModuleForm.markAsUntouched();
        this.setProposalSetupData(res);
        this.setBenchmarkData(res.benchmark);
        setTimeout(() => this.setActiveTab(1));
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
    console.log('-----onNewSizingForm----');
    return true;
  }

  onPdfSubmit(): any {
    return true;
  }

  onResetModuleForm(): any {
    setTimeout(() => {
      this.convertUnits(this.getDefaultConvertedUnits());

      this.calculateCalorificValue({
        energyUnitSelected: this.getSizingValue('BoilerHouseEnergyUnits'),
        smallWeightUnitSelected: this.getSizingValue('WeightUnit'),
        ...this.getSizingFormValues({
          selectedUnits: 'fuelUnitSelected',
          benchmarkInputs: 'inputFuelId'
        }) as { inputFuelId: string; fuelUnitSelected: number; }
      });
      const data = this.getSizingFormValues({selectedUnits: 'tdsUnitSelected', benchmarkInputs: 'waterTreatmentMethod'});
      this.calculateWaterTreatment({waterTreatmentMethodId: data.waterTreatmentMethod, tdsUnitSelected: data.tdsUnitSelected});
    }, 0);

    this.resetCurrencies();

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
    const data = this.createOrUpdateSizingPref();
    const filteredData = data.filter(({propertyName}) => propertyName !== 'fuelEnergyPerUnit' && propertyName !== 'fuelCarbonContent');
    const {
      inputFuelId,
      isSuperheatedSteam,
      boilerSteamPressure,
      fuelUnitSelected,
      energyUnitSelected,
      smallWeightUnitSelected,
      temperatureUnitSelected,
      pressureUnitSelected
    } = this.getSizingFormValues({
      benchmarkInputs: ['inputFuelId', 'isSuperheatedSteam', 'boilerSteamPressure'],
      selectedUnits: [
        'fuelUnitSelected', 'energyUnitSelected', 'smallWeightUnitSelected', 'temperatureUnitSelected', 'pressureUnitSelected'
      ]
    });

    this.convertUnits(filteredData);
    this.calculateCalorificValue({energyUnitSelected, smallWeightUnitSelected, inputFuelId, fuelUnitSelected});

    if (isSuperheatedSteam && boilerSteamPressure && pressureUnitSelected && temperatureUnitSelected) {
      this.apiService.calculateSaturatedAndTemperature({
        boilerSteamTemperature: null,
        isSuperheatedSteam, boilerSteamPressure,
        pressureUnitSelected, temperatureUnitSelected
      }).pipe(
        filter((res) => !!res && !!res.boilerSteamTemperature && !!res.boilerSteamTemperature.boilerSteamTemperature),
        map((res) => {
          const reqTemperature = res.boilerSteamTemperature.boilerSteamTemperature;
          const control = this.sizingModuleForm.get('benchmarkInputs.boilerSteamTemperature');
          control.setValidators([Validators.required, Validators.min(Math.floor(reqTemperature * 100) / 100)]);
          return {next: reqTemperature, prev: control.value };
        })
      ).subscribe(({next}) => this.setBenchmarkInputValue({boilerSteamTemperature: next}));
    }

    const fg = this.sizingModuleForm.get('benchmarkInputs') as FormGroup;
    for (const controlsKey in fg.controls) {
      if (controlsKey) {
        const control = fg.get(controlsKey);
        if (control && control.invalid && !control.pristine && control.value) {
          control.updateValueAndValidity({emitEvent: true, onlySelf: true});
        }
      }
    }

    return true;
  }

  repackageSizing(): any {
    console.log('-----repackageSizing-----');
    return true;
  }

  nextTabHandle(tabsRef?: TabsetComponent): void {
    if (tabsRef && tabsRef.tabs) {
      for (let i = 0; i <= tabsRef.tabs.length; i++) {
        const tab = tabsRef.tabs[i];
        const nextTab = tabsRef.tabs[i + 1];

        if (tab && tab.active && nextTab && !nextTab.disabled) {
          this.setActiveTab(i + 1);
          break;
        }
      }
    }
  }

  setActiveTab(tab: number | TabDirective): void {
    if (tab instanceof TabDirective) {
      const tabIndex = this.tabsRef.tabs.indexOf(tab);

      if (tabIndex !== -1 && this.tabsRef.tabs[tabIndex + 1]) {
        this.nextTab = this.tabsRef.tabs[tabIndex + 1].disabled ? null : this.tabsRef.tabs[tabIndex + 1];
      }
      return;
    }

    if (
      typeof tab === 'number' &&
      this.tabsRef && this.tabsRef.tabs &&
      this.tabsRef.tabs[tab] &&
      !this.tabsRef.tabs[tab].active
    ) {
      this.tabsRef.tabs[tab].active = true;
      this.nextTab = this.tabsRef.tabs[tab + 1];
    }
  }

  calculateProposedSetup(proposalInputs: ProposedDataInterface): void {
    if (!proposalInputs || !proposalInputs.proposedSetup || !proposalInputs.features) { return; }

    this.apiService.calculateProposal({ ...this.sizingModuleForm.getRawValue(), proposalInputs })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.proposedSetupResults = res;
          this.setProposalSetupData(proposalInputs);
        }
      });
  }

  calculateBoilerEfficiency(data: SgaCalcBoilerEfficiencyReqInterface): void {
    if (!data.inputFuelId || data.isEconomizerPresent === undefined || data.isEconomizerPresent === null) { return null; }

    this.apiService.calculateBoilerEfficiency(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ boilerEfficiency }) => this.setBenchmarkInputValue('boilerEfficiency', boilerEfficiency));
  }

  calculateCarbonEmission(data: SgaCalcCarbonEmissionReqInterface): void {
    if (!data.inputFuelId || !data.fuelUnitSelected || !data.fuelEnergyPerUnit || !data.fuelCarbonContent ||
      !data.energyUnitSelected || !data.smallWeightUnitSelected) { return null; }

    this.apiService.calculateCarbonEmission(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({fuelCarbonContent}) => this.setBenchmarkInputValue('fuelCarbonContent', fuelCarbonContent));
  }

  calculateCalorificValue(data: SgaCalcCalorificReqInterface): void {
    if (!data.inputFuelId || !data.fuelUnitSelected || !data.energyUnitSelected || !data.smallWeightUnitSelected) {
      return null;
    }

    this.apiService
      .calculateCalorific(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ fuelCarbonContent, fuelEnergyPerUnit }) =>
        this.setBenchmarkInputValue({fuelEnergyPerUnit, fuelCarbonContent}, null, {emitEvent: false})
      );
  }

  calculateWaterTreatment(data: SgaCalcWaterTreatmentReqInterface): void {
    if (!data.waterTreatmentMethodId || !data.tdsUnitSelected) { return null; }

    this.apiService.calculateWaterTreatment(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => this.setBenchmarkInputValue(res));
  }

  private createOrUpdateSizingPref(sizingUnitPreference?: SizingUnitPreference[]): UnitConvert[] {
    const list = [
      { name: 'BoilerHouseEnergyUnits', masterTextKey: 'ENERGY', selectedUnitName: 'energyUnitSelected' },
      { name: 'WeightUnit', masterTextKey: 'SMALL_WEIGHT', selectedUnitName: 'smallWeightUnitSelected' },
      { name: 'BHCurrency', masterTextKey: 'CURRENCY' },
      { name: 'BoilerHouseEmissionUnits', masterTextKey: 'CO2_EMISSIONS', selectedUnitName: 'emissionUnitSelected' },
      { name: 'BoilerHouseVolumeUnits', masterTextKey: 'VOLUME', selectedUnitName: 'volumeUnitSelected' },
      {
        name: 'BoilerHouseSmallMassFlowUnits',
        masterTextKey: 'BOILER_HOUSE_SMALL_MASS_FLOW_UNITS',
        selectedUnitName: 'smallMassFlowUnitSelected'
      },
      { name: 'BoilerHouseMassFlowUnits', masterTextKey: 'BOILER_HOUSE_MASS_FLOW_UNITS', selectedUnitName: 'massFlowUnitSelected' },
      { name: 'TemperatureUnit', masterTextKey: 'TEMPERATURE', selectedUnitName: 'temperatureUnitSelected' },
      { name: 'PressureUnit', masterTextKey: 'PRESSURE', selectedUnitName: 'pressureUnitSelected' },
      { name: 'BoilerHouseTDSUnits', masterTextKey: 'TDS', selectedUnitName: 'tdsUnitSelected' },
      {
        name: 'BoilerHouseSmallVolumetricFlowUnits',
        masterTextKey: 'SMALL_VOLUMETRIC_FLOW',
        selectedUnitName: 'smallVolumetricFlowUnitSelected'
      },
      { name: 'BoilerHouseVolumetricFlowUnits', masterTextKey: 'VOLUMETRIC_FLOW', selectedUnitName: '' },
      // FUEL_TYPES
      { name: 'BoilerHouseLiquidFuelUnits', masterTextKey: 'LIQUID_FUEL', selectedUnitName: 'fuelUnitSelected' },
      { name: 'BoilerHouseElectricalFuelUnits', masterTextKey: 'ELECTRICAL_FUEL', selectedUnitName: 'fuelUnitSelected' },
      { name: 'BoilerHouseSolidFuelUnits', masterTextKey: 'SOLID_FUEL', selectedUnitName: 'fuelUnitSelected' },
      { name: 'BoilerHouseGasFuelUnits', masterTextKey: 'GASEOUS_FUEL', selectedUnitName: 'fuelUnitSelected' },
    ];

    const fuelId = this.sizingModuleForm.get('benchmarkInputs.inputFuelId').value;
    let fuelTypeName: string;
    let updatedSizingUnitPreferences: UnitConvert[] = [];

    if (fuelId) {
      const enumerationDefinition = this.getEnumerationDefinition('FuelTypeList_BoilerHouseInput', {id: fuelId});
      fuelTypeName = enumerationDefinition && FuelTypesEnumerationLetter[enumerationDefinition.value.charAt(0).toUpperCase()];
    }

    for (const item of list) {
      const sPreferences = sizingUnitPreference || this.preferenceService.sizingUnitPreferences;
      const isUpdate = sPreferences.find(({preference}) => preference.name === item.name);
      const control = this.sizingModuleForm.get(`selectedUnits.${item.selectedUnitName}`);

      if (isUpdate && isUpdate.preference) { // Update
        const newValue = Number(isUpdate.preference.value);
        if (item.name === fuelTypeName) {
          if (control.value !== newValue) {
            updatedSizingUnitPreferences = updatedSizingUnitPreferences
              .concat(this.createConvert('FUEL_TYPE_NAME', SelectedUnitPreferenceEnum[isUpdate.preference.name], newValue));
          }
          control.patchValue(newValue);
        } else if (item.selectedUnitName !== 'fuelUnitSelected' && control) {
          if (control.value !== newValue) {
            updatedSizingUnitPreferences = updatedSizingUnitPreferences
              .concat(this.createConvert(isUpdate.preference.name, SelectedUnitPreferenceEnum[isUpdate.preference.name], newValue));
          }
          control.patchValue(newValue);
        }
      } else { // Create
        const preference = this.preferenceService.allPreferences.find(({name}) => name === item.name || name === item.name + 's');

        if (preference) {
          if (item.name === 'BHCurrency') {
            this.adminService.getCurrencyData().subscribe(currencies => {
              const currency = currencies.find(({currencyCode}) => currencyCode === preference.value);
              if (currency) {
                this.preferenceService.addSizingUnitPreference(
                  {...preference, unitName: currency.symbol, masterTextKey: currency.masterTextKey},
                  item.name,
                  item.masterTextKey,
                  this.moduleGroupId,
                  undefined,
                  currencies
                );
              }
            });
          } else {
            const unitType = item.name.slice(-1) === 's' ? item.name : item.name + 's';

            this.preferenceService.addSizingUnitPreference(preference, unitType, item.masterTextKey, this.moduleGroupId);

            if (control) {
              control.patchValue(Number(preference.value));
            }
          }
        }
      }
    }

    this.setBenchmarkInputValue('waterTreatmentMethod', this.getEnumerationDefinition('WaterTreatmentMethodList_BoilerHouseInput').id);

    return updatedSizingUnitPreferences;
  }

  private createConvert(name: string, selectedUnitsName: string, newValue: any): UnitConvert[] {
    const unitConverts: UnitConvert[] = [];

    for (const key of Object.keys(sgaInputParametersFields)) {
      const item = sgaInputParametersFields[key];
      if (item && item.unitNames && item.unitNames.includes(name)) {
        const values = this.getSizingFormValues({selectedUnits: selectedUnitsName, benchmarkInputs: key});
        const control = this.sizingModuleForm.get(`benchmarkInputs.${key}`);
        if (control && control.pristine && values[selectedUnitsName] && values[key]) {
          unitConverts.push({
            propertyName: key,
            initialValue: values[key],
            initialUnitId: values[selectedUnitsName],
            targetUnitId: newValue,
            convertedValue: null,
          });
        }
      }
    }

    return unitConverts;
  }

  private getDefaultConvertedUnits(): UnitConvert[] {
    if (!this.modulePreferenceService.allModulePreferences ||
      !this.modulePreferenceService.allModulePreferences.length) { return null; }

    const formValues = this.getSizingFormValues({
      selectedUnits: ['fuelUnitSelected', 'emissionUnitSelected', 'volumeUnitSelected'],
      benchmarkInputs: ['costOfCo2PerUnitMass', 'costOfEffluentPerUnit', 'costOfFuelPerUnit', 'costOfWaterPerUnit']
    }, null);

    const obj: {[key: string]: UnitConvert} = {
      costOfCo2PerUnitMass: {
        convertedValue: formValues.costOfCo2PerUnitMass,
        propertyName: 'costOfCo2PerUnitMass',
        initialValue: 0,
        initialUnitId: null,
        targetUnitId: formValues.emissionUnitSelected,
      },
      costOfEffluentPerUnit: {
        convertedValue: formValues.costOfEffluentPerUnit,
        propertyName: 'costOfEffluentPerUnit',
        initialValue: 0,
        initialUnitId: null,
        targetUnitId: formValues.volumeUnitSelected,
      },
      costOfFuelPerUnit: {
        convertedValue: formValues.costOfFuelPerUnit,
        propertyName: 'costOfFuelPerUnit',
        initialValue: 0,
        initialUnitId: null,
        targetUnitId: formValues.fuelUnitSelected,
      },
      costOfWaterPerUnit: {
        convertedValue: formValues.costOfWaterPerUnit,
        propertyName: 'costOfWaterPerUnit',
        initialValue: 0,
        initialUnitId: null,
        targetUnitId: formValues.volumeUnitSelected,
      },
    };

    for (const {name, value} of this.modulePreferenceService.allModulePreferences) {
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
          const fuelTypeId = this.getEnumerationDefinition('FuelTypeList_BoilerHouseInput', { value }).id;
          if (fuelTypeId) {
            this.setBenchmarkInputValue('inputFuelId', fuelTypeId);
          }
          break;
        }
        case 'SteamGenerationFuelUnit': { // fuelUnitSelected
          if (value) {
            this.sizingModuleForm.get('selectedUnits.fuelUnitSelected').setValue(Number(value));
          }
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

        if (!initialUnitId || !targetUnitId) { return false; }

        if (initialUnitId === targetUnitId) {
          this.setBenchmarkInputValue(key as keyof BenchmarkInputsInterface, initialValue);
          return false;
        }

        return true;
      })
      .map((key) => obj[key]);
  }

  private convertUnits(data: UnitConvert[], callback?: (data: UnitConvert[]) => void): void {
    if (!data || !data.length) { return null; }

    this.unitsService.unitsConverter({ unitsConverter: data }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ unitsConverter}) => {
      if (!unitsConverter || !unitsConverter.length) { return null; }

      if (callback && typeof callback === 'function') {
        callback(unitsConverter);
      } else {
        this.setBenchmarkInputValue(unitsConverter.reduce((acc, item) => ({...acc, [item.propertyName]: item.convertedValue}), {}));
      }
    });
  }

  private getSizingValue(name: string): any {
    const sizingPreference = this.preferenceService.sizingUnitPreferences
      .find(({ preference }) => preference.name === name);

    return sizingPreference && sizingPreference.preference && parseInt(sizingPreference.preference.value, 10);
  }

  private resetCurrencies(): void {
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

  private setBenchmarkData(data: any) {
    if (!data) { return null; }

    this.benchmarkData = data;

    const {
      costOfFuelPerYear = 0,
      waterAndChemicalsCostTotalPerYear = 0,
      costOfBoilerHouseEffluent = 0,
      costOfCO2PerYear = 0
    } = this.benchmarkData;

    this.benchmarkChartData = [
      { data: [costOfFuelPerYear], label: 'Fuel' },
      { data: [waterAndChemicalsCostTotalPerYear], label: 'Water and chemicals' },
      { data: [costOfBoilerHouseEffluent], label: 'Effluent' },
      { data: [costOfCO2PerYear], label: 'Carbon Tax' },
    ];

    return this.benchmarkData;
  }

  private setProposalSetupData(data: any, objKey?: keyof ProposedDataInterface) {
    if (!data) { return null; }

    if (objKey) {
      this.proposedSetupData = {
        ...this.proposedSetupData,
        [objKey]: { ...this.proposedSetupData[objKey], ...data }
      };
    } else {
      this.proposedSetupData = {
        features: data.features,
        proposedSetup: data.proposedSetup
      };
    }
  }

  private getEnumerationDefinition(name: string, value?: Partial<{ [key in keyof EnumerationDefinition]: any }>): EnumerationDefinition {
    const enumerations = this.translationService.displayGroup.enumerations
      .find(({enumerationName, opCoOverride}) => enumerationName === name && opCoOverride === false);

    if (!enumerations || !enumerations.enumerationDefinitions) {
      return null;
    }

    let item = enumerations.enumerationDefinitions[0];

    if (value) {
      const key = Object.keys(value)[0];
      const searchVal = value[key];
      item = enumerations && enumerations.enumerationDefinitions.find((v) => v[key] === searchVal);
    }

    return item;
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
