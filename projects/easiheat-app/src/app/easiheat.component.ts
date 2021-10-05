import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, AbstractControl, FormControlDirective } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';

import { BaseSizingModule, Enumeration, EnumerationDefinition } from "sizing-shared-lib";
import { ProjectsJobsService } from "sizing-shared-lib";
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

import { Subscription } from 'rxjs/Subscription';
import { SpecSheetItem } from "./doc-gen.model";

import { Observable, combineLatest } from 'rxjs';
import { Validators } from '@angular/forms';
import { easiHeatDocGenService } from "./easiheatDocGen.service";
import { UnitConvert, UnitsConverter } from "sizing-shared-lib";

import { DatatableComponent } from '@swimlane/ngx-datatable';
import { TranslatePipe } from "sizing-shared-lib";
import { takeWhile } from 'rxjs-compat/operator/takeWhile';
import { DisplayPreferenceDirective } from "sizing-shared-lib";
import { EnumerationComponent } from "sizing-shared-lib";
import { ModulePreferenceService } from "sizing-shared-lib";
import { DocGen, TiRequestModel, TiDocumentInfosModel, TiDocumentInfo } from "sizing-shared-lib";
import { PreferenceService } from "sizing-shared-lib";
import { UnitsService } from "sizing-shared-lib";

import { TranslationService } from "sizing-shared-lib";
import { Preference } from "sizing-shared-lib";
//import { SpecSheetItem } from "./doc-gen.model";
import { DocGenService } from "sizing-shared-lib";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UserProfileService } from "sizing-shared-lib";
import { User } from "sizing-shared-lib";
import { EasiheatProcessConditions } from "./easiheatInputValidation.model";
import { EasiheatOutput } from "./easiheatOutput.model";
import { EasiheatInputValidation, EasiheatProcessConditionsInputValidation } from "./easiheatInputValidation.model";
import { EasiheatFlowOrLoad } from "./easiheatInputValidation.model";
import { EasiheatBackPressureValidation } from "./easiheatInputValidation.model";
import { EasiheatDiffTempValidation } from "./easiheatInputValidation.model";
import { EasiheatProcessConditionsValidation } from "./easiheatInputValidation.model";
import { EasiheatValidationMessage } from "./easiheatInputValidation.model";
import { EasiheatValidationErrorMessage } from "./easiheatInputValidation.model";
import { EasiheatFlowRateValidation } from "./easiheatInputValidation.model";
import { EHSizingDataInput } from "./easiheatSizingInput.model";

import { EHPricing, EHPricingOptions, EasiheatBOMPriceOutput, BOMItem } from "./easiheatPricingOptions.model";
import { EHPricingOutput } from "./easiheatPricingOptions.model";

import { EasiHeatService } from "./easiheat.service";

import { AdminService } from "sizing-shared-lib";
import { MessagesService } from "sizing-shared-lib";

import { ChangeDetectorRef } from '@angular/core';

import { LocaleService, LocaleValidation } from 'node_modules/angular-l10n';
import { Message } from "sizing-shared-lib";
//import { forEach } from '@angular/router/src/utils/collection';

import { Currency } from "sizing-shared-lib";
import { URL } from 'url';
import * as _swal from 'sweetalert';
import { SweetAlert } from 'sweetalert/typings/core';
const swal: SweetAlert = _swal as any;
//declare var swal: any;

import { debug, isUndefined, isNullOrUndefined, isNull } from 'util';
import { HttpClient } from '@angular/common/http';
import { __await } from 'tslib';
import { take } from 'rxjs-compat/operator/take';
import { isNumeric } from 'rxjs/util/isNumeric';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { IGenericChanges } from '../../../sizing-shared-lib/src/lib/modules/generic.changes.interface';


@Component({
  selector: 'easiheat',
  templateUrl: './easiheat.component.html',
  styleUrls: ['./easiheat.component.scss'],
  providers: [EasiHeatService, easiHeatDocGenService]
})
export class EasiHeatComponent extends BaseSizingModule implements OnInit, IGenericChanges {
  @BlockUI('conditions-section') blockUi: NgBlockUI;
  private blockUiTimeOut;
  readonly moduleGroupId: number = 3;
  //readonly moduleId: number = 5;
  readonly ukOpCodeId: number[] = [41,42,43,44];
  readonly moduleName: string = "Easiheat";


  theFormGroup: FormGroup; // to drive GenericChangesGuard
  hasUnsavedDataChanges: boolean; // to drive GenericChangesGuard

  private jobParams: boolean = false;
  private isLoadingJob: boolean = false;
  private isThisAJob: boolean = false;
  public ApplicationType: string = "DHW";
  public ehUnitName: string = "EHD";
  public dhw: boolean = true;
  public htgcc: boolean = false;
  public userIsUkBased: boolean = false;

  public DHWEnergyMonitoringEnabledPref: boolean;
  public HTGEnergyMonitoringEnabledPref: boolean;
  public energyMonitoringDefaultDHW: boolean;
  public energyMonitoringDefaultHTG: boolean;
  public isEnergyMonitoringEnabled: boolean;
  public isEnergyMonitoringSizable: boolean;
  public isIsolationEnabled: boolean = true;

  public DHWENCompliantEnabledPref: boolean;
  public HTGENCompliantEnabledPref: boolean;
  public ENCompliantDefaultDHW: boolean;
  public ENCompliantDefaultHTG: boolean;
  public isEn12828CompliantEnabled: boolean;

  public DHWJackingWheelsEnabled: boolean;
  public HTGJackingWheelsEnabled: boolean;
  public jackingWheelsDefaultDHW: boolean;
  public jackingWheelsDefaultHTG: boolean;
  public isJackingWheelsEnabled: boolean;

  public cvSplitRange: boolean = false;
  public cvSplitRangeAvailable: boolean = false;
  public highLimitActuation: boolean = false;
  public remoteAccess: boolean = true;
  public communications: boolean = true;

  // Module Prefs.
  private manufacturerId: number = 0;
  private basePriceOption: number = 0;  // 0 = Manufacturer Assembled, 1 = No Vessel, 2 = No Panel, 3 = No Vessel or Panel. Defaulted to 0 in case Mod Prefs not found.
  private localRecommendedSalesPriceOption: number = 0; // 0 = Use Manufacturer Recommended Sales Price, 1 = Use Local Recommended Sales Price.

  private currencyConversion: number = 0;
  private ehOptionNames: string;
  private ehOptions: string; //potentially an []int
  private hem10Discount: number = 0;
  private hem6Discount: number = 0;
  private het6pDiscount: number = 0;
  private het8mDiscount: number = 0;
  private het10mDiscount: number = 0;
  private heOverridenP251Markup: boolean = false;
  private heOverridenP251MarkupValue: number = 0;
  private hePricingCurrency: number = 0;
  private heTS6Discount: number = 0;
  private hideHEmodelFromSizing: boolean = false;
  private motiveInletPressureAvailable: boolean = false;
  private prvAllowed: boolean = false;
  public inputPRV: boolean = false;
  private sellSteamControl: boolean = false;


  private landedCostIncreaseFactor: number = 1; // Defaulted to no increase in SSP.
  private deliveryCost: number = 0;
  private sellingMarkup: number = 0;
  private commissionCost: number = 0;
  private oneYearWarrantyCost: number = 0;
  private twoYearWarrantyCost: number = 0;
  private threeYearWarrantyCost: number = 0;

  private manufacturerCurrencyId: number = 0;
  private sellingCurrencyId: number = 0;
  private userSellingCurrencyId: number = 0;

  public manufacturerCurrency: Currency;
  public sellingCurrency: Currency;

  public sellingCurrencySymbol: string;
  public currencyConversionRate: number = 0;

  // User prefs.
  private hideAllPricingUserPref: boolean = false;
  private hideManufactureCostsUserPref: boolean = false;
  // Flags to hide/show pricing details on the UI.
  public hideAllPricing: boolean = false;
  public hideManufactureCosts: boolean = false;

  private internal_SSP: number;
  private internal_SellingPrice: number;
  private unit_and_eh_internal_SSP: number;
  private unit_and_eh_internal_SellingPrice: number;
  private internal_ServiceOfferingPrice: number;
  private internal_TotalPrice: number;

  public display_SSP: string;
  public display_SellingPrice: number;
  public display_ServiceOfferingPrice: string;
  public display_DeliveryPrice: string;
  public display_TotalPrice: string;

  public serviceOfferingKey: string;

  public inletPressureValidationErrorMessage: EasiheatValidationErrorMessage;
  public totalBackPressureValidationErrorMessage: EasiheatValidationErrorMessage;
  public inletTemperatureValidationErrorMessage: EasiheatValidationErrorMessage;
  public outletTemperatureValidationErrorMessage: EasiheatValidationErrorMessage;
  public temperatureDifferentialValidationErrorMessage: EasiheatValidationErrorMessage;
  public waterFlowRateValidationErrorMessage: EasiheatValidationErrorMessage;
  public loadValidationErrorMessage: EasiheatValidationErrorMessage;
  public motiveInletPressureValidationErrorMessage: EasiheatValidationErrorMessage;
  public cleanSteamFlowrateValidationErrorMessage: EasiheatValidationErrorMessage;
  public validateProcessConditionsErrorMessage: EasiheatValidationErrorMessage;
  public packageInletPressureErrorMessage: EasiheatValidationErrorMessage;

  public pressureDifferentialErrorMessage: string;

  ehSizingDataInput: EHSizingDataInput;

  public ehOutputData: EasiheatOutput[] = [];
  public selectedOutputData: EasiheatOutput[] = [];

  public ehPricing: EHPricing;
  public ehPricingOptions: EHPricingOptions;
  public ehPricingOutputData: EHPricingOutput;
  public docGen: DocGen;
  public quoteExpired = false;
  public priceValidityMessage: string;
  public loadedJobSizingData: SizingData;

  private sellingMarkupUpdated: boolean = false;
  private grossMarginUpdated: boolean = false;
  private sellingPriceUpdated: boolean;
  public userCondensate: boolean = false;
  public isResetButtonClicked: boolean = false;

  // Handle the options
  public calcTriggerListChanged: boolean = false;

  public sizedCondensateRemoval: string;

  public gridSelectedRow = false;
  public loadOptions = false;

  public debugData: string;
  public debugDataEnabled: boolean;

  public alertVisible: boolean = false;
  public formStatus: string;
  public doSizing: boolean = false;
  public motiveInletPressureEntered: boolean = false;

  public volumetricFlowBefore: string;
  public volumetricFlowAfter: string;

  public loadBefore: string;
  public loadAfter: string;

  // The view reference variables are declared here
  @ViewChild('priceResultsTop', { static: false }) priceResultsContent: ElementRef; // for scroll to view

  /*
   *easiheat Enum
   */
  @ViewChild("condensate_Removal_Enum", { static: false }) condensate_Removal_Enum: EnumerationComponent;
  @ViewChild("actuator_Enum", { static: false }) actuator_Enum: EnumerationComponent;
  @ViewChild("high_Limit_Options_Enum", { static: false }) high_Limit_Options_Enum: EnumerationComponent;
  @ViewChild("high_Limit_Actuation_Enum", { static: false }) high_Limit_Actuation_Enum: EnumerationComponent;
  @ViewChild("design_Code_Enum", { static: false }) design_Code_Enum: EnumerationComponent;
  @ViewChild("control_System_Enum", { static: false }) control_System_Enum: EnumerationComponent;
  @ViewChild("gasket_Enum", { static: false }) gasket_Enum: EnumerationComponent;
  @ViewChild("service_Offering_Enum", { static: false }) service_Offering_Enum: EnumerationComponent;
  @ViewChild("isolation_Enum", { static: false }) isolation_Enum: EnumerationComponent;
  @ViewChild("remote_Access_Enum", { static: false }) remote_Access_Enum: EnumerationComponent;
  @ViewChild("communications_Enum", { static: false }) communications_Enum: EnumerationComponent;
  @ViewChild("energy_Monitoring_Enum", { static: false }) energy_Monitoring_Enum: EnumerationComponent;
  @ViewChild("jacking_Wheels_Enum", { static: false }) jacking_Wheels_Enum: EnumerationComponent;
  @ViewChild("en12828_Compliant_Enum", { static: false }) en12828_Compliant_Enum: EnumerationComponent;


  private hashTable = [

    {
      //DHW and HTG SC Options
      name: 'DHW_HTGSC',
      condensate_Removal: 'NomCondensateRemoval_EasiHeatUI',
      actuator: 'NomActuatorDHW_EasiHeat', //'NomActuatorDHW_EasiHeat',
      design_Code: 'NomDesignCodeDHW_EasiHeat',
      high_Limit: 'NomHighLimitDHW_EasiHeat',
      high_Limit_Actuation: 'NomHighLimitActuationDHW_EasiHeat',
      isolation: 'NomIsolationDHW_EasiHeat',
      service_Offering: 'WarrantyDHW_EasiHeat',
      control_System: 'NomPanelTypeDHW_EasiHeat',
      gasket: 'NomGasketDHW_EasiHeat',
      remote_Access: 'NomRemoteAccessDHW_EasiHeat',
      communications: 'NomCommunicationsDHW_EasiHeat',
      energy_Monitoring: 'NomEnergyMonitoringOptionDHW_EasiHeat',
      jacking_Wheels: 'NomJackingWheelsOptionDHW_EasiHeat',
      en12828_compliant: 'NomEN12828CompliantOptionDHW_EasiHeat'

    },
    {
      //HTG CC Options
      name: 'HTGCC',
      actuator: 'NomActuatorHTG_EasiHeat',
      design_Code: 'NomDesignCodeHTG_EasiHeat',
      high_Limit: 'NomHighLimitHTG_EasiHeat',
      high_Limit_Actuation: 'NomHighLimitActuationHTG_EasiHeat',
      isolation: 'NomIsolationHTG_EasiHeat',
      control_System: 'NomPanelTypeHTG_EasiHeat',
      service_Offering: 'WarrantyHTG_EasiHeat',
      gasket: 'NomGasketHTG_EasiHeat',
      remote_Access: 'NomRemoteAccessHTG_EasiHeat',
      communications: 'NomCommunicationsHTG_EasiHeat',
      energy_Monitoring: 'NomEnergyMonitoringOptionHTG_EasiHeat',
      jacking_Wheels: 'NomJackingWheelsOptionHTG_EasiHeat',
      en12828_compliant: 'NomEN12828CompliantOptionHTG_EasiHeat'

    }
  ];

  /**
   * Anonymous hash to determine severity icons.
   */
  severityHash: { icon: string }[] = [
    { icon: "fa fa-info-circle info-message-class" },
    { icon: "fa fa-warning warning-message-class" },
    { icon: "fa fa-times-circle error-message-class" }
  ];

  isEasiHeatSizingDone: boolean = false;
  isEasiHeatReSizingDone: boolean = false;

  isSizing: boolean = false;

  //@ViewChild("csgOutputDataTable", { static: false }) csgOutputDataTable: DatatableComponent;

  @ViewChild("pressureRef", { static: false }) pressureRef: DisplayPreferenceDirective;
  @ViewChild("temperatureRef", { static: false }) temperatureRef: DisplayPreferenceDirective;
  @ViewChild("volumetricFlowRef", { static: false }) volumetricFlowRef: DisplayPreferenceDirective;
  @ViewChild("loadRef", { static: false }) loadRef: DisplayPreferenceDirective;

  public sizingModuleForm: FormGroup;
  public user: User;
  public isCalculating: boolean;

  inletpressure: FormControl;
  totalbackpressure: FormControl;
  motiveinletpressure: FormControl;
  packageinletpressure: FormControl;
  noiseLimit_Enumeration: FormControl;
  selectedNoiseLimitValue: string;
  inlettemperature: FormControl;
  outlettemperature: FormControl;
  waterflowrate: FormControl;
  load: FormControl;
  maxPressureDrop_Enumeration: FormControl;
  selectedMaxPressureDrop: string;

  condensate_Removal_Enumeration: FormControl;
  actuator_Enumeration: FormControl;
  high_Limit_Options_Enumeration: FormControl;
  high_Limit_Actuation_Enumeration: FormControl;
  design_Code_Enumeration: FormControl;
  gasket_Enumeration: FormControl;
  control_System_Enumeration: FormControl;
  service_Offering_Enumeration: FormControl;
  isolation_Enumeration: FormControl;
  remote_Access_Enumeration: FormControl;
  communications_Enumeration: FormControl;
  energy_Monitoring_Enumeration: FormControl;
  jacking_Wheels_Enumeration: FormControl;
  en12828_Compliant_Enumeration: FormControl;

  easiHeatUnit: FormControl;
  trimType: FormControl;
  packInletConnSize: FormControl;
  controlValveSize: FormControl;
  condensatePipeSize: FormControl;
  secondaryInAndOutPipeSize: FormControl;
  heatExchangePlateType: FormControl;
  actualSecPressureDrop: FormControl;
  numberOfPlates: FormControl;
  maxCondensateTemp: FormControl;
  length: FormControl;
  height: FormControl;
  width: FormControl;
  weight: FormControl;

  totalPriceFormControl: FormControl;

  totalSSPFormControl: FormControl;
  sellingMarkupFormControl: FormControl;
  nomenclatureFormControl: FormControl;
  grossMarginFormControl: FormControl;
  totalSellingPriceFormControl: FormControl;
  deliveryCostFormControl: FormControl;

  serviceOfferingOptionsFormControl: FormControl;
  serviceOfferingFormControl: FormControl;

  paramsSubscription: Subscription;

  areProjectsAndJobsLoaded: boolean = false;
  project: Project = new Project();
  job: Job = new Job();

  selectedRow: EasiheatOutput;

  noise_Limit_List: any[];
  max_Pressure_Drop_List: any[];
  condensate_Removal_List: any[];
  actuator_List: any[];
  high_Limit_Options_List: any[];
  high_Limit_Actuation_List: any[];
  design_Code_List: any[];
  gasket_List: any[];
  control_System_List: any[];
  service_Offering_List: any[];
  isolation_List: any[];
  remote_Access_List: any[];
  communications_List: any[];
  energy_Monitoring_List: any[];
  jacking_Wheels_List: any[];
  en12828_Compliant_List: any[];

  allInputs: EasiheatProcessConditionsInputValidation[] = [];

  //noiseLimitEnumerationList: Enumeration;
  maxPressureDropEnumerationList: Enumeration;

  userChangedVolumetricFlow: boolean;

  nomenclature: string = "";
  isNone: boolean;
  isCommNone: boolean;
  initial_Maximum_Pressure_Drop_Name: string;
  maximum_Pressure_Drop_Name: string;
  maximum_Pressure_Drop_Unit: string;
  condensate_Removal_Name: string;
  actuator_Name: string;
  actuator_Initial_Value: string;
  actuator_Initial_Value_DHW: string;
  actuator_Initial_Value_HTG: string;
  high_Limit_Options_Name: string;
  highLimitOptions_Initial_Value_DHW: string;
  high_Limit_Actuation_Name: string;
  design_Code_Name: string;
  design_Code_Initial_Value: string;
  gasket_Name: string;
  gasket_Initial_Value: string;
  gasket_Value_Default_Text: string;
  gasket_Value_Default_Text_DHW: string;
  gasket_Value_Default_Text_HTG: string;
  control_System_Name: string;
  service_Offering_Name: string;
  isolation_Name: string;
  remote_Access_Name: string;
  communications_Name: string;
  energy_Monitoring_Name: string;
  jacking_Wheels_Name: string;
  en12828_Compliant_Name: string;

  userPrefs: Preference[];
  specSheetLanguage: string;
  lengthPref: string;
  lengthPrefUnit: string;
  weightPref: string;
  weightPrefUnit: string;

  downloadFilePath: SafeUrl;
  downloadFilePathPdf: string;

  sheet: FormControl;
  quantity: FormControl;
  revisionNumber: FormControl;
  aoNumber: FormControl;
  projectType: FormControl;
  orderNumber: FormControl;
  notes: FormControl;

  high_Limit_Selected_Option_Item_Value: string;
  high_Limit_Actuation_Selected_Option_Item_Value: string;
  designCode_Selected_Option_Item_Value: string;
  gasket_Selected_Option_Item_Value: string;
  service_Offering_Selected_Option_Item_Value: string;
  isolation_Selected_Option_Item_Value: string;
  remote_Access_Selected_Option_Item_Value: string;
  communications_Selected_Option_Item_Value: string;
  design_Code_Selected_Option_Item_Value: string;
  shell_Type_Selected_Option_Item_Value: string;
  valve_Actuation_Selected_Option_Item_Value: string;
  control_Selected_Option_Item_Value: string;
  communication_Interface_Selected_Option_Item_Value: string;


  translatedMessagesList: any[];
    enableJobExportBtn: boolean;
    showJobExportBtn: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private projectsJobsService: ProjectsJobsService,
    private fb: FormBuilder,
    private EasiheatService: EasiHeatService,
    private modulePreferenceService: ModulePreferenceService,
    private translationService: TranslationService,
    private preferenceService: PreferenceService,
    private docGenService: DocGenService,
    private easiheatDocGenService: easiHeatDocGenService,
    private translatePipe: TranslatePipe,
    private sanitizer: DomSanitizer,
    private userProfileService: UserProfileService,
    private adminService: AdminService,
    private messagesService: MessagesService,
    private cdRef: ChangeDetectorRef,
    private localeService: LocaleService,
    private unitsService: UnitsService,
    private localeValidation: LocaleValidation,
    private http: HttpClient
  ) {

    // Call the abstract class' constructor.
    super();
    console.log('easiheat component logged');

    // Initialize.

    this.enableJobExportBtn = false;
    this.ehSizingDataInput = new EHSizingDataInput();
    this.ehPricing = new EHPricing();
    this.ehPricingOptions = new EHPricingOptions();
    this.ehPricingOutputData = new EHPricingOutput();

    // Validation messages.
    this.inletPressureValidationErrorMessage = new EasiheatValidationErrorMessage();
    this.totalBackPressureValidationErrorMessage = new EasiheatValidationErrorMessage();
    this.inletTemperatureValidationErrorMessage = new EasiheatValidationErrorMessage();
    this.outletTemperatureValidationErrorMessage = new EasiheatValidationErrorMessage();
    this.temperatureDifferentialValidationErrorMessage = new EasiheatValidationErrorMessage();
    this.waterFlowRateValidationErrorMessage = new EasiheatValidationErrorMessage();
    this.loadValidationErrorMessage = new EasiheatValidationErrorMessage();
    this.motiveInletPressureValidationErrorMessage = new EasiheatValidationErrorMessage();
    this.validateProcessConditionsErrorMessage = new EasiheatValidationErrorMessage();
    this.packageInletPressureErrorMessage = new EasiheatValidationErrorMessage();
    // Form controls with custom validators.

    this.inletpressure = new FormControl('', [Validators.required, (c) => this.validateInletPressure(c, this.pressureRef, this.inletPressureValidationErrorMessage, this.totalBackPressureValidationErrorMessage), (c) => this.validateProcessConditions(c, 'InputInletPress', this.pressureRef, this.validateProcessConditionsErrorMessage)]);
    this.totalbackpressure = new FormControl('', [Validators.required, (c) => this.validateTotalBackPressure(c, this.pressureRef, this.totalBackPressureValidationErrorMessage, this.motiveInletPressureValidationErrorMessage), (c) => this.validateProcessConditions(c, 'InputBackPress', this.pressureRef, this.validateProcessConditionsErrorMessage)]);
    this.motiveinletpressure = new FormControl('', [Validators.nullValidator, (c) => this.validateMotiveInletPressure(c, this.pressureRef, this.motiveInletPressureValidationErrorMessage), (c) => this.validateProcessConditions(c, 'InputMotivePress', this.pressureRef, this.validateProcessConditionsErrorMessage)]);
    this.packageinletpressure = new FormControl('', [Validators.nullValidator, (c) => this.validatePackageInletPressure(c, this.pressureRef, this.packageInletPressureErrorMessage), (c) => this.validateProcessConditions(c, 'InputPRVPressure', this.pressureRef, this.validateProcessConditionsErrorMessage)]);
    this.inlettemperature = new FormControl('', [Validators.required, (c) => this.validateInletTemperature(c, this.temperatureRef, this.inletTemperatureValidationErrorMessage, this.temperatureDifferentialValidationErrorMessage), (c) => this.calculateFlowOrLoad(c), (c) => this.validateProcessConditions(c, 'InputInletTemp', this.temperatureRef, this.validateProcessConditionsErrorMessage)]);
    this.outlettemperature = new FormControl('', [Validators.required, (c) => this.validateOutletTemperature(c, this.temperatureRef, this.outletTemperatureValidationErrorMessage, this.temperatureDifferentialValidationErrorMessage), (c) => this.calculateFlowOrLoad(c), (c) => this.validateProcessConditions(c, 'InputOutletTemp', this.temperatureRef, this.validateProcessConditionsErrorMessage)]);
    //    this.waterflowrate = new FormControl('', [Validators.required, (c) => this.validateWaterFlowRate(c, this.volumetricFlowRef, this.temperatureRef, this.waterFlowRateValidationErrorMessage), (c) => this.CalcLoad(c), (c) => this.validateProcessConditions(c, 'InputFlowRate', this.volumetricFlowRef, this.validateProcessConditionsErrorMessage)]);
    this.waterflowrate = new FormControl('', [Validators.required, (c) => this.validateProcessConditions(c, 'InputFlowRate', this.volumetricFlowRef, this.validateProcessConditionsErrorMessage)]);
    //    this.load = new FormControl('', [Validators.required, (c) => this.validateLoadInput(c, this.loadRef, this.loadValidationErrorMessage), (c) => this.CalcWaterFlowRate(c), (c) => this.validateProcessConditions(c, 'InputLoad', this.loadRef, this.validateProcessConditionsErrorMessage)]);
    this.load = new FormControl('', [Validators.required, (c) => this.validateProcessConditions(c, 'InputLoad', this.loadRef, this.validateProcessConditionsErrorMessage)]);

    this.easiHeatUnit = new FormControl('');
    this.trimType = new FormControl('');
    this.packInletConnSize = new FormControl('');
    this.controlValveSize = new FormControl('');
    this.condensatePipeSize = new FormControl('');
    this.secondaryInAndOutPipeSize = new FormControl('');
    this.heatExchangePlateType = new FormControl('');
    this.actualSecPressureDrop = new FormControl('');
    this.numberOfPlates = new FormControl('');
    this.maxCondensateTemp = new FormControl('');
    this.length = new FormControl('');
    this.height = new FormControl('');
    this.width = new FormControl('');
    this.weight = new FormControl('');

    this.noiseLimit_Enumeration = new FormControl('85');
    this.noise_Limit_List = [];
    this.maxPressureDrop_Enumeration = new FormControl('');
    this.max_Pressure_Drop_List = [];
    this.condensate_Removal_Enumeration = new FormControl('');
    this.condensate_Removal_List = [];
    this.actuator_Enumeration = new FormControl('');
    this.actuator_List = [];
    this.high_Limit_Options_Enumeration = new FormControl('');
    this.high_Limit_Options_List = [];
    this.high_Limit_Actuation_Enumeration = new FormControl('');
    this.high_Limit_Actuation_List = [];
    this.design_Code_Enumeration = new FormControl('');
    this.design_Code_List = [];
    this.gasket_Enumeration = new FormControl('');
    this.gasket_List = [];
    this.control_System_Enumeration = new FormControl('');
    this.control_System_List = []
    this.service_Offering_Enumeration = new FormControl('');
    this.service_Offering_List = [];
    this.isolation_Enumeration = new FormControl('');
    this.isolation_List = [];
    this.remote_Access_Enumeration = new FormControl('');
    this.remote_Access_List = [];
    this.communications_Enumeration = new FormControl('');
    this.communications_List = [];
    this.energy_Monitoring_Enumeration = new FormControl('');
    this.energy_Monitoring_List = [];
    this.jacking_Wheels_Enumeration = new FormControl('');
    this.jacking_Wheels_List = [];
    this.en12828_Compliant_Enumeration = new FormControl('');
    this.en12828_Compliant_List = [];
    this.design_Code_Enumeration = new FormControl('');

    this.totalPriceFormControl = new FormControl({ value: 0, disabled: true });

    this.totalSSPFormControl = new FormControl({ value: 0, disabled: true });
    this.sellingMarkupFormControl = new FormControl('');
    this.nomenclatureFormControl = new FormControl('');
    this.grossMarginFormControl = new FormControl('');
    this.totalSellingPriceFormControl = new FormControl('');
    this.deliveryCostFormControl = new FormControl({ value: 0, disabled: true });

    this.serviceOfferingOptionsFormControl = new FormControl('');
    this.serviceOfferingFormControl = new FormControl({ value: 0.00, disabled: true });

    this.translatedMessagesList = [];

    this.design_Code_List = [];

    this.maximum_Pressure_Drop_Name = '';
    this.maximum_Pressure_Drop_Unit = '';
    this.condensate_Removal_Name = '';
    this.actuator_Name = '';
    this.actuator_Initial_Value = '';
    this.actuator_Initial_Value_DHW = '';
    this.actuator_Initial_Value_HTG = '';
    this.high_Limit_Options_Name = '';
    this.high_Limit_Actuation_Name = '';
    this.design_Code_Name = '';
    this.design_Code_Initial_Value = '';
    this.gasket_Name = '';
    this.gasket_Initial_Value = '';
    this.gasket_Value_Default_Text = '';
    this.gasket_Value_Default_Text_DHW = '';
    this.gasket_Value_Default_Text_HTG = '';
    this.control_System_Name = '';
    this.service_Offering_Name = '';
    this.isolation_Name = '';
    this.remote_Access_Name = '';
    this.communications_Name = '';
    this.energy_Monitoring_Name = '';
    this.jacking_Wheels_Name = '';
    this.en12828_Compliant_Name = '';

    this.sheet = new FormControl('');
    this.quantity = new FormControl('');
    this.revisionNumber = new FormControl('');
    this.aoNumber = new FormControl('');
    this.projectType = new FormControl('');
    this.orderNumber = new FormControl('');
    this.notes = new FormControl('');

    this.getModulePreferenceValues();

    // Get the users module access level.
    this.adminService.getUserModuleAccessDataByModuleGroupId(this.moduleGroupId).subscribe((accessLevel: number) => {
      if (accessLevel) {
        switch (accessLevel) {
          // Two stars
          case 0.66:
            // Only show the sales prices if preference is set to?
            this.hideManufactureCosts = true;
            if (this.hideAllPricingUserPref) {
              this.hideAllPricing = true;
            }
            break;

          // Three stars
          case 0.99:
            // Show manufacturers cost only if preference is set to?
            if (this.hideManufactureCostsUserPref) {
              this.hideManufactureCosts = true;
            }
            // Show sales prices only if preference is set to?
            if (this.hideAllPricingUserPref) {
              this.hideAllPricing = true;
            }
            break;

          // One/No stars
          default:
            // Hide all the pricing informations.
            this.hideAllPricing = true;
            this.hideManufactureCosts = true;
            break;
        }
      }
    });

    this.sizingModuleForm = this.fb.group({
      inletpressure: this.inletpressure,
      totalbackpressure: this.totalbackpressure,
      packageinletpressure: this.packageinletpressure,
      motiveinletpressure: this.motiveinletpressure,
      inlettemperature: this.inlettemperature,
      outlettemperature: this.outlettemperature,
      waterflowrate: this.waterflowrate,
      load: this.load,
      noiseLimit_Enumeration: this.noiseLimit_Enumeration,
      maxPressureDrop_Enumeration: this.maxPressureDrop_Enumeration,

      pricingOptions: this.fb.group({

        condensate_Removal_Enumeration: this.condensate_Removal_Enumeration,
        actuator_Enumeration: this.actuator_Enumeration,
        high_Limit_Options_Enumeration: this.high_Limit_Options_Enumeration,
        high_Limit_Actuation_Enumeration: this.high_Limit_Actuation_Enumeration,
        design_Code_Enumeration: this.design_Code_Enumeration,
        control_System_Enumeration: this.control_System_Enumeration,
        gasket_Enumeration: this.gasket_Enumeration,
        service_Offering_Enumeration: this.service_Offering_Enumeration,
        isolation_Enumeration: this.isolation_Enumeration,
        remote_Access_Enumeration: this.remote_Access_Enumeration,
        communications_Enumeration: this.communications_Enumeration,
        energy_Monitoring_Enumeration: this.energy_Monitoring_Enumeration,
        jacking_Wheels_Enumeration: this.jacking_Wheels_Enumeration,
        en12828_Compliant_Enumeration: this.en12828_Compliant_Enumeration,
        nomenclatureFormControl: this.nomenclatureFormControl,

      }),

      totalPriceFormControl: this.totalPriceFormControl,
      easiHeatUnit: this.easiHeatUnit,
      trimType: this.trimType,
      packInletConnSize: this.packInletConnSize,
      controlValveSize: this.controlValveSize,
      condensatePipeSize: this.condensatePipeSize,
      secondaryInAndOutPipeSize: this.secondaryInAndOutPipeSize,
      heatExchangePlateType: this.heatExchangePlateType,
      actualSecPressureDrop: this.actualSecPressureDrop,
      numberOfPlates: this.numberOfPlates,
      maxCondensateTemp: this.maxCondensateTemp,
      length: this.length,
      height: this.height,
      width: this.width,
      weight: this.weight,

      totalSSPFormControl: this.totalSSPFormControl,
      sellingMarkupFormControl: this.sellingMarkupFormControl,

      grossMarginFormControl: this.grossMarginFormControl,
      totalSellingPriceFormControl: this.totalSellingPriceFormControl,
      deliveryCostFormControl: this.deliveryCostFormControl,

      serviceOfferingOptionsFormControl: this.serviceOfferingOptionsFormControl,
      serviceOfferingFormControl: this.serviceOfferingFormControl,

      sheet: this.sheet,
      quantity: this.quantity,
      revisionNumber: this.revisionNumber,
      aoNumber: this.aoNumber,
      projectType: this.projectType,
      orderNumber: this.orderNumber,
      notes: this.notes

    }, { updateOn: "blur" });
  }

  getModulePreferenceValues() {

    var localRecommendedSalesPricePref = this.modulePreferenceService.getModulePreferenceByName("CSGLocalRecommendedSalesPriceOption");
    if (localRecommendedSalesPricePref) {
      this.localRecommendedSalesPriceOption = +localRecommendedSalesPricePref.value;
    }

    var currencyConversionPref = this.modulePreferenceService.getModulePreferenceByName("CurrencyConversion");
    if (currencyConversionPref) {
      this.currencyConversion = +currencyConversionPref.value;
    }

    var cvSplitRangePref = this.modulePreferenceService.getModulePreferenceByName("CVSplitRange");
    if (cvSplitRangePref) {
      this.cvSplitRangeAvailable = JSON.parse(cvSplitRangePref.value);
    }

    var ehOptionNamesPref = this.modulePreferenceService.getModulePreferenceByName("EHOptionNames");
    if (ehOptionNamesPref) {
      this.ehOptionNames = ehOptionNamesPref.value;
    }

    var ehOptionsPref = this.modulePreferenceService.getModulePreferenceByName("EHOptions");
    if (ehOptionsPref) {
      this.ehOptions = ehOptionsPref.value;
    }

    // top 2 below have to have old pref nams for now as they have been added wrong to module prefs. Bodge to make it work. Needs fixing
    var het6DiscountPref = this.modulePreferenceService.getModulePreferenceByName("HEM6Discount");
    if (het6DiscountPref) {
      this.het6pDiscount = +het6DiscountPref.value;
    }

    var het8DiscountPref = this.modulePreferenceService.getModulePreferenceByName("HEM10Discount");
    if (het8DiscountPref) {
      this.het8mDiscount = +het8DiscountPref.value;
    }

    var het10DiscountPref = this.modulePreferenceService.getModulePreferenceByName("HET10");
    if (het10DiscountPref) {
      this.het10mDiscount = +het10DiscountPref.value;
    }

    var heOverridenP251MarkupPref = this.modulePreferenceService.getModulePreferenceByName("HEOverridenP251Markup");
    if (heOverridenP251MarkupPref) {

      this.heOverridenP251Markup = JSON.parse(heOverridenP251MarkupPref.value.toLowerCase());
    }

    var heOverridenP251MarkupValuePref = this.modulePreferenceService.getModulePreferenceByName("HEOverridenP251MarkupValue");
    if (heOverridenP251MarkupValuePref) {
      this.heOverridenP251MarkupValue = +heOverridenP251MarkupValuePref.value;
    }

    var hePricingCurrencyPref = this.modulePreferenceService.getModulePreferenceByName("HEPricingCurrency");
    if (hePricingCurrencyPref) {
      this.hePricingCurrency = +hePricingCurrencyPref.value;
    }

    var heTS6DiscountPref = this.modulePreferenceService.getModulePreferenceByName("HETS6Discount");
    if (heTS6DiscountPref) {
      this.heTS6Discount = +heTS6DiscountPref.value;
    }

    var hideHEmodelFromSizingPref = this.modulePreferenceService.getModulePreferenceByName("HideHEmodelFromSizing");
    if (hideHEmodelFromSizingPref) {
      this.hideHEmodelFromSizing = JSON.parse(hideHEmodelFromSizingPref.value);
    }

    var motiveInletPressureAvailablePref = this.modulePreferenceService.getModulePreferenceByName("MotiveInletPressureAvailable");
    if (motiveInletPressureAvailablePref) {
      this.motiveInletPressureAvailable = JSON.parse(motiveInletPressureAvailablePref.value);
    }

    var prvAllowedPref = this.modulePreferenceService.getModulePreferenceByName("PrvAllowed");
    if (prvAllowedPref) {
      this.prvAllowed = JSON.parse(prvAllowedPref.value);
    }

    var sellSteamControlPref = this.modulePreferenceService.getModulePreferenceByName("SellSteamControl");
    if (sellSteamControlPref) {
      this.sellSteamControl = JSON.parse(sellSteamControlPref.value);
    }

    var landedCostIncreasePref = this.modulePreferenceService.getModulePreferenceByName("LandCostIncrease");
    if (landedCostIncreasePref) {
      this.landedCostIncreaseFactor = (100 + (+landedCostIncreasePref.value)) / 100;
    }

    var deliveryCostPref = this.modulePreferenceService.getModulePreferenceByName("DeliveryCost");
    if (deliveryCostPref) {
      this.deliveryCost = +deliveryCostPref.value;
    }

    var sellingMarkupPref = this.modulePreferenceService.getModulePreferenceByName("SellingMarkup");
    if (sellingMarkupPref) {
      this.sellingMarkup = +sellingMarkupPref.value;
    }

    var commissionCostCostPref = this.modulePreferenceService.getModulePreferenceByName("Commission");
    if (commissionCostCostPref) {
      this.commissionCost = +commissionCostCostPref.value;
    }
    var oneYearWarrantyCostPref = this.modulePreferenceService.getModulePreferenceByName("YearOne");
    if (oneYearWarrantyCostPref) {
      this.oneYearWarrantyCost = +oneYearWarrantyCostPref.value;
    }
    var twoYearWarrantyCostPref = this.modulePreferenceService.getModulePreferenceByName("YearTwo");
    if (twoYearWarrantyCostPref) {
      this.twoYearWarrantyCost = +twoYearWarrantyCostPref.value;
    }
    var threeYearWarrantyCostPref = this.modulePreferenceService.getModulePreferenceByName("YearThree");
    if (threeYearWarrantyCostPref) {
      this.threeYearWarrantyCost = +threeYearWarrantyCostPref.value;
    }

    var manufacturerCurrencyPref = this.modulePreferenceService.getModulePreferenceByName("ManufacturerCurrency");
    if (manufacturerCurrencyPref) {
      this.manufacturerCurrencyId = parseInt(manufacturerCurrencyPref.value);
    }
    var sellingCurrencyPref = this.modulePreferenceService.getModulePreferenceByName("SellingCurrency");
    if (sellingCurrencyPref) {
      this.sellingCurrencyId = +sellingCurrencyPref.value;
    }

    var EnergyMonitoringAvailableDHWPref = this.modulePreferenceService.getModulePreferenceByName("EnergyMonitoringAvailableDHW");
    if (EnergyMonitoringAvailableDHWPref) {
      this.DHWEnergyMonitoringEnabledPref = JSON.parse(EnergyMonitoringAvailableDHWPref.value);
      this.isEnergyMonitoringEnabled = JSON.parse(EnergyMonitoringAvailableDHWPref.value);
    }

    var EnergyMonitoringAvailableHTGPref = this.modulePreferenceService.getModulePreferenceByName("EnergyMonitoringAvailableHTG");
    if (EnergyMonitoringAvailableHTGPref) {
      this.HTGEnergyMonitoringEnabledPref = JSON.parse(EnergyMonitoringAvailableHTGPref.value);
    }

    var EnergyMonitoringDefaultDHWPref = this.modulePreferenceService.getModulePreferenceByName("EnergyMonitoringDefaultDHW");
    if (EnergyMonitoringDefaultDHWPref) {
      this.energyMonitoringDefaultDHW = JSON.parse(EnergyMonitoringDefaultDHWPref.value);
      //this.isEnergyMonitoringSelected = JSON.parse(EnergyMonitoringDefaultDHWPref.value);
    }

    var EnergyMonitoringDefaultHTGPref = this.modulePreferenceService.getModulePreferenceByName("EnergyMonitoringDefaultHTG");
    if (EnergyMonitoringDefaultHTGPref) {
      this.energyMonitoringDefaultHTG = JSON.parse(EnergyMonitoringDefaultHTGPref.value);
    }

    var JackingWheelsAvailableDHWPref = this.modulePreferenceService.getModulePreferenceByName("JackingWheelsAvailableDHW");
    if (JackingWheelsAvailableDHWPref) {
      this.DHWJackingWheelsEnabled = JSON.parse(JackingWheelsAvailableDHWPref.value);
      this.isJackingWheelsEnabled = JSON.parse(JackingWheelsAvailableDHWPref.value);
    }

    var JackingWheelsAvailableHTGPref = this.modulePreferenceService.getModulePreferenceByName("JackingWheelsAvailableHTG");
    if (JackingWheelsAvailableHTGPref) {
      this.HTGJackingWheelsEnabled = JSON.parse(JackingWheelsAvailableHTGPref.value);
    }

    var JackingWheelsDefaultDHWPref = this.modulePreferenceService.getModulePreferenceByName("JackingWheelsDefaultDHW");
    if (JackingWheelsDefaultDHWPref) {
      this.jackingWheelsDefaultDHW = JSON.parse(JackingWheelsDefaultDHWPref.value);
    }

    var JackingWheelsDefaultHTGPref = this.modulePreferenceService.getModulePreferenceByName("JackingWheelsDefaultHTG");
    if (JackingWheelsDefaultHTGPref) {
      this.jackingWheelsDefaultHTG = JSON.parse(JackingWheelsDefaultHTGPref.value);
    }

    var ENCompliantAvailableDHWPref = this.modulePreferenceService.getModulePreferenceByName("ENCompliantAvailableDHW");
    if (ENCompliantAvailableDHWPref) {
      this.DHWENCompliantEnabledPref = JSON.parse(ENCompliantAvailableDHWPref.value);
      this.isEn12828CompliantEnabled = JSON.parse(ENCompliantAvailableDHWPref.value);
    }

    var ENCompliantAvailableHTGPref = this.modulePreferenceService.getModulePreferenceByName("ENCompliantAvailableHTG");
    if (ENCompliantAvailableHTGPref) {
      this.HTGENCompliantEnabledPref = JSON.parse(ENCompliantAvailableHTGPref.value);
    }

    var ENCompliantDefaultDHWPref = this.modulePreferenceService.getModulePreferenceByName("ENCompliantDefaultDHW");
    if (ENCompliantDefaultDHWPref) {
      this.ENCompliantDefaultDHW = JSON.parse(ENCompliantDefaultDHWPref.value);
    }

    var ENCompliantDefaultHTGPref = this.modulePreferenceService.getModulePreferenceByName("ENCompliantDefaultHTG");
    if (ENCompliantDefaultHTGPref) {
      this.ENCompliantDefaultHTG = JSON.parse(ENCompliantDefaultHTGPref.value);
    }

    // Get the users prefs.
    var hideAllPricingPref = this.preferenceService.getUserPreferenceByName("EHHideSalesPrice");
    if (hideAllPricingPref) {
      this.hideAllPricingUserPref = (hideAllPricingPref.value === "1");
    }

    var hideManufactureCostsPref = this.preferenceService.getUserPreferenceByName("EHHideManufactureCosts");
    if (hideManufactureCostsPref) {
      this.hideManufactureCostsUserPref = (hideManufactureCostsPref.value === "1");
    }

    var userSellingCurrencyPref = this.modulePreferenceService.getModulePreferenceByName("SellingCurrency");
    if (userSellingCurrencyPref) {
      this.userSellingCurrencyId = parseInt(userSellingCurrencyPref.value);
    }

    var manufacturerPref = this.modulePreferenceService.getModulePreferenceByName("Manufacturer");
    if (manufacturerPref) {
      this.manufacturerId = parseInt(manufacturerPref.value);
    }

    var manufacturerCurrencyPref = this.modulePreferenceService.getModulePreferenceByName("ManufacturerCurrency");
    if (manufacturerCurrencyPref) {
      this.manufacturerCurrencyId = parseInt(manufacturerCurrencyPref.value);
    }

  }

  ngOnInit() {

    //Set properties required for Saving Correctly Project and Jobs
    this.jobStatusId = 1;
    this.moduleId = 5;
    this.productName = "Easiheat";

    //Get User Preferences
    this.preferenceService.getUserPreferences().subscribe((prefs: Array<Preference>) => {

      this.userPrefs = prefs;
      this.specSheetLanguage = this.userPrefs.find(m => m.name === "SpecLanguage").value;
      this.lengthPref = this.userPrefs.find(m => m.name === "LengthUnit").value;
      this.lengthPrefUnit = this.userPrefs.find(m => m.name === "LengthUnit").unitName;
      this.weightPref = this.userPrefs.find(m => m.name === "WeightUnit").value;
      this.weightPrefUnit = this.userPrefs.find(m => m.name === "WeightUnit").unitName;

      this.convertTemperatureToDefaultValueInPageUnits("inlettemperature", 10);
      this.convertTemperatureToDefaultValueInPageUnits("outlettemperature", 65);

      this.sizingModuleForm.markAsPristine();
      this.sizingModuleForm.markAsUntouched();
      this.formStatus = this.sizingModuleForm.value;
    });


    this.userProfileService.getUserDetails().subscribe(user => {
      this.user = user;
      this.userIsUkBased = this.user && this.ukOpCodeId.indexOf(this.user.operatingCompanyId) > -1;
      this.showJobExportBtn = this.userIsUkBased;
    });

    // Get the currency data.
    this.adminService.getCurrencyData().subscribe(data => {
      if (data && data.length > 0) {
        this.sellingCurrency = data.find(c => c.id === this.sellingCurrencyId);
        this.manufacturerCurrency = data.find(c => c.id === this.manufacturerCurrencyId);

        if (this.sellingCurrency && this.manufacturerCurrency) {
          this.currencyConversionRate = +((this.manufacturerCurrency.rateToGbp * (1 / this.sellingCurrency.rateToGbp)).toFixed(5));
        }
      }

      this.sizingModuleForm.markAsPristine();
      this.sizingModuleForm.markAsUntouched();
    });

    //Set Initial Value for Design Code
    var design_Code_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === true && mp.enumerationName === "NomDesignCodeDHW_EasiHeat")[0];
    if (!!design_Code_Enumeration_Items && !!design_Code_Enumeration_Items.enumerationDefinitions && design_Code_Enumeration_Items.enumerationDefinitions.length > 0) {
      this.design_Code_Initial_Value = design_Code_Enumeration_Items.enumerationDefinitions[0].value;// Set default to first item
    }
    else {
      design_Code_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === "NomDesignCodeDHW_EasiHeat")[0];
      this.design_Code_Initial_Value = design_Code_Enumeration_Items.enumerationDefinitions[0].value;// Set default to first item
    }

    // Set Initilal Value for Gasket DHW
    var gasket_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === true && mp.enumerationName === 'NomGasketDHW_EasiHeat')[0];
    if (!!gasket_Enumeration_Items && !!gasket_Enumeration_Items.enumerationDefinitions && gasket_Enumeration_Items.enumerationDefinitions.length > 0) {
      this.gasket_Initial_Value = gasket_Enumeration_Items.enumerationDefinitions[0].value;// Set default to first item
      this.gasket_Value_Default_Text = gasket_Enumeration_Items.enumerationDefinitions[0].defaultText;
      this.gasket_Value_Default_Text_DHW = gasket_Enumeration_Items.enumerationDefinitions[0].defaultText;
    }
    else {
      gasket_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === 'NomGasketDHW_EasiHeat')[0];
      this.gasket_Initial_Value = gasket_Enumeration_Items.enumerationDefinitions[0].value;// Set default to first item
      this.gasket_Value_Default_Text = gasket_Enumeration_Items.enumerationDefinitions[0].defaultText;
      this.gasket_Value_Default_Text_DHW = gasket_Enumeration_Items.enumerationDefinitions[0].defaultText;
    }

    // Set Initilal Value for Gasket HTG
    var gasket_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === true && mp.enumerationName === 'NomGasketHTG_EasiHeat')[0];
    if (!!gasket_Enumeration_Items && !!gasket_Enumeration_Items.enumerationDefinitions && gasket_Enumeration_Items.enumerationDefinitions.length > 0) {
      this.gasket_Value_Default_Text_HTG = gasket_Enumeration_Items.enumerationDefinitions[0].defaultText;
    }
    else {
      gasket_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === 'NomGasketHTG_EasiHeat')[0];
      this.gasket_Value_Default_Text_HTG = gasket_Enumeration_Items.enumerationDefinitions[0].defaultText;
    }

    // Set Initilal Value for Actuator DHW
    var actuator_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === true && mp.enumerationName === 'NomActuatorDHW_EasiHeat')[0];
    if (!!actuator_Enumeration_Items && !!actuator_Enumeration_Items.enumerationDefinitions && actuator_Enumeration_Items.enumerationDefinitions.length > 0) {
      this.actuator_Initial_Value = actuator_Enumeration_Items.enumerationDefinitions[0].value;// Set default to first item
      this.actuator_Initial_Value_DHW = actuator_Enumeration_Items.enumerationDefinitions[0].value;// Set default to first item
    }
    else {
      actuator_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === 'NomActuatorDHW_EasiHeat')[0];
      this.actuator_Initial_Value = actuator_Enumeration_Items.enumerationDefinitions[0].value;// Set default to first item
      this.actuator_Initial_Value_DHW = actuator_Enumeration_Items.enumerationDefinitions[0].value;// Set default to first item
    }

    // Set Initilal Value for Actuator HTG
    var actuator_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === true && mp.enumerationName === 'NomActuatorHTG_EasiHeat')[0];
    if (!!actuator_Enumeration_Items && !!actuator_Enumeration_Items.enumerationDefinitions && actuator_Enumeration_Items.enumerationDefinitions.length > 0) {
      this.actuator_Initial_Value_HTG = actuator_Enumeration_Items.enumerationDefinitions[0].value;// Set default to first item
    }
    else {
      actuator_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === 'NomActuatorHTG_EasiHeat')[0];
      this.actuator_Initial_Value_HTG = actuator_Enumeration_Items.enumerationDefinitions[0].value;// Set default to first item
    }

    // Set Initilal Value for High Limit Options DHW
    var highLimitOptions_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === true && mp.enumerationName === 'NomHighLimitDHW_EasiHeat')[0];
    if (!!highLimitOptions_Enumeration_Items && !!highLimitOptions_Enumeration_Items.enumerationDefinitions && highLimitOptions_Enumeration_Items.enumerationDefinitions.length > 0) {
      this.highLimitOptions_Initial_Value_DHW = highLimitOptions_Enumeration_Items.enumerationDefinitions[0].value;// Set default to first item
    }
    else {
      var highLimitOptions_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === 'NomHighLimitDHW_EasiHeat')[0];
    }

    //Set Visibility of High Limit Actuation List
    if (this.actuator_Initial_Value_DHW == "EL4" && this.highLimitOptions_Initial_Value_DHW.includes("HL")) {
      this.highLimitActuation = true;
    }

    //Set Appropriate Pressure Unit based on Initial Design Code Value
    if (this.design_Code_Initial_Value == 'A') { // (A)ASME
      this.initial_Maximum_Pressure_Drop_Name = "PressureDropPsiRounded_EasiHeat";
      this.maximum_Pressure_Drop_Name = "PressureDropPsiRounded_EasiHeat";
      this.maximum_Pressure_Drop_Unit = "PSI"
    }
    else { // (P or J) PED or ASIA(Japan,Korea)
      this.initial_Maximum_Pressure_Drop_Name = "PressureDrop_EasiHeat";
      this.maximum_Pressure_Drop_Name = "PressureDrop_EasiHeat";
      this.maximum_Pressure_Drop_Unit = "KPA"
    }

    // Set Max Pressure Drop
    setTimeout(() => {
      this.setMaxPressureDropValue(this.ApplicationType, this.design_Code_Initial_Value)
      this.sizingModuleForm.markAsPristine();
      this.sizingModuleForm.markAsUntouched();
    }, 100);


    this.theFormGroup = this.sizingModuleForm; // to drive GenericChangesGuard
    // Update the flag so that Ti sheet could be generated.
    this.isTiEnabled = true;
    this.isNone = true;
    this.isCommNone = true;

    this.handleLoadingJob();
  }



  ngOnDestroy() {
    console.log("Component will be destroyed");
    this.paramsSubscription.unsubscribe();
  }

  handleLoadingJob() {
    this.activatedRoute.params
    // subscribe to router event
    this.paramsSubscription = this.activatedRoute.params.subscribe((params: Params) => {

      let projectId = params['projectId'];
      let jobId = params['jobId'];
      console.log(`projectId=${projectId}, jobId=${jobId}`);
      if (!!projectId && !!jobId) {

        this.jobParams = true;
        this.projectId = projectId;
        this.jobId = jobId;

        // first get data, might be navigated link from P&Js or bookmark?
        this.projectsJobsService.getProjectsAndJobs().subscribe(() => {
          // Inform the view that areProjectsAndJobs are now loaded.
          this.areProjectsAndJobsLoaded = true;
        });

        //ToDo: Write slices and chain async call for single dedicated calls to GetProjectById, GetJobById or GetProjetAndSingleJobByIds all in one server/SP call etc.
        // subject subscription, update as service data has changed (probably changed in memory)
        this.projectsJobsService.projectJobsChange.subscribe(() => {
          //Subject has Updated Projects And Jobs Data.

          var notFound = false;
          if (this.jobParams) {
            this.project = this.projectsJobsService.projectsJobs.projects.find(p => p.id === projectId);
          } else return;

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

            this.loadedJobSizingData = response;

            // This is required to prevent any re-validation and re-calculation when a job is loading.
            this.isLoadingJob = true;
            this.jobParams = false;

            this.loadJob();


            this.sizingModuleForm.markAsPristine();
            this.sizingModuleForm.markAsUntouched();

          });

          setTimeout(() => {
            if (this.maximum_Pressure_Drop_Unit == "PSI") {

              this.maxPressureDrop_Enumeration.setValue(this.maxPressureDrop_Enumeration.value);
              this.sizingModuleForm.markAsPristine();
              this.sizingModuleForm.markAsUntouched();
            }
          }, 200);

        });
      }
    });
  }

  loadJob() {
    try {

      if (this.loadedJobSizingData != null) {

        this.isThisAJob = true; // this prevents ProcessConditionValidation (which is kicking off on job load as soon as all process conditions fields are populated) from setting this.isEasiHeatSizingDone to false so the UI sizing results,pricing,options,notes panel will remain open (if there is any data saved for those).
        // Load unit preferences.
        let unitPreferences = this.loadedJobSizingData.processConditions[0].unitPreferences;
        this.preferenceService.addSizingUnitPreference(unitPreferences.find(u => u.name === this.pressureRef.preference.name), "PressureUnits", "PRESSURE", this.moduleGroupId);
        this.preferenceService.addSizingUnitPreference(unitPreferences.find(u => u.name === this.temperatureRef.preference.name), "TemperatureUnits", "TEMPERATURE", this.moduleGroupId);
        this.preferenceService.addSizingUnitPreference(unitPreferences.find(u => u.name === this.volumetricFlowRef.preference.name), "VolumetricFlowUnit", "VOLUMETRIC_FLOW", this.moduleGroupId);
        this.preferenceService.addSizingUnitPreference(unitPreferences.find(u => u.name === this.loadRef.preference.name), "LoadUnits", "LOAD", this.moduleGroupId);
        this.maximum_Pressure_Drop_Unit = unitPreferences.find(u => u.name === "MaxPressureDropUnit").unitName;
        this.maximum_Pressure_Drop_Name = unitPreferences.find(u => u.name === "MaxPressureDropUnit").masterTextKey;

        // load process conditions
        let processConditions = this.loadedJobSizingData.processConditions[0];
        this.ApplicationType = processConditions.processInputs.find(m => m.name === "Application Type").value;
        this.inletpressure.setValue(parseFloat(processConditions.processInputs.find(m => m.name === "Inlet Pressure").value));
        this.totalbackpressure.setValue(parseFloat(processConditions.processInputs.find(m => m.name === "Total Back Pressure").value));
        this.inlettemperature.setValue(parseFloat(processConditions.processInputs.find(m => m.name === "Inlet Temperature").value));
        this.outlettemperature.setValue(parseFloat(processConditions.processInputs.find(m => m.name === "Outlet Temperature").value));
        this.waterflowrate.setValue(parseFloat(processConditions.processInputs.find(m => m.name === "Water Flow Rate").value));
        this.load.setValue(parseFloat(processConditions.processInputs.find(m => m.name === "Load").value));
        this.maxPressureDrop_Enumeration.setValue(processConditions.processInputs.find(m => m.name === "Maximum Pressure Drop").value);
        this.hideHEmodelFromSizing = JSON.parse(processConditions.processInputs.find(m => m.name === "Hide HE Model From Sizing").value);
        this.dhw = JSON.parse(processConditions.processInputs.find(m => m.name === "DHW boolean").value);
        this.htgcc = JSON.parse(processConditions.processInputs.find(m => m.name === "HTGCC boolean").value);
        this.highLimitActuation = JSON.parse(processConditions.processInputs.find(m => m.name === "High Limit Actuation Visible").value);

        if (this.ApplicationType == "DHW") {

          if (JSON.parse(processConditions.processInputs.find(m => m.name === "Motive Inlet Pressure Visible").value) == true) {

            this.motiveInletPressureAvailable = true;
            this.motiveinletpressure.setValue(processConditions.processInputs.find(m => m.name === "Motive Inlet Pressure").value)
          }

          if (JSON.parse(processConditions.processInputs.find(m => m.name === "CV Split Range Visible").value) == true) {

            this.cvSplitRangeAvailable = true;
            this.cvSplitRange = JSON.parse(processConditions.processInputs.find(m => m.name === "CV Split Range").value)
          }

          this.noiseLimit_Enumeration.setValue(processConditions.processInputs.find(m => m.name === "Noise Limit").value);
        }

        if (this.ApplicationType == "HTGCC") {

          if (JSON.parse(processConditions.processInputs.find(m => m.name === "PRV Visible").value) == true) {

            this.prvAllowed = true;
            this.inputPRV = JSON.parse(processConditions.processInputs.find(m => m.name === "PRV Ticked").value);

            if (JSON.parse(processConditions.processInputs.find(m => m.name === "PRV Ticked").value) == true) {

              this.packageinletpressure.setValue(processConditions.processInputs.find(m => m.name === "Package Inlet Pressure").value);
            }

          }

        }

        if (this.ApplicationType == "HTGSC") {

          if (JSON.parse(processConditions.processInputs.find(m => m.name === "HTGSC Visible").value) == true) {

            this.sellSteamControl = true;

            if (JSON.parse(processConditions.processInputs.find(m => m.name === "CV Split Range Visible").value) == true) {

              this.cvSplitRangeAvailable = true;
              this.cvSplitRange = JSON.parse(processConditions.processInputs.find(m => m.name === "CV Split Range").value)
            }

            if (JSON.parse(processConditions.processInputs.find(m => m.name === "Motive Inlet Pressure Visible").value) == true) {

              this.motiveInletPressureAvailable = true;
              this.motiveinletpressure.setValue(processConditions.processInputs.find(m => m.name === "Motive Inlet Pressure").value)
            }

            this.noiseLimit_Enumeration.setValue(processConditions.processInputs.find(m => m.name === "Noise Limit").value);

          }

        }

        // load sizing result
        if (this.loadedJobSizingData.sizingOutput.outputGrid.outputGridRows.length > 0) {

          this.isEasiHeatSizingDone = true;

          this.ehOutputData = new Array<EasiheatOutput>();

          var row = new EasiheatOutput();

          for (let model of this.loadedJobSizingData.sizingOutput.outputGrid.outputGridRows) {
            row.modelSizingMessages = model.messages;
            row.unitModel = model.outputItems.find(m => m.name === "EasiHeat Unit").value;
            row.trimType = model.outputItems.find(m => m.name === "Trim Type").value;
            row.length = model.outputItems.find(m => m.name === "Length").value;
            row.height = model.outputItems.find(m => m.name === "Height").value;
            row.width = model.outputItems.find(m => m.name === "Width").value;
            row.weight = model.outputItems.find(m => m.name === "Weight").value;
            //row.inletSize = model.outputItems.find(m => m.name === "Package Inlet Connection Size").value;
            row.cvSize = model.outputItems.find(m => m.name === "Control Valve Size").value;
            //row.condensatePipeSize = model.outputItems.find(m => m.name === "Condensate Pipe Size").value;
            //row.inletOutletPipeSize = model.outputItems.find(m => m.name === "Secondary Inlet and Outlet Pipe Size").value;
            row.heatExchangerPlateType = model.outputItems.find(m => m.name === "Heat Exchange Plate Type").value;
            row.secondaryPressureDrop = +model.outputItems.find(m => m.name === "Actual Secondary Pressure Drop").value;
            row.numberOfPlates = +model.outputItems.find(m => m.name === "Number Of Plates").value;

            var type;
            var typeForGasket;
            if (this.ApplicationType == "DHW" || this.ApplicationType == "HTGSC") {
              type = "DHW_HTGSC";
            }
            else {
              type = this.ApplicationType;
            }
            let modelDetails = this.hashTable.find(m => m.name === type);

            if (type == "DHW_HTGSC") {
              this.condensate_Removal_Name = modelDetails.condensate_Removal;
            }
            this.actuator_Name = modelDetails.actuator;
            this.high_Limit_Options_Name = modelDetails.high_Limit;
            this.high_Limit_Actuation_Name = modelDetails.high_Limit_Actuation;
            this.design_Code_Name = modelDetails.design_Code;
            this.control_System_Name = modelDetails.control_System;
            this.isolation_Name = modelDetails.isolation;
            this.remote_Access_Name = modelDetails.remote_Access;
            this.communications_Name = modelDetails.communications;
            this.energy_Monitoring_Name = modelDetails.energy_Monitoring;
            this.jacking_Wheels_Name = modelDetails.jacking_Wheels;
            this.en12828_Compliant_Name = modelDetails.en12828_compliant;


            //Gasket in HTG_SC is actually using same list as HTGCC
            if (this.ApplicationType == "DHW") {
              typeForGasket = "DHW_HTGSC";
            }
            else {
              typeForGasket = "HTGCC";
            }
            let modelDetailsGasket = this.hashTable.find(m => m.name === typeForGasket);
            this.gasket_Name = modelDetailsGasket.gasket;

            this.ehOutputData.push(row);
            row = new EasiheatOutput();
            this.populateResult(this.ehOutputData[0])



          }

          let outputItems = this.loadedJobSizingData.sizingOutput.outputItems;

          // Localize display values.
          //this.localizeEHOutputData();

          // load saved options and price
          // this.sizingModuleForm.controls["design_Code_Enumeration"].setValue(test);

          //if (!this.remote_Access_Enum.enumerationCollection.find(r => r.value == "N")) {
          //if (outputItems.find(m => m.name === this.remote_Access_Name).value == "N") {
          //  this.isNone = false;
          // this.remote_Access_Enum.enumerationCollection.push({ masterTextKey: "NONE", defaultText: "None", value: "N", extraPostText: null, isDeleted: false, sequence: 0, translationText: "None" });
          //}
          //}


          if (type == "DHW_HTGSC") {
            this.condensate_Removal_Enumeration.setValue(outputItems.find(m => m.name === this.condensate_Removal_Name).value)
          }
          this.actuator_Enumeration.setValue(outputItems.find(m => m.name === this.actuator_Name).value);
          this.high_Limit_Options_Enumeration.setValue(outputItems.find(m => m.name === this.high_Limit_Options_Name).value);
          this.high_Limit_Actuation_Enumeration.setValue(outputItems.find(m => m.name === this.high_Limit_Actuation_Name).value);
          this.design_Code_Enumeration.setValue(outputItems.find(m => m.name === this.design_Code_Name).value);
          this.control_System_Enumeration.setValue(outputItems.find(m => m.name === this.control_System_Name).value);
          this.gasket_Enumeration.setValue(outputItems.find(m => m.name === this.gasket_Name).value);
          this.isolation_Enumeration.setValue(outputItems.find(m => m.name === this.isolation_Name).value);
          this.remote_Access_Enumeration.setValue(outputItems.find(m => m.name === this.remote_Access_Name).value);
          this.communications_Enumeration.setValue(outputItems.find(m => m.name === this.communications_Name).value);
          this.energy_Monitoring_Enumeration.setValue(outputItems.find(m => m.name === this.energy_Monitoring_Name).value);
          this.jacking_Wheels_Enumeration.setValue(outputItems.find(m => m.name === this.jacking_Wheels_Name).value);
          this.en12828_Compliant_Enumeration.setValue(outputItems.find(m => m.name === this.en12828_Compliant_Name).value);

          this.sellingCurrencySymbol = outputItems.find(m => m.name === "SellingCurrencySymbol").value;

          this.ehPricingOutputData.inletSize = outputItems.find(m => m.name === "InletSize").value;
          this.ehPricingOutputData.condensatePipeSize = outputItems.find(m => m.name === "CondensateSize").value;
          this.ehPricingOutputData.inletOutletPipeSize = outputItems.find(m => m.name === "InletOutletSize").value;

          this.ehPricingOutputData.inletSizeAnsi = outputItems.find(m => m.name === "InletSizeAnsi").value;
          this.ehPricingOutputData.condensatePipeSizeAnsi = outputItems.find(m => m.name === "CondensateSizeAnsi").value;
          this.ehPricingOutputData.inletOutletPipeSizeAnsi = outputItems.find(m => m.name === "InletOutletSizeAnsi").value;

          if (this.design_Code_Enumeration.value == 'A') {
            this.packInletConnSize.setValue(this.ehPricingOutputData.inletSizeAnsi);
            this.condensatePipeSize.setValue(this.ehPricingOutputData.condensatePipeSizeAnsi);
            this.secondaryInAndOutPipeSize.setValue(this.ehPricingOutputData.inletOutletPipeSizeAnsi);
          }
          else {
            this.packInletConnSize.setValue(this.ehPricingOutputData.inletSize);
            this.condensatePipeSize.setValue(this.ehPricingOutputData.condensatePipeSize);
            this.secondaryInAndOutPipeSize.setValue(this.ehPricingOutputData.inletOutletPipeSize);
          }

          this.packInletConnSize.setValue(outputItems.find(m => m.name === "InletSize").value)

          this.internal_SSP = +outputItems.find(m => m.name === "SSP").value;
          this.internal_SellingPrice = +outputItems.find(m => m.name === "Selling Price").value;
          this.internal_ServiceOfferingPrice = +outputItems.find(m => m.name === "Service Offering Price").value;
          this.deliveryCost = +outputItems.find(m => m.name === "Delivery Cost").value;
          this.internal_TotalPrice = +outputItems.find(m => m.name === "Total Price").value;
          this.unit_and_eh_internal_SSP = +outputItems.find(m => m.name === "Unit And Heat Exchanger Internal SSP").value;
          this.unit_and_eh_internal_SellingPrice = +outputItems.find(m => m.name === "Unit And Heat Exchanger Internal Selling Price").value;

          this.display_SSP = this.localizeValue(this.internal_SSP, 0);
          this.display_SellingPrice = parseInt(this.localizeValue(this.internal_SellingPrice, 0).replace(",", ""));
          this.display_ServiceOfferingPrice = this.localizeValue(this.internal_ServiceOfferingPrice, 0);
          this.display_DeliveryPrice = this.localizeValue(this.deliveryCost, 0);
          this.display_TotalPrice = this.localizeValue(this.internal_TotalPrice, 0);


          this.serviceOfferingKey = outputItems.find(m => m.name === "Service Offering Label").value;
          this.serviceOfferingOptionsFormControl.setValue(outputItems.find(m => m.name === "Service Offering Enumeration").value);
          this.service_Offering_Name = outputItems.find(m => m.name === "Service Offering Name").value;

          this.sellingMarkupFormControl.setValue(outputItems.find(m => m.name === "Selling Markup").value);
          this.grossMarginFormControl.setValue(outputItems.find(m => m.name === "Gross Margin").value);
          this.sizingModuleForm.controls["serviceOfferingFormControl"].setValue(outputItems.find(m => m.name === "Service Offering Enumeration").value);

          this.sellingMarkupUpdated = <boolean>JSON.parse(outputItems.find(m => m.name === "SellingMarkupUpdated").value);
          this.grossMarginUpdated = <boolean>JSON.parse(outputItems.find(m => m.name === "GrossMarginUpdated").value);

          this.nomenclature = outputItems.find(m => m.name === "Nomenclature").value;
          this.nomenclatureFormControl.setValue(!!this.nomenclature ? this.nomenclature : '-');


          // load spec sheet header details
          this.isSpecSheetEnabled = <boolean>JSON.parse(outputItems.find(m => m.name === "IsSpecSheetEnabled").value);

          if (outputItems.find(m => m.name === "Sheet") != null) {
            this.sheet.setValue(outputItems.find(m => m.name === "Sheet").value);
          }

          if (outputItems.find(m => m.name === "Revision No") != null) {
            this.revisionNumber.setValue(outputItems.find(m => m.name === "Revision No").value);
          }

          if (outputItems.find(m => m.name === "Project Type") != null) {
            this.projectType.setValue(outputItems.find(m => m.name === "Project Type").value);
          }

          if (outputItems.find(m => m.name === "Quantity") != null) {
            this.quantity.setValue(outputItems.find(m => m.name === "Quantity").value);
          }

          if (outputItems.find(m => m.name === "AO Number") != null) {
            this.aoNumber.setValue(outputItems.find(m => m.name === "AO Number").value);
          }

          if (outputItems.find(m => m.name === "Order No") != null) {
            this.orderNumber.setValue(outputItems.find(m => m.name === "Order No").value);
          }

          if (outputItems.find(m => m.name === "Note 1") != null) {
            this.notes.setValue(outputItems.find(m => m.name === "Note 1").value);
          }

          if (outputItems.find(m => m.name === "Message 1") != null) {
            for (var i = 0; i < 5; i++) {
              if (outputItems.find(m => m.name === "Message " + i) != null) {

                let msg = outputItems.find(m => m.name === "Message " + i).value;

                this.translatedMessagesList[i] = msg;

              } else {
                this.translatedMessagesList[i] = "-";

              }

            }
          }

          // Reset button status
          if (<boolean>JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "IsResetEnabled").value)) {
            this.sizingModuleForm.markAsDirty();
          }
        }

      } else {
        this.isEasiHeatSizingDone = false;
      }

      setTimeout(() => {
        this.isLoadingJob = false;
        this.isThisAJob = false;
      }, 200);

    } catch (err) {
      console.log(`LoadJob() failed err=${err}`);
      this.showJobLoadError();
      this.isLoadingJob = false;
    }
  }


  showJobLoadError() {

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

  validateQuotaion(quotationLastUpdated: Date) {

    var quoteDaysOld = this.calculateDiff(quotationLastUpdated);
    if (quoteDaysOld > 30) {
      this.quoteExpired = true;
      // this.showQuotationExpiredWarning(quoteDaysOld); // ToDo: Quote expiry strategy TBD. see Chris Rowlands and SVM.
    }
    else {
      this.quoteExpired = false;
    }

    this.setQuotationValidationMessage(quotationLastUpdated);
  }

  setQuotationValidationMessage(quotationLastUpdated: Date) {

    var quoteDaysOld = this.calculateDiff(quotationLastUpdated);

    if (quoteDaysOld > 30) {
      this.quoteExpired = true;
      let trans_MessageText = this.translatePipe.transform('PRICE_INVALID_GREATER_THAN_30DAY_MESSAGE');
      let trans_DaysOld = this.translatePipe.transform('DAYS_OLD');

      let trans_Message = trans_MessageText + '\n\n' + quoteDaysOld + ' ' + trans_DaysOld;

      this.priceValidityMessage = trans_Message
    }
    else {
      this.priceValidityMessage = this.translatePipe.transform('PRICE_VALIDITY_RESTRICTIONS_MESSAGE');
      this.quoteExpired = false;
    }
  }

  calculateDiff(sourceDate1: Date, date2: Date = new Date()) {

    const oneday = 24 * 60 * 60 * 1000;

    var date1 = Date.parse(sourceDate1.toString());
    var diffDays = Math.round(Math.abs((Number(date2) - Number(date1)) / oneday));
    return diffDays;
  }

  showQuotationExpiredWarning(quoteDaysOld: number) {

    let trans_Title = this.translatePipe.transform('PRICE_INVALID_GREATER_THAN_30DAY_TITLE');
    let trans_MessageText1 = this.translatePipe.transform('PRICE_INVALID_GREATER_THAN_30DAY_MESSAGE');
    let trans_MessageText2 = this.translatePipe.transform('PRICE_LOADED_JOB_COMPLIANCE_MESSAGE');
    let trans_DaysOld = this.translatePipe.transform('DAYS_OLD');

    let trans_Message = trans_MessageText1 + ' ' + quoteDaysOld + ' ' + trans_DaysOld + '\n\n' + trans_MessageText2;

    swal({
      closeOnClickOutside: false, closeOnEsc: false,
      title: trans_Title,
      text: trans_Message,
      icon: "warning",
      dangerMode: false,
      //buttons: ['Ok', 'Cancel']
    }).then((okbuttoncClicked?: boolean) => {

      console.info("Ok clicked...");

      // The parameter can also enter as null
      const returnVal = !(okbuttoncClicked === null);

    }); // end of swal
  }

  populateResult(data: EasiheatOutput) {

    this.isSpecSheetEnabled = true;
    //Selected EasiHeat Unit panel
    this.easiHeatUnit.setValue(data.unitModel);
    this.trimType.setValue(data.trimType);

    //Estimated unit size -- this section might be decided to be removed later on.
    this.length.setValue(data.length);
    this.height.setValue(data.height);
    this.width.setValue(data.width);
    this.weight.setValue(data.weight);

    //Left Column
    if (this.design_Code_Enumeration.value == 'A') {
      //      this.packInletConnSize.setValue(data.inletSizeAnsi);
      this.controlValveSize.setValue(data.cvSizeAnsi);
      //      this.condensatePipeSize.setValue(data.condensatePipeSizeAnsi);
      //      this.secondaryInAndOutPipeSize.setValue(data.inletOutletPipeSizeAnsi);
    }
    else {
      //      this.packInletConnSize.setValue(data.inletSize);
      this.controlValveSize.setValue(data.cvSize);
      //      this.condensatePipeSize.setValue(data.condensatePipeSize);
      //      this.secondaryInAndOutPipeSize.setValue(data.inletOutletPipeSize);
    }

    //Right Column
    this.heatExchangePlateType.setValue(data.heatExchangerPlateType);
    this.convertMaxPressureDropToDefaultValueInPageUnits("pressureDrop", data.secondaryPressureDrop.toPrecision(4));
    this.numberOfPlates.setValue(data.numberOfPlates);
    this.convertTemperatureToDefaultValueInPageUnits("maxCondensateTemp", 95);
    this.sizedCondensateRemoval = data.condensateRemoval;
    this.condensate_Removal_Enumeration.setValue(this.sizedCondensateRemoval == "PTHC" ? "PT" : this.sizedCondensateRemoval);

    //Pricing Options panel
    this.sellingCurrencySymbol = this.sellingCurrency.symbol;
    this.unit_and_eh_internal_SSP = data.unitPrice + data.hePrice;
    this.display_SSP = this.localizeValue(this.unit_and_eh_internal_SSP, 0);

    this.unit_and_eh_internal_SellingPrice = this.unit_and_eh_internal_SSP * this.sellingMarkup;
    this.sellingMarkupFormControl.setValue(this.sellingMarkup);
    this.display_DeliveryPrice = this.localizeValue(this.deliveryCost, 0);

    this.isEnergyMonitoringSizable = true;
    this.isEnergyMonitoringSizable = data.energyMonitoringAvailable;
  }

  /*
  * Method to calculate easiheat sizing.
  */
  //onCalculateSizing(formGroup: FormGroup) {
  onCalculateSizing() {

    if (this.isCalculating == false) {
      this.isCalculating = true;
      console.info("Calculating Easiheat!");


      this.isSizing = true;

      this.disableUiInputs();

      this.debugData = ""; // I've checked and on my opinion there is no point of having this entirly but talk to Cedric first
      this.debugDataEnabled = false; // as above

      //this.resetResults(); // i will have to work on this one at some point

      //this.resetLoadingJobStatus(); // i will have to work on this one at some point

      //reset previous sizing result
      this.ehOutputData = new Array<EasiheatOutput>();

      //User Settings / Credentials
      this.ehSizingDataInput.UserId = this.user.userId;
      this.ehSizingDataInput.UserName = this.user.username;
      this.ehSizingDataInput.UserCountry = this.user.operatingCompanyId; ////TODO UserCountry not used in sizing remove from model in later date
      this.ehSizingDataInput.UserOperatorType = "-", ////TODO UseOperatorType not used in sizing remove from model in later date
        this.ehSizingDataInput.UserSellingCurrency = this.userSellingCurrencyId;
      this.ehSizingDataInput.UserManufacturerCurrency = this.manufacturerCurrencyId;
      this.ehSizingDataInput.Manufacturer = this.manufacturerId;
      this.ehSizingDataInput.ManufacturingCurrencyConversionRate = 1.0; ////TODO ManufacturingCurrencyConversionRate not used in sizing remove from model in later date

      //ApplicationType
      this.ehSizingDataInput.ApplicationType = this.ApplicationType;

      // DHW and HTG Shared Primary Process Conditions Input Fields
      this.ehSizingDataInput.InletPressure = +this.inletpressure.value;
      this.ehSizingDataInput.BackPressure = +this.totalbackpressure.value;
      this.ehSizingDataInput.CvSplitRange = this.cvSplitRange;

      //Specific Primary Process Conditions Input Fields for DHW
      this.ehSizingDataInput.NoiseLimit = +this.noiseLimit_Enumeration.value;
      this.ehSizingDataInput.MotivePressureAvailable = this.motiveInletPressureEntered;
      this.ehSizingDataInput.MotivePressure = this.motiveinletpressure.value == "" ? 0 : this.motiveinletpressure.value;

      //Specific Primary Process Conditions Input Fields for HTG
      this.ehSizingDataInput.Prv = this.inputPRV;
      this.ehSizingDataInput.PrvVisible = this.prvAllowed;
      this.ehSizingDataInput.PrvInletPressure = this.packageinletpressure.value == "" ? 0 : this.packageinletpressure.value == null ? 0 : this.packageinletpressure.value;

      //Secondary Side (Water) --> same for both Units DHW & HTG
      this.ehSizingDataInput.InletTemperature = +this.inlettemperature.value;
      this.ehSizingDataInput.OutletTemperature = +this.outlettemperature.value;
      this.ehSizingDataInput.WaterFlowRate = +this.waterflowrate.value;
      this.ehSizingDataInput.HeLoad = +this.load.value;
      this.ehSizingDataInput.MaxPressureDrop = +this.maxPressureDrop_Enumeration.value;

      //Measuring Units Details
      this.ehSizingDataInput.InletPressureUnit = +(this.pressureRef.preference.value);
      this.ehSizingDataInput.TemperatureUnit = +(this.temperatureRef.preference.value);
      this.ehSizingDataInput.FlowRateUnit = +(this.volumetricFlowRef.preference.value);
      this.ehSizingDataInput.HeLoadUnit = +(this.loadRef.preference.value);
      this.ehSizingDataInput.NoiseLimitUnit = 65; //--> Rafal fake value as there is no Unit value in table Units for Noise (dBA) I suggest remove that from the class at the back end and the at the front end.
      this.ehSizingDataInput.MaxPressureDropUnit = this.maximum_Pressure_Drop_Unit == 'PSI' ? 45 : 39; //this.actSecPressDropUnit == 'A' ? 71 : 39; //71 is psi and 39 is kpa

      //Options
      this.ehSizingDataInput.HeOverriddenP251Markup = this.heOverridenP251Markup;
      this.ehSizingDataInput.HeOverriddenP251MarkupValue = this.heOverridenP251MarkupValue;
      this.ehSizingDataInput.HeTs6Discount = this.heTS6Discount;
      this.ehSizingDataInput.HeM6Discount = this.hem6Discount;
      this.ehSizingDataInput.HeM10Discount = this.hem10Discount;

      this.ehSizingDataInput.HeT6PDiscount = this.het6pDiscount;
      this.ehSizingDataInput.HeT8MDiscount = this.het8mDiscount;
      this.ehSizingDataInput.HeT10MDiscount = this.het10mDiscount;

      this.ehSizingDataInput.SellingCurrencyConversionRate = this.currencyConversion;
      this.ehSizingDataInput.EnergyMonitoringVisible = true;
      //      this.ehSizingDataInput.EnergyMonitoringVisible = this.isEnergyMonitoringEnabled; - KNG - changed as old system didn't seem to ever set this to false
      this.ehSizingDataInput.EnergyMonitoringEnabled = isNull(this.energy_Monitoring_Enumeration.value) ? this.energyMonitoringDefaultDHW : this.energy_Monitoring_Enumeration.value == "E" ? true : false;
      this.ehSizingDataInput.ServiceOffering = this.service_Offering_Enumeration.value == null ? "" : this.service_Offering_Enumeration.value;
      this.ehSizingDataInput.DesignCode = this.design_Code_Enumeration.value == "" ? this.design_Code_Initial_Value : this.design_Code_Enumeration.value;
      this.ehSizingDataInput.CondensateRemoval = this.condensate_Removal_Enumeration.value != null && this.calcTriggerListChanged ? this.condensate_Removal_Enumeration.value : "";// ST-steam trap PT-pumptrap  PTHC-pump trap high capacity
      this.ehSizingDataInput.UserCondensateSet = this.userCondensate;

      this.ehSizingDataInput.CompulsaryNomenclature = this.ehUnitName.concat(this.design_Code_Enumeration.value == "" ? this.design_Code_Initial_Value : this.design_Code_Enumeration.value).concat(this.actuator_Enumeration.value == "" || isNull(this.actuator_Enumeration.value) ? this.actuator_Initial_Value : this.actuator_Enumeration.value);

      // The Gasket code might be a value that is not accepted by the alfa laval DLL. Correct this before sizing.
      this.setGasketCode(this.gasket_Value_Default_Text)
      this.ehSizingDataInput.GasketCode = this.gasket_Value_Default_Text;

      this.ehSizingDataInput.MechanicalNomenclature = "";
      this.ehSizingDataInput.OptionalNomenclature = "";
      this.ehSizingDataInput.PanelNomenclature = "";

      this.EasiheatService.sizeEasiheat(this.ehSizingDataInput).subscribe((easiHeatOutputData: EasiheatOutput) => {
        this.isCalculating = true;
        //check for easiheat ranges
        if (easiHeatOutputData == null) {
          return;
        }

        let sizingMessages = easiHeatOutputData.modelSizingMessages;
        let messageIndex = 0;

        if (easiHeatOutputData.unitModel == null || easiHeatOutputData.unitModel == "") {

          this.enableUiInputs();

          // In case more than one message comes back, make sure the first message of severity "error" is the one displayed
          sizingMessages.forEach((message, index) => {
            if (message.severity == 2) {
              messageIndex = index;
            }
          })

          let transUnableToSize = this.translatePipe.transform(sizingMessages[messageIndex].messageKey, false);
          let transError = this.translatePipe.transform('ERROR', false);
          swal({
            closeOnClickOutside: false, closeOnEsc: false,
            title: transError,//"Error",
            text: transUnableToSize,
            icon: "error",
            dangerMode: true,
            //buttons: ['Ok', 'Cancel']
          }).then((okbuttoncClicked?: boolean) => {

            console.info("Ok clicked...");
            this.isCalculating = false;
            this.isSizing = false;
            this.condensate_Removal_Enumeration.reset();
            this.calcTriggerListChanged = false;
            this.userCondensate = false;
            this.sizingModuleForm.markAsPristine();
            this.sizingModuleForm.markAsUntouched();

            // The parameter can also enter as null
            const returnVal = !(okbuttoncClicked === null);

          });

          return;
        }

        this.ehOutputData = new Array<EasiheatOutput>();

        this.ehOutputData.push(easiHeatOutputData);

        if (this.isEasiHeatReSizingDone) {
          this.isEasiHeatReSizingDone = false;
          this.maxPressureDrop_Enumeration.setValue(this.maxPressureDrop_Enumeration.value)
        }

        try {
          // Changed name of the flag as it handles more than just condensate control changes now - KNG
          if (!this.calcTriggerListChanged) {
            this.setupDefaultOptionsForSizingSelection(this.ApplicationType);
          }
        }
        finally {
          this.populateResult(this.ehOutputData[0])
          this.calcTriggerListChanged = false;
        }

        this.enableUiInputs();
        this.isEasiHeatSizingDone = true;
        this.isCalculating = false;

        setTimeout(() => {
          this.calculatePrice();
          //Bug 3910 - tbc
          //if (!this.remote_Access_Enum.enumerationCollection.find(r => r.value == "N")) {
          //  this.isNone = false;
          //} else {
          //  this.isNone = true;
          //}

          //if (!this.communications_Enum.enumerationCollection.find(r => r.value == "N")) {
          //  this.isCommNone = false;
          //} else {
          //  this.isCommNone = true;
          //}

          if (this.ehOutputData.length > 0) {
            // Calculated
            this.jobStatusId = 3//2;
          } else {
            // Input
            this.jobStatusId = 1;
          }
          //if (this.gridSelectedRow) {
          //  // Selected
          //  this.jobStatusId = 3;
          //}

          this.sizingModuleForm.markAsDirty();
          this.sizingModuleForm.markAsTouched();

        }, 150);

        // Localize display values.
        //this.localizeEHOutputData();
      });



      this.moduleId = 5;
      this.productName = "Easiheat";

      this.sizingModuleForm.markAsPristine();
      this.sizingModuleForm.markAsTouched();
    }

  }

  setupDefaultOptionsForSizingSelection(applicationType: string) {

    var type = "";
    if (applicationType == "DHW" || applicationType == "HTGSC") {
      type = "DHW_HTGSC";
    }
    else {
      type = applicationType;
    }

    // We need the selected row to get the Model type and associated list names. List names not yet set up on first sizing.
    this.actuator_Name = this.hashTable.find(m => m.name === type).actuator;
    this.design_Code_Name = this.hashTable.find(m => m.name === type).design_Code;
    this.high_Limit_Options_Name = this.hashTable.find(m => m.name === type).high_Limit;
    this.high_Limit_Actuation_Name = this.hashTable.find(m => m.name === type).high_Limit_Actuation;
    this.control_System_Name = this.hashTable.find(m => m.name === type).control_System;
    this.service_Offering_Name = this.hashTable.find(m => m.name === type).service_Offering;
    this.isolation_Name = this.hashTable.find(m => m.name === type).isolation;
    this.remote_Access_Name = this.hashTable.find(m => m.name === type).remote_Access;
    this.communications_Name = this.hashTable.find(m => m.name === type).communications;
    this.energy_Monitoring_Name = this.hashTable.find(m => m.name === type).energy_Monitoring;
    this.jacking_Wheels_Name = this.hashTable.find(m => m.name === type).jacking_Wheels;
    this.en12828_Compliant_Name = this.hashTable.find(m => m.name === type).en12828_compliant;

    this.isIsolationEnabled = true;

    // For a 2 or 3 size EHHCC unit and PRV is selected, disable Isolation and set to none.
    if ((this.ehOutputData[0].unitModel == "EHHCC2" || this.ehOutputData[0].unitModel == "EHHCC3") && (this.inputPRV)) {
      this.isIsolationEnabled = false;
      this.isolation_Enumeration.setValue("N")
    }
    else if (this.ApplicationType == "HTGCC" && (!this.inputPRV)) {
      this.isolation_Enumeration.reset();
    }

    if (type == "DHW_HTGSC" && !this.userCondensate) {
      this.condensate_Removal_Name = this.hashTable.find(m => m.name === type).condensate_Removal;

      var condensate_Removal_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === this.condensate_Removal_Name)[0];
      if (!!condensate_Removal_Enumeration_Items && !!condensate_Removal_Enumeration_Items.enumerationDefinitions && condensate_Removal_Enumeration_Items.enumerationDefinitions.length > 0) {
        // Set Actuator
        this.condensate_Removal_Enumeration.setValue(condensate_Removal_Enumeration_Items.enumerationDefinitions[0].value);// Set default to first item
      }
    }

    if (this.dhw) {
      this.gasket_Name = this.hashTable.find(m => m.name === "DHW_HTGSC").gasket;
    }
    else {
      this.gasket_Name = this.hashTable.find(m => m.name === "HTGCC").gasket;
    }

    if (!this.isEasiHeatSizingDone) {
      this.gasket_Enumeration.reset();
    }

    //var actuator_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === true && mp.enumerationName === this.actuator_Name)[0];
    //if (!!actuator_Enumeration_Items && !!actuator_Enumeration_Items.enumerationDefinitions && actuator_Enumeration_Items.enumerationDefinitions.length > 0) {
    //  // Set Actuator
    //  this.actuator_Enumeration.setValue(actuator_Enumeration_Items.enumerationDefinitions[0].value);// Set default to first item
    //}

    //var high_Limit_Options_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === this.high_Limit_Options_Name)[0];
    //if (!!high_Limit_Options_Enumeration_Items && !!high_Limit_Options_Enumeration_Items.enumerationDefinitions && high_Limit_Options_Enumeration_Items.enumerationDefinitions.length > 0) {
    //  // Set Limit Options
    //  this.high_Limit_Options_Enumeration.setValue(high_Limit_Options_Enumeration_Items.enumerationDefinitions[0].value);// Set default to first item
    //}

    //var high_Limit_Actuation_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === this.high_Limit_Actuation_Name)[0];
    //if (!!high_Limit_Actuation_Enumeration_Items && !!high_Limit_Actuation_Enumeration_Items.enumerationDefinitions && high_Limit_Actuation_Enumeration_Items.enumerationDefinitions.length > 0) {
    //  // Set Limit Actuation
    //  this.high_Limit_Actuation_Enumeration.setValue(high_Limit_Actuation_Enumeration_Items.enumerationDefinitions[0].value);// Set default to first item
    //}

    //if (!this.designCodeChanged) {
    //  var design_Code_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === true && mp.enumerationName === this.design_Code_Name)[0];
    //  if (!!design_Code_Enumeration_Items && !!design_Code_Enumeration_Items.enumerationDefinitions && design_Code_Enumeration_Items.enumerationDefinitions.length > 0) {
    //    // Set Design Code
    //    this.design_Code_Enumeration.setValue(design_Code_Enumeration_Items.enumerationDefinitions[0].value);// Set default to first item
    //  }
    //}
    //if (isNull(this.design_Code_Enumeration.value)) {
    //  this.design_Code_Enumeration.setValue(this.lastSelectedDesignCode)
    //}
    //if (this.lastSelectedDesignCode == "A") {
    //  this.maxPressureDrop_Enumeration.setValue("4");
    //}


    //var control_System_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === this.control_System_Name)[0];
    //if (!!control_System_Enumeration_Items && !!control_System_Enumeration_Items.enumerationDefinitions && control_System_Enumeration_Items.enumerationDefinitions.length > 0) {
    //  // Set Gasket
    //  this.control_System_Enumeration.setValue(control_System_Enumeration_Items.enumerationDefinitions[0].value);// Set default to first item
    //}

    //var gasket_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === this.gasket_Name)[0];
    //if (!!gasket_Enumeration_Items && !!gasket_Enumeration_Items.enumerationDefinitions && gasket_Enumeration_Items.enumerationDefinitions.length > 0) {
    //  // Set Gasket
    //  this.gasket_Enumeration.setValue(gasket_Enumeration_Items.enumerationDefinitions[0].value);// Set default to first item
    //}

    //var service_Offering_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === this.service_Offering_Name)[0];
    //if (!!service_Offering_Enumeration_Items && !!service_Offering_Enumeration_Items.enumerationDefinitions && service_Offering_Enumeration_Items.enumerationDefinitions.length > 0) {
    //  // Set Service Offering
    //  this.service_Offering_Enumeration.setValue(service_Offering_Enumeration_Items.enumerationDefinitions[0].value);// Set default to first item
    //}

    //var isolation_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === this.isolation_Name)[0];
    //if (!!isolation_Enumeration_Items && !!isolation_Enumeration_Items.enumerationDefinitions && isolation_Enumeration_Items.enumerationDefinitions.length > 0) {
    //  // Set Isolation
    //  this.isolation_Enumeration.setValue(isolation_Enumeration_Items.enumerationDefinitions[0].value);// Set default to first item
    //}

    //var remote_Access_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === this.remote_Access_Name)[0];
    //if (!!remote_Access_Enumeration_Items && !!remote_Access_Enumeration_Items.enumerationDefinitions && remote_Access_Enumeration_Items.enumerationDefinitions.length > 0) {
    //  // Set Remote Access
    //  this.remote_Access_Enumeration.setValue(remote_Access_Enumeration_Items.enumerationDefinitions[0].value);// Set default to first item
    //}

    //var communications_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === this.communications_Name)[0];
    //if (!!communications_Enumeration_Items && !!communications_Enumeration_Items.enumerationDefinitions && communications_Enumeration_Items.enumerationDefinitions.length > 0) {
    //  // Set Communications
    //  this.communications_Enumeration.setValue(communications_Enumeration_Items.enumerationDefinitions[0].value);// Set default to first item
    //}

    var energy_Monitoring_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === this.energy_Monitoring_Name)[0];
    if (!!energy_Monitoring_Enumeration_Items && !!energy_Monitoring_Enumeration_Items.enumerationDefinitions && energy_Monitoring_Enumeration_Items.enumerationDefinitions.length > 0) {
      // Set Communications
      if (type == "DHW_HTGSC") {
        var x = this.energyMonitoringDefaultDHW ? 1 : 0;
      } else {
        var x = this.energyMonitoringDefaultHTG ? 1 : 0;
      }

      this.energy_Monitoring_Enumeration.setValue(energy_Monitoring_Enumeration_Items.enumerationDefinitions[x].value);// Set default to first item
    }

    var jacking_Wheels_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === this.jacking_Wheels_Name)[0];
    if (!!jacking_Wheels_Enumeration_Items && !!jacking_Wheels_Enumeration_Items.enumerationDefinitions && jacking_Wheels_Enumeration_Items.enumerationDefinitions.length > 0) {
      // Set Communications
      if (type == "DHW_HTGSC") {
        var x = this.jackingWheelsDefaultDHW ? 1 : 0;
      } else {
        var x = this.jackingWheelsDefaultHTG ? 1 : 0;
      }

      this.jacking_Wheels_Enumeration.setValue(jacking_Wheels_Enumeration_Items.enumerationDefinitions[x].value);// Set default to first item
    }

    var en12828_Compliant_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === this.en12828_Compliant_Name)[0];
    if (!!en12828_Compliant_Enumeration_Items && !!en12828_Compliant_Enumeration_Items.enumerationDefinitions && en12828_Compliant_Enumeration_Items.enumerationDefinitions.length > 0) {
      // Set Communications
      if (type == "DHW_HTGSC") {
        var x = this.ENCompliantDefaultDHW ? 1 : 0;
      } else {
        var x = this.ENCompliantDefaultHTG ? 1 : 0;
      }

      this.en12828_Compliant_Enumeration.setValue(en12828_Compliant_Enumeration_Items.enumerationDefinitions[x].value);// Set default to first item
    }

  }



  /*
  * Validator for Inlet Pressure control input.
  */
  validateInletPressure(control: AbstractControl, unitRef, msgRefInput, msgRefBack) {


    console.log('ValidateInletPressure');

    // Reset error messages first.
    msgRefInput.value = '';
    msgRefBack.value = '';
    if (!isNullOrUndefined(control.value)) {
      if (control.value.toString() !== "") {
        // Add details into the validation model.
        var ehInputValidation: EasiheatInputValidation = new EasiheatInputValidation();

        //Rounds the inputted value to decimal places set in my preferences.
        var decimalPlaces = this.userPrefs.find(m => m.name === "PressureUnit").decimalPlaces;

        var tempInletPressure = parseFloat(control.value.toFixed(decimalPlaces));

        if (this.inletpressure.value != tempInletPressure) {
          this.inletpressure.setValue(tempInletPressure);
        }

        ehInputValidation.value = +control.value;
        ehInputValidation.units = +(unitRef !== null ? unitRef.preference.value : 0);

        if (this.ApplicationType != "DHW" && this.packageinletpressure.value != null && this.packageinletpressure.value != '') {
          if (control.value > this.packageinletpressure.value) {
            msgRefInput.value = this.translatePipe.transform("PRV_PRESSURE_MUST_EXCEED_THE_INLET_PRESSURE_MESSAGE", false)
            control.setErrors({ 'incorrect': true });
            return null;
          }
        }

        this.EasiheatService.inletPressureCheck(ehInputValidation, this.htgcc).subscribe((result: Array<EasiheatValidationMessage>) => {
          // Check if there's any validation errors? If so, set form control and error message accordingly.
          if (result && result.length > 0) {
            msgRefInput.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value + (unitRef !== null ? ' ' + this.translatePipe.transform(unitRef.preference.masterTextKey, false) : '') + ')';
            control.setErrors({ 'incorrect': true });
          }

        });

        if (!isNullOrUndefined(this.totalbackpressure.value)) {
          if (this.totalbackpressure.value.toString() != "") {
            var ehInputsValidation: EasiheatBackPressureValidation = new EasiheatBackPressureValidation();

            ehInputsValidation.LinePressure = +control.value;
            ehInputsValidation.BackPressure = +this.totalbackpressure.value;
            ehInputsValidation.EhUnitType = this.ApplicationType;
            ehInputsValidation.Units = +(unitRef !== null ? unitRef.preference.value : 0);

            this.EasiheatService.backPressureCheck(ehInputsValidation).subscribe((result: Array<EasiheatValidationMessage>) => {
              // Check if cross validation errors returned?
              if (result && result.length > 0) {
                msgRefBack.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value + (this.pressureRef !== null ? ' ' + this.translatePipe.transform(this.pressureRef.preference.masterTextKey, false) : '') + ')';
                this.sizingModuleForm.controls['totalbackpressure'].setErrors({ 'incorrect': true });
              } else {
                this.sizingModuleForm.controls['totalbackpressure'].reset;
                this.totalbackpressure.setValue(this.totalbackpressure.value);
              }
            });
          }
        }

      }
    }

    // This is required for custo validator attached with form control.
    //return { customError: false }
    return null;
  }

  /*
 * Validator for BackPressure control input. Checks value against set boundaries and inletpressure value
 */
  validatePackageInletPressure(control: AbstractControl, unitRef, msgRef) {
    console.log('Validate Package Inlet Pressure');

    // Reset error messages first.
    msgRef.value = '';
    this.packageInletPressureErrorMessage.value = '';
    //msgRefBack.value = '';
    if (!isNullOrUndefined(control.value)) {
      if (control.value.toString() !== "") {
        // Add details into the validation model.
        var ehInputValidation: EasiheatInputValidation = new EasiheatInputValidation();

        //Rounds the inputted value to decimal places set in my preferences.
        var decimalPlaces = this.userPrefs.find(m => m.name === "PressureUnit").decimalPlaces;

        var tempInletPressure = parseFloat(control.value.toFixed(decimalPlaces));

        if (this.packageinletpressure.value != tempInletPressure) {
          this.packageinletpressure.setValue(tempInletPressure);
        }

        ehInputValidation.value = +control.value;
        ehInputValidation.units = +(unitRef !== null ? unitRef.preference.value : 0);

        if (control.value < this.inletpressure.value) {
          msgRef.value = this.translatePipe.transform("PRV_PRESSURE_MUST_EXCEED_THE_INLET_PRESSURE_MESSAGE", false)
          control.setErrors({ 'incorrect': true });
          return null;
        }

        this.EasiheatService.PRVInletPressureCheck(ehInputValidation).subscribe((result: Array<EasiheatValidationMessage>) => {
          // Check if there's any validation errors? If so, set form control and error message accordingly.
          if (result && result.length > 0) {
            this.packageInletPressureErrorMessage.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value + (unitRef !== null ? ' ' + this.translatePipe.transform(unitRef.preference.masterTextKey, false) : '') + ')';
            //msgRef.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value + (unitRef !== null ? ' ' + this.translatePipe.transform(unitRef.preference.masterTextKey, false) : '') + ')';
            control.setErrors({ 'incorrect': true });
          }

        });


        //this.EasiheatService.inletPressureCheck(ehInputValidation, this.htgcc).subscribe((result: Array<EasiheatValidationMessage>) => {
        //  // Check if there's any validation errors? If so, set form control and error message accordingly.
        //  if (result && result.length > 0) {
        //    msgRef.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value + (unitRef !== null ? ' ' + this.translatePipe.transform(unitRef.preference.masterTextKey, false) : '') + ')';
        //    control.setErrors({ 'incorrect': true });
        //  }

        //});

      }
    }

    // This is required for custo validator attached with form control.
    //return { customError: false }
    return null;
  }

  /*
  * Validator for BackPressure control input. Checks value against set boundaries and inletpressure value
  */
  validateTotalBackPressure(control: AbstractControl, unitRef, msgRefTBP, msgRefMIP) {
    console.log('ValidateTotalBackPressure');

    // 8.7.3	Pressure Differential Data Entry Note (NoteΔP)
    if (!isNullOrUndefined(this.inletpressure) && !isNullOrUndefined(this.totalbackpressure)) {
      if (!isNullOrUndefined(this.inletpressure.value) && !isNullOrUndefined(this.totalbackpressure.value)) {
        if (this.inletpressure.value.toString() != "" && this.totalbackpressure.value.toString() != "") {

          msgRefTBP.value = '';
          var ehInputsValidation: EasiheatBackPressureValidation = new EasiheatBackPressureValidation();

          var decimalPlaces = this.userPrefs.find(m => m.name === "PressureUnit").decimalPlaces;

          var tempBackPressure = parseFloat(control.value.toFixed(decimalPlaces));

          if (this.totalbackpressure.value != tempBackPressure) {
            this.totalbackpressure.setValue(tempBackPressure);
          }

          ehInputsValidation.LinePressure = +this.inletpressure.value;
          ehInputsValidation.BackPressure = +this.totalbackpressure.value;
          ehInputsValidation.EhUnitType = this.ApplicationType;
          ehInputsValidation.Units = +(unitRef !== null ? unitRef.preference.value : 0);

          this.EasiheatService.backPressureCheck(ehInputsValidation).subscribe((result: Array<EasiheatValidationMessage>) => {
            // Check if cross validation errors returned?
            if (result && result.length > 0) {
              msgRefTBP.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value + (this.pressureRef !== null ? ' ' + this.translatePipe.transform(this.pressureRef.preference.masterTextKey, false) : '') + ')';
              this.sizingModuleForm.controls['totalbackpressure'].setErrors({ 'incorrect': true });
            } else {
              this.sizingModuleForm.controls['totalbackpressure'].reset;
            }
          });

          if (this.motiveInletPressureAvailable) {

            if (this.motiveinletpressure.value.toString() != "") {

              msgRefMIP.value = "";
              var ehInputsValidation: EasiheatBackPressureValidation = new EasiheatBackPressureValidation();

              ehInputsValidation.LinePressure = +this.motiveinletpressure.value;
              ehInputsValidation.BackPressure = +control.value;
              ehInputsValidation.Units = +(unitRef !== null ? unitRef.preference.value : 0);

              this.EasiheatService.motiveInletPressureCheck(ehInputsValidation).subscribe((result: Array<EasiheatValidationMessage>) => {
                // Check if cross validation errors returned?
                if (result && result.length > 0) {
                  msgRefMIP.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value + (this.pressureRef !== null ? ' ' + this.translatePipe.transform(this.pressureRef.preference.masterTextKey, false) : '') + ')';
                  this.sizingModuleForm.controls['motiveinletpressure'].setErrors({ 'incorrect': true });
                } else {
                  this.sizingModuleForm.controls['motiveinletpressure'].reset;
                  this.motiveinletpressure.setValue(this.motiveinletpressure.value);
                }
              });
            }

          }

        }
      }
    }

    return null;
  }

  /*
  * Validator for Inlet Pressure control input.
  */
  validateMotiveInletPressure(control: AbstractControl, unitRef, msgRef) {
    console.log('ValidateMotiveInletPressure');
    // Reset results
    //this.resetResults();

    if (isNull(control.value)) {
      this.motiveinletpressure.setValue("");
      msgRef.value = "";
      control.setErrors({ 'incorrect': false });
      this.motiveInletPressureEntered = false;
    }
    else {

      if (control.value.toString() !== "") {

        // Reset error messages first.
        msgRef.value = '';

        // Add details into the validation model.
        var ehInputsValidation: EasiheatBackPressureValidation = new EasiheatBackPressureValidation();

        var decimalPlaces = this.userPrefs.find(m => m.name === "PressureUnit").decimalPlaces;

        var tempMotiveInletPressure = parseFloat(control.value.toFixed(decimalPlaces));

        if (this.motiveinletpressure.value != tempMotiveInletPressure) {
          this.motiveinletpressure.setValue(tempMotiveInletPressure);
        }

        this.motiveInletPressureEntered = true;
        ehInputsValidation.LinePressure = +control.value;
        ehInputsValidation.BackPressure = +this.totalbackpressure.value;
        ehInputsValidation.Units = +(unitRef !== null ? unitRef.preference.value : 0);

        this.EasiheatService.motiveInletPressureCheck(ehInputsValidation).subscribe((result: Array<EasiheatValidationMessage>) => {
          // Check if there's any validation errors? If so, set form control and error message accordingly.
          if (result && result.length > 0) {
            msgRef.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value + (unitRef !== null ? ' ' + this.translatePipe.transform(unitRef.preference.masterTextKey, false) : '') + ')';
            control.setErrors({ 'incorrect': true });
          }
        });
      }
    }

    // This is required for custo validator attached with form control.
    //return { customError: false }
    return null;
  }


  /*
  * Validator for Inlet Temperature control input.
  */
  validateInletTemperature(control: AbstractControl, unitRef, msgRef, diffTempMsgRef) {

    console.log('ValidateInletTemperature');

    // Reset results
    //this.resetResults();
    if (!isNullOrUndefined(control.value)) {
      if (control.value.toString() !== "") {
        // Reset error messages first.
        msgRef.value = '';

        // Add details into the validation model.
        var ehInputValidation: EasiheatInputValidation = new EasiheatInputValidation();

        var decimalPlaces = this.userPrefs.find(m => m.name === "TemperatureUnit").decimalPlaces;

        var tempInletTemp = parseFloat(control.value.toFixed(decimalPlaces));

        if (this.inlettemperature.value != tempInletTemp) {
          this.inlettemperature.setValue(tempInletTemp);
        }

        ehInputValidation.value = +control.value;
        ehInputValidation.units = +(unitRef !== null ? unitRef.preference.value : 0);

        this.EasiheatService.inletTemperatureCheck(ehInputValidation).subscribe((result: Array<EasiheatValidationMessage>) => {
          // Check if there's any validation errors? If so, set form control and error message accordingly.
          if (result && result.length > 0) {
            msgRef.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value.toFixed(2) + (unitRef !== null ? ' ' + this.translatePipe.transform(unitRef.preference.masterTextKey, false) : '') + ')';
            control.setErrors({ 'incorrect': true });
          }

          if (this.outlettemperature.value.toString() != "") {
            var ehInputsValidation: EasiheatDiffTempValidation = new EasiheatDiffTempValidation();

            ehInputsValidation.InletTemperature = +control.value;
            ehInputsValidation.OutletTemperature = +this.outlettemperature.value;
            ehInputsValidation.Units = +(unitRef.preference !== null ? unitRef.preference.value : 0);

            this.EasiheatService.differentialTempCheck(ehInputsValidation, this.dhw).subscribe((result: Array<EasiheatValidationMessage>) => {
              // Check if cross validation errors returned?
              if (result && result.length > 0) {
                diffTempMsgRef.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value.toFixed(2) + (unitRef !== null ? ' ' + this.translatePipe.transform(unitRef.preference.masterTextKey, false) : '') + ')';
                this.sizingModuleForm.setErrors({ 'incorrect': true });
              }
              else {
                diffTempMsgRef.value = "";
              }

            });
          }
        });
      }
    }
    // This return null is required for custo validator attached with form control.
    //return { customError: false }
    return null;
  }

  /*
  * Validator for Outlate Temperature control input.
  */
  validateOutletTemperature(control: AbstractControl, unitRef, msgRef, diffTempMsgRef) {

    console.log('ValidateOutletTemperature');
    // Reset results
    //this.resetResults();
    if (!isNullOrUndefined(control.value)) {
      if (control.value.toString() !== "") {
        // Reset error messages first.
        msgRef.value = '';

        // Add details into the validation model.
        var ehInputValidation: EasiheatInputValidation = new EasiheatInputValidation();

        var decimalPlaces = this.userPrefs.find(m => m.name === "TemperatureUnit").decimalPlaces;

        var tempOutletTemp = parseFloat(control.value.toFixed(decimalPlaces));

        if (this.outlettemperature.value != tempOutletTemp) {
          this.outlettemperature.setValue(tempOutletTemp);
        }

        ehInputValidation.value = +control.value;
        ehInputValidation.units = +(unitRef.preference !== null ? unitRef.preference.value : 0);

        this.EasiheatService.outletTemperatureCheck(ehInputValidation).subscribe((result: Array<EasiheatValidationMessage>) => {
          // Check if there's any validation errors? If so, set form control and error message accordingly.
          if (result && result.length > 0) {
            msgRef.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value.toFixed(2) + (unitRef !== null ? ' ' + this.translatePipe.transform(unitRef.preference.masterTextKey, false) : '') + ')';
            control.setErrors({ 'incorrect': true });
          }

          if (this.inlettemperature.value.toString() != "") {

            var ehInputsValidation: EasiheatDiffTempValidation = new EasiheatDiffTempValidation();

            ehInputsValidation.InletTemperature = +this.inlettemperature.value;
            ehInputsValidation.OutletTemperature = +control.value;
            ehInputsValidation.Units = +(unitRef !== null ? unitRef.preference.value : 0);
            this.EasiheatService.differentialTempCheck(ehInputsValidation, this.dhw).subscribe((result: Array<EasiheatValidationMessage>) => {
              // Check if cross validation errors returned?
              if (result && result.length > 0) {
                diffTempMsgRef.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value.toFixed(2) + (unitRef !== null ? ' ' + this.translatePipe.transform(unitRef.preference.masterTextKey, false) : '') + ')';
                this.sizingModuleForm.setErrors({ 'incorrect': true });
              }
              else {
                diffTempMsgRef.value = "";
              }

            });
          }
        });
      }
    }

    // This return null is required for custo validator attached with form control.
    //return { customError: false }
    return null;
  }

  /*
* Validator for Outlate Temperature control input.
*/
  validateWaterFlowRate(control: AbstractControl, flowUnitRef, tempUnitRef, msgRef) {
    console.log('ValidateWaterFlowRate');
    // Reset results
    //this.resetResults();
    if (!isNullOrUndefined(control.value)) {
      if (control.value.toString() !== "") {

        // Reset error messages first.
        msgRef.value = '';

        // Add details into the validation model.
        var ehInputValidation: EasiheatFlowRateValidation = new EasiheatFlowRateValidation();

        var decimalPlaces = this.userPrefs.find(m => m.name === "VolumetricFlowUnit").decimalPlaces;

        var tempWaterFlow = parseFloat(control.value).toFixed(decimalPlaces);

        // Make sure rounding is done before the validation check as per V1 - KNG
        if (this.waterflowrate.value != tempWaterFlow) {
          //          this.waterflowrate.setValue(tempWaterFlow);
          //this.sizingModuleForm.get('waterflowrate').setValidators([Validators.required]);
          this.waterflowrate.setValue(parseFloat(control.value.toFixed(decimalPlaces)));
          //this.sizingModuleForm.get('waterflowrate').setValidators([Validators.required, (c) => this.validateWaterFlowRate(c, this.volumetricFlowRef, this.temperatureRef, this.waterFlowRateValidationErrorMessage), (c) => this.CalcLoad(c), (c) => this.validateProcessConditions(c, 'InputFlowRate', this.volumetricFlowRef, this.validateProcessConditionsErrorMessage)]);
        }

        ehInputValidation.EnteredFlow = +control.value;
        ehInputValidation.FlowUnits = +(flowUnitRef !== null ? flowUnitRef.preference.value : 0);
        ehInputValidation.TemperatureRise = this.outlettemperature.value - this.inlettemperature.value;
        ehInputValidation.TemperatureUnits = +(tempUnitRef !== null ? tempUnitRef.preference.value : 0);

        this.EasiheatService.waterFlowRateCheck(ehInputValidation).subscribe((result: Array<EasiheatValidationMessage>) => {
          // Check if there's any validation errors? If so, set form control and error message accordingly.
          if (result && result.length > 0) {
            msgRef.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + parseFloat(result[0].value.toFixed(3)) + (flowUnitRef !== null ? ' ' + this.translatePipe.transform(flowUnitRef.preference.masterTextKey, false) : '') + ')';
            control.setErrors({ 'incorrect': true });
          }
          else {
            //  control.reset();
            //  this.sizingModuleForm.get('waterflowrate').setValidators(null);
            //  this.waterflowrate.setValue(parseFloat(control.value.toFixed(decimalPlaces)));
            //  this.sizingModuleForm.get('waterflowrate').setValidators([Validators.required, (c) => this.validateWaterFlowRate(c, this.volumetricFlowRef, this.temperatureRef, this.waterFlowRateValidationErrorMessage), (c) => this.CalcLoad(c), (c) => this.validateProcessConditions(c, 'InputFlowRate', this.volumetricFlowRef, this.validateProcessConditionsErrorMessage)]);
          }
        });
      }
    }

    // This is required for custo validator attached with form control.
    //return { customError: false }
    return null;
  }

  /*
  * Validator for Outlate Temperature control input.
  */
  validateLoadInput(control: AbstractControl, unitRef, msgRef) {
    console.log('ValidateLoadInput');
    // Reset results
    //this.resetResults();
    if (!isNullOrUndefined(control.value)) {
      if (control.value.toString() !== "") {
        // Reset error messages first.
        msgRef.value = '';

        // Add details into the validation model.
        var ehInputValidation: EasiheatInputValidation = new EasiheatInputValidation();

        var decimalPlaces = this.userPrefs.find(m => m.name === "LoadUnit").decimalPlaces;

        var tempLoad = parseFloat(control.value.toFixed(decimalPlaces));

        if (this.load.value != tempLoad) {
          this.load.setValue(tempLoad);
        }

        ehInputValidation.value = +control.value;
        ehInputValidation.units = +(unitRef !== null ? unitRef.preference.value : 0);

        this.EasiheatService.loadInputCheck(ehInputValidation).subscribe((result: Array<EasiheatValidationMessage>) => {
          // Check if there's any validation errors? If so, set form control and error message accordingly.
          if (result && result.length > 0) {
            msgRef.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value + (unitRef !== null ? ' ' + this.translatePipe.transform(unitRef.preference.masterTextKey, false) : '') + ')';
            control.setErrors({ 'incorrect': true });
          }
        });
      }
    }

    // This is required for custo validator attached with form control.
    //return { customError: false }
    return null;
  }

  addInput(controlValue, controlName, unitRef) {

    var ehInputValidation: EasiheatProcessConditionsInputValidation = new EasiheatProcessConditionsInputValidation();

    if (!isNullOrUndefined(controlName)) {

      if (this.allInputs.find(objName => objName.ControlName == controlName)) {

        this.allInputs.find(objName => objName.ControlName == controlName).UnitId = parseInt(unitRef.preference.value);
        this.allInputs.find(objName => objName.ControlName == controlName).Value = controlValue;
      }
      else {
        ehInputValidation.ControlName = controlName;
        ehInputValidation.UnitId = + parseInt(unitRef.preference.value);
        ehInputValidation.Value = + parseFloat(controlValue);
        this.allInputs.push(ehInputValidation);
      }
    }
  }



  /*
  * Validates input process conditions.
  */
  validateProcessConditions(control: AbstractControl, controlName, unitRef, msgRef) {
    console.log('validateProcessConditions: ' + controlName)

    ////this.resetResults();

    if (!isNullOrUndefined(control) && !isNullOrUndefined(controlName) && !isNullOrUndefined(unitRef)) {
      if (!isNull(control.value)) {
        if (control.value.toString() !== '') {

          this.addInput(control.value, controlName, unitRef);

          if (this.inletpressure.value && this.totalbackpressure.value && this.inlettemperature.value &&
            this.outlettemperature.value && this.waterflowrate.value && this.load.value) {

            if (this.inletpressure.value.toString() !== '' && this.totalbackpressure.value.toString() !== '' && this.inlettemperature.value.toString() !== '' &&
              this.outlettemperature.value.toString() !== '' && this.waterflowrate.value.toString() !== '' && this.load.value.toString() !== '') {

              console.log('form Status is : ' + this.sizingModuleForm.status);
              console.info('form Value is : ' + this.sizingModuleForm.value);

              //msgRef.value = '';

              if (this.allInputs !== null) {
                //ProcessConditions
                this.doSizing = true;
                var ehProcessConditionsValidation: EasiheatProcessConditionsValidation = new EasiheatProcessConditionsValidation();

                ehProcessConditionsValidation.ProcessConditionsValidationRequest = this.allInputs;

                ehProcessConditionsValidation.HTGChecked = !this.dhw;
                ehProcessConditionsValidation.InputCondensateControl = this.htgcc;
                ehProcessConditionsValidation.InputPRV = this.inputPRV;

                this.EasiheatService.validateEasiheatProcessConditions(ehProcessConditionsValidation).subscribe((result: Array<EasiheatValidationMessage>) => {
                  // Check if cross validation errors returned?
                  if (result && result.length > 0) {
                    msgRef = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value + (this.pressureRef !== null ? ' ' + this.translatePipe.transform(this.pressureRef.preference.masterTextKey, false) : '') + ')';
                    this.sizingModuleForm.setErrors({ 'incorrect': true });
                  }
                });
              }
            }
          }
        }
      }
    }
    if (!this.isThisAJob) {
      this.isEasiHeatSizingDone = false;
      this.ehOutputData = [];
    }

    return null;
  }

  setMaxPressureDropValue(appType: string, design: string) {

    var result;
    if (design != "" && !isUndefined(design)) {

      var x;

      switch (design) {
        case "J":
        case "P":
          switch (appType) {

            case "DHW":

              x = 4;

              break;

            case "HTGCC":

              x = 4;

              break;

            case "HTGSC":

              x = 9;

              break;
          }
          break;


        case "A":
          switch (appType) {

            case "DHW":

              x = 3;

              break;

            case "HTGCC":

              x = 6;

              break;

            case "HTGSC":

              x = 6;

              break;
          }
          break;

      }

      var maxPressDrop_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === this.maximum_Pressure_Drop_Name)[0];
      if (!!maxPressDrop_Enumeration_Items && !!maxPressDrop_Enumeration_Items.enumerationDefinitions && maxPressDrop_Enumeration_Items.enumerationDefinitions.length > 0) {
        // set maxPressureDrop_Enumeration
        this.maxPressureDrop_Enumeration.setValue(maxPressDrop_Enumeration_Items.enumerationDefinitions[x].value);
        result = parseInt(maxPressDrop_Enumeration_Items.enumerationDefinitions[x].value);
      }
    }
    return result;
  }

  onResetModuleForm() {
    console.info("Resetting the EasiHeat form");
    this.isResetButtonClicked = true;
    this.resetPage();
  }

  onSaveJob() {
    // First, check if a job is already loaded?
    if (this.project && this.projectName && this.job && this.jobName) {
      //if (this.project != null && this.projectName !== '' && this.job != null && this.jobName !== '') {
      // Job already exists, so just update the sizing.
      return false;
    } else {

      return true;
    }
  }

  onUnitsChanged() {
    // Re-validate all the inputs.
    this.inletpressure.updateValueAndValidity();
    this.totalbackpressure.updateValueAndValidity();
    this.inlettemperature.updateValueAndValidity();
  }

  /*
  * Method to reset csg sizing results.
  */

  resetPage() {
    this.maximum_Pressure_Drop_Name = this.initial_Maximum_Pressure_Drop_Name;
    this.quoteExpired = false;

    this.waterFlowRateValidationErrorMessage.value = "";
    this.loadValidationErrorMessage.value = "";

    if (this.ApplicationType != "DHW") {
      this.htgcc = true;
      this.dhw = false;
    }
    else {
      this.htgcc = false;
      this.dhw = true;
    }
    this.SetApplicationType();

    if (this.ApplicationType != "DHW") {
      this.resetHTGTemperatureDefaults();
    }
  }

  // HTG Defaults fro temperature have to be handled differently to DHW as there are also two types of HTG.
  // Switching between the two types of HTG need to keep any user entered temperatures but they still need
  // to be reset on the reset of the page. So moved them to a method so both page reset and a conditional call from
  // SetApplicationType can achieve the same with minimal code duplication.
  resetHTGTemperatureDefaults() {
    this.convertTemperatureToDefaultValueInPageUnits("inlettemperature", 71);
    this.convertTemperatureToDefaultValueInPageUnits("outlettemperature", 82);
  }

  resetResults() {

    console.info("resetResults");
    this.resetPage();

    this.ehOutputData = [];
    this.translatedMessagesList = [];
    this.isSpecSheetEnabled = false;
    this.isEasiHeatSizingDone = false;
    this.isEasiHeatReSizingDone = false;

    //if (!this.isLoadingJob && !!this.design_Code_Enumeration && !!this.design_Code_Enumeration.value) { this.storeCurrentlySelectedOptionItemValues(); }
    if (!!this.sizingModuleForm) { this.sizingModuleForm.controls["pricingOptions"].reset(); }

    this.sellingMarkupUpdated = false;
    this.grossMarginUpdated = false;
    this.sellingPriceUpdated = false;



    this.loadOptions = false;
    this.gridSelectedRow = false;

    this.quoteExpired = false;

  }

  /*
  * Method to reset the isLoadingJob flag.
  */
  resetLoadingJobStatus() {
    this.isLoadingJob = false;
  }

  onNewSizingForm() {

    // Simple popup message box
    swal({
      title: 'Information:',
      text: 'New Sizing support is not yet implemented.',
      icon: "warning",
      dangerMode: true,
      buttons: ['Ok', 'Cancel']
    }).then((okbuttoncClicked?: boolean) => {

      console.info("Ok clicked...");

      // The parameter can also enter as null
      const returnVal = !(okbuttoncClicked === null);

    });

    //this.forgetCurrentlySelectedOptionItemValues();

    // ToDo: Implement!
    this.onResetModuleForm();
  }

  onEnterHeaderDetailsForm() {
    // ToDo: Implement!

    // Simple popup message box
    swal({
      title: 'Information:',
      text: 'Enter Header Details support is not yet implemented.',
      icon: "warning",
      dangerMode: true,
      buttons: ['Ok', 'Cancel']
    }).then((okbuttoncClicked?: boolean) => {

      console.info("Ok clicked...");

      // The parameter can also enter as null
      const returnVal = !(okbuttoncClicked === null);

    });
  }


  onGetTiSheet() {
    // ToDo: Drive parameters for real CSG Ti documents.
    // There is a CORS issue pulling file from another domain!
    // We have to pull down the PDF file using the WebAPI then render to the client like a spec sheet.

    let tiRequestModel: TiRequestModel = new TiRequestModel();
    tiRequestModel.languageId = this.user.languageId; // The required Ti language, defaults to languageId=4 ('en') if Ti language not defined/found in the Ti table.

    //missing http://www.spiraxsarco.com/Documents/TI/p663_01.pdf missing
    tiRequestModel.moduleId = 5; // CSG ModuleId is 8 (child, Product Sizing), moduleGroupId=12 (parent)
    tiRequestModel.languageId = -1; // not supported yet, will get default Ti language, normally 'en'
    tiRequestModel.code = this.ehUnitName + "TI" //"EHDTI";//this.modelName; // Selected CSG Model
    tiRequestModel.params = this.ehUnitName;//"EHD";  any selected CSG Model extra parameters for a Ti selection?

    //http://www.spiraxsarco.com/Documents/ti/p222_03.pdf VES Turflow unit
    //tiRequestModel.moduleId = 10; // CSG ModuleId is 8 (child, Product Sizing), moduleGroupId=12 (parent)
    //tiRequestModel.languageId = -1; // not supported yet, will get default Ti language, normally 'en'
    //tiRequestModel.code = "VES";//this.modelName; // Selected CSG Model
    //tiRequestModel.params = ""; // any selected CSG Model extra parameters for a Ti selection?

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
              text: trans_Ti_The_Product_Technical_Information_sheet + ' "' + ti.tiPath + ti.tiFileName + '" ' + trans_Ti_Failed_To_Download + '.',
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
          title: trans_Ti_Information + ':',
          text: trans_Ti_missing + '.',
          icon: "warning",
          dangerMode: false,
          //buttons: ['Ok', 'Cancel']
        }).then((okbuttoncClicked?: boolean) => {
          console.info("Ok clicked...");
          // The parameter can also enter as null
          const returnVal = !(okbuttoncClicked === null);
        });

      }

    }); // end of getTiDocumentInfo() Subscribe

  }

  onPdfSubmit() {

    this.docGen = new DocGen;
    this.docGen.specItems = new Array<SpecSheetItem>();
    this.docGen.moduleId = 5;
    this.docGen.template = "pdf";
    this.docGen.headerImage = "sxsLogo.jpg";
    this.docGen.bodyImage = "";
    this.docGen.userPreference = new Array<Preference>();

    for (let userPref of this.userPrefs) {

      this.docGen.userPreference.push(userPref);
    }

    // Pass data only, labels are retrieved from database in Doc Gen dll.
    this.setSpecSheetValues();

    this.easiheatDocGenService.getEasiHeatPdf(this.docGen);

    let options = {
      headers: {
        "Content-Type": "application/json", Accept: "application/octet-stream"
      },
      responseType: 'json' as 'json'
    };


  }

  setSpecSheetValues() {
    // ToDo: All usage of translatePipe.transform here will be wrong if the SpecSheet language is not the same as the UI lLanguage.
    var currentDate = new Date();

    var projName = this.projectId != "" ? this.project.name : "-";
    var projRef = this.projectId != "" ? this.project.projectReference : "-";
    var projLocation = this.projectId != "" ? this.project.customerLocation : "-";
    var projQuoteRef = this.projectId != "" ? this.project.quoteReference : "-";
    var projCusName = this.projectId != "" ? this.project.customerName : "-";
    var jobName = this.jobId != "" ? this.job.name : "-";
    var voltage = "";
    var phases = "";
    var phaseMasterText = "";

    // Set up correct hash tab;e reference
    var type = "";
    if (this.ApplicationType == "DHW" || this.ApplicationType == "HTGSC") {
      type = "DHW_HTGSC";
    }
    else {
      type = this.ApplicationType;
    }

    var hePressure = '';

    if (this.ehOutputData[0].hePressure == null) {
      hePressure = '';
    } else {
      hePressure = this.ehOutputData[0].hePressure.toString();
    }

    // this.specSheetLanguage = 'fr-fr';
    // Pass data only, labels are retrieved from database in Doc Gen dll.
    this.docGen.specItems.push({ name: 'Date', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: currentDate.toDateString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Quotation Ref', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projQuoteRef, calculation: "" });
    this.docGen.specItems.push({ name: 'Prepared By', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.user.firstname + ' ' + this.user.lastname, calculation: "" });
    this.docGen.specItems.push({ name: 'Sheet', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.sheet.value == null ? "-" : this.sheet.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Revision No', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.revisionNumber.value == null ? "-" : this.revisionNumber.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Email', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.user.email, calculation: "" });
    this.docGen.specItems.push({ name: 'Quantity', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.quantity.value == null ? "-" : this.quantity.value, calculation: "" });
    this.docGen.specItems.push({ name: 'AO Number', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.aoNumber.value == null ? "-" : this.aoNumber.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Telephone', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.user.telephone, calculation: "" });
    this.docGen.specItems.push({ name: 'Customer', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projCusName, calculation: "" });
    this.docGen.specItems.push({ name: 'Order No', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.orderNumber.value == null ? "-" : this.orderNumber.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Project Type', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.projectType.value == null ? "-" : this.projectType.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Location', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projLocation, calculation: "" });
    this.docGen.specItems.push({ name: 'Project Name', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projName, calculation: "" });
    this.docGen.specItems.push({ name: 'Project Ref', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projRef, calculation: "" });
    this.docGen.specItems.push({ name: 'Job Name', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: jobName, calculation: "" });

    //Process Data
    this.docGen.specItems.push({ name: 'ApplicationType', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.ApplicationType, calculation: "" });

    this.docGen.specItems.push({ name: 'PrimarySide', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: "Primary Side (Steam)", calculation: "" });
    this.docGen.specItems.push({ name: 'SecondarySide', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: "Secondary Side (Water)", calculation: "" });

    this.docGen.specItems.push({ name: 'InletPressure', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.inletpressure.value, calculation: "" });
    this.docGen.specItems.push({ name: 'InletPressureUnit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.unitName, calculation: "" });

    this.docGen.specItems.push({ name: 'CVInletPressure', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.inletpressure.value, calculation: "" });
    this.docGen.specItems.push({ name: 'CVInletPressureUnit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.unitName, calculation: "" });

    this.docGen.specItems.push({ name: 'HEInletPressure', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: hePressure, calculation: "" });
    this.docGen.specItems.push({ name: 'HEInletPressureUnit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.unitName, calculation: "" });

    this.docGen.specItems.push({ name: 'TotalBackPressure', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.totalbackpressure.value, calculation: "" });
    this.docGen.specItems.push({ name: 'TotalBackPressureUnit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.unitName, calculation: "" });

    this.docGen.specItems.push({ name: 'InletTemperature', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.inlettemperature.value, calculation: "" });
    this.docGen.specItems.push({ name: 'InletTemperatureUnit', type: 'Unit', masterTextKey: this.temperatureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.temperatureRef.preference.unitName, calculation: "" });

    this.docGen.specItems.push({ name: 'OutletTemperature', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.outlettemperature.value, calculation: "" });
    this.docGen.specItems.push({ name: 'OutletTemperatureUnit', type: 'Unit', masterTextKey: this.temperatureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.temperatureRef.preference.unitName, calculation: "" });

    this.docGen.specItems.push({ name: 'WaterFlowRate', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.waterflowrate.value, calculation: "" });
    this.docGen.specItems.push({ name: 'WaterFlowRateUnit', type: 'Unit', masterTextKey: this.volumetricFlowRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.volumetricFlowRef.preference.unitName, calculation: "" });

    this.docGen.specItems.push({ name: 'Load', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.load.value, calculation: "" });
    this.docGen.specItems.push({ name: 'LoadUnit', type: 'Unit', masterTextKey: this.loadRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.loadRef.preference.unitName, calculation: "" });

    this.docGen.specItems.push({ name: 'Feed water pressure unit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Feed water temperature unit', type: 'Unit', masterTextKey: this.temperatureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.temperatureRef.preference.unitName, calculation: "" });

    this.docGen.specItems.push({ name: 'NoiseLimit', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.noiseLimit_Enumeration.value, calculation: "" });
    this.docGen.specItems.push({ name: 'NoiseLimitUnit', type: 'Unit', masterTextKey: 'DB', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: '65', calculation: "" });

    this.docGen.specItems.push({
      name: 'MaxPressDrop', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.maxPressureDrop_Enumeration.value, calculation: ""
    });
    this.docGen.specItems.push({ name: 'MaxPressDropUnit', type: 'Unit', masterTextKey: this.maximum_Pressure_Drop_Unit, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.maximum_Pressure_Drop_Unit, calculation: "" });


    // Mechanical Options
    let ActuationType = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === type).actuator, this.actuator_Enum.internalValue);
    this.docGen.specItems.push({ name: 'ActuationType', type: 'Section', masterTextKey: ActuationType, sectionName: 'Mechanical Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(ActuationType, false), calculation: "" });

    //    this.docGen.specItems.push({ name: 'ActuationType', type: 'Section', masterTextKey: '', sectionName: 'Mechanical Options', targetLanguage: this.specSheetLanguage, value: this.actuator_Enumeration.value, calculation: "" });

    //    this.docGen.specItems.push({ name: 'HighLimitActuation', type: 'Section', masterTextKey: '', sectionName: 'Mechanical Options', targetLanguage: this.specSheetLanguage, value: this.high_Limit_Actuation_Enumeration.value, calculation: "" });
    let HighLimitActuation = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === type).high_Limit, this.high_Limit_Options_Enum.internalValue);
    this.docGen.specItems.push({ name: 'HighLimitActuation', type: 'Section', masterTextKey: HighLimitActuation, sectionName: 'Mechanical Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(HighLimitActuation, false), calculation: "" });

    //this.docGen.specItems.push({ name: 'Gasket', type: 'Section', masterTextKey: '', sectionName: 'Mechanical Options', targetLanguage: this.specSheetLanguage, value: this.gasket_Enumeration.value, calculation: "" });
    let Gasket = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === type).gasket, this.gasket_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Gasket', type: 'Section', masterTextKey: Gasket, sectionName: 'Mechanical Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(Gasket, false), calculation: "" });

    //    this.docGen.specItems.push({ name: 'Isolation', type: 'Section', masterTextKey: '', sectionName: 'Mechanical Options', targetLanguage: this.specSheetLanguage, value: this.isolation_Enumeration.value, calculation: "" });
    let Isolation = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === type).isolation, this.isolation_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Isolation', type: 'Section', masterTextKey: Isolation, sectionName: 'Mechanical Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(Isolation, false), calculation: "" });

    this.docGen.specItems.push({ name: 'JackingWheels', type: 'Section', masterTextKey: '', sectionName: 'Mechanical Options', targetLanguage: this.specSheetLanguage, value: this.jacking_Wheels_Enumeration.value, calculation: "" });
    this.docGen.specItems.push({ name: 'EN12828SafetyCompliant', type: 'Section', masterTextKey: '', sectionName: 'Mechanical Options', targetLanguage: this.specSheetLanguage, value: this.en12828_Compliant_Enumeration.value, calculation: "" });

    if (this.ApplicationType === "HTGCC") {
      this.docGen.specItems.push({ name: 'CondensateRemoval', type: 'Section', masterTextKey: "", sectionName: 'Mechanical Options', targetLanguage: this.specSheetLanguage, value: "-", calculation: "" });

    } else {
      let CondensateRemoval = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === type).condensate_Removal, this.condensate_Removal_Enum.internalValue);
      this.docGen.specItems.push({ name: 'CondensateRemoval', type: 'Section', masterTextKey: CondensateRemoval, sectionName: 'Mechanical Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(CondensateRemoval, false), calculation: "" });
    }

    //this.docGen.specItems.push({ name: 'ServiceOffering', type: 'Section', masterTextKey: this.serviceOfferingKey, sectionName: 'Mechanical Options', targetLanguage: this.specSheetLanguage, value: this.service_Offering_Enumeration.value, calculation: "" });
    //let ServiceOffering = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === "DHW_HTGSC").service_Offering, this.service_Offering_Enum.internalValue);
    this.docGen.specItems.push({ name: 'ServiceOffering', type: 'Section', masterTextKey: '', sectionName: 'Mechanical Options', targetLanguage: this.specSheetLanguage, value: this.serviceOfferingKey, calculation: "" });

    // Panel Options
    //this.docGen.specItems.push({ name: 'EnergyMonitoring', type: 'Section', masterTextKey: '', sectionName: 'Panel Options', targetLanguage: this.specSheetLanguage, value: this.energy_Monitoring_Enumeration.value, calculation: "" });
    let EnergyMonitoring = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === type).energy_Monitoring, this.energy_Monitoring_Enum.internalValue);
    this.docGen.specItems.push({ name: 'EnergyMonitoring', type: 'Section', masterTextKey: EnergyMonitoring, sectionName: 'Panel Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(EnergyMonitoring, false), calculation: "" });

    //    this.docGen.specItems.push({ name: 'RemoteAccess', type: 'Section', masterTextKey: '', sectionName: 'Panel Options', targetLanguage: this.specSheetLanguage, value: this.remote_Access_Enumeration.value, calculation: "" });
    let RemoteAccess = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === type).remote_Access, this.remote_Access_Enum.internalValue);
    this.docGen.specItems.push({ name: 'RemoteAccess', type: 'Section', masterTextKey: RemoteAccess, sectionName: 'Panel Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(RemoteAccess, false), calculation: "" });

    //    this.docGen.specItems.push({ name: 'Communications', type: 'Section', masterTextKey: '', sectionName: 'Panel Options', targetLanguage: this.specSheetLanguage, value: this.communications_Enumeration.value, calculation: "" });
    let Communications = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === type).communications, this.communications_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Communications', type: 'Section', masterTextKey: Communications, sectionName: 'Panel Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(Communications, false), calculation: "" });

    //this.docGen.specItems.push({ name: 'PanelType', type: 'Section', masterTextKey: '', sectionName: 'Panel Options', targetLanguage: this.specSheetLanguage, value: this.control_Panel_Location_Enumeration.value, calculation: "" });
    let PanelType = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === type).control_System, this.control_System_Enum.internalValue);
    this.docGen.specItems.push({ name: 'PanelType', type: 'Section', masterTextKey: PanelType, sectionName: 'Panel Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(PanelType, false), calculation: "" });

    // product
    this.docGen.specItems.push({ name: 'EasiHeatUnit', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.nomenclature, calculation: "" });
    this.docGen.specItems.push({ name: 'TrimType', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.ehOutputData[0].cvTrimType, calculation: "" });
    this.docGen.specItems.push({ name: 'ActualNoiseLevel', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: "-", calculation: "" });
    this.docGen.specItems.push({ name: 'Length', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.ehOutputData[0].length, calculation: "" });
    this.docGen.specItems.push({ name: 'Width', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.ehOutputData[0].width, calculation: "" });
    this.docGen.specItems.push({ name: 'Height', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.ehOutputData[0].height, calculation: "" });
    this.docGen.specItems.push({ name: 'Weight', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.ehOutputData[0].weight, calculation: "" });
    this.docGen.specItems.push({ name: 'EasiHeatSizesHeader', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: "EasiHeat Sizes", calculation: "" });
    this.docGen.specItems.push({ name: 'HeatExchangerDetailsHeader', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: "HeatExchanger Details", calculation: "" });

    if (this.design_Code_Enumeration.value == 'A') {
      this.docGen.specItems.push({ name: 'PackageInletConnSize', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.ehPricingOutputData.inletSizeAnsi, calculation: "" });
      this.docGen.specItems.push({ name: 'CondensatePipeSize', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.ehPricingOutputData.condensatePipeSizeAnsi, calculation: "" });
      this.docGen.specItems.push({ name: 'SecondaryInOutPipeSize', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.ehPricingOutputData.inletOutletPipeSizeAnsi, calculation: "" });
    }
    else {
      this.docGen.specItems.push({ name: 'PackageInletConnSize', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.ehPricingOutputData.inletSize, calculation: "" });
      this.docGen.specItems.push({ name: 'CondensatePipeSize', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.ehPricingOutputData.condensatePipeSize, calculation: "" });
      this.docGen.specItems.push({ name: 'SecondaryInOutPipeSize', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.ehPricingOutputData.inletOutletPipeSize, calculation: "" });
    }

    this.docGen.specItems.push({ name: 'ControlValveSize', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.ehOutputData[0].cvSize, calculation: "" });
    this.docGen.specItems.push({ name: 'ActualSecondaryPressureDrop', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.ehOutputData[0].secondaryPressureDrop.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'NumberOfPlates', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.ehOutputData[0].numberOfPlates.toString(), calculation: "" });

    //// Configuration
    //let designCodeTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).design_Code, this.design_Code_Enum.internalValue);
    //this.docGen.specItems.push({ name: 'Design code', type: 'Section', masterTextKey: designCodeTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(designCodeTrans, false), calculation: "" });

    //let shellTypeTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).shell_Type, this.shell_Type_Enum.internalValue);
    //this.docGen.specItems.push({ name: 'Shell type', type: 'Section', masterTextKey: shellTypeTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(shellTypeTrans, false), calculation: "" });

    //this.docGen.specItems.push({ name: 'Unit size', type: 'Section', masterTextKey: '', sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.modelName, calculation: "" });

    //let valveActuationTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).valve_Actuation, this.valve_Actuation_Enum.internalValue);
    //this.docGen.specItems.push({ name: 'Valve actuation type', type: 'Section', masterTextKey: valveActuationTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(valveActuationTrans, false), calculation: "" });

    //let control = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).control, this.control_Enum.internalValue);
    //this.docGen.specItems.push({ name: 'Control', type: 'Section', masterTextKey: control, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(control, false), calculation: "" });

    //let communicationInterfaceTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).communication_Interface, this.communication_Interface_Enum.internalValue);
    //this.docGen.specItems.push({ name: 'Communication interface', type: 'Section', masterTextKey: communicationInterfaceTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(communicationInterfaceTrans, false), calculation: "" });

    //let frameAndCabinetTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).frame_And_Cabinet, this.frame_And_Cabinet_Enum.internalValue);
    //this.docGen.specItems.push({ name: 'Unit frame', type: 'Section', masterTextKey: frameAndCabinetTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(frameAndCabinetTrans, false), calculation: "" });

    //let controlPanelLocationTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).control_Panel_Location, this.control_Panel_Location_Enum.internalValue);
    //this.docGen.specItems.push({ name: 'Control panel location', type: 'Section', masterTextKey: controlPanelLocationTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(controlPanelLocationTrans, false), calculation: "" });

    //let insulationTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).insulation, this.insulation_Enum.internalValue);
    //this.docGen.specItems.push({ name: 'Insulation', type: 'Section', masterTextKey: insulationTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(insulationTrans, false), calculation: "" });

    //let wheelsAndFeetTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).wheels_And_Feet, this.wheels_And_Feet_Enum.internalValue);
    //this.docGen.specItems.push({ name: 'Handling wheels and feet', type: 'Section', masterTextKey: wheelsAndFeetTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(wheelsAndFeetTrans, false), calculation: "" });

    // Messages
    let messageMasterTextKey: string = '';
    let messageValue: string = '';
    for (var i = 0; i < 5; i++) {
      messageMasterTextKey = ''; // reset for each message!
      messageValue = '';         // reset for each message!

      // ToDo: Tom, there is a problem here, when the MasterTextKey is found and provided,
      // only the translated MasterTextKey is output to the report and the value is lost.
      // There is a problem with the messageservice generally that means the messages get reset,
      // hence why most of the time the MasterTextKey is not found.

      // Problem 1: messageservice data appears unreliable.
      // Problem 2: Message data, values and units are merged, how can a translation be seperated from values and a unit (even the unit should be translated).
      // Problem 3: Translations on the message text part is only in the UI language, translating to a different spec sheet language should also be supported.

      if (!!this.translatedMessagesList[i]) {
        messageValue = this.translatedMessagesList[i]
        //  // Will not exist in a loaded job. The MasterTextKey is not saved for sizing messages!
        //  if (!!this.messagesService.messages[i] && this.messagesService.messages[i].messageKey) {
        //    messageMasterTextKey = this.messagesService.messages[i].messageKey;
        //  }

        //  if (!messageMasterTextKey || messageMasterTextKey == '') {
        //    // Get Message MasterTextKey from reverese lookup in this pages displayGroup translations.
        //    var translationObject = this.translationService.displayGroup.translations.find(t => t.translationText == this.translatedMessagesList[i] || t.defaultText == this.translatedMessagesList[i]); // Check default text incase job was saved in different language
        //    if (!!translationObject) {
        //      // Found a match, use mastTextKey
        //      messageMasterTextKey = translationObject.masterTextKey;
        //    }
        //  }
        //  messageMasterTextKey = !!messageMasterTextKey ? messageMasterTextKey : '';
      }
      this.docGen.specItems.push({ name: 'SizingMessages', type: 'Section', masterTextKey: messageMasterTextKey, sectionName: 'Messages', targetLanguage: this.specSheetLanguage, value: messageValue, calculation: "" });
    }

    // Notes
    this.docGen.specItems.push({ name: 'Note 1', type: 'Section', masterTextKey: '', sectionName: 'Notes', targetLanguage: this.specSheetLanguage, value: this.notes.value == "" ? "-" : this.notes.value, calculation: "" });
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
    // this.docGen = new DocGen;
    // this.docGen.specItems = new Array<SpecSheetItem>();
    // this.docGen.moduleId = 12;
    // this.docGen.template = "excel";
    // this.docGen.headerImage = "sxsLogo.jpg";
    // this.docGen.bodyImage = "CSG.png";

    //// Pass data only, labels are retrieved from database in Doc Gen dll.
    //this.setSpecSheetValues();

    //this.docGenService.getExcel(this.docGen).subscribe((response: any) => {

    //  let filename = 'CSG-SpecificationSheet.xlsx';
    //   FileSaver.saveAs(response, filename);

    // });

  }

  get ehOutputDataRows(): EasiheatOutput[] {
    return this.ehOutputData;
  }

  /**
   * Data table selection changed method
   */
  //onSelect(event: any) {
  //  var selectedRow = event.selected as EasiheatOutput[];

  //  //    this.storeCurrentlySelectedOptionItemValues();
  //  //this.setupDefaultOptionsForSizingSelection(selectedRow[0]);
  //  this.setupDefaultOptionsForSizingSelection(this.ApplicationType);
  //  this.selectCSGOutputDataRow(selectedRow[0]);
  //}

  /**
   * Data table selection changed method implementation.
   */
  //selectCSGOutputDataRow(selectedRow: EasiheatOutput) {

  //  this.selectedOutputData[0] = selectedRow;

  //  this.isCSGModelSelected = true;

  //  //this.modelId = selectedRow.modelId;
  //  //this.modelName = selectedRow.modelName;
  //  //this.length = selectedRow.length;
  //  //this.height = selectedRow.height;
  //  //this.width = selectedRow.width;
  //  //this.dryWeight = selectedRow.dryWeight;
  //  //this.plantSteamInletConnection = selectedRow.plantSteamInletConnection;
  //  //this.condensateOutletConnection = selectedRow.condensateOutletConnection;
  //  //this.cleanSteamOutletConnection = selectedRow.cleanSteamOutletConnection;
  //  //this.feedwaterInletConnection = selectedRow.feedwaterInletConnection;
  //  //this.safetyValveDischarge = selectedRow.safetyValveDischarge;
  //  //this.notCondensableVentConnection = selectedRow.notCondensableVentConnection;
  //  //this.drainConnection = selectedRow.drainConnection;
  //  //this.plantSteamCondensateDrainConnection = selectedRow.plantSteamCondensateDrainConnection;
  //  //this.samplingSystem = selectedRow.samplingSystem;
  //  //this.plantSteamFlowrate = selectedRow.plantSteamFlowrate;
  //  //this.displayPlantSteamFlowrate = selectedRow.displayPlantSteamFlowrate;
  //  //this.displayCleanSteamFlowrate = selectedRow.displayCleanSteamFlowrate;
  //  //this.minAirSupply = selectedRow.minAirSupply;

  //  var messages = this.messagesService.messages;

  //  // messages may already be loaded via load job - don't re-add
  //  if (this.translatedMessagesList.length < 1) {

  //    // no previously loaded messages via load job. Are there any new messages to add.
  //    if (messages.length > 0) {
  //      for (var i = 0; i < 5; i++) {
  //        if (messages[i] != null) {
  //          var messageKey = messages[i].messageKey;
  //          var unitKey = messages[i].unitKey;
  //          var translatedMessage = "";

  //          if (unitKey == null) {
  //            translatedMessage = this.translatePipe.transform(messageKey, false);
  //          } else {
  //            translatedMessage = this.translatePipe.transform(messageKey, false) +
  //              " (" + messages[i].value.toFixed(2) + " " + this.translatePipe.transform(messages[i].unitKey, false) + ")";
  //          }

  //          this.translatedMessagesList.push(translatedMessage);
  //        } else {
  //          this.translatedMessagesList.push("-");
  //        }
  //      }
  //    } else {

  //      for (var i = 0; i < 5; i++) {
  //        this.translatedMessagesList.push("-");

  //      }
  //    }
  //  }

  //  // Expand Row Details if any.
  //  if (this.csgOutputDataTable) {
  //    this.csgOutputDataTable.rowDetail.toggleExpandRow(selectedRow);
  //  }

  //  //this.design_Code_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).design_Code;
  //  //this.shell_Type_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).shell_Type;
  //  //this.valve_Actuation_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).valve_Actuation;
  //  //this.control_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).control;
  //  //this.communication_Interface_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).communication_Interface;
  //  //this.frame_And_Cabinet_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).frame_And_Cabinet;
  //  //this.control_Panel_Location_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).control_Panel_Location;
  //  //this.insulation_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).insulation;
  //  //this.wheels_And_Feet_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).wheels_And_Feet;
  //  //this.plant_Steam_Inlet_Shut_Off_Valve_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).plant_Steam_Inlet_Shut_Off_Valve;
  //  //this.plant_Steam_Line_Trapping_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).plant_Steam_Line_Trapping;
  //  //this.tds_Control_System_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).tds_Control_System;
  //  //this.sample_Cooler_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).sample_Cooler;
  //  //this.independent_Low_Level_Alarm_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).independent_Low_Level_Alarm;
  //  //this.feedwater_Pre_Heating_Degassing_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).feedwater_Pre_Heating_Degassing;
  //  //this.intelligent_Diagnostics_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).intelligent_Diagnostics;
  //  //this.clean_Steam_Outlet_Shut_Off_Valve_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).clean_Steam_Outlet_Shut_Off_Valve;
  //  //this.test_And_Certification_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).test_And_Certification;
  //  //this.level_Indicator_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).level_Indicator;
  //  //this.feedwater_Pressurisation_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).feedwater_Pressurisation;

  //  //if (!this.isLoadingJob) {
  //  //  this.restoreCurrentlySelectedOptionItemValues();
  //  //}

  //  // Update the flag so that spec sheet could be generated.
  //  this.isSpecSheetEnabled = true;

  //  this.alertVisible = true;

  //  // Calculate the CSG price.
  //  setTimeout(() => {
  //    this.calculatePrice();
  //  }, 100);
  //}

  notifyAvailableOptionsHaveChanged(optionName: string) {

    let trans_Title = this.translatePipe.transform('OPTION_CHANGED_TITLE', false);
    let trans_Message = this.translatePipe.transform('OPTIONS_CHANGED_MESSAGE', false);
    let trans_OptionName = this.translatePipe.transform(optionName, false);

    swal({
      closeOnClickOutside: false, closeOnEsc: false,
      title: trans_Title,
      text: trans_Message + ':\r\n\r\n' + '"' + trans_OptionName + '"',
      icon: "warning",
      dangerMode: true,
      //buttons: ['Ok', 'Cancel']
    }).then((okbuttoncClicked?: boolean) => {

      console.info("Ok clicked...");

      // The parameter can also enter as null
      const returnVal = !(okbuttoncClicked === null);

    }); // end of swal
  }

  /**
   * Method to calculate total price based on selected model and options.
   */
  calculatePrice() {
    console.info(this.sizingModuleForm.value);

    this.debugData = "";
    if (this.isCalculating == false) {
      this.isCalculating = true;

      if (!this.sellingCurrency || !this.sellingCurrency.symbol || this.sellingCurrency === null || this.sellingCurrency.symbol === null) {
        // try to get module prefs again
        this.getModulePreferenceValues();

        if (!this.sellingCurrency || !this.sellingCurrency.symbol || this.sellingCurrency === null || this.sellingCurrency.symbol === null) {

          this.enableUiInputs();

          let trans_Error = "DEBUG!"; // this.translatePipe.transform('ERROR', true);
          let trans_Message = "Unable to calculate Pricing data. Module Preferences have failed to load, please refresh the page and try again."; // this.translatePipe.transform('SELECTED_JOB_WAS_NOT_FOUND_MESSAGE', true);

          swal({
            title: trans_Error + ':',
            text: trans_Message,
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
      }
      else {
      }

      if (this.control_System_Enum.internalValue != "P2") {
        this.isEnergyMonitoringEnabled = this.isEnergyMonitoringSizable;
      }


      // Ensure that the prices are displayed in current selling currency from the module prefs.
      this.sellingCurrencySymbol = this.sellingCurrency.symbol;

      //this.ehPricing.ModelId = this.modelId;
      this.ehPricing.UnitName = this.easiHeatUnit.value;
      this.ehPricing.OperatingCompanyId = this.user.operatingCompanyId;
      this.ehPricing.ManufacturerId = this.manufacturerId;
      this.ehPricing.LandedCostIncreaseFactor = this.landedCostIncreaseFactor;
      this.ehPricing.PricingOptions = [];

      //this.ehPricing.sizingMessages = this.messagesService.messages;

      // Check and add options
      if (this.ApplicationType != "HTGCC") {

        // Condensate removal must be what is returned from the sizing to handle pricing of PTHC. If the enumeration value is user then the PTHC will be priced as PT which is incorrect
        this.ehPricing.PricingOptions.push({ EnumerationName: this.condensate_Removal_Enum.enumerationName, SelectedValue: isNullOrUndefined(this.sizedCondensateRemoval) ? this.condensate_Removal_Enum.internalValue : this.sizedCondensateRemoval });
        //this.ehPricing.PricingOptions.push({ EnumerationName: this.condensate_Removal_Enum.enumerationName, SelectedValue: this.condensate_Removal_Enum.internalValue });

        this.ehPricing.PricingOptions.push({ EnumerationName: "TrimType", SelectedValue: this.trimType.value == "Low Noise" ? "L" : "S" });
      }
      else if ((this.ApplicationType == "HTGCC") && (this.inputPRV)) {
        this.ehPricing.PricingOptions.push({ EnumerationName: "PRV", SelectedValue: "DP" });
      }
      this.ehPricing.PricingOptions.push({ EnumerationName: this.actuator_Enum.enumerationName, SelectedValue: this.actuator_Enum.internalValue });
      this.ehPricing.PricingOptions.push({ EnumerationName: this.high_Limit_Options_Enum.enumerationName, SelectedValue: this.high_Limit_Options_Enum.internalValue });
      if (!isUndefined(this.high_Limit_Actuation_Enum)) {
        this.ehPricing.PricingOptions.push({ EnumerationName: this.high_Limit_Actuation_Enum.enumerationName, SelectedValue: this.high_Limit_Actuation_Enum.internalValue });
      }

      //this.isIsolationEnabled = true;

      //// For a 2 or 3 size EHHCC unit and PRV is selected, disable Isolation and set to none.
      //if ((this.easiHeatUnit.value == "EHHCC2" || this.easiHeatUnit.value == "EHHCC3") && (this.inputPRV)) {
      //  this.isIsolationEnabled = false;
      //  this.isolation_Enumeration.setValue("N")
      //}
      //else if (this.ApplicationType == "HTGCC" && (!this.inputPRV)) {
      //  this.isolation_Name = this.hashTable.find(m => m.name === this.ApplicationType).isolation;
      //}

      this.ehPricing.PricingOptions.push({ EnumerationName: this.design_Code_Enum.enumerationName, SelectedValue: this.design_Code_Enum.internalValue });
      this.ehPricing.PricingOptions.push({ EnumerationName: this.control_System_Enum.enumerationName, SelectedValue: this.control_System_Enum.internalValue });
      this.ehPricing.PricingOptions.push({ EnumerationName: this.gasket_Enum.enumerationName, SelectedValue: this.gasket_Enum.internalValue });
      this.ehPricing.PricingOptions.push({ EnumerationName: this.isolation_Enum.enumerationName, SelectedValue: this.isolation_Enum.internalValue });
      this.ehPricing.PricingOptions.push({ EnumerationName: this.remote_Access_Enum.enumerationName, SelectedValue: this.remote_Access_Enum.internalValue });
      this.ehPricing.PricingOptions.push({ EnumerationName: this.communications_Enum.enumerationName, SelectedValue: this.communications_Enum.internalValue });
      this.ehPricing.PricingOptions.push({ EnumerationName: this.energy_Monitoring_Enum.enumerationName, SelectedValue: this.energy_Monitoring_Enum.internalValue });
      this.ehPricing.PricingOptions.push({ EnumerationName: this.jacking_Wheels_Enum.enumerationName, SelectedValue: this.jacking_Wheels_Enum.internalValue });
      this.ehPricing.PricingOptions.push({ EnumerationName: this.en12828_Compliant_Enum.enumerationName, SelectedValue: this.en12828_Compliant_Enum.internalValue });


      this.EasiheatService.calculateTotalPrice(this.ehPricing).subscribe((response: EHPricingOutput) => {
        this.isCalculating = true;
        //        this.disableUiInputs();
        // First, check if any valid data returned?
        if (response && response.totalSSPPrice >= 0 && response.totalRecommendedSalesPrice >= 0) {

          // Populate the pipe size fields on th UI
          if (this.design_Code_Enumeration.value == 'A') {
            this.packInletConnSize.setValue(response.inletSizeAnsi);
            this.condensatePipeSize.setValue(response.condensatePipeSizeAnsi);
            this.secondaryInAndOutPipeSize.setValue(response.inletOutletPipeSizeAnsi);
          }
          else {
            this.packInletConnSize.setValue(response.inletSize);
            this.condensatePipeSize.setValue(response.condensatePipeSize);
            this.secondaryInAndOutPipeSize.setValue(response.inletOutletPipeSize);
          }

          this.ehPricingOutputData.inletSize = response.inletSize;
          this.ehPricingOutputData.condensatePipeSize = response.condensatePipeSize;
          this.ehPricingOutputData.inletOutletPipeSize = response.inletOutletPipeSize;
          this.ehPricingOutputData.inletSizeAnsi = response.inletSizeAnsi;
          this.ehPricingOutputData.condensatePipeSizeAnsi = response.condensatePipeSizeAnsi;
          this.ehPricingOutputData.inletOutletPipeSizeAnsi = response.inletOutletPipeSizeAnsi;

          //    //this.debugData = this.debugData + "*----------------------------- calculatePrice() start -----------------------------";
          //    //this.debugData = this.debugData + "\n manufacturerCurrency=" + this.manufacturerCurrency.translationText + " " + this.manufacturerCurrency.symbol + ", rateToGbp=" + this.manufacturerCurrency.rateToGbp + ", Id=" + this.manufacturerCurrency.id + ", currencyCode=" + this.manufacturerCurrency.currencyCode;
          //    //this.debugData = this.debugData + "\n sellingCurrency=" + this.sellingCurrency.translationText + " " + this.sellingCurrency.symbol + ", rateToGbp=" + this.sellingCurrency.rateToGbp + ", Id=" + this.sellingCurrency.id + ", currencyCode=" + this.sellingCurrency.currencyCode;
          //    //this.debugData = this.debugData + "\n landedCostIncreaseFactor=" + this.landedCostIncreaseFactor + "(~ " + (this.landedCostIncreaseFactor - 1) * 100 + "%)" + ", modelId=" + this.modelId + ", manufacturerId=" + this.manufacturerId + ", basePriceOption=" + this.basePriceOption + ", localRecommendedSalesPriceOption=" + this.localRecommendedSalesPriceOption + ", hideAllPricingUserPref=" + this.hideAllPricingUserPref + ", hideManufactureCostsUserPref=" + this.hideManufactureCostsUserPref;

          //    // Price data returned, so convert them before using them for calculations below.
          this.ehPricingOutputData.totalSSPPrice = response.totalSSPPrice / this.currencyConversionRate;
          //    //this.debugData = this.debugData + "\n landed totalSalesPrice=" + response.totalSalesPrice + ", currencyConversionRate=" + this.currencyConversionRate + ", sellingCurrency.symbol=" + this.sellingCurrency.symbol + ", totalSalesPrice / currencyConversionRate=" + this.csgPricingOutputData.totalSalesPrice + " " + this.sellingCurrency.symbol;

          this.ehPricingOutputData.totalRecommendedSalesPrice = response.totalRecommendedSalesPrice / this.currencyConversionRate;
          //    //this.debugData = this.debugData + "\n landed totalRecommendedSalesPrice=" + response.totalRecommendedSalesPrice + ", totalRecommendedSalesPrice / currencyConversionRate=" + this.csgPricingOutputData.totalRecommendedSalesPrice + " " + this.sellingCurrency.symbol;

          //    // Now, calculate the following factors and also calculate the total cost.
          this.internal_SSP = this.unit_and_eh_internal_SSP + this.ehPricingOutputData.totalSSPPrice
          //    ////this.debugData = this.debugData + "\n internal_SSP=" + this.internal_SSP;

          //this.internal_SellingPrice = this.ehPricingOutputData.totalRecommendedSalesPrice / this.currencyConversionRate;
          this.internal_SellingPrice = this.unit_and_eh_internal_SellingPrice + (this.ehPricingOutputData.totalSSPPrice * this.sellingMarkup);
          //    ////this.debugData = this.debugData + "\n internal_SellingPrice=" + this.internal_SellingPrice;

          this.display_SSP = this.localizeValue(this.internal_SSP, 0);

          this.display_SellingPrice = parseInt(this.localizeValue(this.internal_SellingPrice, 0).replace(",", ""));

          this.display_DeliveryPrice = this.localizeValue(this.deliveryCost, 0);
          //    //this.debugData = this.debugData + "\n display_SSP=" + this.display_SSP + " " + this.sellingCurrency.symbol + ", display_SellingPrice=" + this.display_SellingPrice + " " + this.sellingCurrency.symbol + ", display_DeliveryPrice=" + this.display_DeliveryPrice + " " + this.sellingCurrency.symbol;

          this.calculateTotalPrice();

          this.setQuotationValidationMessage(new Date);

          //    // Finally, calculate selling markup/gross margin. However, before calculating these figures, first check if this is initial calc or any of these fields have been manually updated? If so then re-calculate them accordingly.
          if (!this.sellingMarkupUpdated && !this.grossMarginUpdated) {
            this.calculateSellingMarkup();
            this.calculateGrossMargin();
          }
          else {
            if (this.sellingMarkupUpdated) {
              this.calculateSellingPriceFromSellingMarkup(this.sellingMarkupFormControl.value);
            } else {
              this.calculateSellingPriceFromGrossMargin(this.grossMarginFormControl.value);
            }
          }

          let sizingMessages = this.ehOutputData[0].modelSizingMessages;

          const responseMessages: Message[] = [];
          for (let message of sizingMessages) {

            const newMessage = new Message();

            newMessage.messageKey = message.messageKey;
            newMessage.severity = message.severity;
            newMessage.value = message.value;
            newMessage.unitKey = message.unitKey;
            newMessage.displayValue = message.value.toString();
            responseMessages.push(newMessage);
          }

          this.messagesService.addMessage(responseMessages);
          this.enableUiInputs();

        } else if (response.totalSSPPrice == 0 && response.totalRecommendedSalesPrice == 0) {

          swal({
            title: "No Pricing Found",
            text: "No prices found for the selected product.",
            icon: "error",
            dangerMode: true,
            //buttons: ['Ok', 'Cancel']
          }).then((okbuttoncClicked?: boolean) => {

            console.info("Ok clicked...");

            // The parameter can also enter as null
            const returnVal = !(okbuttoncClicked === null);
            this.enableUiInputs();

          });

          return;

        }

        //this.debugData = this.debugData + "\n*----------------------------- calculatePrice() end   -----------------------------";
        if (!this.debugDataEnabled) {
          this.debugData = "";
        }

        //this.scrollToElement(this.priceResultsContent, "start");

        this.isCalculating = false;
      });

      this.buildNomenclature();
    }
    //this.augmentPriceDataToOptionsLists();
  }

  calculateSellingMarkup() {

    if (this.internal_SSP > 0 && this.internal_SellingPrice > 0) {
      this.sellingMarkupFormControl.setValue((this.internal_SellingPrice / this.internal_SSP).toFixed(2));
      //this.debugData = this.debugData + "\n\n calculateSellingMarkup()" + ", sellingMarkupFormControl=(internal_SellingPrice / internal_SSP)";
      //this.debugData = this.debugData + "\n sellingMarkupFormControl=" + this.internal_SellingPrice + " / " + this.internal_SSP;
      //this.debugData = this.debugData + "\n sellingMarkupFormControl=" + this.sellingMarkupFormControl.value;
    }
  }

  calculateGrossMargin() {

    if (this.internal_SSP > 0 && this.internal_SellingPrice > 0) {
      this.grossMarginFormControl.setValue((((this.internal_SellingPrice - this.internal_SSP) / this.internal_SellingPrice) * 100).toFixed(2));
      //this.debugData = this.debugData + "\n\n calculateGrossMargin()" + ", grossMarginFormControl=" + "((internal_SellingPrice - internal_SSP) / internal_SellingPrice) * 100";
      //this.debugData = this.debugData + "\n grossMarginFormControl=" + "((" + this.internal_SellingPrice + " - " + this.internal_SSP + ") / " + this.internal_SellingPrice + ") * 100";
      //this.debugData = this.debugData + "\n grossMarginFormControl=" + this.grossMarginFormControl.value;
    }
  }

  calculateSellingPriceFromSellingMarkup(value: any) {

    if (this.internal_SSP > 0 && value && value > 0) {
      this.internal_SellingPrice = this.internal_SSP * value;

      this.display_SellingPrice = parseInt(this.localizeValue(this.internal_SellingPrice, 0).replace(",", ""));

      //this.debugData = this.debugData + "\n\n calculateSellingPriceFromSellingMarkup(sellingMarkupFormControl.value)" + ", internal_SellingPrice=" + "internal_SSP * sellingMarkupFormControl.value";
      //this.debugData = this.debugData + "\n internal_SellingPrice=" + this.internal_SSP + " * " + value;
      //this.debugData = this.debugData + "\n display_SellingPrice=" + this.display_SellingPrice;

      // Update gross margin.
      this.calculateGrossMargin();
    }

    this.calculateTotalPrice();
  }

  calculateGrossMarginAndSellingMarkupFromSellingPrice(value: string) {

    this.internal_SellingPrice = parseInt(value.replace(',', ''));

    // Update gross margin
    this.calculateGrossMargin();

    // Update selling markup.
    this.calculateSellingMarkup();


    this.calculateTotalPrice();
  }

  calculateSellingPriceFromGrossMargin(value: any) {

    //this.debugData = this.debugData + "\n\n calculateSellingPriceFromGrossMargin(grossMarginFormControl.value)";

    if (this.internal_SSP > 0 && value && value > 0) {

      //this.internal_SellingPrice = (value >= 100) ? (this.internal_SSP * (value / 100)) : ((this.internal_SSP / (100 - value)) * 100);

      if (value >= 100) {
        this.internal_SellingPrice = (this.internal_SSP * (value / 100))
        //this.debugData = this.debugData + "\n\n calculateSellingPriceFromGrossMargin(grossMarginFormControl.value)" + ", grossMarginFormControl=" + value;
        //this.debugData = this.debugData + "\n internal_SellingPrice=" + "internal_SSP * (grossMarginFormControl / 100)";
        //this.debugData = this.debugData + "\n internal_SellingPrice=" + this.internal_SSP + " * (" + value + " / 100)";

      }
      else {
        this.internal_SellingPrice = ((this.internal_SSP / (100 - value)) * 100);
        //this.debugData = this.debugData + "\n\n calculateSellingPriceFromGrossMargin(grossMarginFormControl.value)" + ", grossMarginFormControl=" + value;
        //this.debugData = this.debugData + "\n internal_SellingPrice=" + "((internal_SSP / (100 - grossMarginFormControl)) * 100)";
        //this.debugData = this.debugData + "\n internal_SellingPrice=((" + this.internal_SSP + " / (100 - " + value + ")) * 100)";
      }

      this.display_SellingPrice = parseInt(this.localizeValue(this.internal_SellingPrice, 0).replace(",", ""));
      //this.debugData = this.debugData + "\n display_SellingPrice=" + this.display_SellingPrice;

      // Update selling markup.
      this.calculateSellingMarkup();
    }

    this.calculateTotalPrice();
  }

  /*
  * Method to update Selling price on Selling Markup change.
  */
  onSellingPriceChange(value: any) {
    // Update the appropriate flags.
    this.sellingPriceUpdated = true;
    this.sellingMarkupUpdated = false;
    this.grossMarginUpdated = false;

    this.calculateGrossMarginAndSellingMarkupFromSellingPrice(value);

    //this.scrollToElement(this.priceResultsContent, "start");
  }

  /*
  * Method to update Selling price on Selling Markup change.
  */
  onSellingMarkupChange(value: any) {
    // Update the appropriate flags.
    this.sellingMarkupUpdated = true;
    this.grossMarginUpdated = false;
    this.sellingPriceUpdated = false;

    this.calculateSellingPriceFromSellingMarkup(value);

    //this.scrollToElement(this.priceResultsContent, "start");
  }

  /*
  * Method to update Selling price on Gross Margin change.
  */
  onGrossMarginChange(value: any) {
    // Update the appropriate flags.
    this.sellingMarkupUpdated = false;
    this.grossMarginUpdated = true;
    this.sellingPriceUpdated = false;

    this.calculateSellingPriceFromGrossMargin(value);

    //this.scrollToElement(this.priceResultsContent, "start");
  }

  /*
  * Method to build the nomenclature from the CSG model and options selections.
  */
  buildNomenclature() {

    //Original way of building nomenclature in CSG. To see why .split("_") check database project Enumerations_EnumerationsDefinitions.cs
    //this.nomenclature += '-' + this.design_Code_Enum.internalValue.split("_")[1];

    this.nomenclature = this.easiHeatUnit.value;
    this.nomenclature += this.trimType.value == "Low Noise" ? "L" : "";
    this.nomenclature += this.design_Code_Enum.internalValue != "N" ? this.design_Code_Enum.internalValue : "";
    this.nomenclature += this.actuator_Enum.internalValue != "N" ? this.actuator_Enum.internalValue : "";
    if (this.ApplicationType != "HTGCC") {
      this.nomenclature += isNullOrUndefined(this.ehOutputData[0].condensateRemoval) ? this.condensate_Removal_Enum.internalValue : this.ehOutputData[0].condensateRemoval;
    }
    this.nomenclature += '-';
    //"IHLCV2G4" // IHL comes High Limit Options select Integrated High Limit;  V2->isolation select BSA;    G4->Gasket select WRAS EPDMFF
    this.nomenclature += this.high_Limit_Options_Enum.internalValue != "N" ? this.high_Limit_Options_Enum.internalValue : "";
    if (this.highLimitActuation) {
      this.nomenclature += this.high_Limit_Actuation_Enum.internalValue != "N" ? this.high_Limit_Actuation_Enum.internalValue : "";
    }
    this.nomenclature += this.isolation_Enum.internalValue != "N" ? this.isolation_Enum.internalValue : "";
    this.nomenclature += this.gasket_Enum.internalValue != "N" ? this.gasket_Enum.internalValue : "";
    this.nomenclature += this.jacking_Wheels_Enum.internalValue != "N" ? this.jacking_Wheels_Enum.internalValue : "";
    this.nomenclature += this.en12828_Compliant_Enum.internalValue != "N" ? this.en12828_Compliant_Enum.internalValue : "";
    this.nomenclature += this.inputPRV ? "DP" : "";
    this.nomenclature += '-';
    this.nomenclature += this.control_System_Enum.internalValue != "N" ? this.control_System_Enum.internalValue : "";
    this.nomenclature += this.energy_Monitoring_Enum.internalValue != "N" ? this.energy_Monitoring_Enum.internalValue : "";
    this.nomenclature += this.remote_Access_Enum.internalValue != "N" ? this.remote_Access_Enum.internalValue : "";
    this.nomenclature += this.communications_Enum.internalValue != "N" ? this.communications_Enum.internalValue : "";

    this.nomenclature = this.nomenclature.split('null').join('').split('None_N').join('');

    this.nomenclatureFormControl.setValue(!!this.nomenclature ? this.nomenclature : '-');
  }

  /*
  * Method to calculate the total price.
  */
  calculateTotalPrice() {
    //this.debugData = this.debugData + "\n\n calculateTotalPrice()";

    this.internal_TotalPrice = this.internal_SellingPrice + this.internal_ServiceOfferingPrice + this.deliveryCost;
    //this.debugData = this.debugData + "\n internal_SellingPrice=" + this.internal_SellingPrice + ", internal_ServiceOfferingPrice=" + this.internal_ServiceOfferingPrice + ", deliveryCost=" + this.deliveryCost;
    //this.debugData = this.debugData + "\n internal_TotalPrice=" + this.internal_SellingPrice + " + " + this.internal_ServiceOfferingPrice + " + " + this.deliveryCost;

    this.display_TotalPrice = this.localizeValue(this.internal_TotalPrice, 0);
    //this.debugData = this.debugData + "\n display_TotalPrice=" + this.display_TotalPrice;
    //this.debugData = this.debugData + "\n*............................. calculateTotalPrice() end  .............................";
    if (!this.debugDataEnabled) {
      this.debugData = "";
    }

    if (!this.isLoadingJob && this.sizingModuleForm.dirty && this.quoteExpired) { // force repricing
      //debugger;
      this.quoteExpired = false;
      this.calculatePrice();
    }
  }

  onSave(savedProjectDetails: Project): JobSizing {

    let jobSizing = new JobSizing;
    this.project = new Project;
    let job = new Job;
    let sizingData = new SizingData;
    let processConditions = new Array<ProcessCondition>();
    let processInputs = new Array<ProcessInput>();
    let unitPreferences = new Array<Preference>();

    let outputGridRow = new OutputGridRow;
    let outputGridRows = new Array<OutputGridRow>();
    let outputItems = new Array<OutputItem>();
    let messages = new Array<OutputGridRowMessageItem>();
    if (!savedProjectDetails) {
      return null;
    }

    jobSizing = this.saveData(jobSizing, this.project, job, sizingData, processConditions, processInputs, unitPreferences, outputGridRow, outputGridRows, outputItems, messages);

    //save header details
    this.project.name = savedProjectDetails.name;
    this.project.customerName = savedProjectDetails.customerName;
    this.project.projectReference = savedProjectDetails.projectReference;
    // Update the local Project/Job header details for UI.
    this.projectName = savedProjectDetails.name;
    this.jobName = savedProjectDetails.jobs.length > 1 ? savedProjectDetails.jobs[1].name : savedProjectDetails.jobs[0].name;

    if (savedProjectDetails.jobs.length > 1) {
      // save as call
      job.name = savedProjectDetails.jobs[1].name;
      job.plantOwner = savedProjectDetails.jobs[1].plantOwner;
    } else {
      // save call
      job.name = savedProjectDetails.jobs[0].name;
      job.plantOwner = savedProjectDetails.jobs[0].plantOwner;
    }

    job.moduleId = 5;
    job.productName = "Easiheat";
    this.moduleId = 5;
    this.productName = "Easiheat";

    if (this.ehOutputData.length > 0) {
      job.jobStatusId = 3; //Selected
      this.jobStatusId = 3;
    } else {
      job.jobStatusId = 1; // Input
      this.jobStatusId = 1;
    }

    //if (this.gridSelectedRow) {
    //  job.jobStatusId = 3; // Selected
    //  this.jobStatusId = 3;
    //}

    if (typeof savedProjectDetails.id === 'undefined') {
      this.project.id = ""; // new Guid required from API
      job.projectId = ""; // new Guid required from API
    } else {
      job.projectId = savedProjectDetails.id;
    }

    //save objects into appropriate sizing data objects
    this.project.jobs = new Array<Job>();
    this.project.jobs[0] = job;

    jobSizing.project = this.project;


    this.sizingModuleForm.markAsUntouched;

    return jobSizing;
  }

  saveData(jobSizing: JobSizing, project: Project, job: Job,
    sizingData: SizingData, processConditions: Array<ProcessCondition>,
    processInputs: Array<ProcessInput>, unitPreferences: Array<Preference>, outputGridRow: OutputGridRow, outputGridRows: Array<OutputGridRow>, outputItems: Array<OutputItem>, messages: Array<OutputGridRowMessageItem>): JobSizing {

    //save shared process conditions
    processInputs.push({ name: "Application Type", value: this.ApplicationType, unitId: 0, listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Inlet Pressure", value: this.inletpressure.value, unitId: parseInt(this.pressureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Total Back Pressure", value: this.totalbackpressure.value, unitId: parseInt(this.pressureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Inlet Temperature", value: this.inlettemperature.value, unitId: parseInt(this.temperatureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Outlet Temperature", value: this.outlettemperature.value, unitId: parseInt(this.temperatureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Water Flow Rate", value: this.waterflowrate.value, unitId: parseInt(this.volumetricFlowRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Load", value: this.load.value, unitId: parseInt(this.loadRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Maximum Pressure Drop", value: this.maxPressureDrop_Enumeration.value, unitId: this.maximum_Pressure_Drop_Unit == 'PSI' ? 45 : 39, listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Hide HE Model From Sizing", value: String(this.hideHEmodelFromSizing), unitId: 0, listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "DHW boolean", value: String(this.dhw), unitId: 0, listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "HTGCC boolean", value: String(this.htgcc), unitId: 0, listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "High Limit Actuation Visible", value: String(this.highLimitActuation), unitId: 0, listItemId: null, value2: "", childInputs: null });
    //save extra process conditions depending on Application Type
    if (this.ApplicationType == "DHW") {

      processInputs.push({ name: "Motive Inlet Pressure Visible", value: String(this.motiveInletPressureAvailable), unitId: 0, listItemId: null, value2: "", childInputs: null });
      processInputs.push({ name: "Motive Inlet Pressure", value: this.motiveinletpressure.value, unitId: parseInt(this.pressureRef.preference.value), listItemId: null, value2: "", childInputs: null });

      processInputs.push({ name: "Noise Limit", value: this.noiseLimit_Enumeration.value, unitId: 0, listItemId: null, value2: "", childInputs: null });

      processInputs.push({ name: "CV Split Range Visible", value: String(this.cvSplitRangeAvailable), unitId: 0, listItemId: null, value2: "", childInputs: null });
      processInputs.push({ name: "CV Split Range", value: String(this.cvSplitRange), unitId: 0, listItemId: null, value2: "", childInputs: null });

      processInputs.push({ name: "Is EasiHeat Sizing Done", value: String(this.isEasiHeatSizingDone), unitId: 0, listItemId: null, value2: "", childInputs: null });
    }

    if (this.ApplicationType == "HTGCC") {
      processInputs.push({ name: "PRV Visible", value: String(this.prvAllowed), unitId: 0, listItemId: null, value2: "", childInputs: null });
      processInputs.push({ name: "PRV Ticked", value: String(this.inputPRV), unitId: 0, listItemId: null, value2: "", childInputs: null });
      processInputs.push({ name: "Package Inlet Pressure", value: this.packageinletpressure.value, unitId: parseInt(this.pressureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    }

    if (this.ApplicationType == "HTGSC") {
      processInputs.push({ name: "HTGSC Visible", value: String(this.sellSteamControl), unitId: 0, listItemId: null, value2: "", childInputs: null });

      processInputs.push({ name: "CV Split Range Visible", value: String(this.cvSplitRangeAvailable), unitId: 0, listItemId: null, value2: "", childInputs: null });
      processInputs.push({ name: "CV Split Range", value: String(this.cvSplitRange), unitId: 0, listItemId: null, value2: "", childInputs: null });

      processInputs.push({ name: "Motive Inlet Pressure Visible", value: String(this.motiveInletPressureAvailable), unitId: 0, listItemId: null, value2: "", childInputs: null });
      processInputs.push({ name: "Motive Inlet Pressure", value: this.motiveinletpressure.value, unitId: parseInt(this.pressureRef.preference.value), listItemId: null, value2: "", childInputs: null });

      processInputs.push({ name: "Noise Limit", value: this.noiseLimit_Enumeration.value, unitId: 0, listItemId: null, value2: "", childInputs: null });
    }


    // Create Maximum Pressure Drop Preference
    var maxPressureDropPref = new Preference();
    maxPressureDropPref.name = "MaxPressureDropUnit";
    maxPressureDropPref.decimalPlaces = 2;
    maxPressureDropPref.isUnit = true;
    maxPressureDropPref.masterTextKey = this.maximum_Pressure_Drop_Name;
    maxPressureDropPref.unitName = this.maximum_Pressure_Drop_Unit;
    maxPressureDropPref.value = this.maximum_Pressure_Drop_Unit == 'PSI' ? "45" : "39";

    // Save unit preferences.
    unitPreferences.push(this.pressureRef.preference);
    unitPreferences.push(this.temperatureRef.preference);
    unitPreferences.push(this.volumetricFlowRef.preference);
    unitPreferences.push(this.loadRef.preference);
    unitPreferences.push(maxPressureDropPref);

    processConditions.push({ name: this.jobName, processInputs: processInputs, unitPreferences: unitPreferences });

    sizingData.processConditions = new Array<ProcessCondition>();
    sizingData.processConditions = processConditions;

    //save sizing grid results
    outputGridRow.outputItems = [];
    outputGridRow.messages = [];

    this.ehOutputData.forEach(obj => {

      var dc = this.design_Code_Enumeration.value;

      //if (!!this.selectedOutputData[0].modelSizingMessages) {

      //  this.selectedOutputData[0].modelSizingMessages.forEach(m => {

      //    outputGridRow.messages.push({
      //      messageKey: m.messageKey,
      //      value: m.value,
      //      unitKey: m.unitKey,
      //      severity: m.severity,
      //      displayValue: m.displayValue
      //    });
      //  });
      //}

      if (this.ehOutputData[0].modelSizingMessages.length >= 0) {

        this.ehOutputData[0].modelSizingMessages.forEach(m => {

          outputGridRow.messages.push({
            messageKey: m.messageKey,
            value: m.value,
            unitKey: m.unitKey,
            severity: m.severity,
            displayValue: m.displayValue
          });
        });
      }

      outputGridRow.outputItems.push({
        name: "EasiHeat Unit",
        value: obj.unitModel.toString(),
        unitId: null,
        selected: false,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Trim Type",
        value: obj.trimType.toString(),
        unitId: null,
        selected: false,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Length",
        value: obj.length.toString(),
        unitId: null,
        selected: false,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Height",
        value: obj.height.toString(),
        unitId: null,
        selected: false,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Width",
        value: obj.width.toString(),
        unitId: null,
        selected: false,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Weight",
        value: obj.weight.toString(),
        unitId: null,
        selected: false,
        listItemId: null,
        type: null
      });

      //outputGridRow.outputItems.push({
      //  name: "Package Inlet Connection Size",
      //  value: dc != 'A' ? obj.inletSize.toString() : obj.inletSizeAnsi.toString(),
      //  unitId: null,
      //  selected: false,
      //  listItemId: null,
      //  type: null
      //});

      outputGridRow.outputItems.push({
        name: "Control Valve Size",
        value: dc != 'A' ? obj.cvSize.toString() : obj.cvSizeAnsi.toString(),
        unitId: null,
        selected: false,
        listItemId: null,
        type: null
      });

      //outputGridRow.outputItems.push({
      //  name: "Condensate Pipe Size",
      //  value: dc != 'A' ? obj.condensatePipeSize.toString() : obj.condensatePipeSizeAnsi.toString(),
      //  unitId: null,
      //  selected: false,
      //  listItemId: null,
      //  type: null
      //});

      //outputGridRow.outputItems.push({
      //  name: "Secondary Inlet and Outlet Pipe Size",
      //  value: dc != 'A' ? obj.inletOutletPipeSize.toString() : obj.inletOutletPipeSizeAnsi.toString(),
      //  unitId: null,
      //  selected: false,
      //  listItemId: null,
      //  type: null
      //});

      outputGridRow.outputItems.push({
        name: "Heat Exchange Plate Type",
        value: obj.heatExchangerPlateType.toString(),
        unitId: null,
        selected: false,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Actual Secondary Pressure Drop",
        value: obj.secondaryPressureDrop.toString(),
        unitId: null,
        selected: false,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Number Of Plates",
        value: obj.numberOfPlates.toString(),
        unitId: null,
        selected: false,
        listItemId: null,
        type: null
      });

      outputGridRows.push(outputGridRow);

      //clear for next iteration
      outputGridRow = new OutputGridRow();
      outputGridRow.outputItems = [];
      outputGridRow.messages = [];
    });

    //save options and pricet
    if (this.isEasiHeatSizingDone) {
      outputItems.push({ name: this.actuator_Name, value: this.actuator_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.high_Limit_Options_Name, value: this.high_Limit_Options_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.high_Limit_Actuation_Name, value: this.high_Limit_Actuation_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.design_Code_Name, value: this.design_Code_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.control_System_Name, value: this.control_System_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.gasket_Name, value: this.gasket_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.isolation_Name, value: this.isolation_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.remote_Access_Name, value: this.remote_Access_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.communications_Name, value: this.communications_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.energy_Monitoring_Name, value: this.energy_Monitoring_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.jacking_Wheels_Name, value: this.jacking_Wheels_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.en12828_Compliant_Name, value: this.en12828_Compliant_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      if (this.ApplicationType == "DHW" || this.ApplicationType == "HTGSC") {
        outputItems.push({ name: this.condensate_Removal_Name, value: this.condensate_Removal_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      }

      // Save PED connection Sizes
      outputItems.push({ name: "InletSize", value: this.ehPricingOutputData.inletSize, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "CondensateSize", value: this.ehPricingOutputData.condensatePipeSize, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "InletOutletSize", value: this.ehPricingOutputData.inletOutletPipeSize, unitId: null, selected: false, listItemId: null, type: null });

      // Save ANSI connection sizes
      outputItems.push({ name: "InletSizeAnsi", value: this.ehPricingOutputData.inletSizeAnsi, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "CondensateSizeAnsi", value: this.ehPricingOutputData.condensatePipeSizeAnsi, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "InletOutletSizeAnsi", value: this.ehPricingOutputData.inletOutletPipeSizeAnsi, unitId: null, selected: false, listItemId: null, type: null });

      // Pricing details
      outputItems.push({ name: "SellingCurrencySymbol", value: this.sellingCurrencySymbol, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "SSP", value: this.internal_SSP == null ? "" : this.internal_SSP.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Selling Price", value: this.internal_SellingPrice == null ? "" : this.internal_SellingPrice.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Service Offering Label", value: this.serviceOfferingKey, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Service Offering Price", value: this.internal_ServiceOfferingPrice.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Service Offering Enumeration", value: this.serviceOfferingOptionsFormControl.value.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Service Offering Name", value: this.service_Offering_Name, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Delivery Cost", value: this.deliveryCost.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Total Price", value: this.internal_TotalPrice.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Unit And Heat Exchanger Internal SSP", value: this.unit_and_eh_internal_SSP.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Unit And Heat Exchanger Internal Selling Price", value: this.unit_and_eh_internal_SellingPrice.toString(), unitId: null, selected: false, listItemId: null, type: null });

      outputItems.push({ name: "Selling Markup", value: this.sellingMarkupFormControl.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Gross Margin", value: this.grossMarginFormControl.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Service Offering Enumeration", value: this.serviceOfferingFormControl.value, unitId: null, selected: false, listItemId: null, type: null });

      outputItems.push({ name: "SellingMarkupUpdated", value: this.sellingMarkupUpdated.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "GrossMarginUpdated", value: this.grossMarginUpdated.toString(), unitId: null, selected: false, listItemId: null, type: null });

      outputItems.push({ name: "Nomenclature", value: this.nomenclature, unitId: null, selected: false, listItemId: null, type: null });
    }


    // save spec sheet header details
    outputItems.push({ name: "IsSpecSheetEnabled", value: this.isSpecSheetEnabled.toString(), unitId: null, selected: false, listItemId: null, type: null });

    if (this.sheet.value != null) {
      outputItems.push({ name: "Sheet", value: this.sheet.value, unitId: null, selected: false, listItemId: null, type: null });
    }

    if (this.revisionNumber.value != null) {
      outputItems.push({ name: "Revision No", value: this.revisionNumber.value, unitId: null, selected: false, listItemId: null, type: null });
    }

    if (this.projectType.value != null) {
      outputItems.push({ name: "Project Type", value: this.projectType.value, unitId: null, selected: false, listItemId: null, type: null });
    }

    if (this.quantity.value != null) {
      outputItems.push({ name: "Quantity", value: this.quantity.value, unitId: null, selected: false, listItemId: null, type: null });
    }

    if (this.aoNumber.value != null) {
      outputItems.push({ name: "AO Number", value: this.aoNumber.value, unitId: null, selected: false, listItemId: null, type: null });
    }

    if (this.orderNumber.value != null) {
      outputItems.push({ name: "Order No", value: this.orderNumber.value, unitId: null, selected: false, listItemId: null, type: null });
    }

    if (this.notes.value != null) {
      outputItems.push({ name: "Note 1", value: this.notes.value, unitId: null, selected: false, listItemId: null, type: null });
    }




    //if (this.translatedMessagesList.length > 0) {

    //  for (var i = 0; i < 5; i++) {
    //    if (this.translatedMessagesList[i] != null) {
    //      outputItems.push({ name: "Message " + i, value: this.translatedMessagesList[i].toString(), unitId: null, selected: false, listItemId: null, type: null });

    //    } else {
    //      outputItems.push({ name: "Message " + i, value: "-", unitId: null, selected: false, listItemId: null, type: null });
    //    }
    //  }
    //}

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

  repackageSizing() {

    let jobSizing = new JobSizing;
    this.project = new Project;
    let job = new Job;
    let sizingData = new SizingData;
    let processConditions = new Array<ProcessCondition>();
    let processInputs = new Array<ProcessInput>();
    let unitPreferences = new Array<Preference>();
    let outputItems = new Array<OutputItem>();
    let messages = new Array<OutputGridRowMessageItem>();
    let outputGridRow = new OutputGridRow;
    let outputGridRows = new Array<OutputGridRow>();

    jobSizing = this.saveData(jobSizing, this.project, job, sizingData, processConditions, processInputs, unitPreferences, outputGridRow, outputGridRows, outputItems, messages);

    jobSizing.project = new Project;
    jobSizing.project.jobs = new Array<Job>();
    jobSizing.project.jobs[0] = job;
    jobSizing.project.jobs[0].id = (!!this.jobId ? this.jobId : "");

    this.projectsJobsService.updateJobSizing(jobSizing).subscribe((response: GetSizingJobRequest) => {

      this.jobId = response.toString();

      if (!!response) {
        this.saveJobSuccess = true;
      } else {
        this.saveJobSuccess = false;
      }

      this.sizingModuleForm.markAsPristine();
      this.sizingModuleForm.markAsUntouched();


    });

  }

  /**
   * Determines which icon to use based on the given severity.
   * @param severity
   */
  getSeverityIcon(severity: number): string {

    const hashItem = this.severityHash[severity];

    return !!hashItem ? hashItem.icon : this.severityHash[0].icon;
  }

  /**
   * Determines which icon to use based on the given severity for the data row.
   * @param row
   */
  getRowSeverityIcon(row): string {
    // First, check if the current row has been returned with any sizing messages?
    if (this.severityHash && this.severityHash.length > 0 && row.modelSizingMessages && row.modelSizingMessages.length > 0) {
      // Error takes precedence over any other severity.
      if (row.modelSizingMessages.find(item => item.severity === 2)) {
        return this.severityHash[2].icon;
      }
      else if (row.modelSizingMessages.find(item => item.severity === 1)) {
        return this.severityHash[1].icon;
      }

      return this.severityHash[0].icon;
    }
  }

  onServiceOfferingLoad(event: any) {
    if (!this.isLoadingJob) {
      this.calculateServiceOfferingPrice(event);
    }
  }

  onServiceOfferingChange(event: any) {
    this.resetLoadingJobStatus();

    this.calculateServiceOfferingPrice(event);
  }

  /**
   * Method to select service offerings cost based on service offering selections.
  */
  calculateServiceOfferingPrice(event: any) {
    switch (event.selectedValue) {
      case "No Service Offering":
        this.internal_ServiceOfferingPrice = 0;
        this.serviceOfferingKey = this.translatePipe.transform('NO_SERVICE_OFFERING', false);
        break;
      case "Commission Only":
        this.internal_ServiceOfferingPrice = this.commissionCost;
        this.serviceOfferingKey = this.translatePipe.transform('COMMISSION_ONLY', false);
        break;
      case "Extended Warranty Year 1":
        this.internal_ServiceOfferingPrice = this.oneYearWarrantyCost;
        this.serviceOfferingKey = this.translatePipe.transform('1_YEAR_EXTENDED_WARRANTY', false);
        break;
      case "Extended Warranty Year 2":
        this.internal_ServiceOfferingPrice = this.twoYearWarrantyCost;
        this.serviceOfferingKey = this.translatePipe.transform('2_YEAR_EXTENDED_WARRANTY', false);
        break;
      case "Extended Warranty Year 3":
        this.internal_ServiceOfferingPrice = this.threeYearWarrantyCost;
        this.serviceOfferingKey = this.translatePipe.transform('3_YEAR_EXTENDED_WARRANTY', false);
        break;
    }

    this.display_ServiceOfferingPrice = this.localizeValue(this.internal_ServiceOfferingPrice, 0);

    // Update total price.
    this.calculateTotalPrice();
  }

  onLoadOptionEvent(optionName: string, event: any) {
    if (!this.isLoadingJob) {
      this.filterOptionList(optionName, event);
    }
  }

  onChangeOptionEvent(optionName: string, event: any) {

    this.resetLoadingJobStatus();

    this.filterOptionList(optionName, event);
  }


  /**
   * Method to handle pricing options based on selections of other options.
  */
  filterOptionList(optionName: string, event: any) {


    // WARNING! Do not set defaults with ...Enumeration.setValue() in this method, it will over write freshly loaded job data.
    // After sizing defaults are set in setupDefaultOptionsForSizingSelection()
    // Job loading defaults see loadJob().
    // NO enumberation/list defaults HERE! or in any method called from here.
    if (!this.isResetButtonClicked) {
      if (event && event.selectedValue) {
        if (event.selectedValue === null) {
          event.selectedValue = "";
        }

        switch (optionName) {

          case 'actuator_Enum':
            if (!isUndefined(this.actuator_Enum)) {
              if (this.actuator_Enum.internalValue == "EL4" && !isNullOrUndefined(this.high_Limit_Options_Enum.internalValue)) {

                if (this.high_Limit_Options_Enum.internalValue.includes("HL") || this.ApplicationType == "HTGCC") {

                  this.highLimitActuation = true;
                }

              }
              else {
                this.highLimitActuation = false;
              }
              this.filterControlSystemPanelList(this.actuator_Enum.internalValue);
            }

            break;

          case 'high_Limit_Options_Enum':
            if (!isUndefined(this.actuator_Enum)) {
              if (this.actuator_Enum.internalValue == "EL4" && this.high_Limit_Options_Enum.internalValue.includes("HL")) {

                this.highLimitActuation = true;

              }
              else {
                this.highLimitActuation = false;
              }
              this.filterControlSystemPanelList(this.high_Limit_Options_Enum.internalValue);
            }
            break;

          case 'control_System_Enum':


            //NONE_(N) or Process_Controller_240V_(P2)
            if (event.selectedValue == 'N' || event.selectedValue == 'P2') {

              this.isEnergyMonitoringEnabled = false;
              this.energy_Monitoring_Enumeration.setValue('');
              //this.energy_Monitoring_Enumeration.disable();
              this.isEn12828CompliantEnabled = false;
              this.en12828_Compliant_Enumeration.setValue('');

              //Bug 3910 - tbc
              //if (this.isNone == false) {
              //  this.remote_Access_Enum.enumerationCollection.push({ masterTextKey: "NONE", defaultText: "None", value: "N", extraPostText: null, isDeleted: false, sequence: 0, translationText: "None" });
              //  this.remote_Access_Enumeration.setValue("N");
              //}

              //if (!isUndefined(this.communications_Enum)) {
              //  if (this.isCommNone == false) {
              //    this.communications_Enum.enumerationCollection.push({ masterTextKey: "NONE", defaultText: "None", value: "N", extraPostText: null, isDeleted: false, sequence: 0, translationText: "None" });
              //    this.communications_Enumeration.setValue("N");
              //  }
              //}

              //}

              this.remoteAccess = false;
              this.remote_Access_Enumeration.setValue('');
              this.communications = false;
              this.communications_Enumeration.setValue('');

            }
            else {


              if (!isUndefined(this.remote_Access_Enum)) {

                if (this.isNone == false) {
                  this.remote_Access_Enum.enumerationCollection.splice(0, 1);
                }
              }
              else {

                //Bug 3910 - tbc
                //if (this.isNone == false) {
                //  this.remote_Access_Enum.enumerationCollection.splice(0, 1);
                //}

                if (this.isCommNone == false) {
                  this.communications_Enum.enumerationCollection.splice(0, 1);
                }
                //if (!isUndefined(this.communications_Enum)) {
                //  if (this.isCommNone == false) {
                //    this.communications_Enum.enumerationCollection.splice(0, 1);
                //  }
                //}

              }

              this.remoteAccess = true;
              this.communications = true;
              if (this.ApplicationType == 'DHW' && this.DHWEnergyMonitoringEnabledPref) {
                this.isEnergyMonitoringEnabled = true;
              }
              if (this.ApplicationType != 'DHW' && this.HTGEnergyMonitoringEnabledPref) {
                this.isEnergyMonitoringEnabled = true;
              }

              //Panels that do not require EN12828Compliant
              //SIMS_Panel_230V_Asia_PAC_(T4),
              //SIMS_Panel_110V_Asia_PAC_(T7),
              //SIMS_Panel_Korea_(T8),
              //SIMS_Panel_Japan(T9),
              //SIMS_PANEL_110V_UL(T6),
              //SIMS_PANEL_110V_AMERICAS(T5),
              //SIMS_PANEL_230V_AMERICAS(T3)
              var doNotRequireEn12828Compliant: Array<string> = ['T4', 'T7', 'T8', 'T9', 'T6', 'T5', 'T3'];
              if (doNotRequireEn12828Compliant.find(controlSystem => controlSystem.includes((event.selectedValue).toString()))) {
                this.isEn12828CompliantEnabled = false;
                this.en12828_Compliant_Enumeration.setValue('');
              }
              // SIMS_Panel_230V_EU1_(T1), SIMS_Panel_230V_EU2_(T1)
              else {

                if (this.ApplicationType == 'DHW') {

                  if (this.DHWENCompliantEnabledPref) {
                    this.isEn12828CompliantEnabled = true;
                  }

                }
                else {

                  if (this.HTGENCompliantEnabledPref) {
                    this.isEn12828CompliantEnabled = true;
                  }

                }
              }
            }
            break;

          case 'condensate_Removal_Enum':

            try {
              if (!isUndefined(this.condensate_Removal_Enum)) {
                if (this.sizedCondensateRemoval != event.selectedValue && this.sizedCondensateRemoval != "") {

                  // Commented out the "if" as it was not working if a PT was the first value -  remove later if this passes testing - KNG
                  //             if (event.selectedValue != 'ST') {
                  //if (!this.condensateRemovalChanged) {

                  this.userCondensate = !this.calcTriggerListChanged;
                  this.condensate_Removal_Enumeration.setValue(event.selectedValue);
                  this.isEasiHeatSizingDone = false;

                  // Else leg no longer required - Remove later if passes testing - KNG
                  //else {
                  //  this.userCondensate = false;
                  //  this.condensate_Removal_Enumeration.setValue("ST");
                  //  this.isEasiHeatSizingDone = false;
                  //}
                  this.calcTriggerListChanged = true;
                } else break
              } else break;
            }
            finally {
              if (!this.isEasiHeatSizingDone && !this.isLoadingJob) {
                this.isEasiHeatReSizingDone = true;
                this.onCalculateSizing();
              }
            }
            break;

          case 'design_Code_Enum':
            try {
              if (!isUndefined(this.design_Code_Enum)) {

                this.design_Code_Enumeration.setValue(event.selectedValue);
                this.isEasiHeatSizingDone = false;
                this.maximum_Pressure_Drop_Name = event.selectedValue != "A" ? "PressureDrop_EasiHeat" : "PressureDropPsiRounded_EasiHeat";
                this.maximum_Pressure_Drop_Unit = event.selectedValue != "A" ? "KPA" : "PSI";
                this.setMaxPressureDropValue(this.ApplicationType, event.selectedValue);

              } else break;
            }
            finally {
              if (!this.isEasiHeatSizingDone && this.doSizing) {
                this.isEasiHeatReSizingDone = true;
                this.onCalculateSizing();
              }
            }
            break;

          case 'gasket_Enum':
            try {
              if (!isUndefined(this.gasket_Enum)) {

                var enumerationname;
                if (this.ApplicationType != 'HTGCC') {
                  enumerationname = "NomGasketDHW_EasiHeat";
                }
                else {
                  enumerationname = "NomGasketHTG_EasiHeat";
                }
                var gasket_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === false && mp.enumerationName === enumerationname)[0];

                this.gasket_Enumeration.setValue(event.selectedValue)

                // Set Gasket default text for sizing (onCalculate())
                if (!!gasket_Enumeration_Items && !!gasket_Enumeration_Items.enumerationDefinitions && gasket_Enumeration_Items.enumerationDefinitions.length > 0) {
                  this.gasket_Value_Default_Text = gasket_Enumeration_Items.enumerationDefinitions.find(g => g.value === event.selectedValue).defaultText;
                }

                this.calcTriggerListChanged = true;
                this.isEasiHeatSizingDone = false;
              } else break
            }
            finally {
              // Gasket Change Requires Recalculation
              if (!this.isEasiHeatSizingDone && !this.isLoadingJob && this.doSizing) {
                this.isEasiHeatReSizingDone = true;
                this.onCalculateSizing();
              }
            }
            break;

          case 'isolation_Enum':

            if (this.design_Code_Initial_Value != 'A') {
              this.packInletConnSize.setValue(this.ehPricingOutputData.inletSize)
            }
            else {
              this.packInletConnSize.setValue(this.ehPricingOutputData.inletSizeAnsi)
            }
            break;
        }
      }
    }


    // this.cdRef.detectChanges(); // This ain't good, I wonder why we call this here?
  }

  setSizingOptionListToDefault(EnumComponent: EnumerationComponent, filterList: any[], EnumerationFormControl: FormControl) {
    if (filterList.length > 0) {
      if (!!EnumComponent
        && !!EnumComponent.enumerationCollection
        && EnumComponent.enumerationCollection.length > 0
        && !!EnumComponent.enumerationCollection[0].value
        && filterList.some(x => x === EnumComponent.enumerationCollection[0].value) // Make sure the ModPref default is available in the UI filter list hard coded here.
      ) {
        EnumerationFormControl.setValue(EnumComponent.enumerationCollection[0].value); // Uses the default defined in the original list order
      }
      //else { side effects on first sizing if the default doesn't allign with the ModPref default list item!
      //  EnumerationFormControl.setValue(filterList[0]); //This default is hard coded and ignores ModPref sequencing! Last resort?
      //}
    }
  }

  // Gasket code in the list isn't the same as that required by Alfa Laval DLL. Change the value to correct one.
  setGasketCode(Gasket: string) {
    switch (Gasket) {
      case "EPDMP":
        this.gasket_Value_Default_Text = "EPDMP";
        break;

      case "HeatSeal":
        this.gasket_Value_Default_Text = "FKMT";
        break;

      case "WRAS FKMFF":
        this.gasket_Value_Default_Text = "FKMFF";
        break;

      case "WRAS EPDMFF":
        this.gasket_Value_Default_Text = "EPDMFF";
        break;
    }
  }


  /**
   Method to determine visibility of CSG options.
   Returns False if the list contains only 'None' option, Else returns True.
  */
  getOptionVisibilityStatus(event: any) {
    if (event.selectedValue === 'None_N' && event.itemsCount === 1) {
      return false;
    } else {
      return true;
    }
  }

  ///**
  // Method to localize csg output data display values.
  //*/
  //localizeEHOutputData() {
  //  if (this.ehOutputData) {
  //    this.ehOutputData.secondaryPressureDrop =+ this.localizeValue(this.ehOutputData.secondaryPressureDrop,2);
  //  };
  //}


  /**
   Method to localize values.
  */
  localizeValue(value: any, decimalPoints: number) {
    return this.localeService.formatDecimal(value.toFixed(decimalPoints));
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

  toggleDebug() {
    if (this.user.username.indexOf('PRS dev admin ') >= 0) {
      this.debugDataEnabled = !this.debugDataEnabled;
    }
    if (this.debugDataEnabled) {
      // reprice for debug
      //this.calculatePrice();
      this.debugData = "Feature disabled.";
    }
  }

  closeAlert(): void {
    // Reset the flag
    this.alertVisible = false;
  }

  IsNumeric(value: string) {
    if (!value) {
      return false;
    }

    var isNumber = true;

    // Attempt to parse the string as a double.
    if (!isNumeric(value)) {
      isNumber = false;
    }

    return isNumber;

  }

  /// <summary>
  /// calculates Water Flow Rate based on Load
  /// </summary>
  CalcWaterFlowRate(control: AbstractControl) {
    if (control.value !== "") {

      // check if both temperatures have been entered and if load is entered and valid
      if (!this.userChangedVolumetricFlow && this.IsNumeric(this.inlettemperature.value) && this.IsNumeric(this.outlettemperature.value)
        && this.temperatureRef != null && this.IsNumeric(this.load.value) && this.volumetricFlowRef != null) {

        // Add details into the calculation model.
        var ehFlowOrLoad: EasiheatFlowOrLoad = new EasiheatFlowOrLoad();

        ehFlowOrLoad.inletTemperature = +this.inlettemperature.value;
        ehFlowOrLoad.outletTemperature = +this.outlettemperature.value;
        ehFlowOrLoad.temperatureUnits = +this.temperatureRef.preference.value;
        ehFlowOrLoad.value = +this.load.value;
        ehFlowOrLoad.flowUnits = +this.volumetricFlowRef.preference.value;
        ehFlowOrLoad.loadUnits = +this.loadRef.preference.value;

        this.EasiheatService.calculateVolumetricFlow(ehFlowOrLoad).subscribe((result: number) => {
          // Check if there's any validation errors? If so, set form control and error message accordingly.
          if (!isNullOrUndefined(result)) {

            //calculated volumetric flow value
            console.log("calculated volumetric flow is : " + result.toString());
            if (result > -1) {
              var decimalPlaces = this.userPrefs.find(m => m.name === "VolumetricFlowUnit").decimalPlaces;
              var tempWaterFlow = parseFloat(result.toFixed(decimalPlaces));

              //              this.sizingModuleForm.get('waterflowrate').setValidators([Validators.required]);
              this.waterflowrate.setValue(tempWaterFlow);
              //this.waterflowrate.updateValueAndValidity();
              this.waterFlowRateValidationErrorMessage.value = '';
              this.waterflowrate.setErrors(null);
              this.volumetricFlowBefore = this.waterflowrate.value;
            }
          }
        });
      }
    }
    //    this.userChangedVolumetricFlow = false;
    return null
  }

  /// <summary>
  /// calculates Load based on Water Flow Rate
  /// </summary>
  CalcLoad(control: AbstractControl) {
    console.log('CalcLoad');
    if (control.value !== "") {

      setTimeout(() => {
        // check if both temperatures have been entered and if load is entered and valid
        if (this.userChangedVolumetricFlow && this.IsNumeric(this.inlettemperature.value) && this.IsNumeric(this.outlettemperature.value)
          && this.temperatureRef != null && this.IsNumeric(this.waterflowrate.value) && this.loadRef != null) {

          // Add details into the calculation model.
          var ehFlowOrLoad: EasiheatFlowOrLoad = new EasiheatFlowOrLoad();

          ehFlowOrLoad.inletTemperature = +this.inlettemperature.value;
          ehFlowOrLoad.outletTemperature = +this.outlettemperature.value;
          ehFlowOrLoad.temperatureUnits = +this.temperatureRef.preference.value;
          ehFlowOrLoad.value = +this.waterflowrate.value;
          ehFlowOrLoad.flowUnits = +this.volumetricFlowRef.preference.value;
          ehFlowOrLoad.loadUnits = +this.loadRef.preference.value;

          this.EasiheatService.calculateLoad(ehFlowOrLoad).subscribe((result: number) => {
            // Check if there's any validation errors? If so, set form control and error message accordingly.
            if (!isNullOrUndefined(result)) {

              //calculated volumetric flow value
              console.log("calculated Load is : " + result.toString());

              // No longer validating a calculated value so need to do decimal places here as well
              var decimalPlaces = this.userPrefs.find(m => m.name === "LoadUnit").decimalPlaces;
              var tempLoad = parseFloat(result.toFixed(decimalPlaces));

              // Don't validate a calculated field so turn off validators before setting value. This is as per V1. Can be reviewed for Gen 4.
              //this.sizingModuleForm.get('load').setValidators([Validators.required]);
              this.load.setValue(tempLoad);
              //this.load.updateValueAndValidity();
              //this.sizingModuleForm.get('load').setValidators([Validators.required, (c) => this.validateLoadInput(c, this.loadRef, this.loadValidationErrorMessage), (c) => this.CalcWaterFlowRate(c), (c) => this.validateProcessConditions(c, 'InputLoad', this.loadRef, this.validateProcessConditionsErrorMessage)]);
              this.loadValidationErrorMessage.value = ''
              this.load.setErrors(null);
              //this.validateWaterFlowRate(this.waterflowrate, this.volumetricFlowRef, this.temperatureRef, this.waterFlowRateValidationErrorMessage);

              this.loadBefore = this.load.value;
              //this.sizingModuleForm.get('waterflowrate').setValidators([Validators.required, (c) => this.validateWaterFlowRate(c, this.volumetricFlowRef, this.temperatureRef, this.waterFlowRateValidationErrorMessage), (c) => this.CalcLoad(c), (c) => this.validateProcessConditions(c, 'InputFlowRate', this.volumetricFlowRef, this.validateProcessConditionsErrorMessage)]);

            }
          });

        }
      }, 150);

      //}
    }
    return null
  }

  // When Temperatures change we need to calculated either flow or load depending on which of them was user entered.
  // If user entered flow calculate load and the converse for user entered load.
  // In both cases we need also to validate the user entered flow or load field again for the new temperatures.
  calculateFlowOrLoad(control: AbstractControl) {
    if (this.userChangedVolumetricFlow) {
      this.CalcLoad(control);
      if (!isNullOrUndefined(this.waterflowrate)) {
        this.sizingModuleForm.get('waterflowrate').setValidators([Validators.required, (c) => this.validateWaterFlowRate(c, this.volumetricFlowRef, this.temperatureRef, this.waterFlowRateValidationErrorMessage), (c) => this.validateProcessConditions(c, 'InputFlowRate', this.volumetricFlowRef, this.validateProcessConditionsErrorMessage)]);
        this.waterflowrate.updateValueAndValidity();
        this.sizingModuleForm.get('waterflowrate').setValidators([Validators.required]);
      }
    }
    else {
      this.CalcWaterFlowRate(control);
      if (!isNullOrUndefined(this.load)) {
        this.sizingModuleForm.get('load').setValidators([Validators.required, (c) => this.validateLoadInput(c, this.loadRef, this.loadValidationErrorMessage), (c) => this.validateProcessConditions(c, 'InputLoad', this.loadRef, this.validateProcessConditionsErrorMessage)]);
        this.load.updateValueAndValidity();
        this.sizingModuleForm.get('load').setValidators([Validators.required]);
      }
    }
  }

  SetApplicationType() {

    this.sizedCondensateRemoval = "";
    this.doSizing = false;
    this.isEasiHeatReSizingDone = false;
    this.ehOutputData = [];
    this.translatedMessagesList = [];

    // Added new variable to store previous applicaton type. Use to control temperature defaults within HTG.
    var oldApllicationType = this.ApplicationType;

    this.ApplicationType = this.dhw ? "DHW" : this.htgcc ? "HTGCC" : "HTGSC"
    this.ehUnitName = this.dhw ? "EHD" : this.htgcc ? "EHHCC" : "EHHSC"
    //this.projectName = null;
    //this.projectId = null;
    //this.jobName = null;
    //this.jobId = null;
    this.serviceOfferingOptionsFormControl.setValue('');

    // When resetting the form the gasket change is triggered. Need to then reset the calcTriggerListChanged flag
    // to make sure condensate removal list is handled correctly
    this.sizingModuleForm.controls['pricingOptions'].reset();
    this.calcTriggerListChanged = false;

    this.motiveinletpressure.setValue('');

    if (!this.isResetButtonClicked) {
      this.inletpressure.setValue(this.inletpressure.value);
      this.totalbackpressure.setValue(this.totalbackpressure.value);
      this.waterflowrate.setValue(this.waterflowrate.value);
      this.load.setValue(this.load.value);
    }
    else {
      this.inletpressure.setValue('');
      this.totalbackpressure.setValue('');
      this.waterflowrate.setValue('');
      this.load.setValue('');
    }

    this.cvSplitRange = false;

    // inputPRV was already being set to false correctly but if inputPRV had been set to true in HTG and then switch to DHW th validator for package inlet pressure was still set to required so was impossible to size.
    // Setting validator here removes that issue.
    this.inputPRV = false;
    this.sizingModuleForm.get('packageinletpressure').setValidators([Validators.nullValidator, (c) => this.validatePackageInletPressure(c, this.pressureRef, this.inletPressureValidationErrorMessage), (c) => this.validateProcessConditions(c, 'InputPRVPressure', this.pressureRef, this.validateProcessConditionsErrorMessage)])
    this.packageinletpressure.setValue('');

    this.internal_SSP = 0;
    this.internal_SellingPrice = 0;
    this.isEasiHeatSizingDone = false;
    this.isEnergyMonitoringSizable = true;
    this.isSpecSheetEnabled = false;
    this.ehOutputData = new Array<EasiheatOutput>();

    if (this.ApplicationType == "HTGCC") {
      this.gasket_Value_Default_Text = this.gasket_Value_Default_Text_HTG;
      this.actuator_Initial_Value = this.actuator_Initial_Value_HTG;
      if (this.actuator_Initial_Value_HTG == "EL4") {
        this.highLimitActuation = true;
      }
      else {
        this.highLimitActuation = false;
      }

    }
    else {
      if (this.ApplicationType == "HTGSC") {
        this.gasket_Value_Default_Text = this.gasket_Value_Default_Text_HTG;
      }
      else {
        this.gasket_Value_Default_Text = this.gasket_Value_Default_Text_DHW;
      }

      this.actuator_Initial_Value = this.actuator_Initial_Value_DHW;

      if (this.actuator_Initial_Value_DHW == "EL4" && this.highLimitOptions_Initial_Value_DHW.includes("HL")) {
        this.highLimitActuation = true;
      }
      else {
        this.highLimitActuation = false;
      }

    }


    if (this.dhw) {
      this.convertTemperatureToDefaultValueInPageUnits("inlettemperature", 10);
      this.convertTemperatureToDefaultValueInPageUnits("outlettemperature", 65);


      //if (this.maximum_Pressure_Drop_Unit == 'KPA') {
      if (this.design_Code_Initial_Value != 'A') { //so it is either PED (P) or KS/JS (K) therefore maxPressureDrop Unit is kPa
        this.maximum_Pressure_Drop_Name = "PressureDrop_EasiHeat";
        this.maximum_Pressure_Drop_Unit = "KPA";
      }
      else { //other wise maxPressureDrop Unit is PSI - design code ASME (A)
        //this.maximum_Pressure_Drop_Name = "PressureDropPsiRounded_EasiHeat";
        this.maximum_Pressure_Drop_Unit = "PSI";
      }

      this.isEnergyMonitoringEnabled = this.DHWEnergyMonitoringEnabledPref;
      this.isEn12828CompliantEnabled = this.DHWENCompliantEnabledPref;
      this.isJackingWheelsEnabled = this.DHWJackingWheelsEnabled;
    }
    else {
      // Only do temperature change if the applicatin change is from DHW. If it's within HTG then keep the temperatures
      if (oldApllicationType == "DHW") {
        this.resetHTGTemperatureDefaults();
      }

      //if (this.maximum_Pressure_Drop_Unit == 'KPA') {
      if (this.design_Code_Initial_Value != 'A') { //so it is either PED (P) or KS/JS (K) therefore maxPressureDrop Unit is kPa
        //this.maximum_Pressure_Drop_Name = "PressureDrop_EasiHeat";
        if (this.ApplicationType == "HTGCC") {
          this.maximum_Pressure_Drop_Name = "PressureDropHTGCC_EasiHeat"
        } else {
          this.maximum_Pressure_Drop_Name = "PressureDrop_EasiHeat"
        }

        this.maximum_Pressure_Drop_Unit = "KPA";
      }
      else { //other wise maxPressureDrop Unit is PSI
        //this.maximum_Pressure_Drop_Name = "PressureDropPsiRounded_EasiHeat";
        this.maximum_Pressure_Drop_Unit = "PSI";
      }

      this.isEnergyMonitoringEnabled = this.HTGEnergyMonitoringEnabledPref;
      this.isEn12828CompliantEnabled = this.HTGENCompliantEnabledPref;
      this.isJackingWheelsEnabled = this.HTGJackingWheelsEnabled;
    }

    setTimeout(() => {
      this.noiseLimit_Enumeration.setValue(85);
      this.serviceOfferingOptionsFormControl.setValue('');
      this.design_Code_Enumeration.setValue(this.design_Code_Initial_Value);
      this.setMaxPressureDropValue(this.ApplicationType, this.design_Code_Initial_Value);
      this.isResetButtonClicked = false;
    }, 200);

  }

  convertTemperatureToDefaultValueInPageUnits(propertyName, initValue) {
    // Convert defaults to active page units
    let unitsToConvert: UnitConvert[] = [];

    let unitConvert = new UnitConvert();
    unitConvert.propertyName = propertyName;
    unitConvert.initialValue = initValue;
    unitConvert.initialUnitId = 146; // *C
    unitConvert.targetUnitId = parseInt(this.temperatureRef.preference.value);
    unitConvert.convertedValue = null;
    unitsToConvert.push(unitConvert);

    let unitsConverter = new UnitsConverter();
    unitsConverter.unitsConverter = unitsToConvert;

    this.unitsService.unitsConverter(unitsConverter).subscribe((unitsConvertedData: UnitsConverter) => {

      if (!!unitsConvertedData && unitsConvertedData !== null) {

        var tempDefaultValue = unitsConvertedData.unitsConverter.find(u => u.propertyName === propertyName).convertedValue;

        if (propertyName == "maxCondensateTemp") {
          this.maxCondensateTemp.setValue(tempDefaultValue.toFixed());
        }

        if (propertyName == "inlettemperature") {
          this.inlettemperature.setValue(parseFloat(tempDefaultValue.toFixed(2)));
        }

        if (propertyName == "outlettemperature") {
          this.outlettemperature.setValue(parseFloat(tempDefaultValue.toFixed(2)));
        }

      }
    });

  }

  convertMaxPressureDropToDefaultValueInPageUnits(propertyName, initValue) {

    let unitsToConvert: UnitConvert[] = [];

    let unitConvert = new UnitConvert();
    unitConvert.propertyName = propertyName;
    unitConvert.initialValue = parseFloat(initValue);
    unitConvert.initialUnitId = 39; // kPa because BACK END always convert to kPa and returns that way (it does not convert back to the unit that received it at the first place "e.g PSI")
    unitConvert.targetUnitId = this.maximum_Pressure_Drop_Unit == 'PSI' ? 45 : 39;
    unitConvert.convertedValue = null;
    unitsToConvert.push(unitConvert);

    let unitsConverter = new UnitsConverter();
    unitsConverter.unitsConverter = unitsToConvert;

    this.unitsService.unitsConverter(unitsConverter).subscribe((unitsConvertedData: UnitsConverter) => {

      if (!!unitsConvertedData && unitsConvertedData !== null) {

        var tempDefaultValue = unitsConvertedData.unitsConverter.find(u => u.propertyName === propertyName).convertedValue;

        if (propertyName == "pressureDrop") {
          this.actualSecPressureDrop.setValue(tempDefaultValue.toFixed(2));
        }
      }
    });

  }

  disableUiInputs() {
    //return;
    // Start the busy block
    this.blockUi.start(this.translatePipe.transform("CALCULATING_MESSAGE", true) + "...");
    this.blockUiTimeOut = setTimeout(() => {
      this.blockUi.reset();
    }, 10000);
  }

  enableUiInputs() {
    // return;
    this.blockUi.stop();
    clearTimeout(this.blockUiTimeOut);
  }

  cvSplitRangeChanged() {
    this.cvSplitRange = !this.cvSplitRange;
    this.isEasiHeatSizingDone = false;
  }

  inputPRVChanged() {
    this.inletpressure.setValue("");
    this.inputPRV = !this.inputPRV;
    if (this.inputPRV) {
      this.sizingModuleForm.get('packageinletpressure').setValidators([Validators.required, (c) => this.validatePackageInletPressure(c, this.pressureRef, this.inletPressureValidationErrorMessage), (c) => this.validateProcessConditions(c, 'InputPRVPressure', this.pressureRef, this.validateProcessConditionsErrorMessage)])
    }
    else {
      this.sizingModuleForm.get('packageinletpressure').setValidators([Validators.nullValidator, (c) => this.validatePackageInletPressure(c, this.pressureRef, this.inletPressureValidationErrorMessage), (c) => this.validateProcessConditions(c, 'InputPRVPressure', this.pressureRef, this.validateProcessConditionsErrorMessage)])
      this.packageinletpressure.setValue('');
    }
    this.isEasiHeatSizingDone = false;
  }

  volumetricFlowOnFocus() {
    setTimeout(() => {
      this.volumetricFlowBefore = this.waterflowrate.value;
    }, 100);
  }

  volumetricFlowOnFocusOut() {
    try {
      this.volumetricFlowAfter = this.waterflowrate.value;
    }
    catch {
      //nothing to catch here :)
    }
    finally {
      if (this.volumetricFlowBefore != this.volumetricFlowAfter) {
        this.userChangedVolumetricFlow = true;
        this.sizingModuleForm.get('waterflowrate').setValidators([Validators.required, (c) => this.validateWaterFlowRate(c, this.volumetricFlowRef, this.temperatureRef, this.waterFlowRateValidationErrorMessage), (c) => this.CalcLoad(c), (c) => this.validateProcessConditions(c, 'InputFlowRate', this.volumetricFlowRef, this.validateProcessConditionsErrorMessage)]);
        this.waterflowrate.updateValueAndValidity();
      }

      this.sizingModuleForm.get('waterflowrate').setValidators([Validators.required]);
    }
  }

  loadOnFocus() {
    setTimeout(() => {
      this.loadBefore = this.load.value;
    }, 100);
  }

  loadOnFocusOut() {
    try {
      this.loadAfter = this.load.value;
    }
    catch {
      //nothing to catch here :)
    }
    finally {
      if (this.loadBefore != this.loadAfter) {
        this.userChangedVolumetricFlow = false;
        this.sizingModuleForm.get('load').setValidators([Validators.required, (c) => this.validateLoadInput(c, this.loadRef, this.loadValidationErrorMessage), (c) => this.CalcWaterFlowRate(c), (c) => this.validateProcessConditions(c, 'InputLoad', this.loadRef, this.validateProcessConditionsErrorMessage)]);
        this.load.updateValueAndValidity();
      }
      this.sizingModuleForm.get('load').setValidators([Validators.required]);
    }
  }

  onEnterKeydown(event) {
    //event.stopPropagation();
    document.getElementById(event.srcElement.id).blur();
  }

  onDisableEnter(event) {
    event.stopPropagation();
  }

  filterControlSystemPanelList(option: string) {

    //var control_System_Enumeration_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === true && mp.enumerationName === this.control_System_Name)[0];
    //control_System_Enumeration_Items.enumerationDefinitions.forEach(item => item.value != "" ? this.control_System_List.push(item.value) : null);
    //var hideOptionsList: string[] = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'P2', 'N'];
    var showList: string[] = [];

    if (option != "") {

      switch (this.high_Limit_Options_Enum.internalValue) {

        case "IHL":
          showList.push('T1');
          showList.push('T2');
          break;

        case "HL":
          if (showList.includes('P2')) {
            showList.forEach((option, index) => {
              if (option == 'P2') {
                showList.splice(index, 1)
              }
            });
          }
          showList.push('T1');
          showList.push('T2');
          showList.push('T3');
          showList.push('T4');
          showList.push('T5');
          showList.push('T6');
          showList.push('T7');
          showList.push('T8');
          showList.push('T9');
          showList.push('N');
          break;

        default:
          showList = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'P2', 'N'];
          break;
      }
    }
    else {
      showList = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'P2', 'N'];
    }

    if ((this.actuator_Enum.internalValue == "EL4") && showList.includes('P2')) {
      showList.forEach((option, index) => {
        if (option == 'P2') {
          showList.splice(index, 1)
        }
      });
    }
    else if ((this.actuator_Enum.internalValue != "EL4") && !showList.includes('P2') && (this.high_Limit_Options_Enum.internalValue != "HL")) {
      showList.push('P2');
    }

    this.control_System_List = showList;
  }

}
