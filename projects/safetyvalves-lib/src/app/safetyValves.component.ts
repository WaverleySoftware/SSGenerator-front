import { Component, OnInit, ViewChild, ElementRef, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { BaseSizingModule } from "sizing-shared-lib";
import { SafetyValvesService } from "./safetyValves.service";
import { SafetyValveProcessConditions, SafetyValveSizingResult, Options, OptionsResults, CalculationDetails, Details } from "./safetyValves.model";
import { CalculationsService } from "sizing-shared-lib";

import {
  Project, Job, SizingData, ProcessInput, OutputItem,
  OutputGridRow,
  SizingOutput,
  OutputGrid,
  GetSizingJobRequest,
  OutputGridRowMessageItem,
  JobSizing,
  ProcessCondition
} from "sizing-shared-lib";
import { ProjectsJobsService } from "sizing-shared-lib";
import { PreferenceDecimalPipe } from "sizing-shared-lib";
import * as cloneDeep_ from 'lodash/cloneDeep';
import { DocGen, TiRequestModel, TiDocumentInfosModel } from "sizing-shared-lib";
import { TranslationService } from "sizing-shared-lib";
import { Preference } from "sizing-shared-lib";
import { SpecSheetItem } from "sizing-shared-lib";
import { DocGenService } from "sizing-shared-lib";;
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UserProfileService } from "sizing-shared-lib";
import { User } from "sizing-shared-lib";
import * as FileSaver from 'file-saver';
import { TranslatePipe } from "sizing-shared-lib";
import { PreferenceService } from "sizing-shared-lib";
import { Subscription } from 'rxjs/Subscription';
import { Enumeration } from "sizing-shared-lib";
import { svDocGenService } from "./svDocGen.service";

import { SafetyValvesInputValidation, SafetyValvesProcessConditionsValidation, SafetyValvesValidationMessage, SafetyValvesValidationErrorMessage } from "./safetyValvesInputValidation.model";
import { LocaleService, LocaleValidation } from 'node_modules/angular-l10n';
import { UnitsService } from "sizing-shared-lib";
import { UnitConvert, UnitsConverter } from "sizing-shared-lib";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { DisplayPreferenceDirective } from "sizing-shared-lib";
import * as _swal from 'sweetalert';
import { SweetAlert } from 'sweetalert/typings/core';
const swal: SweetAlert = _swal as any;
import { ChangeDetectorRef } from '@angular/core';
import { element } from 'protractor';
import { isUndefined } from 'util';
import { Location } from '@angular/common';
//import { isNullOrUndefined } from '@swimlane/ngx-datatable';
import { isNullOrUndefined } from 'util';
import { HttpClient } from 'selenium-webdriver/http';
import { TiDocumentInfo } from 'projects/sizing-shared-lib/src/public-api';
import { IGenericChanges } from '../../../sizing-shared-lib/src/lib/modules/generic.changes.interface';

@Component({
  selector: 'safety-valves',
  templateUrl: './safetyValves.component.html',
  styleUrls: ['./safetyValves.component.scss']
})
export class SafetyValvesComponent extends BaseSizingModule implements OnInit, IGenericChanges {

  @ViewChild("pressureRef", { static: false }) pressureRef: DisplayPreferenceDirective;
  @ViewChild("temperatureRef", { static: false }) temperatureRef: DisplayPreferenceDirective;
  @ViewChild("noiseDistanceRef", { static: false }) noiseDistanceRef: DisplayPreferenceDirective;
  @ViewChild("massFlowRef", { static: false }) massFlowRef: DisplayPreferenceDirective;
  @ViewChild("volumetricFlowRef", { static: false }) volumetricFlowRef: DisplayPreferenceDirective;
  @ViewChild("loadRef", { static: false }) loadRef: DisplayPreferenceDirective;
  @ViewChild("forceRef", { static: false }) forceRef: DisplayPreferenceDirective;
  @ViewChild("areaRef", { static: false }) areaRef: DisplayPreferenceDirective;

  @ViewChild(DatatableComponent, { static: false }) table: DatatableComponent;
  @ViewChild('resultstable', { static: false }) resultstable: DatatableComponent;

  @ViewChild('collapseResultsTop', { static: false }) resultsContent: ElementRef; // for scroll to view
  @ViewChild('inputsContentTop', { static: false }) inputsContent: ElementRef; // for scroll to view

  @BlockUI('conditions-section') blockUi: NgBlockUI;
  private blockUiTimeOut;
  public cloneDeep = cloneDeep_;
  get safetyValveData(): SafetyValveSizingResult[] {
    return this.safetyValvesService.safetyValves;
  }

  theFormGroup: FormGroup; // to drive GenericChangesGuard
  hasUnsavedDataChanges: boolean; // to drive GenericChangesGuard

  public docGen: DocGen;
  public user: User;
  private projectsAndJobsSubscription: Subscription;
  public loadedJobSizingData: SizingData;
  public gridSelectedRow = false;
  public loadOptions = false;
  public temperatureDisabled = true;
  public normaltemperatureDisabled = true;

  private noisedistanceBaseValue: number = 30; // Base 3m
  private temperatureBaseValue: number = 0; // Base 0 DegC
  private normalTemperatureBaseValue: number = 20; // Base 20 DegC
  private standardTemperatureBaseValue: number = 0; // Base 0 DegC
  private pressureMinSV40xBaseValue: number = 1.65; // 1.65 Barg

  private noisedistanceDefaultValue: number = 30; // default 3m
  private temperatureDefaultValue: number = 0; // default 0 DegC
  private normalTemperatureDefaultValue: number = 20; // default 20 DegC
  private standardTemperatureDefaultValue: number = 0; // default 0 DegC
  private pressureMinSV40xDefaultValue: number = 1.65; // 1.65 Barg
  private overPressureDefaultValue: number = 10; // default 5 %

  private media: string;
  private calculationDetails: CalculationDetails;

  readonly moduleGroupId: number = 1;
  readonly moduleName: string = "Safety Valves";

  private isLoadingJob: boolean = false;
  private translatedMessagesList: any[];
  private selectedBodyMaterial: string;
  private volumetricFlowChanged: boolean = false;
  private onSelectRunning: boolean;
  massDensity: number = -1;

  rows: SafetyValveSizingResult[];
  selected = [];

  sizingModuleForm: FormGroup;
  safetyValves: SafetyValveProcessConditions;
  selectedSafetyValve: SafetyValveSizingResult;
  options: Options;

  mediaStateFromPPDS: string = "MEDIA_STATE_UNKNOWN"; // The real backing value, not for UI
  media_Enumeration: FormControl;
  mediaState: FormControl;
  pressure: FormControl;
  relievingpressure: FormControl;
  temperature: FormControl;
  relievingtemperature: FormControl;
  normaltemperature: FormControl;
  massflow: FormControl;
  load: FormControl;
  overpressure: FormControl;
  noisedistance: FormControl;
  volumetricflow: FormControl;
  volumetricFlowSelectedPageUnitId: number; // Supports Normal/Standard/Actural Temperatures and Pressure for volumetric flow calcs for a gas, dymnically coupled to media and media state.
  safetyValveStandard_Enumeration: FormControl;
  selectedSafetyValveStandard: string;
  pipeStandard_Enumeration: FormControl;
  nominalBore_Enumeration: FormControl;
  backpressure90Elbows_Enumeration: FormControl;
  backpressure45Elbows_Enumeration: FormControl;
  backpressureSweptBends_Enumeration: FormControl;
  pipeLength: FormControl;

  selectedProducts: FormControl;
  showHideBackpressure: FormControl;
  backpressureOverride: FormControl;
  superImposed: FormControl;
  showHideFinish: FormControl;
  showNozzle: FormControl;
  inletSize: FormControl;
  outletSize_Enumeration: FormControl;
  inletConnection_Enumeration: FormControl;
  outletConnection_Enumeration: FormControl;
  bonnet_Enumeration: FormControl;
  lever_Enumeration: FormControl;
  seat_Enumeration: FormControl;
  spring_Enumeration: FormControl;
  finish_Enumeration: FormControl;
  nozzle_Enumeration: FormControl;
  productCode: FormControl;
  productNumber: FormControl;
  safetyValveStandardList: any[];
  inletConnectionList: any[];
  outletConnectionList: any[];
  leverConnectionList: any[];
  bonnetList: any[];
  leverList: any[];
  nozzleList: any[];
  safetyValveStandardEnumerationList: Enumeration;
  leverEnumerationList: Enumeration;
  bonnetEnumerationList: Enumeration;
  seatEnumerationList: Enumeration;
  springEnumerationList: Enumeration;
  nozzleEnumerationList: Enumeration;
  nozzleTypeEnumerationList: Enumeration;
  finishEnumerationList: Enumeration;
  mediaEnumerationList: Enumeration;
  bodyEnumerationList: Enumeration;
  inletConnectionEnumerationList: Enumeration;
  outletConnectionEnumerationList: Enumeration;
  outletSizeEnumerationList: Enumeration;
  seatList: any[];
  springList: any[];
  outletSizeList: any[];
  outletSizeListDisplay: any[];
  finishList: any[];
  timeout: any;
  userPrefs: Preference[];
  specSheetLanguage: string;
  sheet: FormControl;
  quantity: FormControl;
  revisionNumber: FormControl;
  aoNumber: FormControl;
  projectType: FormControl;
  orderNumber: FormControl;
  notes: FormControl;
  tagNumber: FormControl;

  areProjectsAndJobsLoaded: boolean = false;
  projectId: string; // Guid from P&Js
  jobId: string; // Guid from P&Js
  project: Project = new Project();
  job: Job = new Job();

  paramsSubscription: Subscription;

  isSVSizingDone: boolean = false;
  isSVSelected: boolean = false;
  isMassFlow: boolean = true;
  isBackpressure: boolean = false;
  isSuperBackPressure: boolean = false;

  pressureValidationErrorMessage: SafetyValvesValidationErrorMessage;
  overpressureValidationErrorMessage: SafetyValvesValidationErrorMessage;
  temperatureValidationErrorMessage: SafetyValvesValidationErrorMessage;
  normaltemperatureValidationErrorMessage: SafetyValvesValidationErrorMessage;
  massflowValidationErrorMessage: SafetyValvesValidationErrorMessage;
  volumetricflowValidationErrorMessage: SafetyValvesValidationErrorMessage;
  noisedistanceValidationErrorMessage: SafetyValvesValidationErrorMessage;

  selectedProductsValidationErrorMessage: SafetyValvesValidationErrorMessage;

  isInitialised: boolean = false;
  isSizing: boolean = false;

  scrollAnchor: string = "results";

  public debugData: string;
  public debugDataEnabled: boolean;

  /**
 * Anonymous hash to determine severity icons.
 */
  severityHash: { icon: string }[] = [
    { icon: "fa fa-info-circle info-message-class" },
    { icon: "fa fa-warning warning-message-class" },
    { icon: "fa fa-times-circle error-message-class" }
  ];


  constructor(
    private activatedRoute: ActivatedRoute,
    private projectsJobsService: ProjectsJobsService,
    private fb: FormBuilder,
    private safetyValvesService: SafetyValvesService,
    private calculationsService: CalculationsService,
    private preferenceDecimalPipe: PreferenceDecimalPipe,
    private docGenService: DocGenService,
    public translatePipe: TranslatePipe,
    private preferenceService: PreferenceService,
    private userProfileService: UserProfileService,
    private translationService: TranslationService,
    private localeService: LocaleService,
    private unitsService: UnitsService,
    private cdRef: ChangeDetectorRef,
    private location: Location,
    private svDocGenService: svDocGenService
  ) {



    // Call the abstract class' constructor.
    super();

    this.moduleId = 3; // for SafetyValves
    this.jobStatusId = 1; // default to Input state
    this.productName = "Safety Valve";

    this.safetyValves = new SafetyValveProcessConditions();

    this.options = new Options();

    this.pressureValidationErrorMessage = new SafetyValvesValidationErrorMessage();
    this.overpressureValidationErrorMessage = new SafetyValvesValidationErrorMessage();
    this.temperatureValidationErrorMessage = new SafetyValvesValidationErrorMessage();
    this.normaltemperatureValidationErrorMessage = new SafetyValvesValidationErrorMessage();
    this.massflowValidationErrorMessage = new SafetyValvesValidationErrorMessage();
    this.volumetricflowValidationErrorMessage = new SafetyValvesValidationErrorMessage();
    this.noisedistanceValidationErrorMessage = new SafetyValvesValidationErrorMessage();

    this.selectedProductsValidationErrorMessage = new SafetyValvesValidationErrorMessage();
    this.isInitialised = false; // component isInitialised flag

    this.media_Enumeration = new FormControl('Dry Saturated Steam');
    this.mediaState = new FormControl(this.translatePipe.transform(this.mediaStateFromPPDS.toUpperCase()));
    this.pressure = new FormControl(null, { validators: [Validators.required, (c) => this.validateFormControlInput(c, 'pressure', this.pressureRef, this.pressureValidationErrorMessage)] });
    this.relievingpressure = new FormControl('');
    this.temperature = new FormControl(this.temperatureDefaultValue, { validators: [Validators.required, (c) => this.validateFormControlInput(c, 'temperature', this.temperatureRef, this.temperatureValidationErrorMessage)] });
    this.relievingtemperature = new FormControl(this.temperatureDefaultValue);
    this.normaltemperature = new FormControl(this.normalTemperatureDefaultValue, { validators: [(c) => this.validateFormControlInput(c, 'normaltemperature', this.temperatureRef, this.normaltemperatureValidationErrorMessage)] });
    this.massflow = new FormControl(null, { validators: [Validators.required, (c) => this.validateFormControlInput(c, 'massflow', this.massFlowRef, this.massflowValidationErrorMessage)] });
    this.load = new FormControl(null);
    this.overpressure = new FormControl(this.overPressureDefaultValue, { validators: [Validators.required, (c) => this.validateFormControlInput(c, 'overpressure', this.pressureRef, this.overpressureValidationErrorMessage)] });
    this.noisedistance = new FormControl(this.noisedistanceDefaultValue, { validators: [Validators.required, (c) => this.validateFormControlInput(c, 'noisedistance', this.noiseDistanceRef, this.noisedistanceValidationErrorMessage)] });
    this.volumetricflow = new FormControl(null, { validators: [Validators.required, (c) => this.validateFormControlInput(c, 'volumetricflow', this.volumetricFlowRef, this.volumetricflowValidationErrorMessage)] });
    this.safetyValveStandard_Enumeration = new FormControl('EN ISO 4126');
    this.pipeStandard_Enumeration = new FormControl('');
    this.nominalBore_Enumeration = new FormControl('');
    this.backpressure90Elbows_Enumeration = new FormControl('');
    this.backpressure45Elbows_Enumeration = new FormControl('');
    this.backpressureSweptBends_Enumeration = new FormControl('');
    this.showHideBackpressure = new FormControl(false);
    this.backpressureOverride = new FormControl(false);
    this.showHideFinish = new FormControl(false);
    this.showNozzle = new FormControl(false);



    this.pipeLength = new FormControl('');
    this.superImposed = new FormControl('');

    this.selectedProducts = new FormControl('', { validators: [Validators.required, (c) => this.validateFormControlSelectedProducts(c, this.selectedProductsValidationErrorMessage)] });

    this.inletSize = new FormControl('');
    this.outletSize_Enumeration = new FormControl('');
    this.inletConnection_Enumeration = new FormControl('');
    this.outletConnection_Enumeration = new FormControl('');
    this.bonnet_Enumeration = new FormControl('');
    this.lever_Enumeration = new FormControl('');
    this.seat_Enumeration = new FormControl('');
    this.spring_Enumeration = new FormControl('');
    this.productCode = new FormControl('');
    this.productNumber = new FormControl('');
    this.finish_Enumeration = new FormControl('');
    this.nozzle_Enumeration = new FormControl('-');
    this.safetyValveStandardList = [];
    this.inletConnectionList = [];
    this.outletConnectionList = [];
    this.bonnetList = [];
    this.seatList = [];
    this.leverList = [];
    this.nozzleList = [];
    this.springList = [];
    this.outletSizeList = [];
    this.outletSizeListDisplay = [];
    this.sheet = new FormControl('');
    this.quantity = new FormControl('');
    this.revisionNumber = new FormControl('');
    this.aoNumber = new FormControl('');
    this.projectType = new FormControl('');
    this.orderNumber = new FormControl('');
    this.notes = new FormControl('');
    this.tagNumber = new FormControl('');


    this.translatedMessagesList = [];

    this.sizingModuleForm = this.fb.group({
      media_Enumeration: this.media_Enumeration,
      mediaState: this.mediaState,
      pressure: this.pressure,
      relievingpressure: this.relievingpressure,
      overpressure: this.overpressure,
      temperature: this.temperature,
      relievingtemperature: this.relievingtemperature,
      normaltemperature: this.normaltemperature,
      massflow: this.massflow,
      load: this.load,
      noisedistance: this.noisedistance,
      volumetricflow: this.volumetricflow,
      safetyValveStandard_Enumeration: this.safetyValveStandard_Enumeration,
      pipeStandard_Enumeration: this.pipeStandard_Enumeration,
      nominalBore_Enumeration: this.nominalBore_Enumeration,
      backpressure90Elbows_Enumeration: this.backpressure90Elbows_Enumeration,
      backpressure45Elbows_Enumeration: this.backpressure45Elbows_Enumeration,
      backpressureSweptBends_Enumeration: this.backpressureSweptBends_Enumeration,
      selectedProducts: this.selectedProducts,
      showHideBackpressure: this.showHideBackpressure,
      backpressureOverride: this.backpressureOverride,
      showHideFinish: this.showHideFinish,
      showNozzle: this.showNozzle,
      pipeLength: this.pipeLength,
      superImposed: this.superImposed,
      inletSize: this.inletSize,
      outletSize_Enumeration: this.outletSize_Enumeration,
      inletConnection_Enumeration: this.inletConnection_Enumeration,
      outletConnection_Enumeration: this.outletConnection_Enumeration,
      safetyValveStandardList: this.safetyValveStandardList,
      intletConnectionList: this.inletConnectionList,
      outletConnectionList: this.outletConnectionList,
      leverConnectionList: this.leverConnectionList,
      bonnetList: this.bonnetList,
      leverList: this.leverList,
      nozzleList: this.nozzleList,
      seatList: this.seatList,
      springList: this.springList,
      outletSizeList: this.outletSizeList,
      outletSizeListDisplay: this.outletSizeListDisplay,
      finishList: this.finishList,
      bonnet_Enumeration: this.bonnet_Enumeration,
      lever_Enumeration: this.lever_Enumeration,
      seat_Enumeration: this.seat_Enumeration,
      spring_Enumeration: this.spring_Enumeration,
      productCode: this.productCode,
      productNumber: this.productNumber,
      finish_Enumeration: this.finish_Enumeration,
      nozzle_Enumeration: this.nozzle_Enumeration,
      sheet: this.sheet,
      quantity: this.quantity,
      revisionNumber: this.revisionNumber,
      aoNumber: this.aoNumber,
      projectType: this.projectType,
      orderNumber: this.orderNumber,
      tagNumber: this.tagNumber,
      notes: this.notes,
      nozzleEnumerationList: this.nozzleEnumerationList,
      nozzleTypeEnumerationList: this.nozzleTypeEnumerationList,
      bodyEnumerationList: this.bodyEnumerationList,
      mediaEnumerationList: this.mediaEnumerationList,
      finishEnumerationList: this.finishEnumerationList,
      leverEnumerationList: this.leverEnumerationList,
      bonnetEnumerationList: this.bonnetEnumerationList,
      seatEnumerationList: this.seatEnumerationList,
      springEnumerationList: this.springEnumerationList,
      inletConnectionEnumerationList: this.inletConnectionEnumerationList,
      outletConnectionEnumerationList: this.outletConnectionEnumerationList,
      outletSizeEnumerationList: this.outletSizeEnumerationList
    }, { updateOn: "change" });
  }

  ngOnInit() { 

    if (this.media_Enumeration.value === "Dry Saturated Steam") {
      this.temperatureDisabled = true;
    } else {
      this.temperatureDisabled = false;
    }


    this.preferenceService.getUserPreferences().subscribe((prefs: Array<Preference>) => {

      this.userPrefs = prefs;
      this.specSheetLanguage = this.userPrefs.find(m => m.name === "SpecLanguage").value;
      this.volumetricFlowSelectedPageUnitId = parseInt(this.userPrefs.find(p => p.name === 'VolumetricFlowUnit').value); // Initial page pref

      this.convertBaseToDefaultValuesInPageUnits();

      // process the unit selector based on media selection
      this.processVolumetricFlowUnitSelector();

    });

    this.userProfileService.getUserDetails().subscribe(user => {
      this.user = user;
    });

    this.leverEnumerationList = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === "SafetyValveLever_PRVStation")[0];
    this.bonnetEnumerationList = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === "SafetyValveBonnet_PRVStation")[0];
    this.seatEnumerationList = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === "SafetyValveSeat_PRVStation")[0];
    this.springEnumerationList = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === "SafetyValveSpring_PRVStation")[0];
    this.nozzleEnumerationList = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === "SafetyValveNozzle_PRVStation")[0];
    this.nozzleTypeEnumerationList = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === "SafetyValveNozzleType_PRVStation")[0];
    this.finishEnumerationList = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === "SafetyValveFinish_PRVStation")[0];
    this.mediaEnumerationList = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === "Media_PRVSizing")[0];
    this.bodyEnumerationList = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === "SafetyValveBodyMaterial_PRVStation")[0];
    this.inletConnectionEnumerationList = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === "SafetyValveInletConnection_PRVStation")[0];
    this.outletConnectionEnumerationList = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === "SafetyValveOutletConnection_PRVStation")[0];
    this.safetyValveStandardEnumerationList = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === "SafetyValveStandard_SafetyValveSizing")[0];
    this.outletSizeEnumerationList = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === "SafetyValveOutletSize")[0];
    this.handleLoadingJob();

    this.theFormGroup = this.sizingModuleForm; // to drive GenericChangesGuard
  }

  convertBaseToDefaultValuesInPageUnits() {
    // Convert defaults to active page units
    let unitsToConvert: UnitConvert[] = [];

    let unitConvert = new UnitConvert();
    unitConvert.propertyName = 'noisedistanceDefaultValue';
    unitConvert.initialValue = this.noisedistanceBaseValue;
    unitConvert.initialUnitId = 3; // m
    unitConvert.targetUnitId = parseInt(this.noiseDistanceRef.preference.value);
    unitConvert.convertedValue = null;
    unitsToConvert.push(unitConvert);

    unitConvert = new UnitConvert();
    unitConvert.propertyName = 'normalTemperatureDefaultValue';
    unitConvert.initialValue = this.normalTemperatureBaseValue;
    unitConvert.initialUnitId = 146; // DegC
    unitConvert.targetUnitId = parseInt(this.temperatureRef.preference.value);
    unitConvert.convertedValue = null;
    unitsToConvert.push(unitConvert);

    unitConvert = new UnitConvert();
    unitConvert.propertyName = 'standardTemperatureDefaultValue';
    unitConvert.initialValue = this.standardTemperatureBaseValue;
    unitConvert.initialUnitId = 146; // DegC
    unitConvert.targetUnitId = parseInt(this.temperatureRef.preference.value);
    unitConvert.convertedValue = null;
    unitsToConvert.push(unitConvert);

    unitConvert = new UnitConvert();
    unitConvert.propertyName = 'temperatureDefaultValue';
    unitConvert.initialValue = this.temperatureBaseValue;
    unitConvert.initialUnitId = 146; // DegC
    unitConvert.targetUnitId = parseInt(this.temperatureRef.preference.value);
    unitConvert.convertedValue = null;
    unitsToConvert.push(unitConvert);

    unitConvert = new UnitConvert();
    unitConvert.propertyName = 'pressureMinSV40xDefaultValue';
    unitConvert.initialValue = this.pressureMinSV40xBaseValue;
    unitConvert.initialUnitId = 50; // BarG
    unitConvert.targetUnitId = parseInt(this.pressureRef.preference.value);
    unitConvert.convertedValue = null;
    unitsToConvert.push(unitConvert);

    let unitsConverter = new UnitsConverter();
    unitsConverter.unitsConverter = unitsToConvert;

    this.unitsService.unitsConverter(unitsConverter).subscribe((unitsConvertedData: UnitsConverter) => {

      if (!!unitsConvertedData && unitsConvertedData !== null) {
        this.noisedistanceDefaultValue = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'noisedistanceDefaultValue').convertedValue;
        this.noisedistanceDefaultValue = this.preferenceDecimalPipe.transform(this.noisedistanceDefaultValue, "LengthUnit"); // set decimal places
        this.noisedistance.setValue(this.noisedistanceDefaultValue); // default 30mm

        this.normalTemperatureDefaultValue = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'normalTemperatureDefaultValue').convertedValue;
        this.normalTemperatureDefaultValue = this.preferenceDecimalPipe.transform(this.normalTemperatureDefaultValue, "TemperatureUnit"); // set decimal places

        this.standardTemperatureDefaultValue = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'standardTemperatureDefaultValue').convertedValue; // default 0 DegC
        this.standardTemperatureDefaultValue = this.preferenceDecimalPipe.transform(this.standardTemperatureDefaultValue, "TemperatureUnit"); // set decimal places

        var activeVolumetricFlowUnit = parseInt(this.userPrefs.find(p => p.name === 'VolumetricFlowUnit').value);
        this.setStandardOrNormalTemperatureDefault(activeVolumetricFlowUnit);

        this.temperatureDefaultValue = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'temperatureDefaultValue').convertedValue; // default 0 DegC
        this.temperatureDefaultValue = this.preferenceDecimalPipe.transform(this.temperatureDefaultValue, "TemperatureUnit"); // set decimal places
        this.temperature.setValue(this.temperatureDefaultValue);

        this.pressureMinSV40xDefaultValue = unitsConvertedData.unitsConverter.find(u => u.propertyName === 'pressureMinSV40xDefaultValue').convertedValue;
        this.pressureMinSV40xDefaultValue = this.preferenceDecimalPipe.transform(this.pressureMinSV40xDefaultValue, "PressureUnit"); // set decimal places

        this.selectedProducts.updateValueAndValidity();

      }
    });

  }
  handleLoadingJob() {
    this.activatedRoute.params
    // subscribe to router event
    this.paramsSubscription = this.activatedRoute.params.subscribe((params: Params) => {

      let projectId = params['projectId'];
      let jobId = params['jobId'];
      console.log(`projectId=${projectId}, jobId=${jobId}`);
      if (!!projectId && !!jobId) {

        this.projectId = projectId;
        this.jobId = jobId;

        // first get data, might be navigated link from P&Js or bookmark?
        this.projectsJobsService.getProjectsAndJobs().subscribe(() => {
          // Inform the view that areProjectsAndJobs are now loaded.
          this.areProjectsAndJobsLoaded = true;
        });

        //ToDo: Write slices and chain async call for single dedicated calls to GetProjectById, GetJobById or GetProjetAndSingleJobByIds all in one server/SP call etc.
        // subject subscription, update as service data has changed (probably changed in memory)
        this.projectsAndJobsSubscription = this.projectsJobsService.projectJobsChange.subscribe(() => {
          // avoid future unwanted events on subject firing this code.
          this.projectsAndJobsSubscription.unsubscribe();

          //Subject has Updated Projects And Jobs Data.
          var notFound = false;
          this.project = this.projectsJobsService.projectsJobs.projects.find(p => p.id === projectId);
          if (!this.project) {
            // projectId not found
            // ToDo: infrom user
            notFound = true;
          }
          else {
            this.job = this.project.jobs.find(j => j.id === jobId);
          }
          if (!this.job) {
            // projectId not found
            // ToDo: infrom user
            notFound = true;
          }

          if (notFound) {
            // Simple popup message box
            let trans_Job_Not_Found = this.translatePipe.transform('SELECTED_JOB_WAS_NOT_FOUND_MESSAGE', true);
            let trans_Error = this.translatePipe.transform('ERROR', true);


            swal({
              closeOnClickOutside: false, closeOnEsc: false,
              title: trans_Error + ':',
              text: trans_Job_Not_Found,
              icon: "error",
              dangerMode: true,
              //buttons: ['Ok', 'Cancel']
            }).then((okbuttoncClicked?: boolean) => {

              console.info("Ok clicked...");

              // The parameter can also enter as null
              const returnVal = !(okbuttoncClicked === null);

            });

            return;
          }
          this.projectName = this.project.name;
          this.jobName = this.job.name;

          console.log(`Job loaded! ${this.project.name} - ${this.job.name}`);

          let request = new GetSizingJobRequest();
          request.jobId = this.job.id;
          this.productName = this.job.productName;
          this.moduleId = this.job.moduleId;
          this.jobStatusId = this.job.jobStatusId;

          // ToDo: Get the JobSizing XML or as part of the previous call, single round trip.
          this.projectsJobsService.getJobSizing(request).subscribe((response: SizingData) => {


            if (!!response && response != null && !!response.processConditions && response.processConditions != null) {
              this.loadedJobSizingData = response;

              // This is required to prevent any re-validation and re-calculation when a job is loading.
              this.isLoadingJob = true;



              this.loadJob();

              this.sizingModuleForm.markAsPristine();
              this.sizingModuleForm.markAsUntouched();
              this.isLoadingJob = false;
            }
            else {
              // nothing to load!
            }
          });

        });
      }
    });
  }

  setMassflowIsMaster(massflowIsMasterFromUI: boolean = true): void {
    this.safetyValves.massflowIsMaster = massflowIsMasterFromUI; // sets which to calculate, massflow or volumetricflow
  }

  loadJob() {

    try {
      // load process conditions
      this.sizingModuleForm.controls["media_Enumeration"].setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Media").value);

    // Load the saved job items, forcing any saved string values to numbers using the +("number_As_A_String") techneque.
    this.pressure.setValue( +(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Pressure").value));
    this.temperature.setValue( +(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Temperature").value));
    this.normaltemperature.setValue( +(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Normal Temperature").value));

    if (this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Mass Flow")) {
      this.massflow.setValue( +(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Mass Flow").value));
      this.volumetricflow.setValue(+(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Volumetric Flow").value));
    } else {
      this.load.setValue(+(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Heat Output").value));
      }

      if (this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Relieving Pressure")) {
        this.relievingpressure.setValue(+(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Relieving Pressure").value));
      }
      else {
        this.relievingpressure.setValue( +(this.loadedJobSizingData.sizingOutput.outputGrid.outputGridRows[0].outputItems.find(m => m.name === "Relieving Pressure").value));
      }

      if (this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Relieving Temperature")) {
        this.relievingtemperature.setValue( +(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Relieving Temperature").value));
      }
      else {
        this.relievingtemperature.setValue( +(this.loadedJobSizingData.sizingOutput.outputGrid.outputGridRows[0].outputItems.find(m => m.name === "Relieving Temperature").value));
      }

    this.sizingModuleForm.controls["safetyValveStandard_Enumeration"].setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Standard").value);
    this.setupForSelectedStandard();

    this.noisedistance.setValue( +(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Noise Distance").value));

    this.mediaState.setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "State").value);
    this.mediaStateFromPPDS = this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "mediaStateFromPPDS").value;

    // Load unit preferences.
    this.preferenceService.addSizingUnitPreference(this.loadedJobSizingData.processConditions[0].unitPreferences.find(u => u.name === this.pressureRef.preference.name), "PressureUnits", "PRESSURE", this.moduleGroupId);
    this.preferenceService.addSizingUnitPreference(this.loadedJobSizingData.processConditions[0].unitPreferences.find(u => u.name === this.temperatureRef.preference.name), "TemperatureUnits", "TEMPERATURE", this.moduleGroupId);
    this.preferenceService.addSizingUnitPreference(this.loadedJobSizingData.processConditions[0].unitPreferences.find(u => u.name === this.massFlowRef.preference.name), "MassFlowUnits", "MASS_FLOW", this.moduleGroupId);
    this.preferenceService.addSizingUnitPreference(this.loadedJobSizingData.processConditions[0].unitPreferences.find(u => u.name === this.volumetricFlowRef.preference.name), "VolumetricFlowUnits", "VOLUMETRIC_FLOW", this.moduleGroupId);
    this.preferenceService.addSizingUnitPreference(this.loadedJobSizingData.processConditions[0].unitPreferences.find(u => u.name === this.noiseDistanceRef.preference.name), "LengthUnits", "NOISE_DISTANCE", this.moduleGroupId);
    this.preferenceService.addSizingUnitPreference(this.loadedJobSizingData.processConditions[0].unitPreferences.find(u => u.name === this.loadRef.preference.name), "LoadUnits", "LOAD", this.moduleGroupId);
    this.preferenceService.addSizingUnitPreference(this.loadedJobSizingData.processConditions[0].unitPreferences.find(u => u.name === this.forceRef.preference.name), "ForceUnits", "FORCE", this.moduleGroupId);
    this.preferenceService.addSizingUnitPreference(this.loadedJobSizingData.processConditions[0].unitPreferences.find(u => u.name === this.areaRef.preference.name), "AreaUnits", "AREA", this.moduleGroupId);

      // Valve Selections
      var selectedValvesString = this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Valve Selections").value;
      var selectedValves = [];

      for (let p of selectedValvesString.split(";")) {
        if (p !== "" && p.replace(';', '') !== "") {
          selectedValves.push(p.replace(';', ''));
        }
      }
      this.selectedProducts.setValue(selectedValves);

      this.showHideBackpressure.setValue(<boolean>JSON.parse(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Backpressure").value));

      // Back pressure
      if (this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Pipe Length")) {

        this.sizingModuleForm.controls["pipeStandard_Enumeration"].setValue(true);
        this.sizingModuleForm.controls["pipeStandard_Enumeration"].setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Pipe Standard").value);
        this.sizingModuleForm.controls["nominalBore_Enumeration"].setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Nominal Bore").value);
        this.pipeLength.setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Pipe Length").value);
        this.sizingModuleForm.controls["backpressure90Elbows_Enumeration"].setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "No of 90 Elbows").value);
        this.sizingModuleForm.controls["backpressure45Elbows_Enumeration"].setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "No of 45 Elbows").value);
        this.sizingModuleForm.controls["backpressureSweptBends_Enumeration"].setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "No of Swept Bends").value);

      }
    } catch (err) {
      console.log(`LoadJob() failed err=${err}`);
      this.showJobLoadError();
    }

    // Sizing grid
    if (this.loadedJobSizingData.sizingOutput.outputGrid !== null &&
      this.loadedJobSizingData.sizingOutput.outputGrid.outputGridRows !== null &&
      this.loadedJobSizingData.sizingOutput.outputGrid.outputGridRows.length > 0) {

      this.isSVSizingDone = true;

      this.options = new Options();
      this.selectedBodyMaterial = "";

      var safetyValveSizingResults = new Array<SafetyValveSizingResult>();

      var row = new SafetyValveSizingResult();
      var selectedRowIndex = -1;
      var selectedRow = false;
      var rowCount = 0;
      var isJobLoadError = false;

      this.isSVSelected = false;

      // Get sizing results grid data
      for (let model of this.loadedJobSizingData.sizingOutput.outputGrid.outputGridRows) {
        try {

          rowCount++;
          row.productRange = model.outputItems.find(m => m.name === "Product Range").value;
          row.inletSize = +model.outputItems.find(m => m.name === "Inlet Size").value;

          if (!!model.outputItems.find(m => m.name === "Inlet Size Display")) { // prevent legacy jobs crash
            row.inletDisplay = model.outputItems.find(m => m.name === "Inlet Size Display").value;
          }

          row.bodyMaterial = model.outputItems.find(m => m.name === "Body Material").value;
          row.overPressure = +model.outputItems.find(m => m.name === "Overpressure").value;
          row.relievingPressure = +model.outputItems.find(m => m.name === "Relieving Pressure").value;
          row.relievingTemperature = +model.outputItems.find(m => m.name === "Relieving Temperature").value;  
          //row.displayRelievingTemperature = "0";

          row.calculatedArea = +model.outputItems.find(m => m.name === "Calculated Area").value;
          //row.displayCalculatedArea = "0";

          row.flowArea = +model.outputItems.find(m => m.name === "Actual Area").value;
          //row.displayFlowArea = "0";

          row.ratedCapacity = +model.outputItems.find(m => m.name === "Rated Capacity").value;
          //row.displayRatedCapacity = "0";

          row.percentCapacity = +model.outputItems.find(m => m.name === "Percentage").value;
          //row.displayPercentCapacity = "0";

          row.orifice = model.outputItems.find(m => m.name === "Orifice").value;

          if (!!model.outputItems.find(m => m.name === "Nozzle")) {
            row.nozzle = model.outputItems.find(m => m.name === "Nozzle").value;
          }

          row.noiseAtDistance = +model.outputItems.find(m => m.name === "Noise").value;
          //row.displayNoiseAtDistance = "0";

          row.reactionForce = +model.outputItems.find(m => m.name === "Reaction Force").value;
          //row.displayReactionForce = "0";

          if (!!model.outputItems.find(m => m.name === "Dynamic Viscosity")) {
            if (isNaN(+model.outputItems.find(m => m.name === "Dynamic Viscosity").value)) {
              row.dynamicViscosity = 0;
            } else {
              row.dynamicViscosity = +model.outputItems.find(m => m.name === "Dynamic Viscosity").value;
            }
          }

          if (!!model.outputItems.find(m => m.name === "Compressibility")) {
            if (isNaN(+model.outputItems.find(m => m.name === "Compressibility").value)) {
              row.compressibility = 0
            } else {
              row.compressibility = +model.outputItems.find(m => m.name === "Compressibility").value
            }
          }

          if (isNaN(+model.outputItems.find(m => m.name === "Isentropic Coefficient").value)) {
            row.isentropicCoefficient = 0
          } else {
            row.isentropicCoefficient = +model.outputItems.find(m => m.name === "Isentropic Coefficient").value
          }

          if (!!model.outputItems.find(m => m.name === "Specific Volume")) {
            if (isNaN(+model.outputItems.find(m => m.name === "Specific Volume").value)) {
              row.specificVolume = 0
            } else {
              row.specificVolume = +model.outputItems.find(m => m.name === "Specific Volume").value
            }
          }

          if (!!model.outputItems.find(m => m.name === "Molecular Weight")) {
            if (isNaN(+model.outputItems.find(m => m.name === "Molecular Weight").value)) {
              row.molecularWeight = 0
            } else {
              row.molecularWeight = +model.outputItems.find(m => m.name === "Molecular Weight").value
            }
          }

          if (model.outputItems.find(m => m.name === "Cap Material")) {
            row.capMaterial = model.outputItems.find(m => m.name === "Cap Material").value;
          }

          if (model.outputItems.find(m => m.name === "Cap Grade")) {
            row.capGrade = model.outputItems.find(m => m.name === "Cap Grade").value;
          }

          if (model.outputItems.find(m => m.name === "Nozzle Material")) {
            row.nozzleMaterial = model.outputItems.find(m => m.name === "Nozzle Material").value;
          }

          if (model.outputItems.find(m => m.name === "Stem Material")) {
            row.stemMaterial = model.outputItems.find(m => m.name === "Stem Material").value;
          }

          if (model.outputItems.find(m => m.name === "Stem Grade")) {
            row.stemGrade = model.outputItems.find(m => m.name === "Stem Grade").value;
          }

          if (model.outputItems.find(m => m.name === "Guide Material")) {
            row.guideMaterial = model.outputItems.find(m => m.name === "Guide Material").value;
          }

          if (model.outputItems.find(m => m.name === "Guide Grade")) {
            row.guideGrade = model.outputItems.find(m => m.name === "Guide Grade").value;
          }

          if (model.outputItems.find(m => m.name === "Body Gasket")) {
            row.bodyGasket = model.outputItems.find(m => m.name === "Body Gasket").value;
          }

          if (model.outputItems.find(m => m.name === "Gland Packing")) {
            row.glandPacking = model.outputItems.find(m => m.name === "Gland Packing").value;
          }

          if (model.outputItems.find(m => m.name === "Bellows")) {
            row.bellows = model.outputItems.find(m => m.name === "Bellows").value;
          }

          if (model.outputItems.find(m => m.name === "Inlet Connection List")) {
            row.inletConnectionList = model.outputItems.find(m => m.name === "Inlet Connection List").value.split(",");
          }

          if (model.outputItems.find(m => m.name === "Outlet Connection List")) {
            row.outletConnectionList = model.outputItems.find(m => m.name === "Outlet Connection List").value.split(",");
          }

          if (model.outputItems.find(m => m.name === "Bonnet List")) {
            row.bonnetList = model.outputItems.find(m => m.name === "Bonnet List").value.split(",");
          }

          if (model.outputItems.find(m => m.name === "Seat List")) {
            row.seatList = model.outputItems.find(m => m.name === "Seat List").value.split(",");
          }

          if (model.outputItems.find(m => m.name === "Nozzle List")) {
            row.nozzleList = model.outputItems.find(m => m.name === "Nozzle List").value.split(",");
          }

          if (model.outputItems.find(m => m.name === "Lever List")) {
            row.leverList = model.outputItems.find(m => m.name === "Lever List").value.split(",");
          }

          if (model.outputItems.find(m => m.name === "Spring List")) {
            row.springList = model.outputItems.find(m => m.name === "Spring List").value.split(",");
          }

          if (model.outputItems.find(m => m.name === "Outlet Size List")) {
            row.outletSizeList = model.outputItems.find(m => m.name === "Outlet Size List").value.split(",");
          }

          if (model.outputItems.find(m => m.name === "Outlet Size Display")) {
            row.outletSizeDisplayList = model.outputItems.find(m => m.name === "Outlet Size Display").value.split(",");
          }

          if (model.outputItems.find(m => m.name === "Outlet Size List Display")) {
            row.outletSizeDisplayList = model.outputItems.find(m => m.name === "Outlet Size List Display").value.split(",");
          }

          if (model.outputItems.find(m => m.name === "Outlet Size")) {
            row.outletSize = parseInt(model.outputItems.find(m => m.name === "Outlet Size").value);
          }

          if (model.outputItems.find(m => m.name === "Inlet Connection")) {
            row.inletConnection = model.outputItems.find(m => m.name === "Inlet Connection").value;
          }

          if (model.outputItems.find(m => m.name === "Outlet Connection")) {
            row.outletConnection = model.outputItems.find(m => m.name === "Outlet Connection").value;
          }
  
          //row.finishList = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Finish List").value.split(","); // exists?
      
          //row.backPressure = +model.outputItems.find(m => m.name === "Back Pressure").value;
          //row.backPressurePercentage = +model.outputItems.find(m => m.name === "Back Pressure Percentage").value;
          //row.noiseAtDistance = +model.outputItems.find(m => m.name === "Noise").value;

          //backPressure: number;
          //backPressurePercentage: number;
          //backpressureOk: boolean;

          selectedRow = model.outputItems.find(m => m.name === "Product Range").selected;

          if (selectedRow) {
            // selected row
            this.selectedSafetyValve = row;

            this.selected.splice(0, this.selected.length);
            this.selected.push(row);
            this.selected[0] = row;

            this.isSVSelected = true;
            this.isTiEnabled = true;
            this.isSpecSheetEnabled = true;

            selectedRowIndex = rowCount - 1; // safetyValveSizingResults.length + 1;
          }

        } catch (err) {
          console.log(`LoadJob() failed err=${err}`);
          isJobLoadError = true;
        }

        safetyValveSizingResults.push(row);
        row = new SafetyValveSizingResult();


      } // end of For each row.

      this.safetyValvesService.safetyValves = safetyValveSizingResults;
      this.loadSizingData(safetyValveSizingResults, selectedRowIndex);

      if (isJobLoadError) {
        this.showJobLoadError();
      }

      /*
      Check if any of saved results have been saved as selected - if YES then it will be loaded on the page as the default one with all saved options for that result.
      Other results in the grid will have default options being set up by method onSelect() as soon user click any of them on the grid.
      */
      if (selectedRowIndex == -1) {
        return;
      }
      else {

        try {

          this.options.selectedBodyMaterial = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Body Material").value;
          this.options.translatedPressureUnit = this.pressureRef.preference.unitName;

          // set options & filters
          this.options.inletSize = +this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Inlet Size").value;
          this.options.inletSizeDisplay = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Inlet Size Display").value;

          this.options.selectedInletConnection = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Inlet Connection").value;
          this.options.selectedBonnet = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Bonnet").value;
          this.options.selectedSeat = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Seat").value;
          this.productCode.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Product Code").value);
          this.options.selectedOutletSize = +this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Outlet Size").value;
          this.options.selectedOutletSizeDisplay = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Outlet Size Display").value;
          this.options.selectedOutletConnection = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Outlet Connection").value;
          this.options.selectedLever = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Lever").value;
          this.options.selectedSpring = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Spring").value;
          if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Nozzle")) {
            this.options.selectedNozzle = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Nozzle").value;
          } else {
            this.options.selectedNozzle = "-";
          }
          //this.finishList = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Finish List").value.split(","); // exists?
          this.productNumber.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Product Number").value);
          this.options.relievingTemperature = this.relievingtemperature.value;
          this.options.temperature = this.temperature.value;
          this.options.temperatureUnitId = parseInt(this.temperatureRef.preference.value);
          this.options.mediaState = this.mediaState.value;
          this.options.media = this.media_Enumeration.value;
          this.options.lengthUnit = +this.userPrefs.find(x => x.name == "LengthUnit").value;
          this.options.weightUnit = +this.userPrefs.find(x => x.name == "WeightUnit").value;
          this.options.valveWeight = parseFloat(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Valve Weight").value);
          this.options.dimA = parseInt(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "dimA").value);
          this.options.dimB = parseInt(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "dimB").value);
          this.options.dimC = parseInt(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "dimC").value);

          // Options to drive UI state
          if (!!(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Outlet Connection Enabled").value)) { // prevent legacy jobs crash
            this.options.selectedProductRange = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Product Range").value;

            this.options.standard = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Standard").value;
            this.options.valveOrifice = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Valve Orifice").value;
            this.options.inletPressure = +this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Inlet Pressure").value;
            this.options.pressureUnit = parseInt(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Pressure Unit").value);
            this.options.valveInletSize = parseInt(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Valve Inlet Size").value);

            this.options.standard = this.safetyValveStandard_Enumeration.value;
            this.options.inletPressure = this.pressure.value;
            this.options.pressureUnit = parseInt(this.pressureRef.preference.value);

            this.options.outletConnectionEnabled = (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Outlet Connection Enabled").value) === "true" ? true : false;
            this.options.inletConnectionEnabled = (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Inlet Connection Enabled").value) === "true" ? true : false;
            this.options.leverDisabled = (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Lever Disabled").value) === "true" ? true : false;
            this.options.finishDisplayed = (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Finish Displayed").value) === "true" ? true : false;
            this.options.selectedFinish = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Finish").value;
            if (this.options.finishDisplayed) {
              this.showHideFinish.setValue(true);
            } else {
              this.showHideFinish.setValue(false);
            }
          }

          // load options
          this.inletSize.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Inlet Size Display").value);

          var inletConnectionListString = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Inlet Connection List").value;
          this.inletConnectionList = inletConnectionListString.split(",");
          this.options.inletConnectionList = this.inletConnectionList;

          var outletConnectionListString = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Outlet Connection List").value;
          this.outletConnectionList = outletConnectionListString.split(",");
          this.options.outletConnectionList = outletConnectionListString.split(",");

          var bonnetListString = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Bonnet List").value;
          this.bonnetList = bonnetListString.split(",");
          this.options.bonnetList = bonnetListString.split(",");

          var seatListString = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Seat List").value;
          this.seatList = seatListString.split(",");
          this.options.seatList = seatListString.split(",");

          var leverListString = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Lever List").value;
          this.leverList = leverListString.split(",");
          this.options.leverList = leverListString.split(",");

          var springListString = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Spring List").value;
          this.springList = springListString.split(",");
          this.options.springList = springListString.split(",");

          var outletSizeListString = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Outlet Size List").value;
          this.outletSizeList = outletSizeListString.split(",");
          this.options.outletSizeList = outletSizeListString.split(",");

          var outletSizeListDisplayString = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Outlet Size List Display").value;
          this.outletSizeListDisplay = outletSizeListDisplayString.split(",");
          this.options.outletSizeListDisplay = outletSizeListDisplayString.split(",");

          if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Nozzle List")) {
            var nozzleListString = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Nozzle List").value;
            this.nozzleList = nozzleListString.split(",");
            this.options.NozzleList = nozzleListString.split(",");
          }

          // load spec sheet header details
          this.isSpecSheetEnabled = <boolean>JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "IsSpecSheetEnabled").value);

          if (!!this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Sheet")) {
            this.sheet.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Sheet").value);
          }

          if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Revision No")) {
            this.revisionNumber.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Revision No").value);
          }

          if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Project Type")) {
            this.projectType.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Project Type").value);
          }

          if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Quantity")) {
            this.quantity.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Quantity").value);
          }

          if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "AO Number")) {
            this.aoNumber.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "AO Number").value);
          }

          if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Order No")) {
            this.orderNumber.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Order No").value);
          }

          if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Tag Number")) {
            this.tagNumber.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Tag Number").value);
          }

          if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Notes 1")) {
            this.notes.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Notes 1").value);
          }

          if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Message 1")) {
            for (var i = 0; i < 5; i++) {
              if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Message " + i)) {

                let msg = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Message " + i);

                if (!!msg && !!msg.value) {
                  this.translatedMessagesList[i] = msg;
                }

              } else {
                this.translatedMessagesList[i] = "-";

              }

            }
          }

          // if a valve is selected
          if (selectedRowIndex >= 0) {
              
            this.filterInletConnection(this.options.selectedInletConnection, this.inletConnectionList);
            this.inletConnection_Enumeration.setValue(this.options.selectedInletConnection);

            this.filterOutletConnection(this.options.selectedOutletConnection, this.outletConnectionList);
            this.outletConnection_Enumeration.setValue(this.options.selectedOutletConnection);

            //this.filterSeat(this.selectedSafetyValve.seatList); // overwirtes selected option  
            this.seat_Enumeration.setValue(this.options.selectedSeat);

            //this.filterLever(this.selectedSafetyValve.leverList); // overwirtes selected option
            this.lever_Enumeration.setValue(this.options.selectedLever);

            //this.filterSpring(this.selectedSafetyValve.springList); // overwirtes selected option
            this.spring_Enumeration.setValue(this.options.selectedSpring);

            //this.filterBonnet(this.selectedSafetyValve.bonnetList); // has to be after Lever/cap, dependant UI logic
            this.bonnet_Enumeration.setValue(this.options.selectedBonnet);

            this.finish_Enumeration.setValue(this.options.selectedFinish);

            this.nozzle_Enumeration.setValue(this.options.selectedNozzle);

            var optionsResults: OptionsResults = new OptionsResults();
            optionsResults.productCode = this.productCode.value;
            optionsResults.outletConnection = this.options.selectedOutletConnection;
            optionsResults.productNumber = this.productNumber.value;
            optionsResults.inletConnectionEnabled = this.options.inletConnectionList.length > 0 ? true : false;;
            optionsResults.inletConnection = this.options.selectedInletConnection;
            optionsResults.selectedLever = this.options.selectedLever;
            optionsResults.outletConnectionEnabled = this.options.outletConnectionEnabled; //this.options.outletConnectionList.length > 0 ? true : false;
            optionsResults.inletConnectionEnabled = this.options.inletConnectionEnabled;//this.options.inletConnectionList.length > 0 ? true : false;;
            optionsResults.leverDisabled = this.options.leverDisabled;
            optionsResults.finishDisplayed = this.options.finishDisplayed;
            optionsResults.selectedBonnet = this.options.selectedBonnet;
            optionsResults.selectedLever = this.options.selectedLever;
            optionsResults.selectedSeat = this.options.selectedSeat;
            optionsResults.selectedSpring = this.options.selectedSpring;
            optionsResults.temperature = this.options.temperature;
            optionsResults.selectedNozzle = this.options.selectedNozzle;
            optionsResults.lengthUnit = this.options.lengthUnit;
            optionsResults.weightUnit = this.options.weightUnit;
            optionsResults.weight = this.options.valveWeight;
            optionsResults.dimA = this.options.dimA;
            optionsResults.dimB = this.options.dimB;
            optionsResults.dimC = this.options.dimC;
     


            this.applyOptionsLogicToUI(optionsResults);
          } // end of if selectedRowIndex >= 0

          this.safetyValvesService.safetyValves = safetyValveSizingResults;
          this.loadSizingData(safetyValveSizingResults, selectedRowIndex);

        } catch (err) {
          console.log(`LoadJob() failed err=${err}`);
          this.showJobLoadError();
        }

      }  

      
    }
    else { this.isSVSizingDone = false }

    // Localize display values.
    this.localizeOutputData();

    // Reset button status
    if (<boolean>JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "IsResetEnabled").value)) {
      this.sizingModuleForm.markAsDirty();
    }
  }

  showJobLoadError() {
    console.log("showJobLoadError()");
    this.isLoadingJob = false;

    let trans_Title = this.translatePipe.transform('LOAD_JOB_FAILED_TITLE', true);
    let trans_Message = this.translatePipe.transform('LOAD_JOB_FAILED_MESSAGE', true);

    swal({
      closeOnClickOutside: false, closeOnEsc: false,
      title: trans_Title,
      text: trans_Message,
      icon: "error",
      dangerMode: true,
      //buttons: ['Ok', 'Cancel']
    }).then((okbuttoncClicked?: boolean) => {

      console.info("Ok clicked...");

      // The parameter can also enter as null
      const returnVal = !(okbuttoncClicked === null);

    }); // end of swal
  }


  relievingPressureIsMaster(): void {
    if (!!this.relievingpressure.value && !!this.overpressure.value) {
      // Evaluate the Set Pressure based on the relieving pressure decreased by the over pressure value
      var p1 = this.relievingpressure.value - ((this.relievingpressure.value / (100 + this.overpressure.value)) * this.overpressure.value); //this.pressure.value / ((this.overpressure.value / 100) + 1.0);
      this.pressure.setValue(this.preferenceDecimalPipe.transform(p1, "PressureUnit"));
    }
  }

  rationaliseSafetyValvesFormInput(): void {

    this.disableUiInputs();

    // Doesn't matter which field was last entered, get all the necessary form values.
    // It's up to the server to decide what needs verifying/rationalising/validating.
    // Media
    this.safetyValves.media = this.sizingModuleForm.value.media_Enumeration;
    this.safetyValves.mediaState = this.mediaStateFromPPDS; // untranslated
    this.safetyValves.standard = this.safetyValveStandard_Enumeration.value;

    // Pressure
    this.safetyValves.pressure = this.sizingModuleForm.value.pressure;
    this.safetyValves.pressureUnitId = parseInt(this.pressureRef.preference.value);

    // Over Pressure entered on the UI
    this.safetyValves.overPressure = this.overpressure.value;

    // Temperature
    this.safetyValves.temperature = this.sizingModuleForm.value.temperature;
    this.safetyValves.temperatureUnitId = parseInt(this.temperatureRef.preference.value);

    // NormalTemperature
    this.safetyValves.normalTemperature = this.sizingModuleForm.value.normaltemperature;
    this.safetyValves.normalTemperatureUnitId = parseInt(this.temperatureRef.preference.value);

    // Noise
    this.safetyValves.noise = this.sizingModuleForm.value.noisedistance;
    this.safetyValves.noiseUnitId = parseInt(this.noiseDistanceRef.preference.value);

    // Area
    this.safetyValves.areaUnitId = parseInt(this.areaRef.preference.value);

    // Force
    this.safetyValves.forceUnitId = parseInt(this.forceRef.preference.value);

    this.safetyValves.loadUnitId = parseInt(this.loadRef.preference.value);
    var activeVolumetricFlowUnit = parseInt(this.volumetricFlowRef.preference.value);

    this.safetyValves.massFlowUnitId = parseInt(this.massFlowRef.preference.value);

    if (this.isMassFlow) {

      this.isNormalTemperatureInputEnabled() || this.normaltemperature.hasError ? this.normaltemperature.enable : this.normaltemperature.disable;

      // Mass flow
      this.safetyValves.massFlow = this.massflow.value;


      // Volumetric flow
      this.safetyValves.volumetricFlow = this.volumetricflow.value;
      this.safetyValves.volumetricFlowUnitId = activeVolumetricFlowUnit;


    } else {
      this.safetyValves.heatOutput = this.load.value;
    }



    // Collect selected products
    this.safetyValves.selectedValves = [];
    for (let p of this.selectedProducts.value) {
      this.safetyValves.selectedValves.push(p);
    }

    this.selectedProducts.updateValueAndValidity();

    // run process condiotn validation and calculate PPDS dependncies if Set Pressure has a useful value.
    if (!!this.safetyValves.pressure && this.safetyValves.pressure > 0) {

      // Run the validation
      this.safetyValvesService.validateProcessCondition(this.safetyValves).subscribe(result => {

        this.enableUiInputs();

        if (!result) { // any data?
          return;
        }

        // Set the form control with the returned value.
        if (!!result && !!result.mediaState && this.mediaStateFromPPDS.toUpperCase() !== result.mediaState.toUpperCase()) {

          let trans_mediaState = this.translatePipe.transform(result.mediaState.toUpperCase()); //  ToUpper for Trans MasterKeyText on UI

          this.mediaStateFromPPDS = result.mediaState;

          this.filterSafetyValveStandardList(this.safetyValveStandard_Enumeration.value);

          this.mediaState.setValue(trans_mediaState);

          //this.safetyValveStandard_Enumeration.setValue(safetyValveStandard);
        }

        if (!!result.temperature && this.preferenceDecimalPipe.transform(result.temperature, "TemperatureUnit") == this.safetyValves.temperature) {

          this.temperature.setValue(this.preferenceDecimalPipe.transform(result.temperature, "TemperatureUnit"));
        }

        if (!!result.temperature && this.preferenceDecimalPipe.transform(result.temperature, "TemperatureUnit") !== this.safetyValves.temperature) {

          this.temperature.setValue(this.preferenceDecimalPipe.transform(result.temperature, "TemperatureUnit"));
          let trans_Media = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === "Media_PRVSizing")[0].enumerationDefinitions.filter(m => m.value === this.media_Enumeration.value)[0].translationText;

          // If SuperHeated Steam and the Temperature has been adjusted (to 1 kelvin above saturation point) then inform user.
          let trans_SuperheatedSteamCheckTitle = this.translatePipe.transform('SUPERHEAT_TEMPERATURE_CHECK');
          let trans_SuperheatedSteamCheckMessage = this.translatePipe.transform('STEAM_IS_NOT_SUPERHEATED_AT_THIS_TEMPERATURE_AND_PRESSURE_THEREFORE_THE_ENTERED_TEMPERATURE_HAS_BEEN_RAISED_TO_1_DEGREE_ABOVE_T_MESSAGE', false);
          let trans_VolumetricFlowUnitsHaveBeenChangedTitle = this.translatePipe.transform('VOLUMETRIC_FLOW_CHANGED');
          let trans_VolumetricFlowUnitsHaveBeenChangedMessage = this.translatePipe.transform('VOLUMETRIC_FLOW_CHANGED_MESSAGE');
          let trans_OldVolumetricFlowUnitName = this.translatePipe.transform(this.volumetricFlowRef.preference.masterTextKey);
          let trans_NewVolumetricFlowUnitName = this.translatePipe.transform(this.volumetricFlowRef.preference.masterTextKey);

          // !!! Temp Fix!!! -- This is a join messagge for SuperHeated Steam Temperature and Volumetric Flow.(Need to be revise and split in to two separate pop up messages in the future.)
          if (this.safetyValves.media === "Superheated Steam" && this.volumetricFlowChanged) {
            this.volumetricFlowChanged = false;
            swal({
              closeOnClickOutside: false, closeOnEsc: false,
              title: trans_SuperheatedSteamCheckTitle + ' & ' + trans_VolumetricFlowUnitsHaveBeenChangedTitle,
              text: trans_SuperheatedSteamCheckMessage + ' (' + this.preferenceDecimalPipe.transform(result.temperature + 1, "TemperatureUnit") + ' ' + this.temperatureRef.preference.unitName + ') \n\n' + trans_VolumetricFlowUnitsHaveBeenChangedMessage + ' from ' + trans_OldVolumetricFlowUnitName + ' to ' + trans_NewVolumetricFlowUnitName,
              icon: "warning",
              dangerMode: true,
              //buttons: ['Ok', 'Cancel']
            }).then((okbuttoncClicked?: boolean) => {

              console.info("Ok clicked...");
              //this.rationaliseSafetyValvesFormInput();

              // The parameter can also enter as null
              const returnVal = !(okbuttoncClicked === null);

            }); // end of swal
          }
          else if (this.safetyValves.media === "Superheated Steam") {
            swal({
              closeOnClickOutside: false, closeOnEsc: false,
              title: trans_SuperheatedSteamCheckTitle,
              text: trans_SuperheatedSteamCheckMessage + ' (' + this.temperature.value + ' ' + this.temperatureRef.preference.unitName + ')',
              icon: "warning",
              dangerMode: true,
              //buttons: ['Ok', 'Cancel']
            }).then((okbuttoncClicked?: boolean) => {

              console.info("Ok clicked...");
              //this.rationaliseSafetyValvesFormInput();

              // The parameter can also enter as null
              const returnVal = !(okbuttoncClicked === null);

            }); // end of swal

          } // end of "Superheated Steam"
          else if (this.safetyValves.media === "Water") {
            // WaterCheck or Melting point Check has moved temperature result.
            if (this.preferenceDecimalPipe.transform(result.temperature, "TemperatureUnit") < this.safetyValves.temperature) {
              // Temp moved lower, moved from Gas into Liquid state
              let trans_WaterCheckTitle = this.translatePipe.transform('WATER_TEMPERATURE_CHECK');
              let trans_WaterCheckMessage = trans_Media + " " + this.translatePipe.transform('IS_NOT_A_LIQUID_AT_THIS_TEMPERATURE_AND_PRESSURE_SATURATION_TEMPERATURE_AT_THIS_PRESSURE_IS_MESSAGE');


              swal({
                closeOnClickOutside: false, closeOnEsc: false,
                title: trans_WaterCheckTitle,
                text: trans_WaterCheckMessage + ' (' + this.temperature.value + ' ' + this.temperatureRef.preference.unitName + ')',
                icon: "warning",
                dangerMode: true,
                //buttons: ['Ok', 'Cancel']
              }).then((okbuttoncClicked?: boolean) => {

                console.info("Ok clicked...");

                // The parameter can also enter as null
                const returnVal = !(okbuttoncClicked === null);

              }); // end of swal

            } // end of WaterCheck message
          } // end of else if "Water"

          if (this.safetyValves.media !== "Superheated Steam" && this.safetyValves.media !== "Dry Saturated Steam") {
            if (this.preferenceDecimalPipe.transform(result.temperature, "TemperatureUnit") > this.safetyValves.temperature) {
              // Temp moved upward, moved from solid into Liquid state
              let trans_MeltingPointCheckTitle = this.translatePipe.transform('MELTING_POINT_CHECK');
              let trans_MeltingPointCheckMessage = trans_Media + " " + this.translatePipe.transform('IS_SOLID_AT_THIS_TEMPERATURE_AND_PRESSURE_MELTING_POINT_AT_THIS_PRESSURE_IS_MESSAGE');


              swal({
                closeOnClickOutside: false, closeOnEsc: false,
                title: trans_MeltingPointCheckTitle,
                text: trans_MeltingPointCheckMessage + ' (' + this.temperature.value + ' ' + this.temperatureRef.preference.unitName + ')',
                icon: "warning",
                dangerMode: true,
                //buttons: ['Ok', 'Cancel']
              }).then((okbuttoncClicked?: boolean) => {

                console.info("Ok clicked...");

                // The parameter can also enter as null
                const returnVal = !(okbuttoncClicked === null);

              }); // end of swal

            }  // end of MeltingPointCheck message
          } // end of Melting check for all but Dry Sat and SuperHeated Steam
        } // end of Temperature has been modified by Validation and PPDS results

        if (this.isMassFlow) {

          // Collect flow rates from initial saturation checks, must be performed last and after initial PPDS sat checks.
          // Current Mass Flow
          this.safetyValves.massFlow = result.massFlow;
          // Current Volumetric flow
          this.safetyValves.volumetricFlow = result.volumetricFlow;
          // The current working temperature (may be already adjusted for state eg. SuperHeatedSteam).
          this.safetyValves.temperature = result.temperature;
          // NormalTemperature
          this.safetyValves.normalTemperature = result.normalTemperature;
          // The current working media state
          this.safetyValves.mediaState = this.mediaStateFromPPDS; // untranslated

          this.processVolumetricFlowUnitSelector(); // handle volumetric flow units for Normal/Standard temperature based on possible changes to media and state.
          this.safetyValves.volumetricFlowUnitId = parseInt(this.volumetricFlowRef.preference.value); // If media state has changed then Normal/Standard temperature Volumetric flow rates may be implemented.

          // Start the busy block
          this.disableUiInputs();

          // Run the flow rate consolidation calculations and validation
          this.safetyValvesService.consolidateFlowRates(this.safetyValves).subscribe(result => {
            this.relievingPressureIsMaster
            this.enableUiInputs();
            if (result.massDensity === null) {
              this.massDensity = -1;
            }
            else {
              this.massDensity = result.massDensity;
            }

            if (!result) { // any data?
              return;
            }

            // Set the form control with the returned value.
            this.volumetricflow.setValue(this.preferenceDecimalPipe.transform(result.volumetricFlow, "VolumetricFlowUnit"));

            // Set the form control with the returned value.
            this.massflow.setValue(this.preferenceDecimalPipe.transform(result.massFlow, "MassFlowUnit"));

            if (isUndefined(result.massDensity)) {

            }

          });

          // Get the Relieving Pressure and Relieving Temperature values from PPDS by applying the Over Pressure %
          // Over Pressure entered on the UI
          this.safetyValves.overPressure = this.overpressure.value;

          // Relieving Pressure with over pressure % (for PPDS to return relieving Temperature)
          this.safetyValves.relievingPressure = this.sizingModuleForm.value.pressure * ((this.overpressure.value / 100) + 1.0); // grey out refernce value
          this.relievingpressure.setValue(this.preferenceDecimalPipe.transform(this.safetyValves.relievingPressure, "PressureUnit"));
          this.safetyValves.pressure = this.safetyValves.relievingPressure; // swap in for PPDS call

          // Relieving Temperature at the Relieving Pressure (via PPDS).
          this.safetyValves.relievingTemperature = 0; //this.sizingModuleForm.value.temperature;
          this.relievingtemperature.setValue(this.preferenceDecimalPipe.transform(0, "TemperatureUnit"));
          this.safetyValves.temperature = this.sizingModuleForm.value.temperature; // swap in for PPDS call

          // **Re-Run** the validation to get Relieving values.
          this.safetyValvesService.validateProcessCondition(this.safetyValves).subscribe(result => {
            if (!!result && !!result.mediaState && this.mediaStateFromPPDS.toUpperCase() !== result.mediaState.toUpperCase()) {
              // ToDo: Warning, media state will change at the Relieving Pressure!
              let trans_mediaState = this.translatePipe.transform(result.mediaState.toUpperCase()); //  ToUpper for Trans MasterKeyText on UI
            }

            // Set the form control with the returned value.
            this.safetyValves.relievingTemperature = result.temperature;
            this.relievingtemperature.setValue(this.preferenceDecimalPipe.transform(result.temperature, "TemperatureUnit"));

            if (this.safetyValves.media === "Superheated Steam") {
              this.safetyValves.temperature = this.temperature.value; //result.temperature;
              this.temperature.setValue(this.preferenceDecimalPipe.transform(this.safetyValves.temperature, "TemperatureUnit"));
            }

            // Restore values for Pressure and Temperatue from UI (first/previous PPDS values)
            this.safetyValves.temperature = this.sizingModuleForm.value.temperature;
            this.safetyValves.pressure = this.sizingModuleForm.value.pressure;


          }); // end of Get the Relieving values

        } // end of isMassFlow and not Energy based
      });

    }//if pressure value set
    else {
      this.enableUiInputs();
    }
  }

  productSelectorOnChange($event) {
    console.log(`productSelectorOnChange: event:${event}`);

    this.onChangeValidatePressureForSelectedProducts();

    this.rationaliseSafetyValvesFormInput();
  }

  onCalculateSizing() {

    this.debugData = "";
    this.debugDataEnabled = false;

    // We need to make sure that the PPDS values have settled and the Asyn finished
    // before we collect the data from the UI to send to the Sizing engine.
    // Eg. change the volflow and use the massflow after ValidateProccessConditions() asyn server call has returned.
    if (this.blockUi.isActive || this.blockUi.blockCount > 0) {

      if (!this.isSizing) {
        // Defer sizing calc call for 1.5 secs then try again
        setTimeout(() => {
          this.onCalculateSizing();
        }, 1500);
      }
      else {
        setTimeout(() => {
          this.isSizing = false; // clear blocking flag
        }, 1500);
      }
      return;
    }

    this.isSizing = true;

    this.disableUiInputs();

    this.isSVSelected = false;
    this.isSpecSheetEnabled = true;

    this.safetyValves.media = this.media_Enumeration.value;
    this.safetyValves.mediaState = this.mediaStateFromPPDS; // untranslated

    this.safetyValves.pressure = this.pressure.value;
    this.safetyValves.relievingPressure = this.relievingpressure.value;
    this.safetyValves.pressureUnitId = parseInt(this.pressureRef.preference.value);

    this.safetyValves.overPressure = this.overpressure.value;

    this.safetyValves.temperature = this.temperature.value;
    this.safetyValves.relievingTemperature = this.relievingtemperature.value;
    this.safetyValves.temperatureUnitId = parseInt(this.temperatureRef.preference.value);
    this.safetyValves.normalTemperature = this.normaltemperature.value;
    this.safetyValves.normalTemperatureUnitId = parseInt(this.temperatureRef.preference.value);


    this.safetyValves.areaUnitId = parseInt(this.areaRef.preference.value);

    this.safetyValves.forceUnitId = parseInt(this.forceRef.preference.value);

    this.safetyValves.isMassFlow = this.isMassFlow;


    if (this.isMassFlow) {
      this.safetyValves.volumetricFlow = this.volumetricflow.value;
      this.safetyValves.volumetricFlowUnitId = parseInt(this.volumetricFlowRef.preference.value);

      this.safetyValves.massFlow = this.massflow.value;
      this.safetyValves.massFlowUnitId = parseInt(this.massFlowRef.preference.value);

    } else {
      this.safetyValves.heatOutput = this.load.value;
    }
    this.safetyValves.loadUnitId = parseInt(this.loadRef.preference.value);
    this.safetyValves.noise = this.noisedistance.value;
    this.safetyValves.noiseUnitId = parseInt(this.noiseDistanceRef.preference.value);
    this.safetyValves.standard = this.safetyValveStandard_Enumeration.value;
    this.safetyValves.massDensity = this.massDensity;

    this.safetyValves.backPressureChecked = false;

    this.safetyValves.selectedValves = [];
    for (let p of this.selectedProducts.value) {
      this.safetyValves.selectedValves.push(p);
    }

    this.safetyValvesService.calculate(this.safetyValves).subscribe((response: SafetyValveSizingResult[]) => {
      this.loadSizingData(response, -1); // with nothing selected on grid UI

    });
  }

  loadSizingData(safetyValveSizingResult: SafetyValveSizingResult[], selectedRowIndex: number = -1) {
    this.isSVSizingDone = true;
    if (!!safetyValveSizingResult && safetyValveSizingResult.length > 0) {
      this.rows = this.cloneDeep(this.safetyValveData);
      if (selectedRowIndex >= 0) {
        // set selected valve row
        this.selectedSafetyValve = safetyValveSizingResult[selectedRowIndex];
        this.selected[0] = this.rows[selectedRowIndex]; // select on grid UI, must be a row of safetyValve data with a shape that exists in the rows table.
      }

      if (!this.debugDataEnabled) {
        this.debugData = "";
      }

      if (this.safetyValveData.length > 0) {
        var isFlashOccurred = false;
        for (var i = 0; i < this.safetyValveData.length; i++) {

          if (this.safetyValveData[i]["twoPhaseLiquidArea"] > 0 || this.safetyValveData[i]["twoPhaseGasArea"] > 0) {
            isFlashOccurred = true;

          }
          else {
          }
        }

        if (isFlashOccurred == true) {
          swal({
            closeOnClickOutside: false, closeOnEsc: false,
            title: "Warning",
            text: "Flashing will occur at valve outlet. Sizing calculation adjusted to include flash vapour.",
            icon: "warning",
            dangerMode: true,
            //buttons: ['Ok', 'Cancel']
          }).then((okbuttoncClicked?: boolean) => {

            console.info("Ok clicked...");

            // The parameter can also enter as null
            const returnVal = !(okbuttoncClicked === null);

          }); // end of swal
        }
      }

      // Localize display values.
      this.localizeOutputData();

      this.enableUiInputs();

      this.isSizing = false;

      if (!!this.safetyValveData && this.safetyValveData.length > 0) {
        this.scrollToElement(this.resultsContent, "start");
      }
      else {
        //this.scrollToElement(this.inputsContent, "end"); // annoying on anything but Chrome
      }

      //updating Job Status from 1 (Process Conditions) to 2 (Calculated) this status is used for Saving Job 
      this.jobStatusId = 2;
   
      

    } else {
      let transUnableToSize = this.translatePipe.transform('THE_SOFTWARE_IS_CURRENTLY_UNABLE_TO_SIZE_A_PRODUCT_BASED_ON_YOUR_CRITERIA_PLEASE_CONTACT_YOUR_NEAREST_SPIRAX_SARCO_ASSOCIATE_TO_MESSAGE_DUPLICATE_ID_1101', false);
      let transError = this.translatePipe.transform('ERROR', false);
      this.isSVSizingDone = false;  
      swal({
        closeOnClickOutside: false, closeOnEsc: false,
        title: "Error",
       // text: 'The software is currently unable to size a product based on your criteria. Please contact your nearest Spirax Sarco Associate.',
        text: transUnableToSize,
        icon: "error",
        dangerMode: true,
        //buttons: ['Ok', 'Cancel']
      }).then((okbuttoncClicked?: boolean) => {

        console.info("Ok clicked...");

        // The parameter can also enter as null
        const returnVal = !(okbuttoncClicked === null);       

      });
    }


    //if (this.safetyValveData.length > 0) {
    //  var isFlashOccurred = false;
    //  for (var i = 0; i < this.safetyValveData.length; i++) {

    //    if (this.safetyValveData[i]["twoPhaseLiquidArea"] > 0 || this.safetyValveData[i]["twoPhaseGasArea"] > 0) {
    //      isFlashOccurred = true;

    //    }
    //    else {
    //    }
    //  }

    //  if (isFlashOccurred == true) {
    //    swal({
    //      closeOnClickOutside: false, closeOnEsc: false,
    //      title: "Warning",
    //      text: "Flashing will occur at valve outlet. Sizing calculation adjusted to include flash vapour.",
    //      icon: "warning",
    //      dangerMode: true,
    //      //buttons: ['Ok', 'Cancel']
    //    }).then((okbuttoncClicked?: boolean) => {

    //      console.info("Ok clicked...");

    //      // The parameter can also enter as null
    //      const returnVal = !(okbuttoncClicked === null);

    //    }); // end of swal
    //  }
    //}

    //Below Pop Up code commented out because:
    //Fix consists of disabling the Pop Up message due to validation of incorrect conditions.
    //This could be implemented back in the future once more specific conditions would be developed.

    //Pop-up to explain that set pressure is too high and to suggest to lower the set pressure.
    //  if (safetyValveSizingResult.length == 0) {

    //    swal({
    //      closeOnClickOutside: false, closeOnEsc: false,
    //      title: "No valves available",
    //      text: "The set pressure is too high. Try lowering the set pressure.",
    //      icon: "error",
    //      dangerMode: true,
    //      //buttons: ['Ok', 'Cancel']
    //    }).then((okbuttoncClicked?: boolean) => {

    //      console.info("Ok clicked...");

    //      // The parameter can also enter as null
    //      const returnVal = !(okbuttoncClicked === null);

    //    }); // end of swal
    //  };




    //// Localize display values.
    //this.localizeOutputData();

    //this.enableUiInputs();

    //this.isSizing = false;

    //if (!!this.safetyValveData && this.safetyValveData.length > 0) {
    //  this.scrollToElement(this.resultsContent, "start");
    //}
    //else {
    //  //this.scrollToElement(this.inputsContent, "end"); // annoying on anything but Chrome
    //}
  }

  /*
  * Custom validator for all the form control inputs.
  */
  validateFormControlInput(control: AbstractControl, controlName, unitRef, msgRef) {
      
   
    // Don't attempt to validate until all the data is available
    if (!(!!controlName && !!unitRef && !!unitRef.preference)) {
      return;
    }

    // Reset results
    this.resetResults();
    this.isSVSizingDone = false;

    if (control.value !== "") {
      // Reset error messages first.
      msgRef.value = '';


      // Add details into the validation model.
      var svInputValidation: SafetyValvesInputValidation = new SafetyValvesInputValidation();
      svInputValidation.controlName = controlName;
      svInputValidation.value = control.value;
      svInputValidation.unitId = parseInt(!!unitRef && !!unitRef.preference ? unitRef.preference.value : 0);
      svInputValidation.decimalPlaces = parseInt(!!unitRef && !!unitRef.preference ? unitRef.preference.decimalPlaces : 2);

      this.safetyValvesService.validateSafetyValvesInput(svInputValidation).subscribe((result: Array<SafetyValvesValidationMessage>) => {
        // Check if there's any validation errors? If so, set form control and error message accordingly.

        if (result && result.length > 0) {
          if (result[0].messageKey !== 'UNSUPPORTED_VALIDATION') {
            // Set validation failure message and details (limit value in UI page units)
            let uiValue = !!unitRef && !!unitRef.preference ? this.preferenceDecimalPipe.transform(result[0].value, unitRef.displayPreference) : result[0].value; // set decimal places

            msgRef.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + uiValue + (!!unitRef && !!unitRef.preference && result[0].unitId > 0 ? ' ' + this.translatePipe.transform(unitRef.preference.masterTextKey, false) : '') + ')';

            control.setErrors({ 'incorrect': true });
          }
          else {
            // Validation not supported on Web API, popup on UI
            let trans_Error = this.translatePipe.transform('ERROR', true);
            let trans_UnsupportedValidation = this.translatePipe.transform(result[0].messageKey, true);


            swal({
              closeOnClickOutside: false, closeOnEsc: false,
              title: trans_Error + ':',
              text: trans_UnsupportedValidation + ': ' + controlName,
              icon: "error",
              dangerMode: true,
              //buttons: ['Ok', 'Cancel']
            }).then((okbuttoncClicked?: boolean) => {

              console.info("Ok clicked...");

              // The parameter can also enter as null
              const returnVal = !(okbuttoncClicked === null);

            }); // end of swal

          }
        }
      }); // end of validateSafetyValvesInput() subscribe
    }

    // This is required for custo validator attached with form control.
    //return { customError: false }
    return null;
  }

  validateFormControlSelectedProducts(control: AbstractControl, msgRef) {

    msgRef.value = '';

    if (this.isInitialised && !!control && control.value.length <= 0 && !!msgRef) {

      msgRef.value = this.translatePipe.transform('INVALID_SELECTED_VALVES_ERROR_MSG', false)

      control.setErrors({ 'incorrect': true });

    }
    return null;
  }

  onChangeValidatePressureForSelectedProducts() {

    // Any products selected?
    if (!this.selectedProducts || !this.selectedProducts.value) {
      return;
    }

    this.rationaliseSafetyValvesFormInput();
  }


  onResetModuleForm() {
    console.info("Resetting the Safety Valves form");

    this.convertBaseToDefaultValuesInPageUnits();

    //Reset Project and Job reference
    //this.projectName = this.translatePipe.transform('UNTITLED_PROJECT');
    //this.jobName = this.translatePipe.transform('UNTITLED_JOB');
    //this.projectId = this.translatePipe.transform('');
    //this.jobId = this.translatePipe.transform('');

    //Reset Process Conditions
    this.overpressure.setValue(10);
    this.pressure.setValue('');
    this.temperatureDisabled = true;
    this.temperature.setValue(0);
    this.relievingtemperature.setValue('');
    this.massflow.setValue('');
    this.selectedProducts.setValue('');
    this.relievingpressure.setValue('');
    this.volumetricflow.setValue('');
    this.relievingtemperature.setValue('');
    this.noisedistance.setValue(this.noisedistanceDefaultValue);
    this.mediaStateFromPPDS = "MEDIA_STATE_UNKNOWN";
    this.mediaState.setValue(this.translatePipe.transform(this.mediaStateFromPPDS.toUpperCase()));
    this.processVolumetricFlowUnitSelector(); // Set Normal/Standard/Actual VolumetricFlow units.
    this.selectedProducts.setValue(''); //reset selected valve
    this.massDensity = -1;

    //Reset Spec Sheet Header Details at bottom of the page
    this.sheet.setValue('');
    this.revisionNumber.setValue('');
    this.projectType.setValue('');
    this.quantity.setValue('');
    this.aoNumber.setValue('');
    this.orderNumber.setValue('');
    this.tagNumber.setValue('');
    this.notes.setValue('');

    //remove project ID from URL
    //this.location.replaceState('/sizingModules/safetyValves');

    //unfortunatelly these two settings has to be within setTimeout() function to avoid being overraid by form reset call within sizingModuleComponent.ts in method  doSizingModuleReset()
    this.timeout = setTimeout(() => {

      //Reset Standard
      this.safetyValveStandard_Enumeration.setValue("EN ISO 4126")

      //Rationalise clean form -> media_Enumeration includes this.rationaliseSafetyValvesFormInput();
      this.media_Enumeration.setValue("Dry Saturated Steam");

    }, 100);

  }

  onSaveJob() {
    //// First, check if a job is already loaded?
    //if (this.project && this.projectName && this.job && this.jobName) {
    //  // Job already exists, so just update the sizing.
    //  return false;
    //} else {

    //  return true;

    // First, check if a job is already loaded?
    if (this.project.id && this.projectName && this.job.id && this.jobName) {
      // Job already exists, so just update the sizing.
      return false;
    } else {

      return true;
    }
  }

  onUnitsChanged() {
    this.convertBaseToDefaultValuesInPageUnits();

    this.media_Enumeration.setValue(this.media_Enumeration.value);

    this.volumetricFlowSelectedPageUnitId = parseInt(this.volumetricFlowRef.preference.value); // Initial page pref

    this.setStandardOrNormalTemperatureDefault(this.volumetricFlowSelectedPageUnitId);

    this.processVolumetricFlowUnitSelector(); // Set Normal/Standard/Actual VolumetricFlow units.

    this.rationaliseSafetyValvesFormInput();
  }

  /*
 * Method to reset sizing results.
 */
  resetResults() {
    this.rows = [];
    this.isSVSelected = false;
    this.isSVSizingDone = false;
    this.translatedMessagesList = [];
    this.loadOptions = false;
    this.gridSelectedRow = false;
    if (this.pressure.value === null) {
      this.massDensity = -1
    };

    // Update the flag, no valve means no Ti sheet could be generated.
    this.isTiEnabled = false;
  }

  onGetTiSheet() {

    // ToDo: Drive parameters for real Ti documents.
    // There is a CORS issue pulling file from another domain!
    // We have to pull down the PDF file using the WebAPI then render to the client like a spec sheet.

    let tiRequestModel: TiRequestModel = new TiRequestModel();
    tiRequestModel.languageId = this.user.languageId; // The required Ti language, defaults to languageId=4 ('en') if Ti language not defined/found in the Ti table.

    tiRequestModel.moduleId = 3; // SV ModuleId is 3 (child, Product Sizing), SV moduleGroupId=1 (parent)
    tiRequestModel.languageId = -1; // not supported yet, will get default Ti language, normally 'en'
    tiRequestModel.code = "Safety Valve";
    tiRequestModel.params = this.selectedSafetyValve.productRange + "-TI1"; // any selected CSG Model extra parameters for a Ti selection?

    let trans_Ti_Error = this.translatePipe.transform('TI_ERROR', true);
    let trans_Ti_Information = this.translatePipe.transform('TI_INFORMATION', true);
    let trans_Ti_Failed_To_Download = this.translatePipe.transform('TI_FAILED_TO_DOWNLOAD', true);
    let trans_Ti_The_Product_Technical_Information_sheet = this.translatePipe.transform('TI_THE_PRODUCT_TECHNICAL_INFORMATION_SHEET', true);
    let trans_Ti_missing = this.translatePipe.transform('TI_THE_PRODUCT_TECHNICAL_INFORMATION_SHEET_IS_UNAVAILABLE_OR_MISSING', true);

    // Get Ti url/path
    this.docGenService.getTiDocumentInfo(tiRequestModel).subscribe((response: TiDocumentInfo[]) => {

      // ToDo: Better manage multiple Ti documents returned?
      if (!!response && response.length > 0) {

        response.forEach(ti => {
          // Get first Ti url from result.
          let tiUrlPath = ti.tiPath + ti.tiFileName;// pdf

          if (!!tiUrlPath && tiUrlPath.length > 0) {
            window.open(tiUrlPath, "_blank");
          }
          else {
            swal({
              closeOnClickOutside: false, closeOnEsc: false,
              title: trans_Ti_Error + ':',
              text: trans_Ti_The_Product_Technical_Information_sheet + ' "' + ti.tiPath + '" ' + trans_Ti_Failed_To_Download + '.',
              icon: "error",
              dangerMode: false,
              //buttons: ['Ok', 'Cancel']
            }).then((okbuttoncClicked?: boolean) => {
              console.info("Ok clicked...");
              // The parameter can also enter as null
              const returnVal = !(okbuttoncClicked === null);
            }); // OF SWAL
          } // end of if (!!tiUrlPath)

        }); // end of foreach

      } // end of if
      else {
        // Notify UI, Ti missing/unavailable.
        // ToDo : Translation support?

        swal({
          closeOnClickOutside: false, closeOnEsc: false,
          title: trans_Ti_Information + ':',
          text: trans_Ti_missing + '.',
          icon: "warning",
          dangerMode: false,
          //buttons: ['Ok', 'Cancel']
        }).then((okbuttoncClicked?: boolean) => {
          console.info("Ok clicked...");
          // The parameter can also enter as null
          const returnVal = !(okbuttoncClicked === null);
        });// OF SWAL

      }

    }); // end of getTiDocumentInfo() Subscribe

  }

  onEnterHeaderDetailsForm() {

  }

  onNewSizingForm() {
    // ToDo: Implement!
    let trans_Title = this.translatePipe.transform('NEW_SIZING');
    let trans_Message = this.translatePipe.transform('THIS_WILL_RESET_YOUR_SIZING_AND_REMOVE_THE_PROJECT_AND_JOB_REFERENCE_WOULD_YOU_LIKE_TO_START_A_NEW_SIZING_FROM_THE_BEGINNING');

    // Simple popup message box
    swal({
      title: trans_Title,
      text: trans_Message,
      icon: "warning",
      dangerMode: true,
      buttons: ['Yes', 'Cancel']
    }).then((okbuttoncClicked?: boolean) => {

      // The parameter can also enter as null
      const returnVal = !(okbuttoncClicked === null);

      if (!returnVal) {
        // Begin New Sizing
        console.log("New Sizing")
        this.onResetModuleForm();
      }
      else {
        console.log("New Sizing Cancelled")
      }
    });
  }


  inspecto(daForm: FormGroup) {
    console.info(daForm);
  }

  onPdfSubmit() {

    this.docGen = new DocGen;
    this.docGen.specItems = new Array<SpecSheetItem>();
    this.docGen.moduleId = 3;
    this.docGen.template = "pdf";
    this.docGen.headerImage = "sxsLogo.jpg";
    this.docGen.bodyImage = "SV.png";
    this.docGen.userLanguageId = this.user.languageId;
    this.docGen.targetLanguage = this.specSheetLanguage;
    this.docGen.userPreference = new Array<Preference>();

    for (let userPref of this.userPrefs) {

      this.docGen.userPreference.push(userPref);
    }


    this.calculationDetails = new CalculationDetails;

    // Pass data only, labels are retrieved from database in Doc Gen dll.
    this.setSpecSheetValues();

    this.svDocGenService.getSafetyValvePdf(this.docGen);


  }
  onExcelSubmit() {
    swal({
      closeOnClickOutside: false, closeOnEsc: false,
      title: "Disabled",
      text: "Button disabled. Please click 'PDF' for specification sheet.",
      dangerMode: true,
      //buttons: ['Ok', 'Cancel']
    }).then((okbuttoncClicked?: boolean) => {

      console.info("Ok clicked...");

      // The parameter can also enter as null
      const returnVal = !(okbuttoncClicked === null);

    });


    //this.docGen = new DocGen;
    //this.docGen.specItems = new Array<SpecSheetItem>();
    //this.docGen.moduleId = 3;
    //this.docGen.template = "excel";
    //this.docGen.headerImage = "sxsLogo.jpg";
    //this.docGen.bodyImage = "SV.png";

    //this.calculationDetails = new CalculationDetails;

    //// Pass data only, labels are retrieved from database in Doc Gen dll.
    //this.setSpecSheetValues();

    //this.docGenService.getExcel(this.docGen).subscribe((response: any) => {

    //  let filename = 'SV-SpecificationSheet.xlsx';
    //  FileSaver.saveAs(response, filename);

    //});
  }

  setSpecSheetValues() {
    var currentDate = new Date();

    var seatMaterialList = new Array();

    //Finds the index number of the selected seat/disc in the list of seats.
    var seatIndex = this.seatList.findIndex(x => x == this.options.selectedSeat);

    if (this.selectedSafetyValve["seatMaterialList"]) {

      for (let seatList of this.selectedSafetyValve["seatMaterialList"]) {

        seatMaterialList.push(seatList);


      }

      //Finds the seat/disc material relative to the Seat type
      var seatMaterial = this.selectedSafetyValve["seatMaterialList"][seatIndex];

    } else {
      seatMaterialList.push("-");
    }

    this.options.sealMaterial = this.selectedSafetyValve["sealMaterial"];



    //Sets rated capacity unit to either kg/h or kwh
    if (this.isMassFlow == false) {

      this.docGen.specItems.push({ name: 'Rated Capacity Unit', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.docGen.userPreference.find(x => x.name == "LoadUnit").unitName, calculation: "" });
    } else {

      this.docGen.specItems.push({ name: 'Rated Capacity Unit', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.massFlowRef.preference.unitName, calculation: "" });

    }




    var projName = this.projectId !== "" ? this.project.name : "-";
    var projRef = this.projectId !== "" ? this.project.projectReference : "-";
    var projLocation = this.projectId !== "" ? this.project.customerLocation : "-";
    var projQuoteRef = this.projectId !== "" ? this.project.quoteReference : "-";
    var projCusName = this.projectId !== "" ? this.project.customerName : "-";
    var jobName = this.jobId !== "" ? this.job.name : "-";

    // Pass data only, labels are retrieved from database in Doc Gen dll.
    this.docGen.specItems.push({ name: 'Date', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: currentDate.toDateString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Quotation', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projQuoteRef, calculation: "" });
    this.docGen.specItems.push({ name: 'Prepared By', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.user.firstname + ' ' + this.user.lastname, calculation: "" });
    this.docGen.specItems.push({ name: 'Sheet', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.sheet.value == null ? "-" : this.sheet.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Revision No', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.revisionNumber.value == null ? "-" : this.revisionNumber.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Email', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.user.email, calculation: "" });
    this.docGen.specItems.push({ name: 'Quantity', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.quantity.value == null ? "-" : this.quantity.value, calculation: "" });
    this.docGen.specItems.push({ name: 'AO Number', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.aoNumber.value == null ? "-" : this.aoNumber.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Telephone', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.user.telephone, calculation: "" });
    this.docGen.specItems.push({ name: 'Customer', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projCusName, calculation: "" });
    this.docGen.specItems.push({ name: 'Order Number', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.orderNumber.value == null ? "-" : this.orderNumber.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Project Type', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.projectType.value == null ? "-" : this.projectType.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Location', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projLocation, calculation: "" });
    this.docGen.specItems.push({ name: 'Project Name', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projName, calculation: "" });
    this.docGen.specItems.push({ name: 'Project Ref', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projRef, calculation: "" });
    this.docGen.specItems.push({ name: 'Job Name', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: jobName, calculation: "" });
    this.docGen.specItems.push({ name: 'Product Code', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: jobName, calculation: "" });
    this.docGen.specItems.push({ name: 'Tag No', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.tagNumber.value, calculation: "" });

    // general
    this.docGen.specItems.push({ name: 'Media', type: 'Section', masterTextKey: this.mediaEnumerationList.enumerationDefinitions.find(x => x.value == this.media_Enumeration.value).masterTextKey, sectionName: 'General', targetLanguage: this.specSheetLanguage, value: this.media_Enumeration.value, calculation: "" });
    this.docGen.specItems.push({ name: 'State', type: 'Section', masterTextKey: '', sectionName: 'General', targetLanguage: this.specSheetLanguage, value: this.mediaState.value, calculation: "" });
    this.docGen.specItems.push({ name: 'mediaStateFromPPDS', type: 'Section', masterTextKey: '', sectionName: 'General', targetLanguage: this.specSheetLanguage, value: this.mediaStateFromPPDS, calculation: "" });
    this.docGen.specItems.push({ name: 'Standard', type: 'Section', masterTextKey: this.safetyValveStandardEnumerationList.enumerationDefinitions.find(x => x.value == this.safetyValveStandard_Enumeration.value).masterTextKey, sectionName: 'General', targetLanguage: this.specSheetLanguage, value: this.safetyValveStandard_Enumeration.value, calculation: "" });

    // process data
    this.docGen.specItems.push({ name: 'Mass Flow', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.safetyValves.massFlow == null ? this.massflow.value.toString() : this.safetyValves.massFlow.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Mass flow unit', type: 'Unit', masterTextKey: this.massFlowRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.massFlowRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Volumetric Flow', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.safetyValves.volumetricFlow == null ? this.volumetricflow.value.toString() : this.safetyValves.volumetricFlow.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Volumetric flow unit', type: 'Unit', masterTextKey: this.volumetricFlowRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.volumetricFlowRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Heat Output', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.safetyValves.heatOutput == null ? "-" : this.safetyValves.heatOutput.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Heat Output unit', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.docGen.userPreference.find(x => x.name == "LoadUnit").unitName = null ? "-" : this.docGen.userPreference.find(x => x.name == "LoadUnit").unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Set Pressure', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressure.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Set pressure unit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Overpressure', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve.overPressure.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Overpressure unit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Relieving Pressure', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve.relievingPressure.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Relieving pressure unit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Relieving Temperature', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve.relievingTemperature.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Relieving Temperature unit', type: 'Unit', masterTextKey: this.temperatureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.temperatureRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Coefficient of Discharge', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["kdrUsed"] == null ? "-" : this.selectedSafetyValve["kdrUsed"].toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Coefficient of Discharge Unit', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: "Kdr", calculation: "" });
    this.docGen.specItems.push({ name: 'Superheat Correction Factor', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["superheatCorrection"] == null ? "-" : this.selectedSafetyValve["superheatCorrection"], calculation: "" });
    this.docGen.specItems.push({ name: 'Dynamic Viscosity', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["dynamicViscosity"] == null ? "-" : this.selectedSafetyValve["dynamicViscosity"].toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Compressibility Factor', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["compressibility"] == null ? "-" : this.selectedSafetyValve["compressibility"].toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Isentropic Coefficient', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["isentropicCoefficient"] == null ? "-" : this.selectedSafetyValve["isentropicCoefficient"].toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Specific Volume', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["specificVolume"] == null ? "-" : this.selectedSafetyValve["specificVolume"].toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Molecular Weight', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["molecularWeight"] == null ? "-" : this.selectedSafetyValve["molecularWeight"].toString(), calculation: "" });

    // backpressure
    this.docGen.specItems.push({ name: 'Pipe Standard', type: 'Section', masterTextKey: '', sectionName: 'Backpressure', targetLanguage: this.specSheetLanguage, value: this.isBackpressure ? this.pipeStandard_Enumeration.value : "-", calculation: "" });
    this.docGen.specItems.push({ name: 'Nominal Bore', type: 'Section', masterTextKey: '', sectionName: 'Backpressure', targetLanguage: this.specSheetLanguage, value: this.isBackpressure ? this.nominalBore_Enumeration.value : this.selectedSafetyValve["nominalBore"] == null ? "-" : this.selectedSafetyValve["nominalBore"], calculation: "" });
    this.docGen.specItems.push({ name: 'Pipe Length', type: 'Section', masterTextKey: '', sectionName: 'Backpressure', targetLanguage: this.specSheetLanguage, value: this.isBackpressure ? this.pipeLength.value : this.selectedSafetyValve["newPipeSize"] == null ? "-" : this.selectedSafetyValve["newPipeSize"], calculation: "" });
    this.docGen.specItems.push({ name: 'No of 90 Elbows', type: 'Section', masterTextKey: '', sectionName: 'Backpressure', targetLanguage: this.specSheetLanguage, value: this.isBackpressure ? this.backpressure90Elbows_Enumeration.value : "-", calculation: "" });
    this.docGen.specItems.push({ name: 'No of 45 Elbows', type: 'Section', masterTextKey: '', sectionName: 'Backpressure', targetLanguage: this.specSheetLanguage, value: this.isBackpressure ? this.backpressure45Elbows_Enumeration.value : "-", calculation: "" });
    this.docGen.specItems.push({ name: 'No of Swept Bends', type: 'Section', masterTextKey: '', sectionName: 'Backpressure', targetLanguage: this.specSheetLanguage, value: this.isBackpressure ? this.backpressureSweptBends_Enumeration.value : "-", calculation: "" });
    this.docGen.specItems.push({ name: 'Superimposed Backpressure', type: 'Section', masterTextKey: '', sectionName: 'Backpressure', targetLanguage: this.specSheetLanguage, value: this.isSuperBackPressure ? this.superImposed.value : "-", calculation: "" });

    // selected valves
    this.docGen.specItems.push({ name: 'Calculated Area', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve.calculatedArea.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Calculated Area Unit', type: 'Section', masterTextKey: this.areaRef.preference.masterTextKey, sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.areaRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Selected Area', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve.flowArea.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Orifice Letter', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve.orifice, calculation: "" });
    this.docGen.specItems.push({ name: 'Rated Capacity', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve.ratedCapacity.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Percentage Capacity', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve.percentCapacity.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Reaction Force', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve.reactionForce.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Reaction Force Unit', type: 'Section', masterTextKey: this.forceRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.forceRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Noise Prediction', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve.noiseAtDistance.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Noise Distance', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.noisedistance.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Noise Distance unit', type: 'Unit', masterTextKey: this.noiseDistanceRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.noiseDistanceRef.preference.unitName, calculation: "" });

    //product
    this.docGen.specItems.push({ name: 'Product Number', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.productNumber.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Product Code No', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.productCode.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Valve Weight', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.options.valveWeight == null ? "-" : this.options.valveWeight.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Valve Weight Unit', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.userPrefs.find(x => x.name == "WeightUnit").unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'A', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.options.dimA == null ? "-" : this.options.dimA.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'B', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.options.dimB == null ? "-" : this.options.dimB.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'C', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.options.dimC == null ? "-" : this.options.dimC.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Length Unit', type: 'Section', masterTextKey: '', sectionName: 'Valve', targetLanguage: this.specSheetLanguage, value: this.userPrefs.find(x => x.name == "LengthUnit").unitName, calculation: "" });

    // construction
    this.docGen.specItems.push({ name: 'Size Inlet Outlet', type: 'Section', masterTextKey: '', sectionName: 'Construction', targetLanguage: this.specSheetLanguage, value: this.inletSize.value.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Outlet', type: 'Section', masterTextKey: '', sectionName: 'Construction', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["outletDisplay"] == null ? "-" : this.selectedSafetyValve["outletDisplay"].toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Connection Inlet Outlet', type: 'Section', masterTextKey: '', sectionName: 'Construction', targetLanguage: this.specSheetLanguage, value: this.inletConnection_Enumeration.value.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Outlet connection', type: 'Section', masterTextKey: '', sectionName: 'Construction', targetLanguage: this.specSheetLanguage, value: this.outletConnection_Enumeration.value.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Nozzle Type', type: 'Section', masterTextKey: this.nozzleTypeEnumerationList.enumerationDefinitions.find(x => x.value == this.selectedSafetyValve["nozzle"]).masterTextKey.toString() , sectionName: 'Construction', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["nozzle"] == null ? "-" : this.selectedSafetyValve["nozzle"], calculation: "" });
    this.docGen.specItems.push({ name: 'Bonnet Type', type: 'Section', masterTextKey: this.bonnetEnumerationList.enumerationDefinitions.find(x => x.value == this.bonnet_Enumeration.value).masterTextKey.toString(), sectionName: 'Construction', targetLanguage: this.specSheetLanguage, value: this.bonnet_Enumeration.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Lever / Cap Type', type: 'Section', masterTextKey: this.leverEnumerationList.enumerationDefinitions.find(x => x.value == this.lever_Enumeration.value).masterTextKey, sectionName: 'Construction', targetLanguage: this.specSheetLanguage, value: this.lever_Enumeration.value.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Finish', type: 'Section', masterTextKey: this.finishEnumerationList.enumerationDefinitions.find(x => x.value == this.options.selectedFinish).masterTextKey, sectionName: 'Construction', targetLanguage: this.specSheetLanguage, value: this.options.selectedFinish, calculation: "" });
    this.docGen.specItems.push({ name: 'Code Stamp', type: 'Section', masterTextKey: '', sectionName: 'Construction', targetLanguage: this.specSheetLanguage, value: "-", calculation: "" });
    this.docGen.specItems.push({ name: 'National Board Stamp', type: 'Section', masterTextKey: '', sectionName: 'Construction', targetLanguage: this.specSheetLanguage, value: "-", calculation: "" });

    // materials
    this.docGen.specItems.push({ name: 'Body', type: 'Section', masterTextKey: this.bodyEnumerationList.enumerationDefinitions.find(x => x.value == this.selectedSafetyValve.bodyMaterial).masterTextKey, sectionName: 'Materials', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve.bodyMaterial + " " + this.selectedSafetyValve["bodyGrade"] == null ? "-" : this.selectedSafetyValve.bodyMaterial + " " + this.selectedSafetyValve["bodyGrade"], calculation: "" });
    this.docGen.specItems.push({ name: 'Bonnet', type: 'Section', masterTextKey: '', sectionName: 'Materials', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["bonnetMaterial"] + " " + this.selectedSafetyValve["bonnetGrade"] == null ? "-" : this.selectedSafetyValve["bonnetMaterial"] + " " + this.selectedSafetyValve["bonnetGrade"], calculation: "" });
    this.docGen.specItems.push({ name: 'Cap', type: 'Section', masterTextKey: '', sectionName: 'Materials', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["capMaterial"] + " " + this.selectedSafetyValve["capGrade"] == null ? "-" : this.selectedSafetyValve["capMaterial"] + " " + this.selectedSafetyValve["capGrade"], calculation: "" });
    this.docGen.specItems.push({ name: 'Nozzle', type: 'Section', masterTextKey: '', sectionName: 'Materials', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["nozzle"] == null ? "-" : this.selectedSafetyValve["nozzle"] + " " + this.selectedSafetyValve["nozzleMaterial"], calculation: "" });
    this.docGen.specItems.push({ name: 'Disc', type: 'Section', masterTextKey: '', sectionName: 'Materials', targetLanguage: this.specSheetLanguage, value: seatMaterial + " / " + this.options.selectedSeat, calculation: "" });
    this.docGen.specItems.push({ name: 'Spring', type: 'Section', masterTextKey: this.springEnumerationList.enumerationDefinitions.find(x => x.value == this.options.selectedSpring).masterTextKey, sectionName: 'Materials', targetLanguage: this.specSheetLanguage, value: this.options.selectedSpring, calculation: "" });
    this.docGen.specItems.push({ name: 'Stem', type: 'Section', masterTextKey: '', sectionName: 'Materials', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["stemMaterial"] + " " + this.selectedSafetyValve["stemGrade"] == null ? "-" : this.selectedSafetyValve["stemMaterial"] + " " + this.selectedSafetyValve["stemGrade"], calculation: "" });
    this.docGen.specItems.push({ name: 'Guide', type: 'Section', masterTextKey: '', sectionName: 'Materials', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["guideMaterial"] + " " + this.selectedSafetyValve["guideGrade"] == null ? "-" : this.selectedSafetyValve["guideMaterial"] + " " + this.selectedSafetyValve["guideGrade"], calculation: "" });
    this.docGen.specItems.push({ name: 'Gasket', type: 'Section', masterTextKey: '', sectionName: 'Materials', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["bodyGasket"] == null ? "-" : this.selectedSafetyValve["bodyGasket"], calculation: "" });
    this.docGen.specItems.push({ name: 'Gland Packing', type: 'Section', masterTextKey: '', sectionName: 'Materials', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["glandPacking"] == null ? "-" : this.selectedSafetyValve["glandPacking"], calculation: "" });
    this.docGen.specItems.push({ name: 'Bellows', type: 'Section', masterTextKey: '', sectionName: 'Materials', targetLanguage: this.specSheetLanguage, value: this.selectedSafetyValve["bellows"] == null ? "-" : this.selectedSafetyValve["bellows"], calculation: "" });



    // Notes
    this.docGen.specItems.push({ name: 'Notes', type: 'Section', masterTextKey: '', sectionName: 'Notes', targetLanguage: this.specSheetLanguage, value: this.notes.value == "" ? "-" : this.notes.value, calculation: "" });

    var i = 0;

    var details = new Details;


    switch (this.mediaStateFromPPDS) {
      case "Steam":

        switch (this.safetyValveStandard_Enumeration.value) {
          case "EN ISO 4126":

            details.name = "Calculated Area";
            details.calculation = "A = Qm / 0.2883 x C x Kdr x SQRT(Po / v)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Speed of sound in the gas";
            details.calculation = "C = 91.2 x SQRT(k x To / M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            //  details.name = '';
            //  details.calculation = '';
            //  details.name = "Noise Prediction at Radius - 30 Metres";
            //  details.calculation = "L(30) = L + (10 x Log(Qm x C²/ 2))";
            //  this.calculationDetails[i] = details;
            //  i = i + 1;

            details = new Details;
            details.name = "Noise Prediction at Radius";
            details.calculation = "LP = L(30) - (20 x Log(r / 30))";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Reaction Force Prediction";
            details.calculation = "F = 129 x Qm x SQRT(k x To / (k+1) x M)";
            this.calculationDetails[i] = details;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });
            i = i + 1;

            break;

          case "AD Merkblatt A2":

            details.name = "Function of Isentropic Coefficient";
            details.calculation = "C = 3.948 x SQRT(k x (2 / (k+1))^(k+1)/(k-1))";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Calculated Area";
            details.calculation = "A = (Qm x X) / (Kd x Po)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Speed of sound in the gas";
            details.calculation = "C = 91.2 x SQRT(k x To / M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            //  details.name = '';
            //  details.calculation = '';
            //  details.name = "Noise Prediction at Radius - 30 Metres";
            //  details.calculation = "L(30) = L + (10 x Log(Qm x C²/ 2))";
            //  this.calculationDetails[i] = details;
            //  i = i + 1;

            details = new Details;
            details.name = "Noise Prediction at Radius";
            details.calculation = "LP = L(30) - (20 x Log(r / 30))";
            this.calculationDetails[i] = details;
            i = i + 1;
            //
            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Reaction Force Prediction";
            details.calculation = "F = 129 x Qm x SQRT(k x To / (k+1) x M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Pressure Medium Coefficient";
            details.calculation = "Taken from Fig.4 chart in AD Merkblatt Standard.";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            break;

          case "ASME I":
            details.name = "Calculated Area";
            details.calculation = "A = Qm / (51.5 x Po x Kdr x Ksh)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Speed of sound in the gas";
            details.calculation = "C = 223 x SQRT(k x To / M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Reaction Force Prediction";
            details.calculation = "F = Qm / 366 x SQRT(k x To / (k+1) x M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            //  details.name = '';
            //  details.calculation = '';
            //  details.name = "Noise Prediction at Radius - 100 Feet";
            //  details.calculation = "L(100) = L + (10 x Log(Qm x C²/ 2))";
            //  this.calculationDetails[i] = details;
            //  i = i + 1;

            //  details.name = '';
            //  details.calculation = '';
            //  details.name = "Noise Prediction at Radius - 98.43 Feet";
            //  details.calculation = "LP = L(100) - (20 x Log(r / 100))";
            //  this.calculationDetails[i] = details;
            //  i = i + 1;

            break;

          case "ASME VIII":

            details.name = "Calculated Area";
            details.calculation = "A = Qm / (51.5 x Po x Kdr x Ksh)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Speed of sound in the gas";
            details.calculation = "C = 223 x SQRT(k x To / M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Reaction Force Prediction";
            details.calculation = "F = Qm / 366 x SQRT(k x To / (k+1) x M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            //  details.name = '';
            //  details.calculation = '';
            //  details.name = "Noise Prediction at Radius - 100 Feet";
            //  details.calculation = "L(100) = L + (10 x Log(Qm x C²/ 2))";
            //  this.calculationDetails[i] = details;
            //  i = i + 1;

            //  details.name = '';
            //  details.calculation = '';
            //  details.name = "Noise Prediction at Radius - 98.43 Feet";
            //  details.calculation = "LP = L(100) - (20 x Log(r / 100))";
            //  this.calculationDetails[i] = details;
            //  i = i + 1;

            break;

          case "API520":

            details.name = "Calculated Area";
            details.calculation = "A = Qm / (51.5 x Po x Kdr x Ksh)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Speed of sound in the gas";
            details.calculation = "C = 223 x SQRT(k x To / M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Reaction Force Prediction";
            details.calculation = "F = Qm / 366 x SQRT(k x To / (k+1) x M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            //  details.name = '';
            //  details.calculation = '';
            //  details.name = "Noise Prediction at Radius - 100 Feet";
            //  details.calculation = "L(100) = L + (10 x Log(Qm x C²/ 2))";
            //  this.calculationDetails[i] = details;
            //  i = i + 1;

            //  details.name = '';
            //  details.calculation = '';
            //  details.name = "Noise Prediction at Radius - 98.43 Feet";
            //  details.calculation = "LP = L(100) - (20 x Log(r / 100))";
            //  this.calculationDetails[i] = details;
            //  i = i + 1;

            break;
        }

        break;

      case "Liquid":

        switch (this.safetyValveStandard_Enumeration.value) {

          case "EN ISO 4126":

            details.name = "Function of Isentropic Coefficient";
            details.calculation = "C = 3.948 x SQRT(k x (2 / (k+1))^(k+1)/(k-1))";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Calculated Area";
            details.calculation = "A = Qm / 1.61 x Kdr x SQRT((Po - Pb) / v))";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            //details.name = '';
            //details.calculation = '';
            //details.name = "Calculated Area L Phase";
            //details.calculation = "A = Qm / (1.61 x Kdr x SQRT((Po - Pb) / v))";
            //this.calculationDetails[i] = details;
            //i = i + 1;

            details = new Details;
            details.name = "Reynolds Number";
            details.calculation = "Re = (Qm / (3.6 * u)) * SQRT(4/(Pi * As))";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Viscosity Correction";
            details.calculation = "OR = A / As";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            break;

          case "AD Merkblatt A2":

            details.name = "Function of Isentropic Coefficient";
            details.calculation = "C = 3.948 x SQRT(k x (2 / (k+1))^(k+1)/(k-1))";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Calculated Area";
            details.calculation = "A = ( 0.6211 x Qm / Kdr x sqrt(p( Po – Pb ))";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            //details.name = '';
            //details.calculation = '';
            //details.name = "Calculated Area G Phase";
            //details.calculation = "A = Qm / (Po x C x Kdr x SQRT(M /(Z x To))";
            //this.calculationDetails[i] = details;
            //i = i + 1;

            details = new Details;
            details.name = "Outflow Function";
            details.calculation = "Y = SQRT(k / k+1) x (2 / k+1)^(1 / k-1)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Reynolds Number";
            details.calculation = "Re = (Qm / (3.6 * u)) * SQRT(4/(Pi * As))";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Viscosity Correction";
            details.calculation = "OR = A / As";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            break;

          case "TRD 721":

            details.name = "Calculated Area";
            details.calculation = "A = P / Kdr x K";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.calculation = '';
            details.name = "Outflow Function";
            details.calculation = "Y = SQRT(k / k+1) x (2 / k+1)^(1 / k-1)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.calculation = '';
            details.name = "Pressure Medium Coefficient";
            details.calculation = "X = 0.6211 x (SQRT(Po x v) / Y)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.calculation = '';
            details.name = "Pressure Constant";
            details.calculation = "K = ((p / X) x (I x 2.78))^-4";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            break;
        }

        break;
      case "Gas":

        switch (this.safetyValveStandard_Enumeration.value) {

          case "EN ISO 4126":

            details.name = "Function of Isentropic Coefficient";
            details.calculation = "C = 520 x SQRT(k x (2 / (k+1))^(k+1)/(k-1))";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation
            });

            details = new Details;
            details.name = "Calculated Area";
            details.calculation = "A = Qm / (Po x C x Kdr x SQRT(M /(Z x To))";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: this.selectedSafetyValve.calculatedArea.toString(),
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Speed of sound in the gas";
            details.calculation = "C = 91.2 x SQRT(k x To / M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation
            });

            //details = new Details;
            //details.name = "Noise Prediction at Radius - 30 Metres";
            //details.calculation = "L(30) = L + (10 x Log(Qm x C²/ 2))";
            //this.calculationDetails[i] = details;
            //i = i + 1;

            //this.docGen.specItems.push({
            //  name: details.name,
            //  type: 'Section',
            //  masterTextKey: "",
            //  sectionName: 'Calculation Details',
            //  targetLanguage: this.specSheetLanguage,
            //  value: details.calculation
            //});

            details = new Details;
            details.name = "Noise Prediction at Radius";
            details.calculation = "F = 129 x Qm x SQRT(k x To / (k+1) x M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation
            });

            details = new Details;
            details.name = "Reaction Force Prediction";
            details.calculation = "F = 129 x Qm x SQRT(k x To / (k+1) x M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation
            });

            break;

          case "AD Merkblatt A2":

            details.name = "Calculated Area";
            details.calculation = "A = 0.1791 x Qm /((Po x Y x Kdr) x SQRT(M/ (Z x To)))";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Speed of sound in the gas";
            details.calculation = "C = 91.2 x SQRT(k x To / M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            //details.name = '';
            //details.calculation = '';
            //details.name = "Noise Prediction at Radius - 30 Metres";
            //details.calculation = "L(30) = L + (10 x Log(Qm x C²/ 2))";
            //this.calculationDetails[i] = details;
            //i = i + 1;

            details = new Details;
            details.name = "Noise Prediction at Radius";
            details.calculation = "LP = L(30) - (20 x Log(r / 30))";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Reaction Force Prediction";
            details.calculation = "F = 129 x Qm x SQRT(k x To / (k+1) x M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Outflow Function";
            details.calculation = "Y = SQRT(k / k+1) x (2 / k+1)^(1 / k-1)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            break;

          case "ASME VIII":

            details.name = "Function of Isentropic Coefficient";
            details.calculation = "C = 520 x SQRT(k x (2 / (k+1))^(k+1)/(k-1))";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Calculated Area";
            details.calculation = "A = (Qm / (Po x C x Kdr)) x SQRT((Z x To) / M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Speed of sound in the gas";
            details.calculation = "C = 223 x SQRT(k x To / M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Reaction Force Prediction";
            details.calculation = "F = Qm / 366 x SQRT(k x To / (k+1) x M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            //details.name = '';
            //details.calculation = '';
            //details.name = "Noise Prediction at Radius - 100 Feet";
            //details.calculation = "L(100) = L + (10 x Log(Qm x C²/ 2))";
            //this.calculationDetails[i] = details;
            //i = i + 1;

            //details.name = '';
            //details.calculation = '';
            //details.name = "Noise Prediction at Radius - 98.43 Feet";
            //details.calculation = "LP = L(100) - (20 x Log(r / 100))";
            //this.calculationDetails[i] = details;
            //i = i + 1;

            break;

          case "API520":

            details.name = "Function of Isentropic Coefficient";
            details.calculation = "C = 3.948 x SQRT(k x (2 / (k+1))^(k+1)/(k-1))";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Calculated Area";
            details.calculation = "A = (Qm / (Po x C x Kdr)) x SQRT((Z x To) / M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Speed of sound in the gas";
            details.calculation = "C = 223 x SQRT(k x To / M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

            details = new Details;
            details.name = "Reaction Force Prediction";
            details.calculation = "F = Qm / 366 x SQRT(k x To / (k+1) x M)";
            this.calculationDetails[i] = details;
            i = i + 1;

            this.docGen.specItems.push({
              name: details.name,
              type: 'Section',
              masterTextKey: "",
              sectionName: 'Calculation Details',
              targetLanguage: this.specSheetLanguage,
              value: "",
              calculation: details.calculation

            });

          //details.name = '';
          //details.calculation = '';
          //details.name = "Noise Prediction at Radius - 100 Feet";
          //details.calculation = "L(100) = L + (10 x Log(Qm x C²/ 2))";
          //this.calculationDetails[i] = details;
          //i = i + 1;

          //details.name = '';
          //details.calculation = '';
          //details.name = "Noise Prediction at Radius - 98.43 Feet";
          //details.calculation = "LP = L(100) - (20 x Log(r / 100))";
          //this.calculationDetails[i] = details;
          //i = i + 1;

        }

        break;

    }


  }

  /**
   * Data table selection changed
   */
  onSelect({ selected }) {
    console.log('Select Event', selected);
    this.onSelectRunning = true;
    this.selectedSafetyValve = selected[0];
    this.isSVSelected = true;

    this.inletSize.setValue(this.selectedSafetyValve.inletDisplay);
    this.selectedBodyMaterial = this.selectedSafetyValve.bodyMaterial;
    this.options.selectedBodyMaterial = this.selectedBodyMaterial;
    this.options.translatedPressureUnit = this.pressureRef.preference.unitName;

    // set options & filters
    this.options.inletSize = this.selectedSafetyValve.inletSize;  
    this.options.inletSizeDisplay = this.selectedSafetyValve.inletDisplay;

    this.options.selectedInletConnection = this.selectedSafetyValve.inletConnection;
    this.filterOutletSize(this.selectedSafetyValve.outletSizeList, this.selectedSafetyValve.outletSizeDisplayList);

    this.filterInletConnection(this.selectedSafetyValve.inletConnection, this.selectedSafetyValve.inletConnectionList);
    this.filterOutletConnection(this.selectedSafetyValve.outletConnection, this.selectedSafetyValve.outletConnectionList);
    this.filterBonnet(this.selectedSafetyValve.bonnetList);
    this.filterSeat(this.selectedSafetyValve.seatList);
    this.filterLever(this.selectedSafetyValve.leverList);
    this.filterSpring(this.selectedSafetyValve.springList);

    this.options.NozzleList = this.selectedSafetyValve.nozzleList;

    this.options.selectedProductRange = this.selectedSafetyValve.productRange;
    this.options.standard = this.safetyValveStandard_Enumeration.value;
    this.options.valveOrifice = this.selectedSafetyValve.orifice;
    this.options.inletPressure = this.pressure.value;
    this.options.pressureUnit = parseInt(this.pressureRef.preference.value);
    this.options.valveInletSize = this.selectedSafetyValve.inletSize;

    this.options.selectedFinish = "None";
    this.finish_Enumeration.setValue("None");

    this.options.selectedNozzle = this.nozzle_Enumeration.value;
    //if (this.options.selectedNozzle == "")
    //{
    //  this.options.selectedNozzle = "-"
    //}

    this.options.temperature = this.temperature.value
    this.options.temperatureUnitId = parseInt(this.temperatureRef.preference.value);
    this.options.mediaState = this.mediaState.value;
    this.options.media = this.media_Enumeration.value;
    this.options.relievingTemperature = this.relievingtemperature.value;
    this.options.selectedBonnet = this.bonnet_Enumeration.value;
    this.options.lengthUnit = +this.userPrefs.find(x => x.name == "LengthUnit").value;
    this.options.weightUnit = +this.userPrefs.find(x => x.name == "WeightUnit").value;


    this.setOptions();

    // Update the flag so that Ti sheet could be generated.
    this.isTiEnabled = true;

    this.scrollToElement(this.resultsContent, "start");

    if (this.debugDataEnabled) {
      this.debugData = JSON.stringify(this.selectedSafetyValve);
      this.debugData = this.debugData.replace(new RegExp(this.escapeRegExp(',"'), 'g'), '\r\n"');
    }
    else {
      this.debugData = "";
    }

    this.onSelectRunning = false;
  }

  // Escape characters that have a special meaning in Regular Expressions
  escapeRegExp(s: string): string {
    return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  }

  filterInletConnection(connection: any, connectionList: any) {
    this.options.selectedInletConnection = connection;
    this.options.inletConnectionList = [];
    this.inletConnectionList = [];

    if (!!connection && !!connectionList) {
      for (let item of connectionList) {
        this.options.inletConnectionList.push(item);
        this.inletConnectionList.push(item);
      }
    }
    else {
      console.log('filterInletConnection() parameters are empty? connection=' + connection + ', connectionList=' + connectionList);
      debugger;
    }

  }

  filterOutletConnection(connection: any, connectionList: any) {

    this.options.selectedOutletConnection = connection;
    this.options.outletConnectionList = [];
    this.outletConnectionList = [];

    if (!!connection && !!connectionList) {

      for (let item of connectionList) {
        this.options.outletConnectionList.push(item);
        this.outletConnectionList.push(item);

      }
    }
    else {
      console.log('filterOutletConnection() parameters are empty? connection=' + connection + ', connectionList=' + connectionList);
      debugger;
    }

  }

  filterBonnet(bonnetList: any) {
    this.options.bonnetList = [];
    this.bonnetList = [];

    if (!!bonnetList) {

      for (let item of bonnetList) {
        // base text value used in safety valve dll
        this.options.bonnetList.push(item);

        // translated text for display filter
        var defaultText = this.bonnetEnumerationList.enumerationDefinitions.find(x => x.value == item).defaultText;
        this.bonnetList.push(defaultText);
      }

      //sets default for bonnet list
      this.bonnet_Enumeration.setValue(this.bonnetList[0]);
      this.options.selectedBonnet = this.bonnetList[0];

      if (this.bonnetList.length < 1) {
        this.bonnet_Enumeration.disable();
      } else {
        this.bonnet_Enumeration.enable();
      }
    }
    else {
      console.log('filterBonnet() parameter is empty? bonnetList=' + bonnetList);
      debugger;
    }

  }


  filterSeat(seatList: any) {
    this.options.seatList = [];
    this.seatList = [];

    if (!!seatList) {

      for (let item of seatList) {
        // base text value used in safety valve dll
        this.options.seatList.push(item);

        // translated text for display filter
        var defaultText = this.seatEnumerationList.enumerationDefinitions.find(x => x.value == item).defaultText;
        this.seatList.push(defaultText);
      }

      this.options.selectedSeat = this.seatList[0];


      if (this.seatList.length < 1) {
        this.seat_Enumeration.disable();
      } else {
        this.seat_Enumeration.enable();
      }
    }
    else {
      console.log('filterSeat() parameter is empty? seatList=' + seatList);
      debugger;
    }
  }

  filterLever(leverList: any) {
    this.options.leverList = [];
    this.leverList = [];

    if (!!leverList) {

      for (let item of leverList) {
        // base text value used in safety valve dll
        this.options.leverList.push(item);

        // translated text for display filter
        var defaultText = this.leverEnumerationList.enumerationDefinitions.find(x => x.value === item).defaultText;
        this.leverList.push(defaultText);
      }

      // set standard lever to default (if available)
      if (this.leverList.find(x => x === "Standard Lever")) {

        this.options.selectedLever = this.leverEnumerationList.enumerationDefinitions
          .find(x => x.value === "Standard Lever").defaultText;

      } else {
        this.options.selectedLever = this.leverList[0];;
      }

      if (this.leverList.length < 1) {
        this.lever_Enumeration.disable();
      } else {
        this.lever_Enumeration.enable();
      }
    }
    else {
      console.log('filterLever() parameter is empty? leverList=' + leverList);
      debugger;
    }

  }

  filterNozzle(nozzleList: any) {
    this.options.NozzleList = [];
    this.nozzleList = [];

    if (!!nozzleList) {

      for (let item of nozzleList) {
        // base text value used in safety valve dll
        this.options.NozzleList.push(item);

        // translated text for display filter
        var defaultText = this.nozzle_Enumeration.value.find(x => x.value == item).defaultText;
        this.nozzleList.push(defaultText);
      }

    }

  }

  filterSpring(springList: any) {
    this.options.springList = [];
    this.springList = [];

    if (!!springList) {

      for (let item of springList) {
        // base text value used in safety valve dll
        this.options.springList.push(item);

        // translated text for display filter
        var defaultText = this.springEnumerationList.enumerationDefinitions.find(x => x.value == item).defaultText;
        this.springList.push(defaultText);
      }

      this.options.selectedSpring = this.springList[0];

      if (this.springList.length < 1) {
        this.spring_Enumeration.disable();
      } else {
        this.spring_Enumeration.enable();
      }
    }
    else {
      console.log('filterSpring() parameter is empty? springList=' + springList);
      debugger;
    }
  }

  filterOutletSize(list: any, displayList: any) {
    this.options.outletSizeList = [];
    this.options.outletSizeListDisplay = [];
    this.outletSizeList = [];
    this.outletSizeListDisplay = [];

    if (!!list && !!displayList) {
      for (let item of list) {
        this.options.outletSizeList.push(item);
        this.outletSizeList.push(item);
      }

      for (let item of displayList) {
        this.options.outletSizeListDisplay.push(item);
        this.outletSizeListDisplay.push(item);
      }

      this.options.selectedOutletSize = parseInt(this.outletSizeList[0]);
      this.options.selectedOutletSizeDisplay = this.outletSizeListDisplay[0];
    }
    else {
      console.log('filterOutletSize() parameters are empty? list=' + list + ', displayList=' + displayList);
      debugger;
    }
  }

  //grid filters
  onGridFilterValveRange(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const rowsFiltered = this.safetyValveData.filter((d) => {

      // Test if the Name is like the filter text
      if (!!d.productRange) {
        if (d.productRange.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        }
      }

    });

    this.rows = rowsFiltered;
  }

  onGridFilterInletSize(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const rowsFiltered = this.safetyValveData.filter((d) => {

      // Test if the Name is like the filter text
      if (!!d.inletSize) {
        if (d.inletSize.toString().toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        }
      }

    });

    this.rows = rowsFiltered;

  }

  onGridFilterBodyMaterial(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const rowsFiltered = this.safetyValveData.filter((d) => {

      // Test if the Name is like the filter text
      if (!!d.bodyMaterial) {
        if (d.bodyMaterial.toLowerCase().indexOf(val) !== -1 || !val) {
          return true;
        }
      }

    });

    this.rows = rowsFiltered;
  }

  onChangeStandardSelectedItem(event: any) {

    if (this.isLoadingJob) {
      return;
    }

    //let standard = event.selectedValue;
    //if (standard === "TRD721") {

    this.setupForSelectedStandard();

    this.rationaliseSafetyValvesFormInput();

  }

  setupForSelectedStandard() {
    if (this.safetyValveStandard_Enumeration.value === "TRD721") {
      this.setupForTRD721();
    }
    else {
      this.setupForOtherStandards();
    }
  }

  setupForTRD721() {
    this.isMassFlow = false;
    this.massflow.clearValidators();
    this.massflow.setValidators(null);
    this.massflow.updateValueAndValidity();
    this.safetyValves.massFlow = 0;

    this.volumetricflow.clearValidators();
    this.volumetricflow.setValidators(null);
    this.volumetricflow.updateValueAndValidity();
    this.safetyValves.volumetricFlow = 0;


    this.load.clearValidators();
    this.load.setValidators([Validators.required]);
    this.load.updateValueAndValidity();
  }

  setupForOtherStandards() {
    this.isMassFlow = true;
    this.load.clearValidators();
    this.load.setValidators(null);
    this.load.updateValueAndValidity();
    this.safetyValves.heatOutput = 0;

    this.massflow.setValidators([Validators.required, (c) => this.validateFormControlInput(c, 'massflow', this.massFlowRef, this.massflowValidationErrorMessage)]);
    this.massflow.updateValueAndValidity();
    this.volumetricflow.setValidators([Validators.required, (c) => this.validateFormControlInput(c, 'volumetricflow', this.volumetricFlowRef, this.volumetricflowValidationErrorMessage)]);
    this.volumetricflow.updateValueAndValidity();
    if (this.safetyValveStandard_Enumeration.value === "ASME I") {
      this.overpressure.setValue(3)
    }
    else
      this.overpressure.setValue(this.overPressureDefaultValue);
  }


  filterSafetyValveStandardList(safetyValveStandard: any) {

    var tempSafetyValveStandardList = [];

    if (!!safetyValveStandard) {
      // Build new filter list
      for (let item of this.safetyValveStandardEnumerationList.enumerationDefinitions) {

        // Manage allowable standard list, rules based on selected media and the PPDS media state.
        switch (item.value) {

          case "ASME I":
            if (this.media_Enumeration.value.toUpperCase() === "DRY SATURATED STEAM" || this.media_Enumeration.value.toUpperCase() === "SUPERHEATED STEAM") {
              tempSafetyValveStandardList.push(item.value);
            }
            break;
          case "ASME VIII":
          case "API":
            if (this.media_Enumeration.value.toUpperCase() !== "WATER" && this.mediaStateFromPPDS.toUpperCase() !== "LIQUID") {
              tempSafetyValveStandardList.push(item.value);
            }
            break;

          case "TRD721":
            if (this.media_Enumeration.value.toUpperCase() === "WATER" && (this.mediaStateFromPPDS.toUpperCase() !== "GAS" && this.mediaStateFromPPDS.toUpperCase() !== "SOLID")) {
              tempSafetyValveStandardList.push(item.value);
            }
            break;
          default:
            tempSafetyValveStandardList.push(item.value);
        }
      }
    }
    else {
      console.log('filterSafetyValveStandardList() parameters are empty? safetyValveStandard=' + safetyValveStandard);
      debugger;
    }

    // Has the filter list of standards changed from the current filter list?
    if (JSON.stringify(tempSafetyValveStandardList) !== JSON.stringify(this.safetyValveStandardList)) {
      this.safetyValveStandardList = [];

      // filter list has changed, set the actual filter and refresh the UI list to redraw/reset
      for (let val of tempSafetyValveStandardList) {
        this.safetyValveStandardList.push(val);
      }
     // if (safetyValveStandard !== "ASME VIII") {

        if (safetyValveStandard !== this.safetyValveStandardList.find(x => x === safetyValveStandard) || safetyValveStandard !== "EN ISO 4126") {


          // Do translated UI alert, selected standard is not available for current media and media state.
          this.safetyValveStandard_Enumeration.setValue("EN ISO 4126"); // use default value

          let trans_StandardHasBeenChangedTitle = this.translatePipe.transform('VALVE_STANDARD_CHANGED');
          let trans_StandardHasBeenChangedMessage = this.translatePipe.transform('VALVE_STANDARD_CHANGED_MESSAGE');
          let trans_OldValveStandard = this.safetyValveStandardEnumerationList.enumerationDefinitions.find(x => x.value === safetyValveStandard).translationText;
          let trans_NewValveStandard = this.safetyValveStandardEnumerationList.enumerationDefinitions.find(x => x.value === "EN ISO 4126").translationText;


          swal({
            closeOnClickOutside: false, closeOnEsc: false,
            title: trans_StandardHasBeenChangedTitle,
            text: trans_StandardHasBeenChangedMessage + ' from ' + trans_OldValveStandard + ' to ' + trans_NewValveStandard,
            icon: "warning",
            dangerMode: true,
            //buttons: ['Ok', 'Cancel']
          }).then((okbuttoncClicked?: boolean) => {

            console.info("Ok clicked...");

            // The parameter can also enter as null
            const returnVal = !(okbuttoncClicked === null);

          }); // end of swal

        }
        else {
          // this.safetyValveStandard_Enumeration.setValue(safetyValveStandard); this doesn't work, probably because the filter list has been recreated and forces a refresh after this setValue().
          this.safetyValveStandard_Enumeration.setValue("EN ISO 4126"); // use default value
        }
     // }
    }
   // this.safetyValveStandard_Enumeration.setValue(safetyValveStandard);
  }

  onChangeMediaSelectedItem(event: any) {

    this.media = event.selectedValue;

    if (!this.media || this.safetyValves.media == this.media) {
      return;
    }

    this.mediaStateFromPPDS = "-";
    this.mediaState.setValue(this.translatePipe.transform(this.mediaStateFromPPDS.toUpperCase()));

    this.filterSafetyValveStandardList(this.safetyValveStandard_Enumeration.value);

    if (this.media === "Dry Saturated Steam") {
      this.temperatureDisabled = true;
    } else {
      this.temperatureDisabled = false;
    }

    // process the unit selector based on media selection
    this.processVolumetricFlowUnitSelector();

    this.rationaliseSafetyValvesFormInput(); // call PPDS
  }


  /// <summary>
  /// Process the vol flow unit selector with support for Normal/Standard temperature conditions with respect to media and media state (from PPDS).
  /// </summary>
  processVolumetricFlowUnitSelector() {

    if (!this.media_Enumeration || !this.volumetricFlowRef || !this.volumetricFlowRef.preference) {
      return;
    }

    var requiredFlowUnit = 0;
    var activeVolumetricFlowUnit = parseInt(this.volumetricFlowRef.preference.value);

    // if StateDetail is Liquid, or the media is Dry Sat or Superheated Steam, remove N and S entries and switch current unit if needed
    // Note that we cannot rely on this.mediaStateFromPPDS as it reflects the previous state and cannot call PPDS as we need to change the Normal/Standard units to call PPDS. Chicken egg.
    if (this.media_Enumeration.value === "Dry Saturated Steam" || this.media_Enumeration.value === "Superheated Steam" || this.media_Enumeration.value === "Water" || this.mediaStateFromPPDS.toUpperCase() !== "GAS") {

      // if the user has selected one of the above units we need to switch to its equivalent
      if (activeVolumetricFlowUnit >= 201 && activeVolumetricFlowUnit <= 222) {

        switch (activeVolumetricFlowUnit) {
          case 201:
            requiredFlowUnit = 75;
            break;
          case 202:
            requiredFlowUnit = 76;
            break;
          case 203:
            requiredFlowUnit = 77;
            break;
          case 204:
            requiredFlowUnit = 72;
            break;
          case 205:
            requiredFlowUnit = 74;
            break;
          case 206:
            requiredFlowUnit = 73;
            break;
          case 207:
            requiredFlowUnit = 75;
            break;
          case 208:
            requiredFlowUnit = 76;
            break;
          case 209:
            requiredFlowUnit = 72;
            break;
          case 210:
            requiredFlowUnit = 74;
            break;
          case 211:
            requiredFlowUnit = 73;
            break;
          case 212:
            requiredFlowUnit = 78;
            break;
          case 213:
            requiredFlowUnit = 79;
            break;
          case 214:
            requiredFlowUnit = 80;
            break;
          case 215:
            requiredFlowUnit = 81;
            break;
          case 216:
            requiredFlowUnit = 82;
            break;
          case 217:
            requiredFlowUnit = 77;
            break;
          case 218:
            requiredFlowUnit = 78;
            break;
          case 219:
            requiredFlowUnit = 79;
            break;
          case 220:
            requiredFlowUnit = 80;
            break;
          case 221:
            requiredFlowUnit = 81;
            break;
          case 222:
            requiredFlowUnit = 82;
            break;
        }
      }
    }
    else {
      // set pref back to selected page unit for Normal/Standard volumetric flow.
      if (!(activeVolumetricFlowUnit >= 201 && activeVolumetricFlowUnit <= 222)) {
        requiredFlowUnit = this.volumetricFlowSelectedPageUnitId;
      }
    }

    if (requiredFlowUnit !== 0 && requiredFlowUnit !== parseInt(this.volumetricFlowRef.preference.value)) {
      this.volumetricFlowChanged = true;
      // set the correct unit of measurement
      var vfUnitPref = this.unitsService.units.find(i => i.id == requiredFlowUnit); // this.preferenceService.allPreferences.find(i => i.value == requiredFlowUnit.toString());
      if (!vfUnitPref) {
        return;
      }
      let trans_OldVolumetricFlowUnitName = this.translatePipe.transform(this.volumetricFlowRef.preference.masterTextKey);

      // override current unit properties
      this.volumetricFlowRef.preference.masterTextKey = vfUnitPref.masterTextKey;
      this.volumetricFlowRef.preference.unitName = vfUnitPref.name;
      this.volumetricFlowRef.preference.value = vfUnitPref.id.toString();

      let trans_NewVolumetricFlowUnitName = this.translatePipe.transform(this.volumetricFlowRef.preference.masterTextKey);
      let trans_VolumetricFlowUnitsHaveBeenChangedTitle = this.translatePipe.transform('VOLUMETRIC_FLOW_CHANGED');
      let trans_VolumetricFlowUnitsHaveBeenChangedMessage = this.translatePipe.transform('VOLUMETRIC_FLOW_CHANGED_MESSAGE');

      this.setStandardOrNormalTemperatureDefault(vfUnitPref.id);


      swal({
        closeOnClickOutside: false, closeOnEsc: false,
        title: trans_VolumetricFlowUnitsHaveBeenChangedTitle,
        text: trans_VolumetricFlowUnitsHaveBeenChangedMessage + ' from ' + trans_OldVolumetricFlowUnitName + ' to ' + trans_NewVolumetricFlowUnitName,
        icon: "warning",
        dangerMode: true,
        //buttons: ['Ok', 'Cancel']
      }).then((okbuttoncClicked?: boolean) => {

        console.info("Ok clicked...");

        // The parameter can also enter as null
        const returnVal = !(okbuttoncClicked === null);

      }); // end of swal

      this.setNormalTemperatureValidator(true);
    }
  }


  setStandardOrNormalTemperatureDefault(activeVolumetricFlowUnit: number) {

    if ((activeVolumetricFlowUnit >= 207 && activeVolumetricFlowUnit <= 211) || (activeVolumetricFlowUnit >= 217 && activeVolumetricFlowUnit <= 222)) {
      this.normaltemperature.setValue(this.normalTemperatureDefaultValue); // reset to default 20DegC
    }
    else {
      this.normaltemperature.setValue(this.standardTemperatureDefaultValue); // reset to default 0DegC
    }
  }

  onChangeOutletSizeSelectedItem(event: any) {
    if (this.isLoadingJob || this.onSelectRunning) {
      return;
    }

    this.options.selectedOutletSize = event.selectedValue;
    this.options.outletSizeList = this.outletSizeList;
    this.options.setOutletConnection = false;
    if (this.selectedProducts.value != "") {
      this.setOptions();
    }
    
  }

  onChangeInletConnectionSelectedItem(event: any) {
    if (this.isLoadingJob || this.onSelectRunning) {
      return;
    }

    this.options.selectedInletConnection = event.selectedValue;
    this.options.outletConnectionList = this.outletConnectionList;
    this.options.setOutletConnection = true;
    if (this.selectedProducts.value != "") {
      this.setOptions();
    }
  }

  onChangeOutletConnectionSelectedItem(event: any) {
    if (this.isLoadingJob || this.onSelectRunning) {
      return;
    }

    this.options.selectedOutletConnection = event.selectedValue;
    this.options.outletConnectionList = this.outletConnectionList;
    this.options.setOutletConnection = true;
    if (this.selectedProducts.value != "") {
      this.setOptions();
    }
  }

  onChangeBonnetSelectedItem(selectedItem: any) {
    if (this.isLoadingJob || this.onSelectRunning) {
      return;
    }

    this.options.selectedBonnet = selectedItem.selectedValue;
    //this.selectedBonnet = selectedItem.selectedValue;
    //this.bonnet_Enumeration.setValue(selectedItem.selectedValue);
    this.options.setOutletConnection = false;
    if (this.selectedProducts.value != "") {
      this.setOptions();
    }
  }

  onChangeSeatSelectedItem(selectedItem: any) {
    if (this.isLoadingJob || this.onSelectRunning) {
      return;
    }

    this.options.selectedSeat = selectedItem.selectedValue;

    this.options.setOutletConnection = false;

    if (this.selectedProducts.value != "") {
      this.setOptions();
    }
  }

  onChangeLeverSelectedItem(selectedItem: any) {
    if (this.isLoadingJob || this.onSelectRunning) {
      return;
    }

    this.options.selectedLever = selectedItem.selectedValue;
    //this.selectedLever = selectedItem.selectedValue;
    this.options.setOutletConnection = false;
    this.options.setInletConnection = true;
    if (this.selectedProducts.value != "") {
      this.setOptions();
    }
  }

  onChangeSpringSelectedItem(selectedItem: any) {
    if (this.isLoadingJob || this.onSelectRunning) {
      return;
    }

    this.options.selectedSpring = selectedItem.selectedValue;
    // this.selectedSpring = selectedItem.selectedValue;
    //this.spring_Enumeration.setValue(selectedItem.selectedValue);
    this.options.setOutletConnection = false;
    if (this.selectedProducts.value != "") {
      this.setOptions();
    }
  }

  onChangeFinishSelectedItem(selectedItem: any) {
    if (this.isLoadingJob || this.onSelectRunning) {
      return;
    }

    this.options.selectedFinish = selectedItem.selectedValue;
    //this.selectedFinish = selectedItem.selectedValue;
    this.options.setOutletConnection = false;
    if (this.selectedProducts.value != "") {
      this.setOptions();
    }
  }

  onChangeNozzleSelectedItem(selectedItem: any) {
    if (this.isLoadingJob || this.onSelectRunning) {
      return;
    }

    this.options.selectedNozzle = selectedItem.selectedValue;
    this.options.setOutletConnection = false;
    if (this.selectedProducts.value != "") {
      this.setOptions();
    }
  }

  setOptions() {

    this.safetyValvesService.setOptions(this.options).subscribe((response: OptionsResults) => {
      this.applyOptionsLogicToUI(response);
    });

  }

  applyOptionsLogicToUI(response: OptionsResults) {

    // set the outlet connection selected item
    //

    this.options.dimA = response.dimA;
    this.options.dimB = response.dimB;
    this.options.dimC = response.dimC;
    this.options.valveWeight = response.weight;
    this.options.weightUnit = response.weightUnit;
    this.options.lengthUnit = response.lengthUnit;


    this.outletConnection_Enumeration.setValue(response.outletConnection);
    this.options.selectedOutletConnection = response.outletConnection;

    this.options.outletConnectionList = [];

    if (this.outletConnectionList.includes(response.outletConnection)) {
      this.outletConnectionList.push(this.outletConnectionList.splice(this.outletConnectionList.indexOf(response.outletConnection), 1)[0]);
    }
    else {
      this.outletConnectionList.push(response.outletConnection);
    }
    

    //this.filterLever(response.leverList);

    if (response.seatDisabled == true) {
      this.seat_Enumeration.disable();
    } else {
      this.seat_Enumeration.enable();
    }

    if (this.options.selectedProductRange == "SV405") {
      this.showNozzle.setValue(true);

      if (response.selectedLever == "Lifting Device") {

        this.nozzle_Enumeration.setValue(response.selectedNozzle)

        this.nozzle_Enumeration.disable();

      } else {
        this.nozzle_Enumeration.enable();
      }
    } else if (this.options.selectedProductRange == "SV406") {

      this.showNozzle.setValue(true);
      this.nozzle_Enumeration.setValue(response.selectedNozzle);
      this.nozzle_Enumeration.disable();
    } else {
      this.showNozzle.setValue(false);
    }

    this.options.selectedNozzle = response.selectedNozzle;
    this.seat_Enumeration.setValue(response.selectedSeat);
    this.spring_Enumeration.setValue(response.selectedSpring);

    //If temp is over 230 C then only Tungsten is selectable
    if (response.temperature > 230) {
      this.bonnet_Enumeration.disable();
    } else {
      this.bonnet_Enumeration.enable();
    }

    // inlet connection
    if (!response.inletConnectionEnabled) {
      this.inletConnection_Enumeration.disable();

      this.inletConnection_Enumeration.setValue(response.inletConnection);

      this.options.selectedInletConnection = response.inletConnection;
      this.options.inletConnectionList = [];
      this.inletConnectionList = [];
      this.options.inletConnectionList.push(response.inletConnection);
      this.inletConnectionList.push(response.inletConnection);


      this.inletConnection_Enumeration.setValue(response.inletConnection);

    }
    else {
      this.inletConnection_Enumeration.enable();
      this.inletConnection_Enumeration.setValue(!!response.inletConnection ? response.inletConnection : this.options.selectedInletConnection);
    }
    // bonnet & lever checks
    if (response.leverDisabled) {
      this.lever_Enumeration.disable();
    } else {
      this.lever_Enumeration.enable();
    }



    this.bonnet_Enumeration.setValue(response.selectedBonnet)

    if (response.bonnetDisabled) {
      this.bonnet_Enumeration.disable();
    } else {
      this.bonnet_Enumeration.enable();
    }

    //Spring check for SV604/SV607
    var defaultSpring = this.springEnumerationList.enumerationDefinitions.find(x => x.value == "Chrome Vanadium Alloy Steel").value;

    if (response.springDisabled) {
      this.spring_Enumeration.disable();
      this.spring_Enumeration.setValue(defaultSpring)
    } else {
      this.spring_Enumeration.enable();
    }
    //}

    if (response.selectedLever === "Standard Lever") {
      this.options.selectedLever = "Standard Lever";

      // get translation to set lever enumeration
      var defaultText = this.leverEnumerationList.enumerationDefinitions.find(x => x.value == "Standard Lever").defaultText;

      this.lever_Enumeration.setValue(defaultText);
    } else {

      var defaultText = this.options.selectedLever
      //this.options.selectedLever = response.selectedLever;

    }

    //if (this.leverEnumerationList.enumerationDefinitions.find(x => x.value == this.options.selectedLever) == null) {
    //  var defaultText = "Standard Lever"
    //  this.lever_Enumeration.setValue(defaultText);
    //} else {
    //  var defaultText = this.leverEnumerationList.enumerationDefinitions.find(x => x.value == this.options.selectedLever).defaultText;
    //  this.lever_Enumeration.setValue(defaultText);
    //}

    //if (response.selectedLever == null) {
    //  this.options.selectedLever = '-';
    //  response.selectedLever = '-';
    //}
    //var defaultText = this.leverEnumerationList.enumerationDefinitions.find(x => x.value == this.options.selectedLever).defaultText;

    this.lever_Enumeration.setValue(defaultText);


    //this.lever_Enumeration.setValue(response.selectedLever);

    if (!response.outletConnectionEnabled) {
      this.outletConnection_Enumeration.disable();
    } else {
      this.outletConnection_Enumeration.enable();
    }

    // finish option only available for SV615 range
    if (response.finishDisplayed) {
      this.showHideFinish.setValue(true);
    } else {
      this.showHideFinish.setValue(false);
    }

    // Set the form control with the returned value.
    this.productCode.setValue(response.productCode);
    this.productNumber.setValue(response.productNumber);
    this.productNumber.disable();


    this.options.outletConnectionEnabled = response.outletConnectionEnabled;
    this.options.inletConnectionEnabled = response.inletConnectionEnabled;
    this.options.leverDisabled = response.leverDisabled;
    this.options.finishDisplayed = response.finishDisplayed;


    if (this.inletConnectionList.length < 2) {
      this.inletConnection_Enumeration.disable();
    }

    if (this.bonnetList.length < 2) {
      this.bonnet_Enumeration.disable();
    }

    if (this.seatList.length < 2) {
      this.seat_Enumeration.disable();
    }

    if (this.leverList.length < 2) {
      this.lever_Enumeration.disable();
    }

    if (this.springList.length < 2) {
      this.spring_Enumeration.disable();
    }

    if (this.outletConnectionList.length < 2) {
      this.outletConnection_Enumeration.disable();
    }

  }

  onKeyDown(event) {

    event.preventDefault();

  }


  repackageSizing() {

    const jobSizing = this.onSave(this.project);

    // check save type:
    // update job
    if (jobSizing !== null) {
      this.projectsJobsService.updateJobSizing(jobSizing).subscribe((response) => {
        if (response) {

          // need to display success message
          this.saveJobSuccess = true;
        }
      },
        error => {
          this.saveJobError = true;
        });
    }

    this.sizingModuleForm.markAsPristine();
    this.sizingModuleForm.markAsUntouched();

  }

  onSave(savedProjectDetails: Project): JobSizing {
    let jobSizing = new JobSizing;
    let sizingData = new SizingData;
    let processConditions = new Array<ProcessCondition>();
    let processInputs = new Array<ProcessInput>();
    let unitPreferences = new Array<Preference>();

    let outputGridRow = new OutputGridRow;
    let outputGridRows = new Array<OutputGridRow>();
    let outputItems = new Array<OutputItem>();

    this.project = new Project;
    this.job = new Job;

    if (!savedProjectDetails) {
      return null;
    }

    jobSizing = this.saveData(jobSizing, this.project, sizingData, processConditions, processInputs, unitPreferences, outputGridRow, outputGridRows, outputItems);

    //save header details
    this.project.id = this.projectId;
    this.project.name = this.projectName; // savedProjectDetails.name;
    this.job.name = this.jobName;
    this.job.id = (!!this.jobId ? this.jobId : "");

    if (!this.job.id || this.job.id === null) {
      // use new job dialog data
      this.job.plantOwner = savedProjectDetails.jobs[0].plantOwner;
    }
    this.project.customerName = savedProjectDetails.customerName;
    this.project.projectReference = savedProjectDetails.projectReference;

    this.job.moduleId = 3;
    this.job.productName = "Safety Valve";
    this.moduleId = 3;
    this.productName = "Safety Valve";

    if (this.rows.length > 1) {
      this.job.jobStatusId = 2; // Calculated
      this.jobStatusId = 2;
    } else {
      this.job.jobStatusId = 1; // Input
      this.jobStatusId = 1;
    }

    if (this.gridSelectedRow) {
      this.job.jobStatusId = 3; // Selected
      this.jobStatusId = 3;
    }

    if (typeof savedProjectDetails.id === 'undefined') {
      this.project.id = ""; // new Guid required from API
      this.job.projectId = ""; // new Guid required from API
    } else {
      this.job.projectId = this.projectId;//savedProjectDetails.id;
    }

    //save objects into appropriate sizing data objects
    this.project.jobs = new Array<Job>();
    this.project.jobs[0] = this.job;

    jobSizing.project = this.project;

    this.scrollToElement(this.inputsContent, "end"); // annoying on anything but Chrome

    this.sizingModuleForm.markAsUntouched();

    return jobSizing;
  }

  saveData(jobSizing: JobSizing, project: Project,
    sizingData: SizingData, processConditions: Array<ProcessCondition>,
    processInputs: Array<ProcessInput>, unitPreferences: Array<Preference>, outputGridRow: OutputGridRow,
    outputGridRows: Array<OutputGridRow>, outputItems: Array<OutputItem>): JobSizing {

    // Save process conditions
    processInputs.push({ name: "Media", value: this.media_Enumeration.value, unitId: null, listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Pressure", value: this.pressure.value, unitId: parseInt(this.pressureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Relieving Pressure", value: this.relievingpressure.value, unitId: parseInt(this.pressureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Relieving Temperature", value: this.relievingtemperature.value, unitId: parseInt(this.temperatureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Temperature", value: this.temperature.value, unitId: parseInt(this.temperatureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Normal Temperature", value: this.normaltemperature.value, unitId: parseInt(this.temperatureRef.preference.value), listItemId: null, value2: "", childInputs: null });

    if (this.isMassFlow) {
      processInputs.push({ name: "Mass Flow", value: this.massflow.value, unitId: parseInt(this.massFlowRef.preference.value), listItemId: null, value2: "", childInputs: null });
    } else {
      processInputs.push({ name: "Heat Output", value: this.load.value, unitId: parseInt(this.loadRef.preference.value), listItemId: null, value2: "", childInputs: null });
    }

    processInputs.push({ name: "State", value: this.mediaState.value, unitId: null, listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "mediaStateFromPPDS", value: this.mediaStateFromPPDS, unitId: null, listItemId: null, value2: "", childInputs: null });

    processInputs.push({ name: "Standard", value: this.safetyValveStandard_Enumeration.value, unitId: null, listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Noise Distance", value: this.noisedistance.value, unitId: parseInt(this.noiseDistanceRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Volumetric Flow", value: this.volumetricflow.value, unitId: parseInt(this.volumetricFlowRef.preference.value), listItemId: null, value2: "", childInputs: null });
    
    var selectedValves = "";

    for (let p of this.selectedProducts.value) {

      selectedValves = selectedValves + ";" + p;
    }

    processInputs.push({ name: "Valve Selections", value: selectedValves, unitId: null, listItemId: null, value2: "", childInputs: null });

    processInputs.push({ name: "Backpressure", value: this.showHideBackpressure.value, unitId: null, listItemId: null, value2: "", childInputs: null });

    // back pressure
    if (this.showHideBackpressure) {
      processInputs.push({ name: "Pipe Standard", value: this.pipeStandard_Enumeration.value, unitId: null, listItemId: null, value2: "", childInputs: null });
      processInputs.push({ name: "Nominal Bore", value: this.nominalBore_Enumeration.value, unitId: null, listItemId: null, value2: "", childInputs: null });
      processInputs.push({ name: "Pipe Length", value: this.pipeLength.value, unitId: null, listItemId: null, value2: "", childInputs: null });
      processInputs.push({ name: "No of 90 Elbows", value: this.backpressure90Elbows_Enumeration.value, unitId: null, listItemId: null, value2: "", childInputs: null });
      processInputs.push({ name: "No of 45 Elbows", value: this.backpressure45Elbows_Enumeration.value, unitId: null, listItemId: null, value2: "", childInputs: null });
      processInputs.push({ name: "No of Swept Bends", value: this.backpressureSweptBends_Enumeration.value, unitId: null, listItemId: null, value2: "", childInputs: null });
    }

    // Save unit preferences.
    unitPreferences.push(this.pressureRef.preference);
    unitPreferences.push(this.temperatureRef.preference);
    unitPreferences.push(this.massFlowRef.preference);
    unitPreferences.push(this.volumetricFlowRef.preference);
    unitPreferences.push(this.noiseDistanceRef.preference);
    unitPreferences.push(this.loadRef.preference);
    unitPreferences.push(this.forceRef.preference);
    unitPreferences.push(this.areaRef.preference);

    processConditions.push({ name: "safety valve sizing", processInputs: processInputs, unitPreferences: unitPreferences });

    sizingData.processConditions = new Array<ProcessCondition>();
    sizingData.processConditions = processConditions;

    //save sizing grid results
    outputGridRow.outputItems = [];
    outputGridRow.messages = [];

    //GRID
    this.rows.forEach(obj => {

      var isRowSelected = false;

      if (this.selected.length > 0) {
        if (obj === this.selected[0]) {
          isRowSelected = true; // This is the selected row!
          this.loadOptions = true;

          if (!!this.selected[0].modelSizingMessages) {

            this.selected[0].modelSizingMessages.forEach(m => {

              outputGridRow.messages.push({
                messageKey: m.messageKey,
                value: m.value,
                unitKey: m.unitKey,
                severity: m.severity,
                displayValue: m.displayValue
              });
            });
          }

        } else {
          isRowSelected = false;
        }
      } else {
        isRowSelected = false;
      }

      outputGridRow.outputItems.push({
        name: "Product Range",
        value: obj.productRange,
        unitId: null,
        selected: isRowSelected,  
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Inlet Size",
        value: obj.inletSize.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Inlet Size Display",
        value: obj.inletDisplay.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Body Material",
        value: obj.bodyMaterial,
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Overpressure",
        value: obj.overPressure.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Relieving Pressure",
        value: obj.relievingPressure.toString(),
        unitId: parseInt(this.pressureRef.preference.value),
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Relieving Temperature",
        value: obj.relievingTemperature.toString(),
        unitId: parseInt(this.temperatureRef.preference.value),
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Calculated Area",
        value: obj.calculatedArea.toString(),
        unitId: parseInt(this.areaRef.preference.value),
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Actual Area",
        value: obj.flowArea.toString(),
        unitId: parseInt(this.areaRef.preference.value),
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Rated Capacity",
        value: obj.ratedCapacity.toString(),
        unitId: parseInt(this.massFlowRef.preference.value),
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      if (!isNullOrUndefined(obj.ratedCapacityInVolumetricUnit)) {
        outputGridRow.outputItems.push({
          name: "Rated Capacity In Volumetric Units",
          value: obj.ratedCapacityInVolumetricUnit.toString(),
          unitId: parseInt(this.massFlowRef.preference.value),
          selected: isRowSelected,
          listItemId: null,
          type: null
        });
      }

      outputGridRow.outputItems.push({
        name: "Percentage",
        value: obj.percentCapacity.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Orifice",
        value: obj.orifice,
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Nozzle",
        value: obj.nozzle,
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Noise",
        value: obj.noiseAtDistance.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Reaction Force",
        value: obj.reactionForce.toString(),
        unitId: parseInt(this.forceRef.preference.value),
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Dynamic Viscosity",
        value: obj.dynamicViscosity.toString(),
        // value: this.rows[0]["dynamicViscosity"].toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Compressibility",
        value: obj.compressibility.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Isentropic Coefficient",
        value: obj.isentropicCoefficient.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Specific Volume",
        value: obj.specificVolume.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Molecular Weight",
        value: obj.molecularWeight.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Cap Material",
        value: obj.capMaterial.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Cap Grade",
        value: obj.capGrade.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Nozzle Material",
        value: obj.nozzleMaterial.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Stem Grade",
        value: obj.stemGrade.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Stem Material",
        value: obj.stemMaterial.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Guide Material",
        value: obj.guideMaterial.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Guide Grade",
        value: obj.guideGrade.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Body Gasket",
        value: obj.bodyGasket.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Gland Packing",
        value: obj.glandPacking.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Bellows",
        value: obj.bellows.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Inlet Connection List",
        value: obj.inletConnectionList.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Outlet Connection List",
        value: obj.outletConnectionList.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Bonnet List",
        value: obj.bonnetList.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Seat List",
        value: obj.seatList.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Nozzle List",
        value: obj.nozzleList.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Lever List",
        value: obj.leverList.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Spring List",
        value: obj.springList.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Outlet Size List",
        value: obj.outletSizeList.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Outlet Size List Display",
        value: obj.outletSizeDisplayList.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Outlet Size",
        value: obj.outletSize.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Inlet Connection",
        value: obj.inletConnection.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Outlet Connection",
        value: obj.outletConnection.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Outlet Size List Display",
        value: this.outletSizeListDisplay.toString(),
        unitId: null,
        selected: isRowSelected,
        listItemId: null,
        type: null
      });
     
      outputGridRows.push(outputGridRow);

      //clear for next iteration
      outputGridRow = new OutputGridRow();
      outputGridRow.outputItems = [];
      outputGridRow.messages = [];
    });

    if (!!this.selectedSafetyValve && !!this.rows && this.rows.length > 0) {

      // options
      outputItems.push({ name: "Product Range", value: this.options.selectedProductRange.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Body Material", value: this.selectedBodyMaterial.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Inlet Size", value: this.options.inletSize.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Inlet Size Display", value: this.options.inletSizeDisplay.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Inlet Connection", value: this.options.selectedInletConnection.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Inlet Connection List", value: this.inletConnectionList.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Bonnet", value: this.options.selectedBonnet.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Bonnet List", value: this.bonnetList.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Seat", value: this.options.selectedSeat.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Seat List", value: this.seatList.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Product Code", value: this.productCode.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Outlet Size", value: this.options.selectedOutletSize.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Outlet Size Display", value: this.options.selectedOutletSizeDisplay.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Outlet Size List", value: this.outletSizeList.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Outlet Connection", value: this.options.selectedOutletConnection.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Outlet Connection List", value: this.outletConnectionList.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Outlet Size List Display", value: this.outletSizeListDisplay.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Lever", value: this.options.selectedLever.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Lever List", value: this.leverList.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Spring", value: this.options.selectedSpring.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Spring List", value: this.springList.toString(), unitId: null, selected: false, listItemId: null, type: null });
      //undefined will happened when making and saving changes to the Job that do not have Nozzle (is not SV40 Valve product range)
      if (!isNullOrUndefined(this.options.selectedNozzle)) {
        outputItems.push({ name: "Nozzle", value: this.options.selectedNozzle.toString(), unitId: null, selected: false, listItemId: null, type: null });
        outputItems.push({ name: "Nozzle List", value: this.options.NozzleList.toString(), unitId: null, selected: false, listItemId: null, type: null });
      }

      outputItems.push({ name: "Finish", value: this.options.selectedFinish.toString(), unitId: null, selected: false, listItemId: null, type: null });
      //outputItems.push({ name: "Finish List", value: this.finishList.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Product Number", value: this.productNumber.value, unitId: null, selected: false, listItemId: null, type: null });

      outputItems.push({ name: "Standard", value: this.options.standard.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Valve Orifice", value: this.options.valveOrifice.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Inlet Pressure", value: this.options.inletPressure.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Pressure Unit", value: this.options.pressureUnit.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Valve Inlet Size", value: this.options.valveInletSize.toString(), unitId: null, selected: false, listItemId: null, type: null });

      outputItems.push({ name: "Outlet Connection Enabled", value: this.options.outletConnectionEnabled.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Inlet Connection Enabled", value: this.options.inletConnectionEnabled.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Lever Disabled", value: this.options.leverDisabled.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Finish Displayed", value: this.options.finishDisplayed.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Valve Weight", value: this.options.valveWeight.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "dimA", value: this.options.dimA.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "dimB", value: this.options.dimB.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "dimC", value: this.options.dimC.toString(), unitId: null, selected: false, listItemId: null, type: null });
    }

    // save spec sheet header details
    outputItems.push({ name: "IsSpecSheetEnabled", value: this.isSpecSheetEnabled.toString(), unitId: null, selected: false, listItemId: null, type: null });

    if (this.sheet.value !== null) {
      outputItems.push({ name: "Sheet", value: this.sheet.value, unitId: null, selected: false, listItemId: null, type: null });
    }

    if (this.revisionNumber.value !== null) {
      outputItems.push({ name: "Revision No", value: this.revisionNumber.value, unitId: null, selected: false, listItemId: null, type: null });
    }

    if (this.projectType.value !== null) {
      outputItems.push({ name: "Project Type", value: this.projectType.value, unitId: null, selected: false, listItemId: null, type: null });
    }

    if (this.quantity.value !== null) {
      outputItems.push({ name: "Quantity", value: this.quantity.value, unitId: null, selected: false, listItemId: null, type: null });
    }

    if (this.aoNumber.value !== null) {
      outputItems.push({ name: "AO Number", value: this.aoNumber.value, unitId: null, selected: false, listItemId: null, type: null });
    }

    if (this.orderNumber.value !== null) {
      outputItems.push({ name: "Order No", value: this.orderNumber.value, unitId: null, selected: false, listItemId: null, type: null });
    }

    if (this.tagNumber.value !== null) {
      outputItems.push({ name: "Tag Number", value: this.tagNumber.value, unitId: null, selected: false, listItemId: null, type: null });
    }

    if (this.notes.value !== null) {
      outputItems.push({ name: "Notes 1", value: this.notes.value, unitId: null, selected: false, listItemId: null, type: null });
    }

    if (this.translatedMessagesList.length > 0) {

      for (var i = 0; i < 5; i++) {
        if (this.translatedMessagesList[i] !== null) {
          outputItems.push({ name: "Message " + i, value: this.translatedMessagesList[i].toString(), unitId: null, selected: false, listItemId: null, type: null });

        } else {
          outputItems.push({ name: "Message " + i, value: "-", unitId: null, selected: false, listItemId: null, type: null });
        }
      }
    }

    // Reset button status
    outputItems.push({ name: "IsResetEnabled", value: (!this.sizingModuleForm.pristine).toString(), unitId: null, selected: false, listItemId: null, type: null });

    //save objects into appropriate sizing data objects
    jobSizing.sizingData = sizingData;
    jobSizing.sizingData.sizingOutput = new SizingOutput;
    jobSizing.sizingData.sizingOutput.outputItems = outputItems;
    jobSizing.sizingData.sizingOutput.outputGrid = new OutputGrid;
    jobSizing.sizingData.sizingOutput.outputGrid.outputGridRows = outputGridRows;

    return jobSizing;

  }
  /**
   * Data table events
   */
  onActivate(event) {
    console.log('Activate Event', event);

    // handle arrow key change for selected project
    if (event.type === "keydown" && event.event.code === "ArrowDown") {

    }
    if (event.type === "keydown" && event.event.code === "ArrowUp") {

    }
  }

  /**
  * Handle paging
  * @param $event The page event.
  */
  onPage(event) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      console.log('paged!', event);
    }, 100);
  }

  localizeOutputData() {
    if (this.rows && this.rows.length > 0) {
      this.rows.forEach(o => {
        o.displayRelievingPressure = this.localizeValue(o.relievingPressure, this.pressureRef.preference.decimalPlaces);
        o.displayRelievingTemperature = this.localizeValue(o.relievingTemperature, this.temperatureRef.preference.decimalPlaces);
        o.displayCalculatedArea = this.localizeValue(o.calculatedArea, this.areaRef.preference.decimalPlaces);
        o.displayFlowArea = this.localizeValue(o.flowArea, this.areaRef.preference.decimalPlaces);
        o.displayRatedCapacity = this.localizeValue(o.ratedCapacity, this.massFlowRef.preference.decimalPlaces);
        o.displayPercentCapacity = this.localizeValue(o.percentCapacity, this.loadRef.preference.decimalPlaces);
        o.displayNoiseAtDistance = this.localizeValue(o.noiseAtDistance, this.noiseDistanceRef.preference.decimalPlaces);
        o.displayReactionForce = this.localizeValue(o.reactionForce, this.forceRef.preference.decimalPlaces);
        if (o.ratedCapacityInVolumetricUnit >= 0) {
          o.displayRatedCapacityInVolumetricUnit = this.localizeValue(o.ratedCapacityInVolumetricUnit, this.massFlowRef.preference.decimalPlaces);
        }

        if (o.backpressureOk) {
          this.isBackpressure = true;
        }
        else { this.isBackpressure = false; }

      });
    }
  }

  onBackpressureOverrideChange(event: any) {
    if (event) {
      this.isSuperBackPressure = true;
    } else {
      this.isSuperBackPressure = false;
    }
  }

  /**
   Method to localize values.
  */
  localizeValue(value: any, decimalPoints: number) {
    return this.localeService.formatDecimal(value.toFixed(decimalPoints));
  }


  /// <summary>
  /// Check if Normal input is Enabled
  /// </summary>
  isNormalTemperatureInputEnabled() {
    var normalTemperatureInputEnabled = false;

    if (this.isInitialised && !!this.volumetricFlowRef && !!this.volumetricFlowRef.preference) {
      if (!this.volumetricFlowRef.preference || !this.media_Enumeration || this.media_Enumeration.value === "Dry Saturated Steam" || this.media_Enumeration.value === "Superheated Steam" || this.media_Enumeration.value === "Water"
        || this.mediaStateFromPPDS.toUpperCase() !== "GAS") {
        normalTemperatureInputEnabled = false;
        this.setNormalTemperatureValidator(normalTemperatureInputEnabled);
      }
      else {
        var activeVolumetricFlowUnit = parseInt(this.volumetricFlowRef.preference.value);

        if ((activeVolumetricFlowUnit >= 207 && activeVolumetricFlowUnit <= 211) || (activeVolumetricFlowUnit >= 217 && activeVolumetricFlowUnit <= 222)) {
          normalTemperatureInputEnabled = true;  // only enabled for editing the Normal Temperature but not for Standard
        }
      }
    }



    return normalTemperatureInputEnabled;
  }

  /// <summary>
  /// Check if Normal input is Visible
  /// </summary>
  isNormalTemperatureInputVisible() {
    var normalTemperatureInputVisible = false;

    if (this.isInitialised && !!this.volumetricFlowRef && !!this.volumetricFlowRef.preference) {
      if (!this.media_Enumeration || this.media_Enumeration.value === "Dry Saturated Steam" || this.media_Enumeration.value === "Superheated Steam" || this.media_Enumeration.value === "Water"
        || this.mediaStateFromPPDS.toUpperCase() !== "GAS") {
        normalTemperatureInputVisible = false;
        this.setNormalTemperatureValidator(normalTemperatureInputVisible);
      }
      else {
        var activeVolumetricFlowUnit = parseInt(this.volumetricFlowRef.preference.value);

        if ((activeVolumetricFlowUnit >= 201 && activeVolumetricFlowUnit <= 217)) {
          normalTemperatureInputVisible = true; // both for Normal And Standard units
        }
      }
    }

    return normalTemperatureInputVisible;
  }

  setNormalTemperatureValidator(normalTemperatureUIControlIsActive) {

    if (normalTemperatureUIControlIsActive) {
      this.normaltemperature.clearValidators();
      this.normaltemperature.setValidators([Validators.required, (c) => this.validateFormControlInput(c, 'normaltemperature', this.temperatureRef, this.normaltemperatureValidationErrorMessage)]);
      this.normaltemperature.updateValueAndValidity();
    } else {
      // disable validators when hidden or not visible
      this.normaltemperature.clearValidators();
      this.normaltemperature.setValidators(null);
      this.normaltemperature.updateValueAndValidity();
    }
  }
  disableUiInputs() {
    //return;
    // Start the busy block
    this.blockUi.start(this.translatePipe.transform("CALCULATING_MESSAGE", true) + "...");
    this.blockUiTimeOut = setTimeout(() => {
      this.blockUi.reset();
    }, 2000);
  }

  enableUiInputs() {
    // return;
    this.blockUi.stop();
    clearTimeout(this.blockUiTimeOut);
  }

  scrollToElement = (elementRef: ElementRef, position: string = "start") => {
    // ToDo: Fix fussy scroll on first sizing bug. Hence the use of timeout delay here.
    setTimeout(() => {
      try {
        elementRef.nativeElement.scrollIntoView({ block: position, behavior: "smooth" });
      } catch (err) {
        console.log(`scrollToElement err=${err}`);
      }
    }, 200);
  }


  // eg: if (swal.getState().isOpen) { this.delay(9000); } else{this.delay(6000); } not working?
  //async delay(ms: number) {

  //  console.log(formatDate(new Date(), 'dd-MM-yyyy hh:mm:ss a', 'en-GB') + ms + "ms delay started...");
  //  await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => console.log(formatDate(new Date(), 'dd-MM-yyyy hh:mm:ss a', 'en-GB') + ms + "ms delay finish fired"));
  //}

  toggleDebug() {
    if (this.user.username.indexOf('Test User') >= 0) {
      this.debugDataEnabled = !this.debugDataEnabled;
    }
    if (this.debugDataEnabled) {
      // reprice for debug
      //this.calculatePrice();
      //this.debugData = "Feature disabled.";
      this.debugData = JSON.stringify(this.selectedSafetyValve);
      this.debugData = this.debugData.replace(new RegExp(this.escapeRegExp(',"'), 'g'), '\r\n"');
    }
  }

  ngOnDestroy() {
  }
}
