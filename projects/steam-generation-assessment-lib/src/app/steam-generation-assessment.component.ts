import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from "@angular/router";
import {
  AdminService,
  BaseSizingModule,
  JobSizing,
  ModulePreferenceService,
  PreferenceService,
  Project,
  Job,
  TranslationService,
  UnitConvert,
  UnitsService,
  EnumerationDefinition,
  TranslatePipe,
  MessagesService,
  ProjectsJobsService,
  ProcessCondition,
  ProcessInput,
  OutputGridRow,
  GetSizingJobRequest
} from 'sizing-shared-lib';
import { combineLatest, Subject, of, Observable } from "rxjs";
import { tap } from "rxjs/operators/tap";
import { distinctUntilChanged, filter, map, switchMap, takeUntil, first } from "rxjs/operators";
import { TabsetComponent } from 'ngx-bootstrap';
import { TabDirective } from 'ngx-bootstrap/tabs/tab.directive';
import { SgaFormService } from './services/sga-form.service';
import { SizingUnitPreference } from '../../../sizing-shared-lib/src/lib/shared/preference/sizing-unit-preference.model';
import { FuelTypesEnumerationLetter } from './interfaces/fuel-type.interface';
import { BenchmarkInputsInterface } from './interfaces/benchmarkInputs.interface';
import {
  SgaCalcBoilerEfficiencyReqInterface,
  SgaCalcCalorificReqInterface,
  SgaCalcCarbonEmissionReqInterface,
  SgaCalcFeedtankTemperatureAndPressureReqInterface,
  SgaCalcSaturatedAndFreezingTemperatureReqInterface,
  SgaCalcWaterTemperatureExchangerReqInterface,
  SgaCalcWaterTreatmentReqInterface
} from "./interfaces/api-requests.interface";
import { SgaApiService } from './services/sga-api.service';
import {
  InputParametersTFormInterface,
  TForm,
  TFormBenchmarkValueSetterInterface,
  TFormValueGetterInterface
} from "./interfaces/forms.interface";
import sgaInputParametersFields from './utils/sga-input-parameters-fields';
import { benchmarkCalculationValidator } from './validators/sga-benchmark.validator';
import { SelectedUnitPreferenceEnum } from './interfaces/selectedUnits.interface';
import { ProposedDataInterface } from "./interfaces/steam-generation-form.interface";
import { ChartBarDataInterface } from './interfaces/chart-bar.interface';
import { SgaChartService } from "./services/sga-chart.service";
import { SgaTotalSavingInterface } from "./interfaces/sga-chart-data.Interface";
import { CalcBenchmarkResInterface } from "./interfaces/calc-benchmark-res.interface";
import { validateProposedCalculation } from "./validators/sga-proposed-setup.validator";
import {
  generateSavedData,
  generateSavedDataFromChart,
  parseSavedChartData,
  parseSavedData, patchSavedDataToForm
} from "./utils/generate-saved-data";
import { Unit } from 'sizing-shared-lib/lib/shared/units/unit.model';
import { SGA_SIZING_UNITS_LIST } from "./utils/sga-sizing-units-list";
import swal from "sweetalert";


@Component({
  selector: 'app-steam-generation-assessment',
  templateUrl: './steam-generation-assessment.component.html',
  styleUrls: ['./steam-generation-assessment.component.scss']
})
export class SteamGenerationAssessmentComponent extends BaseSizingModule implements OnDestroy {
  readonly moduleGroupId: number = 9;
  readonly moduleName: string = 'steamGenerationAssessment';
  private ngUnsubscribe = new Subject<void>();
  moduleId = 2;
  jobStatusId = 1;
  projectId: string;
  projectName: string;
  jobId: string;
  jobName: string;
  project: Project = new Project();
  job: Job = new Job();
  productName = 'Steam Generation Assessment';
  nextTab: TabDirective;
  sizingModuleForm: TForm<InputParametersTFormInterface> = this.formService.getInputParamsFg();
  sizingModuleResults: CalcBenchmarkResInterface;
  setBenchmarkInputValue: TFormBenchmarkValueSetterInterface;
  getSizingFormValues: TFormValueGetterInterface;
  proposalSetupTotal: SgaTotalSavingInterface;
  benchmarkChartData: ChartBarDataInterface[];
  proposalSetupHorizontalChart: ChartBarDataInterface[];
  proposalVerticalChart: ChartBarDataInterface[];
  finalProposalHorizontalChart: ChartBarDataInterface[];
  requestLoading$ = this.apiService.requestLoading$;
  currency$ = this.preferenceService.sizingUnitPreferencesUpdate.pipe(
    filter((v) => v.updated.preference.name === 'BHCurrency'),
    map(({updated}) => updated.preference.unitName)
  );
  units: { [key: number]: string };

  @ViewChild('tabsRef', {static: true}) tabsRef: TabsetComponent;

  constructor(
    private preferenceService: PreferenceService,
    private unitsService: UnitsService,
    private elRef: ElementRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modulePreferenceService: ModulePreferenceService,
    protected translationService: TranslationService,
    private adminService: AdminService,
    private formService: SgaFormService,
    private apiService: SgaApiService,
    private translatePipe: TranslatePipe,
    private messagesService: MessagesService,
    private chartService: SgaChartService,
    private projectsJobsService: ProjectsJobsService
  ) {
    super();

    this.jobId = this.activatedRoute.snapshot.params['jobId'];
    this.projectId = this.activatedRoute.snapshot.params['projectId'];
    this.setBenchmarkInputValue = this.formService.createFormValueSetter<BenchmarkInputsInterface>(this.sizingModuleForm, 'benchmarkInputs');
    this.getSizingFormValues = this.formService.createFormValueGetter(this.sizingModuleForm);
    this.sizingModuleForm.get('benchmarkInputs').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.resetBenchmarkData());
    this.setSgaUnits(this.unitsService);
    this.createSizingPref().pipe(
      takeUntil(this.ngUnsubscribe),
      map(selectedUnits => {
        const selectedControls = this.sizingModuleForm.get('selectedUnits') as FormGroup;

        for (const controlsKey in selectedControls.controls) {
          const selectedControl = selectedControls.get(controlsKey);

          if (selectedUnits && selectedUnits[controlsKey] && selectedControl && !selectedControl.value) {
            selectedControl.patchValue(selectedUnits[controlsKey], {emitEvent: false, onlySelf: true});
          }
        }

        // Load default values for new Job
        if (!this.jobId) {
          this.loadDefaultValues();
          this.convertUnits(this.getDefaultConvertedUnits());
        }

        return selectedUnits;
      }),
      switchMap(() => this.loadJob({jobId: this.jobId, projectId: this.projectId})),
      filter(patchedFormData => this.jobId && !patchedFormData)
    ).subscribe(() => {
      // Load default values is no Job Sizing
      this.loadDefaultValues();
      this.convertUnits(this.getDefaultConvertedUnits());
    });
    this.formFieldsChangesSubscribtions();
  }

  setTestData() {
    this.sizingModuleForm.patchValue({
      "selectedUnits": {
        "energyUnitSelected": 108,
        "smallWeightUnitSelected": 26,
        "emissionUnitSelected": 27,
        "volumeUnitSelected": 16,
        "smallVolumetricFlowUnitSelected": 76,
        "massFlowUnitSelected": 230,
        "smallMassFlowUnitSelected": 84,
        "pressureUnitSelected": 50,
        "temperatureUnitSelected": 146,
        "tdsUnitSelected": 228,
        "fuelUnitSelected": 108
      },
      "benchmarkInputs": {
        "hoursOfOperation": 8736,
        "isSteamFlowMeasured": true,
        "isAutoTdsControlPResent": false,
        "boilerSteamGeneratedPerYear": null,
        "boilerSteamGeneratedPerHour": 1,
        "inputFuelId": "8c24c468-e50a-45ac-bc4c-8ebd60470c99",
        "costOfFuelPerUnit": 0.0000849504,
        "fuelQtyPerYearIsKnown": false,
        "costOfFuelPerYear": null,
        "fuelConsumptionPerYear": null,
        "fuelEnergyPerUnit": 1,
        "fuelCarbonContent": 0.184973,
        "costOfWaterPerUnit": 0.326775872,
        "costOfEffluentPerUnit": 0.2973264,
        "boilerHouseWaterQtyPerYearIsKnown": false,
        "costOfWaterPerYear": null,
        "waterConsumptionPerHour": null,
        "waterConsumptionPerYear": null,
        "boilerWaterTreatmentChemicalCostsIsKnown": false,
        "totalChemicalCostPerYear": null,
        "o2ScavengingChemicalsCostSavings": null,
        "isCo2OrCarbonEmissionsTaxed": false,
        "carbonTaxLevyCostPerUnit": null,
        "costOfCo2PerUnitMass": null,
        "isBlowdownVesselPresent": false,
        "isCoolingWaterUsed": false,
        "isSuperheatedSteam": false,
        "boilerEfficiency": 80,
        "isFeedWaterMeasured": false,
        "boilerSteamPressure": 10,
        "boilerSteamTemperature": 184.115270845302,
        "isEconomizerPresent": false,
        "boilerAverageTds": 200,
        "boilerMaxTds": 300,
        "boilerFeedwaterConsumptionPerHour": null,
        "boilerFeedwaterConsumptionPerYear": null,
        "isFlashVesselPresent": false,
        "isHeatExchangerPresent": false,
        "waterTemperatureLeavingHeatExchanger": null,
        "waterTreatmentMethod": "aa5642a0-88a5-43e1-ba9d-367db3bb9df5",
        "percentageWaterRejection": 4,
        "tdsOfMakeupWater": 155,
        "isMakeUpWaterMonitored": false,
        "temperatureOfMakeupWater": 10,
        "makeupWaterAmountPerHour": null,
        "makeupWaterAmountPerYear": null,
        "atmosphericDeaerator": true,
        "pressurisedDeaerator": false,
        "temperatureOfFeedtank": 80,
        "tdsOfFeedwaterInFeedtank": 70,
        "tdsOfCondensateReturn": 9,
        "temperatureOfCondensateReturn": 20,
        "areChemicalsAddedDirectlyToFeedtank": false,
        "pressureOfFeedtank": null,
        "pressureOfSteamSupplyingDsi": null,
        "isCondensateReturnKnown": false,
        "percentageOfCondensateReturn": null,
        "volumeOfCondensateReturn": null,
        "isDsiPresent": false
      }
    }, {emitEvent: false});
    this.sizingModuleForm.get('benchmarkInputs.boilerSteamGeneratedPerHour').enable();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.preferenceService.clearUnitPreferences();
    this.formService.resetInputParamsFg();
    this.resetBenchmarkData();
  }

  onCalculateSizing(formGroup: FormGroup): any {
    this.resetBenchmarkData();
    this.apiService.calculateBenchmark(formGroup.getRawValue())
      .pipe(
        takeUntil(this.ngUnsubscribe),
        map(res => benchmarkCalculationValidator(res, this.sizingModuleForm, this.elRef)),
        filter((v) => !!v)
      )
      .subscribe((res) => {
        this.showMessage(res && res.messages);
        this.sizingModuleForm.markAsUntouched();
        this.sizingModuleResults = res;
        this.formService.getProposedSetupForm()
          .patchValue({features: res.features, proposedSetup: res.proposedSetup}, {emitEvent: false});
        this.benchmarkChartData = this.chartService
          .generateBenchmark(this.sizingModuleResults.benchmark, 'benchmark');
        setTimeout(() => {
          this.setActiveTab(1);
          this.sizingModuleForm.markAllAsTouched();
        });
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
    this.project = new Project();
    this.job = new Job();

    if (!savedProjectDetails) {
      return null;
    }

    const processConditions = this.generateProcessConditions();
    const job = new Job();
    const project = new Project();
    const {projectReference = null, customerName = '', id, jobs } = savedProjectDetails;
    const savedJob = jobs && jobs[0];

    job.id =  this.jobId || '';
    job.name = this.jobName;
    job.moduleId = this.moduleId;
    job.productName = savedJob && savedJob.productName || this.productName || '';
    job.jobStatusId = savedJob && savedJob.jobStatusId || this.jobStatusId || 1;
    project.id = this.projectId;
    project.name = this.projectName;
    project.customerName = customerName;
    project.projectReference = projectReference;

    if (!job.id) {
      job.plantOwner = savedJob && savedJob.plantOwner || '';
    }
    if (typeof id === 'undefined') {
      project.id = '';
      job.projectId = '';
    } else {
      job.projectId = this.projectId;
    }


    project.jobs = job && [job] || null;

    this.job = job;
    this.project = project;

    return {
      project: this.project,
      sizingData: {
        sizingOutput: {
          outputItems: [{
            name: 'IsResetEnabled',
            value: (!this.sizingModuleForm.pristine).toString(),
            unitId: null,
            selected: false,
            listItemId: null,
            type: null
          }],
          outputGrid: { outputGridRows: new Array<OutputGridRow>() },
        },
        processConditions
      }
    };
  }

  private generateProcessConditions(): ProcessCondition[] {
    const processConditions = new Array<ProcessCondition>();
    const unitPreferences = this.preferenceService.sizingUnitPreferences.map(unit => unit.preference);
    const {selectedUnits, benchmarkInputs} = this.sizingModuleForm.getRawValue();

    processConditions.push({
      name: 'selectedUnits',
      processInputs: generateSavedData(selectedUnits),
      unitPreferences: unitPreferences
    }, {
      name: 'benchmarkInputs',
      processInputs: generateSavedData(benchmarkInputs),
      unitPreferences: unitPreferences
    });

    if (this.sizingModuleResults) {
      if (this.sizingModuleResults.benchmark) {
        this.job.jobStatusId = this.jobStatusId = 2; // Calculated
        processConditions.push({
          name: 'benchmark',
          processInputs: generateSavedData(this.sizingModuleResults.benchmark),
          unitPreferences: unitPreferences
        })
      }

      if (this.sizingModuleResults.features) {
        processConditions.push({
          name: 'features',
          processInputs: generateSavedData(this.sizingModuleResults.features),
          unitPreferences: unitPreferences
        })
      }

      if (this.sizingModuleResults.proposedSetup) {
        processConditions.push({
          name: 'proposedSetup',
          processInputs: generateSavedData(this.sizingModuleResults.proposedSetup),
          unitPreferences: unitPreferences
        });
      }

      if (this.sizingModuleResults.overallProposal) {
        this.job.jobStatusId = this.jobStatusId = 3; // Proposal generated
        processConditions.push({
          name: 'overallProposal',
          processInputs: generateSavedData(this.sizingModuleResults.overallProposal),
          unitPreferences: unitPreferences
        });
      }
    }

    if (this.finalProposalHorizontalChart) {
      processConditions.push({
        name: 'finalProposalHorizontalChart',
        processInputs: generateSavedDataFromChart(this.finalProposalHorizontalChart),
        unitPreferences: unitPreferences
      });
    }

    if (this.proposalSetupHorizontalChart) {
      processConditions.push({
        name: 'proposalSetupHorizontalChart',
        processInputs: generateSavedDataFromChart(this.proposalSetupHorizontalChart),
        unitPreferences: unitPreferences
      });
    }

    if (this.proposalVerticalChart) {
      processConditions.push({
        name: 'proposalVerticalChart',
        processInputs: generateSavedDataFromChart(this.proposalVerticalChart),
        unitPreferences: unitPreferences
      });
    }

    if (this.proposalSetupTotal) {
      processConditions.push({
        name: 'proposalSetupTotal',
        processInputs: [{
          name: 'steamGenerationSavings',
          value: this.proposalSetupTotal.steamGenerationSavings.toString(),
          unitId: null,
          listItemId: null,
          value2: null,
          childInputs: null,
        }, {
          name: 'savingsIncludingCondensateEffluent',
          value: this.proposalSetupTotal.savingsIncludingCondensateEffluent.toString(),
          unitId: null,
          listItemId: null,
          value2: null,
          childInputs: null,
        }],
        unitPreferences: unitPreferences
      });
    }

    return processConditions;
  }

  onSaveJob(): boolean {
    return !(this.project && this.project.id && this.projectName && this.job && this.job.id && this.jobName);
  }

  saveJobToNewProject(jobRequest: GetSizingJobRequest) {
    if (jobRequest && jobRequest.jobId && jobRequest.projectId) {
      this.redirectToJob(jobRequest.projectId, jobRequest.jobId);
    }
  }

  repackageSizing(): any {
    let project = this.project;

    if (!project && this.projectId) {
      project = this.projectsJobsService.projectsJobs &&
        this.projectsJobsService.projectsJobs.projects &&
        this.projectsJobsService.projectsJobs.projects.find(({id}) => id === this.projectId);

      if (!project) {
        project = new Project();
        project.id = this.projectId;
        project.name = this.projectName;
      }
    }

    const jobSizing = this.onSave(project);

    if (jobSizing !== null) {
      this.apiService.changeLoading(true, 'updateJobSizing');
      this.projectsJobsService.updateJobSizing(jobSizing).pipe(
        takeUntil(this.ngUnsubscribe),
        tap(null, null, () => this.apiService.changeLoading(false, 'updateJobSizing'))
      ).subscribe(() => this.redirectToJob(this.projectId, this.jobId));
    }
  }

  onUnitsChanged(): any {
    const data = this.updateSizingPref();
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

    this.convertUnits(data.filter(({propertyName}) => propertyName !== 'fuelEnergyPerUnit' && propertyName !== 'fuelCarbonContent'));
    if (data.some((v) => v.propertyName === 'fuelEnergyPerUnit' || v.propertyName === 'fuelCarbonContent')) {
      this.calculateCalorificValue({energyUnitSelected, smallWeightUnitSelected, inputFuelId, fuelUnitSelected});
    }

    if (
      data.some(({propertyName}) => propertyName === 'boilerSteamTemperature') &&
      isSuperheatedSteam && boilerSteamPressure && pressureUnitSelected && temperatureUnitSelected
    ) {
      this.apiService.calculateSaturatedAndTemperature({
        boilerSteamTemperature: null,
        isSuperheatedSteam, boilerSteamPressure,
        pressureUnitSelected, temperatureUnitSelected
      }).pipe(
        takeUntil(this.ngUnsubscribe),
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

    if (data.length) {
      this.resetBenchmarkData();
    }

    return true;
  }

  public nextTabHandle(tabsRef?: TabsetComponent): void {
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

  public setActiveTab(tab: number | TabDirective): void {
    if (tab instanceof TabDirective) {
      const tabIndex = this.tabsRef.tabs.indexOf(tab);

      if (tabIndex !== -1) {
        this.nextTab = this.tabsRef.tabs[tabIndex + 1] &&
        this.tabsRef.tabs[tabIndex + 1].disabled ? null : this.tabsRef.tabs[tabIndex + 1];
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

  public calculateProposedSetup({proposalInputs, isFinal}: {proposalInputs: ProposedDataInterface, isFinal?: boolean}) {
    if (!proposalInputs || !proposalInputs.proposedSetup || !proposalInputs.features) { return; }

    const fg = this.formService.getProposedSetupForm().get('proposedSetup') as FormGroup;

    this.apiService.calculateProposal({ ...this.sizingModuleForm.getRawValue(), proposalInputs })
      .pipe(takeUntil(this.ngUnsubscribe), map(v  => validateProposedCalculation(v, fg)), filter((v) => !!v))
      .subscribe(res => {
        this.showMessage(res && res.messages);
        fg.markAsUntouched();

        if (res && res.proposal) {
          const overall = res.proposal.find(v => !!v && !!v.overallImpactOnProposalsSelectedOnBoilerHouse);
          const chartName = isFinal ? 'final' : 'setup';
          const {total, vertical, horizontal} = this.chartService.generateProposal(res.proposal, chartName);

          this.sizingModuleResults.proposedSetup = proposalInputs.proposedSetup;
          this.sizingModuleResults.features = proposalInputs.features;
          this.sizingModuleResults.overallProposal = overall && overall.overallImpactOnProposalsSelectedOnBoilerHouse;
          this.proposalVerticalChart = vertical;
          this.proposalSetupTotal = total;

          if (isFinal) {
            this.finalProposalHorizontalChart = horizontal;
          } else {
            this.finalProposalHorizontalChart = null;
            this.proposalSetupHorizontalChart = horizontal;
          }

          this.sizingModuleForm.markAllAsTouched();
        }
      });
  }

  public calculateBoilerEfficiency(data: SgaCalcBoilerEfficiencyReqInterface): void {
    if (!data.inputFuelId || data.isEconomizerPresent === undefined || data.isEconomizerPresent === null) { return null; }

    this.apiService.calculateBoilerEfficiency(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ boilerEfficiency }) => this.setBenchmarkInputValue('boilerEfficiency', boilerEfficiency));
  }

  public calculateCarbonEmission(data: SgaCalcCarbonEmissionReqInterface): void {
    if (!data.inputFuelId || !data.fuelUnitSelected || !data.fuelEnergyPerUnit || !data.fuelCarbonContent ||
      !data.energyUnitSelected || !data.smallWeightUnitSelected) { return null; }

    this.apiService.calculateCarbonEmission(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({fuelCarbonContent}) => this.setBenchmarkInputValue('fuelCarbonContent', fuelCarbonContent));
  }

  public calculateCalorificValue(data: SgaCalcCalorificReqInterface): void {
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

  public calculateWaterTreatment(data: SgaCalcWaterTreatmentReqInterface): void {
    if (!data.waterTreatmentMethodId || !data.tdsUnitSelected) { return null; }

    this.apiService.calculateWaterTreatment(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => this.setBenchmarkInputValue(res));
  }

  public resetFinalProposal(): void {
    this.finalProposalHorizontalChart = this.proposalVerticalChart = null;
    this.sizingModuleForm.markAllAsTouched(); // Enable save changes btn
  }

  private showMessage(messages: any[]) {
    if (messages && messages.length) {
      const msg = messages.map(m => typeof m === 'string' ? {
        messageKey: m,
        value: null,
        unitKey: null,
        severity: '0',
        displayValue: null
      } : {
        messageKey: m && m.code || m.messageKey || m.errorMessage,
        value: m && m.value,
        unitKey: m && m.unitKey,
        severity: m && m.severity,
        displayValue: m && m.displayValue || m.customState,
      });

      if (msg && msg.length) {
        this.messagesService.addMessage(msg);
      }
    }
  }

  private resetBenchmarkData() {
    if (this.benchmarkChartData) {
      this.benchmarkChartData = null;
    }
    if (this.sizingModuleResults) {
      this.sizingModuleResults = null;
    }
    if (this.proposalVerticalChart) {
      this.proposalVerticalChart = null;
    }
    if (this.proposalSetupHorizontalChart) {
      this.proposalSetupHorizontalChart = null;
    }
    if (this.proposalSetupTotal) {
      this.proposalSetupTotal = null;
    }
    if (this.finalProposalHorizontalChart) {
      this.finalProposalHorizontalChart = null;
    }
    this.setActiveTab(0);
  }

  private createSizingPref(): Observable<any> {
    const creationFn = (units?: Unit[], isLoadJob?: boolean): any => {
      const newValues = {};
      const fuelControl = this.sizingModuleForm.get('benchmarkInputs.inputFuelId');
      const fuelId = fuelControl && fuelControl.value;
      const enumerationDefinition = this.getEnumerationDefinition('FuelTypeList_BoilerHouseInput', fuelId && {id: fuelId});
      const fuelTypeName = FuelTypesEnumerationLetter[enumerationDefinition.value.charAt(0).toUpperCase()];

      for (const {selectedUnitName, name, masterTextKey} of SGA_SIZING_UNITS_LIST) {
        const preference = this.preferenceService.allPreferences.find((p) => p.name === name || p.name === name + 's');
        const unitControl = this.sizingModuleForm.get(`selectedUnits.${selectedUnitName}`);

        if (preference) {
          const unit = isLoadJob && units && units.find(v => v && unitControl && v.id === unitControl.value && v.unitType === preference.name);
          if (unit && preference.value !== unit.id.toString()) {
            preference.value = unit.id.toString();
            preference.unitName = unit.units;
            preference.masterTextKey = unit.masterTextKey;
          }

          switch (preference.name) {
            case 'BHCurrency': {
              this.adminService.getCurrencyData().subscribe(currencies => {
                const currency = currencies.find(({currencyCode}) => currencyCode === preference.value);

                if (currency) {
                  this.preferenceService.addSizingUnitPreference(
                    {...preference, unitName: currency.symbol, masterTextKey: currency.masterTextKey},
                    name,
                    masterTextKey,
                    this.moduleGroupId,
                    undefined,
                    currencies
                  );
                }
              });
              break;
            }
            default: {
              const unitType = name.slice(-1) === 's' ? name : name + 's';

              this.preferenceService.addSizingUnitPreference(preference, unitType, masterTextKey, this.moduleGroupId);

              if (unitControl && Number(preference.value)) {
                if (selectedUnitName !== 'fuelUnitSelected') {
                  newValues[selectedUnitName] = Number(preference.value);
                } else if (fuelTypeName === name) {
                  fuelControl.patchValue(enumerationDefinition.id);
                  newValues[selectedUnitName] = Number(preference.value);
                }
              }
            }
          }
        }
      }

      // Set Water Treatment Method
      const {id} = this.getEnumerationDefinition('WaterTreatmentMethodList_BoilerHouseInput');
      this.setBenchmarkInputValue('waterTreatmentMethod', id);

      return newValues;
    }

    if (!this.unitsService.units || !this.unitsService.units.length) {
      return this.unitsService.getAllUnitsByAllTypes().pipe(first(), map(units => creationFn(units, !!this.jobId)));
    } else {
      return of(creationFn(this.unitsService.units, !!this.jobId));
    }
  }

  private updateSizingPref(sizingUnitPreference?: SizingUnitPreference[]): UnitConvert[] {
    const sizingPreferences = sizingUnitPreference || this.preferenceService.sizingUnitPreferences;
    const fuelId = this.sizingModuleForm.get('benchmarkInputs.inputFuelId').value;
    const enumerationDefinition = this.getEnumerationDefinition('FuelTypeList_BoilerHouseInput', fuelId && {id: fuelId});
    const fuelTypeName = FuelTypesEnumerationLetter[enumerationDefinition.value.charAt(0).toUpperCase()];
    let unitConverts: UnitConvert[] = [];

    for (const {selectedUnitName, name} of SGA_SIZING_UNITS_LIST) {
      const unitControl = this.sizingModuleForm.get(`selectedUnits.${selectedUnitName}`);
      const sizingPreference = sizingPreferences.find(({preference}) => preference.name === name);
      const preference = sizingPreference && sizingPreference.preference;
      const newUnitId = preference && Number(preference.value);

      if (unitControl && unitControl.value && unitControl.value !== newUnitId) {
        if (name === fuelTypeName && unitControl.value !== newUnitId) {
          const unitConvert = this.createConvert('FUEL_TYPE_NAME', SelectedUnitPreferenceEnum[fuelTypeName], newUnitId)
          unitConverts = unitConverts.concat(unitConvert);
          unitControl.patchValue(newUnitId);
        } else if (selectedUnitName !== 'fuelUnitSelected' && unitControl && unitControl.value !== newUnitId) {
          const unitConvert = this.createConvert(preference.name, SelectedUnitPreferenceEnum[preference.name], newUnitId);
          unitConverts = unitConverts.concat(unitConvert);
          unitControl.patchValue(newUnitId);
        }
      }
    }

    // Set Water Treatment Method
    const {id} = this.getEnumerationDefinition('WaterTreatmentMethodList_BoilerHouseInput');
    this.setBenchmarkInputValue('waterTreatmentMethod', id);

    return unitConverts;
  }

  private createConvert(name: string, selectedUnitsName: string, newValue: any): UnitConvert[] {
    const unitConverts: UnitConvert[] = [];

    for (const key of Object.keys(sgaInputParametersFields)) {
      const item = sgaInputParametersFields[key];
      if (item && item.unitNames && item.unitNames.includes(name)) {
        const values = this.getSizingFormValues({selectedUnits: selectedUnitsName, benchmarkInputs: key});
        const control = this.sizingModuleForm.get(`benchmarkInputs.${key}`);
        if (control && control.pristine && control.value && values[selectedUnitsName] && values[key]) {
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
            const control = this.sizingModuleForm.get('selectedUnits.fuelUnitSelected');
            if (control && !control.value) {
              control.setValue(Number(value), {onlySelf: true, emitEvent: false});
            }
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

        if (!initialUnitId || !targetUnitId || !initialValue) { return false; }

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
    const preference = this.preferenceService.sizingUnitPreferences.find(({ unitType }) => unitType === 'BHCurrency');
    if (preference) {
      this.adminService.getCurrencyData().subscribe((currencies) => this.preferenceService.addSizingUnitPreference(
        preference.preference,
        preference.unitType,
        'CURRENCY',
        this.moduleGroupId,
        undefined,
        currencies
      ));
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

  private loadJob(data?: {projectId?: string, jobId?: string}): Observable<any> {

    if (data && data.jobId && data.projectId) {
      this.apiService.changeLoading(true, 'getProjectsAndJobs');
      this.projectsJobsService.getProjectsAndJobs()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => this.apiService.changeLoading(false, 'getProjectsAndJobs'));
    }

    // this.activatedRoute.params
    //   .pipe(takeUntil(this.ngUnsubscribe), filter(({projectId, jobId}: Params) => !!projectId && !!jobId))
    //   .subscribe(({projectId, jobId}: Params) => {
    //     this.projectId = projectId;
    //     this.jobId = jobId;
    //     this.apiService.changeLoading(true, 'getProjectsAndJobs');
    //     this.projectsJobsService.getProjectsAndJobs()
    //       .subscribe(() => this.apiService.changeLoading(false, 'getProjectsAndJobs'));
    //   });

    return this.projectsJobsService.projectJobsChange
      .pipe(
        first(),
        tap(() => this.apiService.changeLoading(true, 'projectJobsChange', true)),
        map(({projects}) => this.projectId && projects && projects.find((p) => p && p.id === this.projectId)),
        map(project => {
          this.project = project;
          this.job = project && project.jobs && this.jobId  && project.jobs.find((j) => j && j.id === this.jobId);

          if ((this.projectId && !this.project) || (this.jobId && !this.job)) {
            swal({
              title: this.translatePipe.transform('ERROR'),
              text: this.translatePipe.transform('SELECTED_JOB_WAS_NOT_FOUND_MESSAGE'),
              icon: "error",
              dangerMode: true
            }).then(() => this.router.navigate(['/home']));
            return null;
          }

          if (this.project) {
            this.projectName = this.project.name;
          }

          if (this.job) {
            this.jobName = this.job.name;
            this.productName = this.job.productName;
            this.moduleId = this.job.moduleId;
            this.jobStatusId = this.job.jobStatusId;
          }

          return {projectId: project && project.id, jobId: this.job && this.job.id};
        }),
        switchMap((data) => {
          if (!data || !data.projectId || !data.jobId) {
            return of(null);
          }

          return this.projectsJobsService.getJobSizing({projectId: data.projectId, jobId: data.jobId});
        }),
        map(sizingData => {
          if (!sizingData || !sizingData.processConditions && !sizingData.processConditions.length) {
            return null;
          }

          const data = sizingData.processConditions.reduce((acc, v) => ({
            ...acc, [v.name]: v.processInputs
          }), {})
          return this.setLoadedJobData(data);
        }),
        tap(()=>{}, ()=>{}, () => this.apiService.changeLoading(false, 'projectJobsChange', true))
      );
  }

  private setLoadedJobData(data: {[key: string]: ProcessInput[]}): any {
    if (!data) {
      return null;
    }
    const patchedValues = {};

    // INPUT PARAMETERS
    if (data.selectedUnits) {
      patchedValues['selectedUnits'] =
        patchSavedDataToForm(data.selectedUnits, this.sizingModuleForm.get('selectedUnits') as FormGroup);
    }
    if (data.benchmarkInputs) {
      patchedValues['benchmarkInputs'] =
        patchSavedDataToForm(data.benchmarkInputs, this.sizingModuleForm.get('benchmarkInputs') as FormGroup);
    }

    // BENCHMARK
    if (data.benchmark && data.features && data.proposedSetup) {
      this.sizingModuleResults = {
        benchmark: parseSavedData(data.benchmark),
        features: parseSavedData(data.features),
        proposedSetup: parseSavedData(data.proposedSetup),
      } as CalcBenchmarkResInterface;

      this.formService.getProposedSetupForm().patchValue({
        features: this.sizingModuleResults.features,
        proposedSetup: this.sizingModuleResults.proposedSetup
      }, {emitEvent: false});

      patchedValues['features'] = this.sizingModuleResults.features;
      patchedValues['proposedSetup'] = this.sizingModuleResults.proposedSetup;
      this.benchmarkChartData = this.chartService
        .generateBenchmark(this.sizingModuleResults.benchmark, 'benchmark');
    }

    // PROPOSED AND FINAL SETUP
    if (data.proposalSetupHorizontalChart) {
      this.proposalSetupHorizontalChart = parseSavedChartData(data.proposalSetupHorizontalChart);
    }
    if (data.proposalVerticalChart) {
      this.proposalVerticalChart = parseSavedChartData(data.proposalVerticalChart);
    }
    if (data.proposalSetupTotal) {
      this.proposalSetupTotal = parseSavedData(data.proposalSetupTotal) as SgaTotalSavingInterface;
    }
    if (data.finalProposalHorizontalChart) {
      this.finalProposalHorizontalChart = parseSavedChartData(data.finalProposalHorizontalChart);
    }
    if (data.overallProposal) {
      this.sizingModuleResults.overallProposal = parseSavedData(data.overallProposal);
    }

    return patchedValues;
  }

  private loadDefaultValues() {
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
  }

  private formFieldsChangesSubscribtions() {
    // Calculate Steam Pressure
    combineLatest([
      this.sizingModuleForm.get('benchmarkInputs.boilerSteamPressure').statusChanges,
      this.sizingModuleForm.get('benchmarkInputs.boilerSteamPressure').valueChanges,
    ]).pipe(
      takeUntil(this.ngUnsubscribe),
      filter((v) => v && v[0] === 'VALID'),
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
      filter((v) => {
        const {prev, next} = v;
        return !this.sizingModuleForm.get('benchmarkInputs.isSuperheatedSteam').value || prev < next
      })
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

  private setSgaUnits(unitsService: UnitsService) {
    const generateUnits = (units) => units.reduce((acc, item) => ({...acc, [item.id]: item.units}), {});

    if (unitsService.units && unitsService.units.length) {
      this.units = generateUnits(unitsService.units);
    } else {
      const subscription = unitsService.getAllUnitsByAllTypes().subscribe(units => {
        subscription.unsubscribe();
        this.units = generateUnits(units);
      });
    }
  }

  private redirectToJob(projectId: string, jobId: string): void {
    const params = this.activatedRoute &&  this.activatedRoute.snapshot && this.activatedRoute.snapshot.params;
    if (projectId && jobId) {
      if (params && params.projectId && params.jobId && params.projectId === projectId && params.jobId === jobId) {
        swal({ title: 'SAVE', text: 'Saving complete', icon: "warning", dangerMode: false });
        return null;
      }

      swal({ title: 'SAVE', text: 'Saving complete', icon: "warning", dangerMode: false }).then(() => {
        if (this.jobId !== jobId) {
          this.jobId = jobId;
        }

        if (this.projectId !== projectId) {
          this.projectId = projectId;
        }

        this.router.navigate(['sizingModules/steamGenerationAssessment', projectId, jobId]).then(() => {
          console.log('-----NAVIGATED----', {projectId, jobId});
        });
      });
    }
  }

  get isActiveFinalProposal(): boolean {
    return !!(this.finalProposalHorizontalChart &&
      this.proposalVerticalChart &&
      this.sizingModuleResults &&
      this.sizingModuleResults.benchmark &&
      this.sizingModuleResults.overallProposal &&
      this.sizingModuleResults.proposedSetup);
  }
}
