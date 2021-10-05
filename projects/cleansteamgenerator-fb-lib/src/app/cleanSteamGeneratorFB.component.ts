import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';

import { BaseSizingModule } from "sizing-shared-lib";
//import { ProjectsJobsService } from "../../../../../src/app/routes/projects-jobs/projects-jobs.service";
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

//import * as _swal from 'sweetalert';
//import { SweetAlert } from 'sweetalert/typings/core';
//const swal: SweetAlert = _swal as any;

import { Subscription } from 'rxjs/Subscription';

import * as FileSaver from 'file-saver';

import { CleanSteamGeneratorFBProcessConditions } from "./cleanSteamGeneratorFBInput.model";
import { CleanSteamGeneratorFBOutput } from "./cleanSteamGeneratorFBOutput.model";
import { CleanSteamGeneratorFBInputValidation } from "./cleanSteamGeneratorFBInputValidation.model";
import { CleanSteamGeneratorFBProcessConditionsValidation } from "./cleanSteamGeneratorFBInputValidation.model";
import { CleanSteamGeneratorFBValidationMessage } from "./cleanSteamGeneratorFBInputValidation.model";
import { CleanSteamGeneratorFBValidationErrorMessage } from "./cleanSteamGeneratorFBInputValidation.model";

//import { CleanSteamGeneratorPricing } from "./cleanSteamGeneratorPricingOptions.model";
//import { CleanSteamGeneratorPricingOutput } from "./cleanSteamGeneratorPricingOptions.model";

import { CleanSteamGeneratorFBService } from "./cleanSteamGeneratorFB.service";

import { Observable, combineLatest } from 'rxjs';
import { Validators } from '@angular/forms';

import { DatatableComponent } from '@swimlane/ngx-datatable';
import { TranslatePipe } from "sizing-shared-lib";
import { takeWhile } from 'rxjs-compat/operator/takeWhile';
//import { DisplayPreferenceDirective } from "../../../../../src/app/shared/preference/display-preference.directive";
//import { ModulePreferenceService } from "../../../../../src/app/shared/module-preference/module-preference.service";
import { DocGen, TiRequestModel, TiDocumentInfosModel, TiDocumentInfo } from "sizing-shared-lib";
//import { PreferenceService } from "../../../../../src/app/shared/preference/preference.service";

import { TranslationService } from "sizing-shared-lib";
//import { Preference } from "../../../../../src/app/shared/preference/preference.model";
//import { DocGenService } from "../../../../../src/app/shared/doc-gen/doc-gen.service";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
//import { UserProfileService } from "../../../../../src/app/routes/user-profile/user-profile.service";

//import { AdminService } from "../../../../../src/app/routes/admin/admin.service";
//import { MessagesService } from "../../../../../src/app/core/messages/messages.service";

import { ChangeDetectorRef } from '@angular/core';

import { LocaleService, LocaleValidation } from 'node_modules/angular-l10n';
//import { forEach } from '@angular/router/src/utils/collection';
import { Currency } from 'sizing-shared-lib';
import { Preference } from 'sizing-shared-lib';
import { ProjectsJobsService } from 'sizing-shared-lib';
import { MessagesService } from 'sizing-shared-lib';
import { UserProfileService } from 'sizing-shared-lib';
import { PreferenceService } from 'sizing-shared-lib';
import { DocGenService } from 'sizing-shared-lib';
import { AdminService } from 'sizing-shared-lib';
import { ModulePreferenceService } from 'sizing-shared-lib';
import { DisplayPreferenceDirective } from 'sizing-shared-lib';

//import { Currency } from "../../../../../src/app/routes/admin/currency/currency.model";
import * as _swal from 'sweetalert';
import { SweetAlert } from 'sweetalert/typings/core';
const swal: SweetAlert = _swal as any;


@Component({
  selector: 'clean-steam-generator-fb',
  templateUrl: './cleanSteamGeneratorFB.component.html',
  styleUrls: ['./cleanSteamGeneratorFB.component.scss'],
  providers: [CleanSteamGeneratorFBService]
})

export class CleanSteamGeneratorFBComponent extends BaseSizingModule implements OnInit {

  readonly moduleGroupId: number = 13;
  readonly moduleName: string = "Clean Steam Generator FB";

  private isLoadingJob: boolean = false;


  // Module Prefs.
  private manufacturerId: number = 0;
  private basePriceOption: number = 0;  // 0 = Manufacturer Assembled, 1 = No Vessel, 2 = No Panel, 3 = No Vessel or Panel. Defaulted to 0 in case Mod Prefs not found.
  private localRecommendedSalesPriceOption: number = 0; // 0 = Use Manufacturer Recommended Sales Price, 1 = Use Local Recommended Sales Price.
  private landedCostIncreaseFactor: number = 1; // Defaulted to no increase in SSP.
  private deliveryCost: number = 0;
  private commissionCost: number = 0;
  private oneYearWarrantyCost: number = 0;
  private twoYearWarrantyCost: number = 0;
  private threeYearWarrantyCost: number = 0;

  private manufacturerCurrencyId: number = 0;
  private sellingCurrencyId: number = 0;

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
  private internal_ServiceOfferingPrice: number;
  private internal_TotalPrice: number;

  public display_SSP: string;
  public display_SellingPrice: string;
  public display_ServiceOfferingPrice: string;
  public display_DeliveryPrice: string;
  public display_TotalPrice: string;

  public serviceOfferingKey: string;

  readonly overdesign_Limit_10: number = 10;
  readonly overdesign_Limit_0: number = 0;

  public plantSteamValidationErrorMessage: CleanSteamGeneratorFBValidationErrorMessage;
  public cleanSteamValidationErrorMessage: CleanSteamGeneratorFBValidationErrorMessage;
  public feedwaterPressureValidationErrorMessage: CleanSteamGeneratorFBValidationErrorMessage;
  public feedwaterTemperatureValidationErrorMessage: CleanSteamGeneratorFBValidationErrorMessage;
  public cleanSteamFlowrateValidationErrorMessage: CleanSteamGeneratorFBValidationErrorMessage;
  public tdsBlowdownValidationErrorMessage: CleanSteamGeneratorFBValidationErrorMessage;
  public flowrateOfNonCondensibleGasesErrorMessage: CleanSteamGeneratorFBValidationErrorMessage;

  //public pressureDifferentialErrorMessage: string;

  csgFBProcessConditions: CleanSteamGeneratorFBProcessConditions;

  public csgFBOutputData: CleanSteamGeneratorFBOutput[] = [];
  public selectedOutputData: CleanSteamGeneratorFBOutput[] = [];
  public getHeight: number;
  //public csgPricing: CleanSteamGeneratorPricing;
  //public csgPricingOutputData: CleanSteamGeneratorPricingOutput;

  //public docGen: DocGen;

  //public loadedJobSizingData: SizingData;

  //private sellingMarkupUpdated: boolean;
  //private grossMarginUpdated: boolean;

  //// Flags to control the visibility of different CSG options.
  //public show_clean_Steam_Outlet_Shut_Off_Valve: boolean = true;
  //public show_plant_Steam_Line_Trapping: boolean = true;
  //public show_sample_Cooler: boolean = true;
  //public show_independent_Low_Level_Alarm: boolean = true;
  //public show_feedwater_Pre_Heating_Degassing: boolean = true;
  //public show_intelligent_Diagnostics: boolean = true;

  public gridSelectedRow = false;
  public loadOptions = false;

  //// The view reference variables are declared here
  //@ViewChild("design_Code_Enum") design_Code_Enum: EnumerationComponent;
  //@ViewChild("shell_Type_Enum") shell_Type_Enum: EnumerationComponent;
  //@ViewChild("valve_Actuation_Enum") valve_Actuation_Enum: EnumerationComponent;
  //@ViewChild("control_Enum") control_Enum: EnumerationComponent;
  //@ViewChild("communication_Interface_Enum") communication_Interface_Enum: EnumerationComponent;
  //@ViewChild("frame_And_Cabinet_Enum") frame_And_Cabinet_Enum: EnumerationComponent;
  //@ViewChild("control_Panel_Location_Enum") control_Panel_Location_Enum: EnumerationComponent;
  //@ViewChild("insulation_Enum") insulation_Enum: EnumerationComponent;
  //@ViewChild("wheels_And_Feet_Enum") wheels_And_Feet_Enum: EnumerationComponent;
  //@ViewChild("plant_Steam_Inlet_Shut_Off_Valve_Enum") plant_Steam_Inlet_Shut_Off_Valve_Enum: EnumerationComponent;
  //@ViewChild("plant_Steam_Line_Trapping_Enum") plant_Steam_Line_Trapping_Enum: EnumerationComponent;
  //@ViewChild("tds_Control_System_Enum") tds_Control_System_Enum: EnumerationComponent;
  //@ViewChild("sample_Cooler_Enum") sample_Cooler_Enum: EnumerationComponent;
  //@ViewChild("independent_Low_Level_Alarm_Enum") independent_Low_Level_Alarm_Enum: EnumerationComponent;
  //@ViewChild("feedwater_Pre_Heating_Degassing_Enum") feedwater_Pre_Heating_Degassing_Enum: EnumerationComponent;
  //@ViewChild("intelligent_Diagnostics_Enum") intelligent_Diagnostics_Enum: EnumerationComponent;
  //@ViewChild("clean_Steam_Outlet_Shut_Off_Valve_Enum") clean_Steam_Outlet_Shut_Off_Valve_Enum: EnumerationComponent;
  //@ViewChild("test_And_Certification_Enum") test_And_Certification_Enum: EnumerationComponent;
  //@ViewChild("other_Enum") other_Enum: EnumerationComponent;

  //@ViewChild("feedwater_Pressurisation_Enum") feedwater_Pressurisation_Enum: EnumerationComponent;
  //@ViewChild("pump_Enum") pumpEnum: EnumerationComponent;

  /*
   * CSG-HS 400 => CSG-HS 020
   * CSG-HS 500 => CSG-HS 055
   * CSG-HS 601 => CSG-HS 125
   * CSG-HS 602 => CSG-HS 180
   */
  //private hashTable = [
  //  {
  //    name: 'CSG-HS 020',
  //    design_Code: 'CSG_HS_020_Design_Code',
  //    shell_Type: 'CSG_HS_020_Shell_Type',
  //    valve_Actuation: 'CSG_HS_020_Valve_Actuation',
  //    control: 'CSG_HS_020_Control',
  //    communication_Interface: 'CSG_HS_020_Communication_Interface',
  //    frame_And_Cabinet: 'CSG_HS_020_Frame_And_Cabinet',
  //    control_Panel_Location: 'CSG_HS_020_Control_Panel_Location',
  //    insulation: 'CSG_HS_020_Insulation',
  //    wheels_And_Feet: 'CSG_HS_020_Wheels_And_Feet',
  //    plant_Steam_Inlet_Shut_Off_Valve: 'CSG_HS_020_Plant_Steam_Inlet_Shut_Off_Valve',
  //    plant_Steam_Line_Trapping: 'CSG_HS_020_Plant_Steam_Line_Trapping',
  //    tds_Control_System: 'CSG_HS_020_TDS_Control_System',
  //    sample_Cooler: 'CSG_HS_020_Sample_Cooler',
  //    independent_Low_Level_Alarm: 'CSG_HS_020_Independent_Low_Level_Alarm',
  //    feedwater_Pre_Heating_Degassing: 'CSG_HS_020_Feedwater_Pre_Heating_Degassing',
  //    intelligent_Diagnostics: 'CSG_HS_020_Intelligent_Diagnostics',
  //    clean_Steam_Outlet_Shut_Off_Valve: 'CSG_HS_020_Clean_Steam_Outlet_Shut_Off_Valve',
  //    test_And_Certification: 'CSG_HS_020_Test_And_Certification',
  //    other: 'CSG_HS_020_Other',

  //    feedwater_Pressurisation: 'CSG_HS_020_Feedwater_Pressurisation'
  //  },
  //  {
  //    name: 'CSG-HS 055',
  //    design_Code: 'CSG_HS_055_Design_Code',
  //    shell_Type: 'CSG_HS_055_Shell_Type',
  //    valve_Actuation: 'CSG_HS_055_Valve_Actuation',
  //    control: 'CSG_HS_055_Control',
  //    communication_Interface: 'CSG_HS_055_Communication_Interface',
  //    frame_And_Cabinet: 'CSG_HS_055_Frame_And_Cabinet',
  //    control_Panel_Location: 'CSG_HS_055_Control_Panel_Location',
  //    insulation: 'CSG_HS_055_Insulation',
  //    wheels_And_Feet: 'CSG_HS_055_Wheels_And_Feet',
  //    plant_Steam_Inlet_Shut_Off_Valve: 'CSG_HS_055_Plant_Steam_Inlet_Shut_Off_Valve',
  //    plant_Steam_Line_Trapping: 'CSG_HS_055_Plant_Steam_Line_Trapping',
  //    tds_Control_System: 'CSG_HS_055_TDS_Control_System',
  //    sample_Cooler: 'CSG_HS_055_Sample_Cooler',
  //    independent_Low_Level_Alarm: 'CSG_HS_055_Independent_Low_Level_Alarm',
  //    feedwater_Pre_Heating_Degassing: 'CSG_HS_055_Feedwater_Pre_Heating_Degassing',
  //    intelligent_Diagnostics: 'CSG_HS_055_Intelligent_Diagnostics',
  //    clean_Steam_Outlet_Shut_Off_Valve: 'CSG_HS_055_Clean_Steam_Outlet_Shut_Off_Valve',
  //    test_And_Certification: 'CSG_HS_055_Test_And_Certification',
  //    other: 'CSG_HS_055_Other',

  //    feedwater_Pressurisation: 'CSG_HS_055_Feedwater_Pressurisation'
  //  },
  //  {
  //    name: 'CSG-HS 125',
  //    design_Code: 'CSG_HS_125_Design_Code',
  //    shell_Type: 'CSG_HS_125_Shell_Type',
  //    valve_Actuation: 'CSG_HS_125_Valve_Actuation',
  //    control: 'CSG_HS_125_Control',
  //    communication_Interface: 'CSG_HS_125_Communication_Interface',
  //    frame_And_Cabinet: 'CSG_HS_125_Frame_And_Cabinet',
  //    control_Panel_Location: 'CSG_HS_125_Control_Panel_Location',
  //    insulation: 'CSG_HS_125_Insulation',
  //    wheels_And_Feet: 'CSG_HS_125_Wheels_And_Feet',
  //    plant_Steam_Inlet_Shut_Off_Valve: 'CSG_HS_125_Plant_Steam_Inlet_Shut_Off_Valve',
  //    plant_Steam_Line_Trapping: 'CSG_HS_125_Plant_Steam_Line_Trapping',
  //    tds_Control_System: 'CSG_HS_125_TDS_Control_System',
  //    sample_Cooler: 'CSG_HS_125_Sample_Cooler',
  //    independent_Low_Level_Alarm: 'CSG_HS_125_Independent_Low_Level_Alarm',
  //    feedwater_Pre_Heating_Degassing: 'CSG_HS_125_Feedwater_Pre_Heating_Degassing',
  //    intelligent_Diagnostics: 'CSG_HS_125_Intelligent_Diagnostics',
  //    clean_Steam_Outlet_Shut_Off_Valve: 'CSG_HS_125_Clean_Steam_Outlet_Shut_Off_Valve',
  //    test_And_Certification: 'CSG_HS_125_Test_And_Certification',
  //    other: 'CSG_HS_125_Other',

  //    feedwater_Pressurisation: 'CSG_HS_125_Feedwater_Pressurisation'
  //  },
  //  {
  //    name: 'CSG-HS 180',
  //    design_Code: 'CSG_HS_180_Design_Code',
  //    shell_Type: 'CSG_HS_180_Shell_Type',
  //    valve_Actuation: 'CSG_HS_180_Valve_Actuation',
  //    control: 'CSG_HS_180_Control',
  //    communication_Interface: 'CSG_HS_180_Communication_Interface',
  //    frame_And_Cabinet: 'CSG_HS_180_Frame_And_Cabinet',
  //    control_Panel_Location: 'CSG_HS_180_Control_Panel_Location',
  //    insulation: 'CSG_HS_180_Insulation',
  //    wheels_And_Feet: 'CSG_HS_180_Wheels_And_Feet',
  //    plant_Steam_Inlet_Shut_Off_Valve: 'CSG_HS_180_Plant_Steam_Inlet_Shut_Off_Valve',
  //    plant_Steam_Line_Trapping: 'CSG_HS_180_Plant_Steam_Line_Trapping',
  //    tds_Control_System: 'CSG_HS_180_TDS_Control_System',
  //    sample_Cooler: 'CSG_HS_180_Sample_Cooler',
  //    independent_Low_Level_Alarm: 'CSG_HS_180_Independent_Low_Level_Alarm',
  //    feedwater_Pre_Heating_Degassing: 'CSG_HS_180_Feedwater_Pre_Heating_Degassing',
  //    intelligent_Diagnostics: 'CSG_HS_180_Intelligent_Diagnostics',
  //    clean_Steam_Outlet_Shut_Off_Valve: 'CSG_HS_180_Clean_Steam_Outlet_Shut_Off_Valve',
  //    test_And_Certification: 'CSG_HS_180_Test_And_Certification',
  //    other: 'CSG_HS_180_Other',

  //    feedwater_Pressurisation: 'CSG_HS_180_Feedwater_Pressurisation'
  //  }
  //];

  /**
   * Anonymous hash to determine severity icons.
   */
  severityHash: { icon: string }[] = [
    { icon: "fa fa-info-circle info-message-class" },
    { icon: "fa fa-warning warning-message-class" },
    { icon: "fa fa-times-circle error-message-class" }
  ];

  isCSGFBSizingDone: boolean = false;
  isCSGFBModelSelected: boolean = false;

  @ViewChild("csgFBOutputDataTable", { static: false }) csgFBOutputDataTable: DatatableComponent;

  @ViewChild("pressureRef", { static: false }) pressureRef: DisplayPreferenceDirective;
  @ViewChild("temperatureRef", { static: false }) temperatureRef: DisplayPreferenceDirective;
  @ViewChild("massFlowRef", { static: false }) massFlowRef: DisplayPreferenceDirective;
  @ViewChild("loadRef", { static: false }) loadRef: DisplayPreferenceDirective;

  public sizingModuleForm: FormGroup;
  //public user: User;

  plantsteampressure: FormControl;
  cleansteampressure: FormControl;
  feedwaterpressure: FormControl;
  feedwatertemperature: FormControl;
  requiredcleansteamflowrate: FormControl;
  tdsblowdownpercentage: FormControl;
  flowrateofnoncondensiblegases: FormControl;

  //design_Code_Enumeration: FormControl;
  //shell_Type_Enumeration: FormControl;
  //valve_Actuation_Enumeration: FormControl;
  //control_Enumeration: FormControl;
  //communication_Interface_Enumeration: FormControl;
  //frame_And_Cabinet_Enumeration: FormControl;
  //control_Panel_Location_Enumeration: FormControl;
  //insulation_Enumeration: FormControl;
  //wheels_And_Feet_Enumeration: FormControl;
  //plant_Steam_Inlet_Shut_Off_Valve_Enumeration: FormControl;
  //plant_Steam_Line_Trapping_Enumeration: FormControl;
  //tds_Control_System_Enumeration: FormControl;
  //sample_Cooler_Enumeration: FormControl;
  //independent_Low_Level_Alarm_Enumeration: FormControl;
  //feedwater_Pre_Heating_Degassing_Enumeration: FormControl;
  //intelligent_Diagnostics_Enumeration: FormControl;
  //clean_Steam_Outlet_Shut_Off_Valve_Enumeration: FormControl;
  //test_And_Certification_Enumeration: FormControl;
  //other_Enumeration: FormControl;

  //feedwater_Pressurisation_Enumeration: FormControl;
  //phase_Voltage_Enumeration: FormControl;

  //totalPriceFormControl: FormControl;

  //totalSSPFormControl: FormControl;
  //sellingMarkupFormControl: FormControl;
  //grossMarginFormControl: FormControl;
  //totalSellingPriceFormControl: FormControl;
  //deliveryCostFormControl: FormControl;

  //serviceOfferingOptionsFormControl: FormControl;
  //serviceOfferingFormControl: FormControl;

  //paramsSubscription: Subscription;

  areProjectsAndJobsLoaded: boolean = false;
  project: Project = new Project();
  job: Job = new Job();

  //selectedRow: CleanSteamGeneratorOutput;

  //design_Code_List: any[];
  //shell_Type_List: any[];
  //valve_Actuation_List: any[];
  //control_List: any[];
  //communication_Interface_List: any[];
  //frame_And_Cabinet_List: any[];
  //control_Panel_Location_List: any[];
  //insulation_List: any[];
  //wheels_And_Feet_List: any[];
  //plant_Steam_Inlet_Shut_Off_Valve_List: any[];
  //plant_Steam_Line_Trapping_List: any[];
  //tds_Control_System_List: any[];
  //sample_Cooler_List: any[];
  //independent_Low_Level_Alarm_List: any[];
  //feedwater_Pre_Heating_Degassing_List: any[];
  //intelligent_Diagnostics_List: any[];
  //clean_Steam_Outlet_Shut_Off_Valve_List: any[];
  //test_And_Certification_List: any[];
  //other_List: any[];

  //feedwater_Pressurisation_List: any[];
  //phaseVoltageList: any[];

  //modelId: number;
  //modelName: string;
  //length: number;
  //height: number;
  //width: number;
  //dryWeight: number;
  //plantSteamInletConnection: string;
  //condensateOutletConnection: string;
  //cleanSteamOutletConnection: string;
  //feedwaterInletConnection: string;
  //safetyValveDischarge: string;
  //notCondensableVentConnection: string;
  //drainConnection: string;
  //plantSteamCondensateDrainConnection: string;
  //tdsBlowdownConnection: string;
  //samplingSystem: string;

  //nomenclature: string = "";

  //plantSteamFlowrate: number;
  //minAirSupply: number;

  //displayPlantSteamFlowrate: string;
  //displayCleanSteamFlowrate: string;

  //design_Code_Enum_Name: string;
  //shell_Type_Enum_Name: string;
  //valve_Actuation_Enum_Name: string;
  //control_Enum_Name: string;
  //communication_Interface_Enum_Name: string;
  //frame_And_Cabinet_Enum_Name: string;
  //control_Panel_Location_Enum_Name: string;
  //insulation_Enum_Name: string;
  //wheels_And_Feet_Enum_Name: string;
  //plant_Steam_Inlet_Shut_Off_Valve_Enum_Name: string;
  //plant_Steam_Line_Trapping_Enum_Name: string;
  //tds_Control_System_Enum_Name: string;
  //sample_Cooler_Enum_Name: string;
  //independent_Low_Level_Alarm_Enum_Name: string;
  //feedwater_Pre_Heating_Degassing_Enum_Name: string;
  //intelligent_Diagnostics_Enum_Name: string;
  //clean_Steam_Outlet_Shut_Off_Valve_Enum_Name: string;
  //test_And_Certification_Enum_Name: string;
  //other_Enum_Name: string;

  //feedwater_Pressurisation_Enum_Name: string;

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

  translatedMessagesList: any[];

  constructor(private activatedRoute: ActivatedRoute, private projectsJobsService: ProjectsJobsService, private fb: FormBuilder,
    private cleanSteamGeneratorFBService: CleanSteamGeneratorFBService, private modulePreferenceService: ModulePreferenceService,
    private translationService: TranslationService, private preferenceService: PreferenceService, private docGenService: DocGenService, private translatePipe: TranslatePipe,
    private sanitizer: DomSanitizer, private userProfileService: UserProfileService, private adminService: AdminService,
    private messagesService: MessagesService, private cdRef: ChangeDetectorRef, private localeService: LocaleService, private localeValidation: LocaleValidation) {

    // Call the abstract class' constructor.
    super();

    // Initialize.
    this.csgFBProcessConditions = new CleanSteamGeneratorFBProcessConditions();

    //this.csgPricing = new CleanSteamGeneratorPricing();
    //this.csgPricingOutputData = new CleanSteamGeneratorPricingOutput();

    // Validation messages.
    this.plantSteamValidationErrorMessage = new CleanSteamGeneratorFBValidationErrorMessage();
    this.cleanSteamValidationErrorMessage = new CleanSteamGeneratorFBValidationErrorMessage();
    this.feedwaterPressureValidationErrorMessage = new CleanSteamGeneratorFBValidationErrorMessage();
    this.feedwaterTemperatureValidationErrorMessage = new CleanSteamGeneratorFBValidationErrorMessage();
    this.cleanSteamFlowrateValidationErrorMessage = new CleanSteamGeneratorFBValidationErrorMessage();
    this.tdsBlowdownValidationErrorMessage = new CleanSteamGeneratorFBValidationErrorMessage();
    this.flowrateOfNonCondensibleGasesErrorMessage = new CleanSteamGeneratorFBValidationErrorMessage();
    // Form controls with custom validators.
    this.plantsteampressure = new FormControl('', [Validators.required, (c) => this.validateFormControlInput(c, 'plantsteampressure', this.pressureRef, this.plantSteamValidationErrorMessage)]);
    this.cleansteampressure = new FormControl('', [Validators.required, (c) => this.validateFormControlInput(c, 'cleansteampressure', this.pressureRef, this.cleanSteamValidationErrorMessage)]);
    this.feedwaterpressure = new FormControl('', [Validators.required, (c) => this.validateFormControlInput(c, 'feedwaterpressure', this.pressureRef, this.feedwaterPressureValidationErrorMessage)]);
    this.feedwatertemperature = new FormControl('', [Validators.required, (c) => this.validateFormControlInput(c, 'feedwatertemperature', this.temperatureRef, this.feedwaterTemperatureValidationErrorMessage)]);
    this.requiredcleansteamflowrate = new FormControl('', [Validators.required, (c) => this.validateFormControlInput(c, 'requiredcleansteamflowrate', this.massFlowRef, this.cleanSteamFlowrateValidationErrorMessage)]);
    this.tdsblowdownpercentage = new FormControl('5', [Validators.required, (c) => this.validateFormControlInput(c, 'tdsblowdownpercentage', null, this.tdsBlowdownValidationErrorMessage)]);
    this.flowrateofnoncondensiblegases = new FormControl('0', [Validators.required, (c) => this.validateFormControlInput(c, 'flowrateofnoncondensiblegases', this.massFlowRef, this.flowrateOfNonCondensibleGasesErrorMessage)]);

    //this.design_Code_Enumeration = new FormControl('');
    //this.shell_Type_Enumeration = new FormControl('');
    //this.valve_Actuation_Enumeration = new FormControl('');
    //this.control_Enumeration = new FormControl('');
    //this.communication_Interface_Enumeration = new FormControl('');
    //this.frame_And_Cabinet_Enumeration = new FormControl('');
    //this.control_Panel_Location_Enumeration = new FormControl('');
    //this.insulation_Enumeration = new FormControl('');
    //this.wheels_And_Feet_Enumeration = new FormControl('');
    //this.plant_Steam_Inlet_Shut_Off_Valve_Enumeration = new FormControl('');
    //this.plant_Steam_Line_Trapping_Enumeration = new FormControl('');
    //this.tds_Control_System_Enumeration = new FormControl('');
    //this.sample_Cooler_Enumeration = new FormControl('');
    //this.independent_Low_Level_Alarm_Enumeration = new FormControl('');
    //this.feedwater_Pre_Heating_Degassing_Enumeration = new FormControl('');
    //this.intelligent_Diagnostics_Enumeration = new FormControl('');
    //this.clean_Steam_Outlet_Shut_Off_Valve_Enumeration = new FormControl('');
    //this.test_And_Certification_Enumeration = new FormControl('');
    //this.other_Enumeration = new FormControl('');

    //this.feedwater_Pressurisation_Enumeration = new FormControl('');
    //this.phase_Voltage_Enumeration = new FormControl('');

    //this.totalPriceFormControl = new FormControl({ value: 0, disabled: true });

    //this.totalSSPFormControl = new FormControl({ value: 0, disabled: true });
    //this.sellingMarkupFormControl = new FormControl('');
    //this.grossMarginFormControl = new FormControl('');
    //this.totalSellingPriceFormControl = new FormControl({ value: 0, disabled: true });
    //this.deliveryCostFormControl = new FormControl({ value: 0, disabled: true });

    //this.serviceOfferingOptionsFormControl = new FormControl('');
    //this.serviceOfferingFormControl = new FormControl({ value: 0.00, disabled: true });

    this.translatedMessagesList = [];

    //this.design_Code_List = [];
    //this.shell_Type_List = [];
    //this.valve_Actuation_List = [];
    //this.control_List = [];
    //this.communication_Interface_List = [];
    //this.frame_And_Cabinet_List = [];
    //this.control_Panel_Location_List = [];
    //this.insulation_List = [];
    //this.wheels_And_Feet_List = [];
    //this.plant_Steam_Inlet_Shut_Off_Valve_List = [];
    //this.plant_Steam_Line_Trapping_List = [];
    //this.tds_Control_System_List = [];
    //this.sample_Cooler_List = [];
    //this.independent_Low_Level_Alarm_List = [];
    //this.feedwater_Pre_Heating_Degassing_List = [];
    //this.intelligent_Diagnostics_List = [];
    //this.clean_Steam_Outlet_Shut_Off_Valve_List = [];
    //this.test_And_Certification_List = [];
    //this.other_List = [];

    //this.feedwater_Pressurisation_List = [];

    //this.modelId = 0;

    //this.design_Code_Enum_Name = '';
    //this.shell_Type_Enum_Name = '';
    //this.valve_Actuation_Enum_Name = '';
    //this.control_Enum_Name = '';
    //this.communication_Interface_Enum_Name = '';
    //this.frame_And_Cabinet_Enum_Name = '';
    //this.control_Panel_Location_Enum_Name = '';
    //this.insulation_Enum_Name = '';
    //this.wheels_And_Feet_Enum_Name = '';
    //this.plant_Steam_Inlet_Shut_Off_Valve_Enum_Name = '';
    //this.plant_Steam_Line_Trapping_Enum_Name = '';
    //this.tds_Control_System_Enum_Name = '';
    //this.sample_Cooler_Enum_Name = '';
    //this.independent_Low_Level_Alarm_Enum_Name = '';
    //this.feedwater_Pre_Heating_Degassing_Enum_Name = '';
    //this.intelligent_Diagnostics_Enum_Name = '';
    //this.clean_Steam_Outlet_Shut_Off_Valve_Enum_Name = '';
    //this.test_And_Certification_Enum_Name = '';
    //this.other_Enum_Name = '';

    //this.feedwater_Pressurisation_Enum_Name = '';

    this.sheet = new FormControl('');
    this.quantity = new FormControl('');
    this.revisionNumber = new FormControl('');
    this.aoNumber = new FormControl('');
    this.projectType = new FormControl('');
    this.orderNumber = new FormControl('');
    this.notes = new FormControl('');

    //// Get all the required module prefs.
    //var manufacturerPref = this.modulePreferenceService.getModulePreferenceByName("CSGManufacturer");
    //if (manufacturerPref) {
    //  this.manufacturerId = +manufacturerPref.value;
    //}
    //var basePricePref = this.modulePreferenceService.getModulePreferenceByName("CSGBasePriceOption");
    //if (basePricePref) {
    //  this.basePriceOption = +basePricePref.value;
    //}
    //var localRecommendedSalesPricePref = this.modulePreferenceService.getModulePreferenceByName("CSGLocalRecommendedSalesPriceOption");
    //if (localRecommendedSalesPricePref) {
    //  this.localRecommendedSalesPriceOption = +localRecommendedSalesPricePref.value;
    //}
    //var landedCostIncreasePref = this.modulePreferenceService.getModulePreferenceByName("CSGLandCostIncrease");
    //if (landedCostIncreasePref) {
    //  this.landedCostIncreaseFactor = (100 + (+landedCostIncreasePref.value)) / 100;
    //}
    //var deliveryCostPref = this.modulePreferenceService.getModulePreferenceByName("CSGDeliveryCost");
    //if (deliveryCostPref) {
    //  this.deliveryCost = +deliveryCostPref.value;
    //}

    //var commissionCostCostPref = this.modulePreferenceService.getModulePreferenceByName("CSGCommission");
    //if (commissionCostCostPref) {
    //  this.commissionCost = +commissionCostCostPref.value;
    //}
    //var oneYearWarrantyCostPref = this.modulePreferenceService.getModulePreferenceByName("CSGYearOne");
    //if (oneYearWarrantyCostPref) {
    //  this.oneYearWarrantyCost = +oneYearWarrantyCostPref.value;
    //}
    //var twoYearWarrantyCostPref = this.modulePreferenceService.getModulePreferenceByName("CSGYearTwo");
    //if (twoYearWarrantyCostPref) {
    //  this.twoYearWarrantyCost = +twoYearWarrantyCostPref.value;
    //}
    //var threeYearWarrantyCostPref = this.modulePreferenceService.getModulePreferenceByName("CSGYearThree");
    //if (threeYearWarrantyCostPref) {
    //  this.threeYearWarrantyCost = +threeYearWarrantyCostPref.value;
    //}

    //var manufacturerCurrencyPref = this.modulePreferenceService.getModulePreferenceByName("CSGManufacturerCurrency");
    //if (manufacturerCurrencyPref) {
    //  this.manufacturerCurrencyId = +manufacturerCurrencyPref.value;
    //}
    //var sellingCurrencyPref = this.modulePreferenceService.getModulePreferenceByName("CSGSellingCurrency");
    //if (sellingCurrencyPref) {
    //  this.sellingCurrencyId = +sellingCurrencyPref.value;
    //}

    //// Get the users prefs.
    //var hideAllPricingPref = this.preferenceService.getUserPreferenceByName("EHHideSalesPrice");
    //if (hideAllPricingPref) {
    //  this.hideAllPricingUserPref = (hideAllPricingPref.value === "1");
    //}
    //var hideManufactureCostsPref = this.preferenceService.getUserPreferenceByName("EHHideManufactureCosts");
    //if (hideManufactureCostsPref) {
    //  this.hideManufactureCostsUserPref = (hideManufactureCostsPref.value === "1");
    //}
    // Get the users module access level.
    //this.adminService.getUserModuleAccessDataByModuleGroupId(this.moduleGroupId).subscribe((accessLevel: number) => {
    //  if (accessLevel) {
    //    switch (accessLevel) {
    //      // Two stars
    //      case 0.66:
    //        // Only show the sales prices if preference is set to?
    //        this.hideManufactureCosts = true;
    //        if (this.hideAllPricingUserPref) {
    //          this.hideAllPricing = true;
    //        }
    //        break;

    //      // Three stars
    //      case 0.99:
    //        // Show manufacturers cost only if preference is set to?
    //        if (this.hideManufactureCostsUserPref) {
    //          this.hideManufactureCosts = true;
    //        }
    //        // Show sales prices only if preference is set to?
    //        if (this.hideAllPricingUserPref) {
    //          this.hideAllPricing = true;
    //        }
    //        break;

    //      // One/No stars
    //      default:
    //        // Hide all the pricing informations.
    //        this.hideAllPricing = true;
    //        this.hideManufactureCosts = true;
    //        break;
    //    }
    //  }
    //});

    this.sizingModuleForm = this.fb.group({
      plantsteampressure: this.plantsteampressure,
      cleansteampressure: this.cleansteampressure,
      feedwaterpressure: this.feedwaterpressure,
      feedwatertemperature: this.feedwatertemperature,
      requiredcleansteamflowrate: this.requiredcleansteamflowrate,
      tdsblowdownpercentage: this.tdsblowdownpercentage,
      flowrateofnoncondensiblegases: this.flowrateofnoncondensiblegases,

      //  design_Code_Enumeration: this.design_Code_Enumeration,
      //  shell_Type_Enumeration: this.shell_Type_Enumeration,
      //  valve_Actuation_Enumeration: this.valve_Actuation_Enumeration,
      //  control_Enumeration: this.control_Enumeration,
      //  communication_Interface_Enumeration: this.communication_Interface_Enumeration,
      //  frame_And_Cabinet_Enumeration: this.frame_And_Cabinet_Enumeration,
      //  control_Panel_Location_Enumeration: this.control_Panel_Location_Enumeration,
      //  insulation_Enumeration: this.insulation_Enumeration,
      //  wheels_And_Feet_Enumeration: this.wheels_And_Feet_Enumeration,
      //  plant_Steam_Inlet_Shut_Off_Valve_Enumeration: this.plant_Steam_Inlet_Shut_Off_Valve_Enumeration,
      //  plant_Steam_Line_Trapping_Enumeration: this.plant_Steam_Line_Trapping_Enumeration,
      //  tds_Control_System_Enumeration: this.tds_Control_System_Enumeration,
      //  sample_Cooler_Enumeration: this.sample_Cooler_Enumeration,
      //  independent_Low_Level_Alarm_Enumeration: this.independent_Low_Level_Alarm_Enumeration,
      //  feedwater_Pre_Heating_Degassing_Enumeration: this.feedwater_Pre_Heating_Degassing_Enumeration,
      //  intelligent_Diagnostics_Enumeration: this.intelligent_Diagnostics_Enumeration,
      //  clean_Steam_Outlet_Shut_Off_Valve_Enumeration: this.clean_Steam_Outlet_Shut_Off_Valve_Enumeration,
      //  test_And_Certification_Enumeration: this.test_And_Certification_Enumeration,
      //  other_Enumeration: this.other_Enumeration,

      //  feedwater_Pressurisation_Enumeration: this.feedwater_Pressurisation_Enumeration,
      //  phase_Voltage_Enumeration: this.phase_Voltage_Enumeration,

      //  totalPriceFormControl: this.totalPriceFormControl,

      //  totalSSPFormControl: this.totalSSPFormControl,
      //  sellingMarkupFormControl: this.sellingMarkupFormControl,
      //  grossMarginFormControl: this.grossMarginFormControl,
      //  totalSellingPriceFormControl: this.totalSellingPriceFormControl,
      //  deliveryCostFormControl: this.deliveryCostFormControl,

      //  serviceOfferingOptionsFormControl: this.serviceOfferingOptionsFormControl,
      //  serviceOfferingFormControl: this.serviceOfferingFormControl,

      sheet: this.sheet,
      quantity: this.quantity,
      revisionNumber: this.revisionNumber,
      aoNumber: this.aoNumber,
      projectType: this.projectType,
      orderNumber: this.orderNumber,
      notes: this.notes

    }, { updateOn: "blur" });
  }

  ngOnInit() {
    //this.handleLoadingJob();
    this.preferenceService.getUserPreferences().subscribe((prefs: Array<Preference>) => {
      this.userPrefs = prefs;

      this.specSheetLanguage = this.userPrefs.find(m => m.name === "SpecLanguage").value;
      this.lengthPref = this.userPrefs.find(m => m.name === "LengthUnit").value;
      this.lengthPrefUnit = this.userPrefs.find(m => m.name === "LengthUnit").unitName;
      this.weightPref = this.userPrefs.find(m => m.name === "WeightUnit").value;
      this.weightPrefUnit = this.userPrefs.find(m => m.name === "WeightUnit").unitName;

    });

    //this.userProfileService.getUserDetails().subscribe(user => {
    //  this.user = user;
    //});

    //// Get the currency data.
    //this.adminService.getCurrencyData().subscribe(data => {
    //  if (data && data.length > 0) {
    //    this.sellingCurrency = data.find(c => c.id === this.sellingCurrencyId);
    //    this.manufacturerCurrency = data.find(c => c.id === this.manufacturerCurrencyId);

    //    if (this.sellingCurrency && this.manufacturerCurrency) {
    //      this.currencyConversionRate = +((this.manufacturerCurrency.rateToGbp * (1 / this.sellingCurrency.rateToGbp)).toFixed(5));
    //    }
    //  }
    //});
  }

  ngOnDestroy() {
    //console.log("Component will be destroyed");
    //this.paramsSubscription.unsubscribe();
  }

  //handleLoadingJob()
  //{
  //  this.activatedRoute.params
  //  // subscribe to router event
  //  this.paramsSubscription = this.activatedRoute.params.subscribe((params: Params) => {

  //    let projectId = params['projectId'];
  //    let jobId = params['jobId'];
  //    console.log(`projectId=${projectId}, jobId=${jobId}`);
  //    if (!!projectId && !!jobId) {

  //      this.projectId = projectId;
  //      this.jobId = jobId;

  //      // first get data, might be navigated link from P&Js or bookmark?
  //      this.projectsJobsService.getProjectsAndJobs().subscribe(() => {
  //        // Inform the view that areProjectsAndJobs are now loaded.
  //        this.areProjectsAndJobsLoaded = true;
  //      });

  //      //ToDo: Write slices and chain async call for single dedicated calls to GetProjectById, GetJobById or GetProjetAndSingleJobByIds all in one server/SP call etc.
  //      // subject subscription, update as service data has changed (probably changed in memory)
  //      this.projectsJobsService.projectJobsChange.subscribe(() => {
  //        //Subject has Updated Projects And Jobs Data.
  //var notFound = false;
  //this.project = this.projectsJobsService.projectsJobs.projects.find(p => p.id === projectId);
  //if (!this.project) {
  //  // projectId not found
  //  // ToDo: infrom user
  //  notFound = true;
  //}
  //else {
  //  this.job = this.project.jobs.find(j => j.id === jobId);
  //}
  //if (!this.job) {
  //  // projectId not found
  //  // ToDo: infrom user
  //  notFound = true;
  //}

  //if (notFound) {
  //  // Simple popup message box
  //  let trans_Job_Not_Found = this.translatePipe.transform('SELECTED_JOB_WAS_NOT_FOUND_MESSAGE', true);
  //  let trans_Error = this.translatePipe.transform('ERROR', true);

  //  swal({
  //    title: trans_Error + ':',
  //    text: trans_Job_Not_Found,
  //    icon: "error",
  //    dangerMode: true,
  //    //buttons: ['Ok', 'Cancel']
  //  }).then((okbuttoncClicked?: boolean) => {

  //    console.info("Ok clicked...");

  //    // The parameter can also enter as null
  //    const returnVal = !(okbuttoncClicked === null);

  //  });
  //  return;
  //}
  //        this.projectName = this.project.name;
  //        this.jobName = this.job.name;

  //        console.log(`Job loaded! ${this.project.name} - ${this.job.name}`);

  //        let request = new GetSizingJobRequest();
  //        request.jobId = this.job.id;
  //        this.productName = this.job.productName;
  //        this.moduleId = this.job.moduleId;
  //        this.jobStatusId = this.job.jobStatusId;

  //        // ToDo: Get the JobSizing XML or as part of the previous call, single round trip.
  //        this.projectsJobsService.getJobSizing(request).subscribe((response: SizingData) => {

  //          this.loadedJobSizingData = response;

  //          // This is required to prevent any re-validation and re-calculation when a job is loading.
  //          this.isLoadingJob = true;

  //          this.loadJob();
  //        });

  //      });
  //    }
  //  });
  //}

  //loadJob() {
  //  // load process conditions
  //  this.plantsteampressure.setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Plant Steam Pressure").value);
  //  this.cleansteampressure.setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Clean Steam Pressure").value);
  //  this.feedwaterpressure.setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Feedwater Pressure").value);
  //  this.feedwatertemperature.setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Feedwater Temperature").value);
  //  this.requiredcleansteamflowrate.setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Required Clean Steam Flowrate").value);
  //  this.tdsblowdownpercentage.setValue(this.loadedJobSizingData.processConditions[0].processInputs.find(m => m.name === "Tds Blowdown Percentage").value);

  //  // Load unit preferences.
  //  this.preferenceService.addSizingUnitPreference(this.loadedJobSizingData.processConditions[0].unitPreferences.find(u => u.name === this.pressureRef.preference.name), "PressureUnits", "PRESSURE", this.moduleGroupId);
  //  this.preferenceService.addSizingUnitPreference(this.loadedJobSizingData.processConditions[0].unitPreferences.find(u => u.name === this.temperatureRef.preference.name), "TemperatureUnits", "TEMPERATURE", this.moduleGroupId);
  //  this.preferenceService.addSizingUnitPreference(this.loadedJobSizingData.processConditions[0].unitPreferences.find(u => u.name === this.massFlowRef.preference.name), "MassFlowUnits", "MASS_FLOW", this.moduleGroupId);
  //  this.preferenceService.addSizingUnitPreference(this.loadedJobSizingData.processConditions[0].unitPreferences.find(u => u.name === this.loadRef.preference.name), "LoadUnits", "LOAD", this.moduleGroupId);

  //  // load sizing grid
  //  if (this.loadedJobSizingData.sizingOutput.outputGrid != null &&
  //    this.loadedJobSizingData.sizingOutput.outputGrid.outputGridRows != null && this.loadedJobSizingData.sizingOutput.outputGrid.outputGridRows.length > 0) {

  //    this.isCSGSizingDone = true;

  //    this.csgOutputData = new Array<CleanSteamGeneratorOutput>();

  //    var row = new CleanSteamGeneratorOutput();

  //    for (let model of this.loadedJobSizingData.sizingOutput.outputGrid.outputGridRows) {

  //      row.modelId                             = +model.outputItems.find(m => m.name === "Model Id").value;
  //      row.modelName                           = model.outputItems.find(m => m.name === "Model Name").value;
  //      row.cleanSteamFlowrate                  = +model.outputItems.find(m => m.name === "Clean Steam Flow Rate").value;
  //      row.plantSteamFlowrate                  = +model.outputItems.find(m => m.name === "Plant Steam Flow Rate").value;
  //      row.feedwaterFlowrate                   = +model.outputItems.find(m => m.name === "Feed Water Flow Rate").value;
  //      row.blowDownFlowrate                    = +model.outputItems.find(m => m.name === "Blow Down Flow Rate").value;
  //      row.pressurisedDeaeratorInletFlowrate   = +model.outputItems.find(m => m.name === "Pressurised Deaerator Inlet Flow Rate").value;
  //      row.pressurisedDeaeratorOutletFlowrate  = +model.outputItems.find(m => m.name === "Pressurised Deaerator Outlet Flow Rate").value;
  //      row.heatExchangerDuty                   = +model.outputItems.find(m => m.name === "Heat Exchanger Duty").value;
  //      row.overdesign                          = +model.outputItems.find(m => m.name === "OverDesign").value;

  //      row.length                              = +model.outputItems.find(m => m.name === "Length").value;
  //      row.height                              = +model.outputItems.find(m => m.name === "Height").value;
  //      row.width                               = +model.outputItems.find(m => m.name === "Width").value;
  //      row.dryWeight                           = +model.outputItems.find(m => m.name === "DryWeight").value;
  //      row.plantSteamInletConnection           = model.outputItems.find(m => m.name === "PlantSteamInletConnection").value;
  //      row.condensateOutletConnection          = model.outputItems.find(m => m.name === "CondensateOutletConnection").value;
  //      row.cleanSteamOutletConnection          = model.outputItems.find(m => m.name === "CleanSteamOutletConnection").value;
  //      row.feedwaterInletConnection            = model.outputItems.find(m => m.name === "FeedwaterInletConnection").value;
  //      row.safetyValveDischarge                = model.outputItems.find(m => m.name === "SafetyValveDischarge").value;
  //      row.notCondensableVentConnection        = model.outputItems.find(m => m.name === "NotCondensableVentConnection").value;
  //      row.drainConnection = model.outputItems.find(m => m.name === "DrainConnection").value;
  //      row.plantSteamCondensateDrainConnection = model.outputItems.find(m => m.name === "PlantSteamCondensateDrainConnection").value;
  //      row.tdsBlowdownConnection               = model.outputItems.find(m => m.name === "TdsBlowdownConnection").value;
  //      row.samplingSystem                      = model.outputItems.find(m => m.name === "SamplingSystem").value;
  //      row.minAirSupply                        = +model.outputItems.find(m => m.name === "MinAirSupply").value;
  //      row.isPumpMandatory                     = <boolean>JSON.parse(model.outputItems.find(m => m.name === "IsPumpMandatory").value);

  //      let selectedRow = model.outputItems.find(m => m.name === "Model Id").selected;

  //      if (selectedRow) {
  //        // selected row
  //        this.selectedOutputData[0] = row;
  //        this.modelId = row.modelId;
  //        this.modelName = row.modelName;

  //        this.design_Code_Enum_Name = this.hashTable.find(m => m.name === row.modelName).design_Code;
  //        this.shell_Type_Enum_Name = this.hashTable.find(m => m.name === row.modelName).shell_Type;
  //        this.valve_Actuation_Enum_Name = this.hashTable.find(m => m.name === row.modelName).valve_Actuation;
  //        this.control_Enum_Name = this.hashTable.find(m => m.name === row.modelName).control;
  //        this.communication_Interface_Enum_Name = this.hashTable.find(m => m.name === row.modelName).communication_Interface;
  //        this.frame_And_Cabinet_Enum_Name = this.hashTable.find(m => m.name === row.modelName).frame_And_Cabinet;
  //        this.control_Panel_Location_Enum_Name = this.hashTable.find(m => m.name === row.modelName).control_Panel_Location;
  //        this.insulation_Enum_Name = this.hashTable.find(m => m.name === row.modelName).insulation;
  //        this.wheels_And_Feet_Enum_Name = this.hashTable.find(m => m.name === row.modelName).wheels_And_Feet;
  //        this.plant_Steam_Inlet_Shut_Off_Valve_Enum_Name = this.hashTable.find(m => m.name === row.modelName).plant_Steam_Inlet_Shut_Off_Valve;
  //        this.plant_Steam_Line_Trapping_Enum_Name = this.hashTable.find(m => m.name === row.modelName).plant_Steam_Line_Trapping;
  //        this.tds_Control_System_Enum_Name = this.hashTable.find(m => m.name === row.modelName).tds_Control_System;
  //        this.sample_Cooler_Enum_Name = this.hashTable.find(m => m.name === row.modelName).sample_Cooler;
  //        this.independent_Low_Level_Alarm_Enum_Name = this.hashTable.find(m => m.name === row.modelName).independent_Low_Level_Alarm;
  //        this.feedwater_Pre_Heating_Degassing_Enum_Name = this.hashTable.find(m => m.name === row.modelName).feedwater_Pre_Heating_Degassing;
  //        this.intelligent_Diagnostics_Enum_Name = this.hashTable.find(m => m.name === row.modelName).intelligent_Diagnostics;
  //        this.clean_Steam_Outlet_Shut_Off_Valve_Enum_Name = this.hashTable.find(m => m.name === row.modelName).clean_Steam_Outlet_Shut_Off_Valve;
  //        this.test_And_Certification_Enum_Name = this.hashTable.find(m => m.name === row.modelName).test_And_Certification;
  //        this.other_Enum_Name = this.hashTable.find(m => m.name === row.modelName).other;

  //        this.feedwater_Pressurisation_Enum_Name = this.hashTable.find(m => m.name === row.modelName).feedwater_Pressurisation;

  //        this.length = +model.outputItems.find(m => m.name === "Length").value;
  //        this.height = +model.outputItems.find(m => m.name === "Height").value;
  //        this.width = +model.outputItems.find(m => m.name === "Width").value;
  //        this.dryWeight = +model.outputItems.find(m => m.name === "DryWeight").value;
  //        this.plantSteamInletConnection = model.outputItems.find(m => m.name === "PlantSteamInletConnection").value;
  //        this.condensateOutletConnection = model.outputItems.find(m => m.name === "CondensateOutletConnection").value;
  //        this.cleanSteamOutletConnection = model.outputItems.find(m => m.name === "CleanSteamOutletConnection").value;
  //        this.feedwaterInletConnection = model.outputItems.find(m => m.name === "FeedwaterInletConnection").value;
  //        this.safetyValveDischarge = model.outputItems.find(m => m.name === "SafetyValveDischarge").value;
  //        this.notCondensableVentConnection = model.outputItems.find(m => m.name === "NotCondensableVentConnection").value;
  //        this.tdsBlowdownConnection = model.outputItems.find(m => m.name === "TdsBlowdownConnection").value;
  //        this.drainConnection = model.outputItems.find(m => m.name === "DrainConnection").value;
  //        this.plantSteamCondensateDrainConnection = model.outputItems.find(m => m.name === "PlantSteamCondensateDrainConnection").value;
  //        this.samplingSystem = model.outputItems.find(m => m.name === "SamplingSystem").value;

  //        // Check if pump must be selected?
  //        this.filterFeedwaterPressurisationList(row.isPumpMandatory);

  //        //messages
  //        if (model.messages && model.messages.length > 0) {
  //          row.modelSizingMessages = new Array<Message>();

  //          model.messages.forEach(m => {

  //            row.modelSizingMessages.push({
  //              messageKey: m.messageKey,
  //              value: m.value,
  //              unitKey: m.unitKey,
  //              severity: m.severity,
  //              displayValue: m.displayValue
  //            });

  //          });
  //        }

  //        this.isCSGModelSelected = true;
  //      }

  //      this.csgOutputData.push(row);
  //      row = new CleanSteamGeneratorOutput();

  //    }

  //    // Localize display values.
  //    this.localizeCSGOutputData();

  //    // load saved options and price
  //    if (this.isCSGModelSelected) {

  //      let test = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.design_Code_Enum_Name).value;
  //      this.sizingModuleForm.controls["design_Code_Enumeration"].setValue(test);

  //      this.sizingModuleForm.controls["shell_Type_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.shell_Type_Enum_Name).value);
  //      this.sizingModuleForm.controls["valve_Actuation_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.valve_Actuation_Enum_Name).value);
  //      this.sizingModuleForm.controls["control_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.control_Enum_Name).value);
  //      this.sizingModuleForm.controls["communication_Interface_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.communication_Interface_Enum_Name).value);
  //      this.sizingModuleForm.controls["frame_And_Cabinet_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.frame_And_Cabinet_Enum_Name).value);
  //      this.sizingModuleForm.controls["control_Panel_Location_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.control_Panel_Location_Enum_Name).value);
  //      this.sizingModuleForm.controls["insulation_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.insulation_Enum_Name).value);
  //      this.sizingModuleForm.controls["wheels_And_Feet_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.wheels_And_Feet_Enum_Name).value);
  //      this.sizingModuleForm.controls["plant_Steam_Inlet_Shut_Off_Valve_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.plant_Steam_Inlet_Shut_Off_Valve_Enum_Name).value);
  //      this.sizingModuleForm.controls["plant_Steam_Line_Trapping_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.plant_Steam_Line_Trapping_Enum_Name).value);
  //      this.sizingModuleForm.controls["tds_Control_System_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.tds_Control_System_Enum_Name).value);
  //      this.sizingModuleForm.controls["sample_Cooler_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.sample_Cooler_Enum_Name).value);
  //      this.sizingModuleForm.controls["independent_Low_Level_Alarm_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.independent_Low_Level_Alarm_Enum_Name).value);
  //      this.sizingModuleForm.controls["feedwater_Pre_Heating_Degassing_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.feedwater_Pre_Heating_Degassing_Enum_Name).value);
  //      this.sizingModuleForm.controls["intelligent_Diagnostics_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.intelligent_Diagnostics_Enum_Name).value);
  //      this.sizingModuleForm.controls["clean_Steam_Outlet_Shut_Off_Valve_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.clean_Steam_Outlet_Shut_Off_Valve_Enum_Name).value);
  //      this.sizingModuleForm.controls["test_And_Certification_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.test_And_Certification_Enum_Name).value);
  //      this.sizingModuleForm.controls["other_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.other_Enum_Name).value);
  //      // Pump and Phase/voltage selections.
  //      this.sizingModuleForm.controls["feedwater_Pressurisation_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.feedwater_Pressurisation_Enum_Name).value);
  //      // Filter Phase/Voltage list base on feedwater pressurisation selection.
  //      this.filterPhaseVoltageList(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === this.feedwater_Pressurisation_Enum_Name).value);
  //      this.sizingModuleForm.controls["phase_Voltage_Enumeration"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "CSG_Phase_Voltage").value);

  //      // Option visibility status
  //      this.show_plant_Steam_Line_Trapping         = <boolean>JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Show_Plant_Steam_Line_Trapping").value);
  //      this.show_sample_Cooler                     = <boolean>JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Show_Sample_Cooler").value);
  //      this.show_independent_Low_Level_Alarm       = <boolean>JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Show_Independent_Low_Level_Alarm").value);
  //      this.show_feedwater_Pre_Heating_Degassing   = <boolean>JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Show_Feedwater_Pre_Heating_Degassing").value);
  //      this.show_intelligent_Diagnostics           = <boolean>JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Show_Intelligent_Diagnostics").value);
  //      this.show_clean_Steam_Outlet_Shut_Off_Valve = <boolean>JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Show_Clean_Steam_Outlet_Shut_Off_Valve").value);

  //      this.sellingCurrencySymbol          = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "SellingCurrencySymbol").value;

  //      this.internal_SSP                   = +this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "SSP").value;
  //      this.internal_SellingPrice          = +this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Selling Price").value;
  //      this.internal_ServiceOfferingPrice  = +this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Service Offering Price").value;
  //      this.deliveryCost                   = +this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Delivery Cost").value;
  //      this.internal_TotalPrice            = +this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Total Price").value;

  //      this.display_SSP                    = this.localizeValue(this.internal_SSP, 2);
  //      this.display_SellingPrice           = this.localizeValue(this.internal_SellingPrice, 2);
  //      this.display_ServiceOfferingPrice   = this.localizeValue(this.internal_ServiceOfferingPrice, 2);
  //      this.display_DeliveryPrice          = this.localizeValue(this.deliveryCost, 2);
  //      this.display_TotalPrice             = this.localizeValue(this.internal_TotalPrice, 2);

  //      this.serviceOfferingKey = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Service Offering Label").value;

  //      this.sellingMarkupFormControl.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Selling Markup").value);
  //      this.grossMarginFormControl.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Gross Margin").value);
  //      this.sizingModuleForm.controls["serviceOfferingOptionsFormControl"].setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Service Offering Enumeration").value);

  //      this.sellingMarkupUpdated = <boolean>JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "SellingMarkupUpdated").value);
  //      this.grossMarginUpdated = <boolean>JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "GrossMarginUpdated").value);

  //      this.nomenclature = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Nomenclature").value;
  //    }

  //    // load spec sheet header details
  //    this.isSpecSheetEnabled = <boolean>JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "IsSpecSheetEnabled").value);

  //    if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Sheet") != null) {
  //      this.sheet.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Sheet").value);
  //    }

  //    if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Revision No") != null) {
  //      this.revisionNumber.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Revision No").value);
  //    }

  //    if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Project Type") != null) {
  //      this.projectType.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Project Type").value);
  //    }

  //    if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Quantity") != null) {
  //      this.quantity.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Quantity").value);
  //    }

  //    if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "AO Number") != null) {
  //      this.aoNumber.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "AO Number").value);
  //    }

  //    if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Order No") != null) {
  //      this.orderNumber.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Order No").value);
  //    }

  //    if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Note 1") != null) {
  //      this.notes.setValue(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Note 1").value);
  //    }

  //    if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Message 1") != null) {
  //      for (var i = 0; i < 5; i++) {
  //        if (this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Message " + i) != null) {

  //          let msg = this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "Message " + i).value;

  //          this.translatedMessagesList[i] = msg;

  //        } else {
  //          this.translatedMessagesList[i] = "-";

  //        }

  //      }
  //    }
  //  } else {
  //    this.isCSGSizingDone = false;
  //  }

  //  // Reset button status
  //  if (<boolean>JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "IsResetEnabled").value)) {
  //    this.sizingModuleForm.markAsDirty();
  //  }
  //}

  /*
  * Method to calculate csg sizing.
  */
  onCalculateSizing(formGroup: FormGroup) {
    console.info("Calculating CSG F&B!");

    this.resetResults();
    this.resetLoadingJobStatus();

    //// Process conditions
    this.csgFBProcessConditions.plantSteamPressure = this.plantsteampressure.value;
    this.csgFBProcessConditions.cleanSteamPressure = this.cleansteampressure.value;
    this.csgFBProcessConditions.feedwaterPressure = this.feedwaterpressure.value;
    this.csgFBProcessConditions.feedwaterTemperature = this.feedwatertemperature.value;
    this.csgFBProcessConditions.requiredCleanSteamFlowrate = this.requiredcleansteamflowrate.value;
    this.csgFBProcessConditions.tdsBlowDownPercentage = this.tdsblowdownpercentage.value;
    this.csgFBProcessConditions.flowrateOfNonCondensibleGases = this.flowrateofnoncondensiblegases.value;

    // Unit Details
    this.csgFBProcessConditions.pressureUnitId = parseInt(this.pressureRef.preference.value);
    this.csgFBProcessConditions.pressureUnitMasterTextKey = this.pressureRef.preference.masterTextKey;
    this.csgFBProcessConditions.pressureUnitDecimalPlaces = this.pressureRef.preference.decimalPlaces;

    this.csgFBProcessConditions.temperatureUnitId = parseInt(this.temperatureRef.preference.value);
    this.csgFBProcessConditions.temperatureUnitMasterTextKey = this.temperatureRef.preference.masterTextKey;
    this.csgFBProcessConditions.temperatureUnitDecimalPlaces = this.temperatureRef.preference.decimalPlaces;

    this.csgFBProcessConditions.massFlowUnitId = parseInt(this.massFlowRef.preference.value);
    this.csgFBProcessConditions.massFlowUnitMasterTextKey = this.massFlowRef.preference.masterTextKey;
    this.csgFBProcessConditions.massFlowUnitDecimalPlaces = this.massFlowRef.preference.decimalPlaces;

    this.csgFBProcessConditions.loadUnitId = parseInt(this.loadRef.preference.value);
    this.csgFBProcessConditions.lengthUnitId = parseInt(this.lengthPref);
    this.csgFBProcessConditions.weightUnitId = parseInt(this.weightPref);

    //this.csgFBProcessConditions.weightUnitId = true;


    //});

    //this.cleanSteamGeneratorFBService.sizeCleanSteamGeneratorFB(this.csgFBProcessConditions).subscribe((cleanSteamGeneratorFBOutputData: boolean) => {
    this.cleanSteamGeneratorFBService.sizeCleanSteamGeneratorFB(this.csgFBProcessConditions).subscribe((cleanSteamGeneratorFBOutputData: Array<CleanSteamGeneratorFBOutput>) => {
      //check for csg FB ranges
      if (cleanSteamGeneratorFBOutputData[0] == null) {
        return;
      }

      // Update the subject with the data that's just been retrieved (see the constructor).
      // Also, ensure that the output data is ordered by overdesign.
      this.csgFBOutputData = cleanSteamGeneratorFBOutputData.sort((a, b) => a.overdesign > b.overdesign ? 1 : 0);

      // Localize display values.
      this.localizeCSGFBOutputData();

      //// Check if pump must be selected?
      //this.filterFeedwaterPressurisationList(this.csgOutputData.findIndex(od => od.isPumpMandatory) > -1);

      this.isCSGFBSizingDone = true;

      //NOTE: CSG FB Options loaded via enumerations

      // Check and select any data row with overdesign greter than 0.
      var idx = this.csgFBOutputData.findIndex(i => i.overdesign > this.overdesign_Limit_0);
      if (idx > -1) {
        // The following timeout is required for "#csgOutputDataTable" to finish loading for the first time before we are able to make a default row selection.
        setTimeout(() => {
          this.selectCSGFBOutputDataRow(this.csgFBOutputData[idx]);
        }, 100); // delay for UI (csgOutputDataTable) to load.
      }

    });

    this.moduleId = 11;
    this.productName = "CSG FB";

    if (this.csgFBOutputDataRows.length > 1) {
      // Calculated
      this.jobStatusId = 2;
    } else {
      // Input
      this.jobStatusId = 1;
    }

    if (this.gridSelectedRow) {
      // Selected
      this.jobStatusId = 3;
    }

  }

  /*
  * Custom validator for all the form control inputs.
  */
  validateFormControlInput(control: AbstractControl, controlName, unitRef, msgRef) {
    // Reset results
    this.resetResults();

    if (control.value !== "") {
      // Reset error messages first.
      msgRef.value = '';

      // Add details into the validation model.
      var csgFBInputValidation: CleanSteamGeneratorFBInputValidation = new CleanSteamGeneratorFBInputValidation();
      csgFBInputValidation.controlName = controlName;
      csgFBInputValidation.value = +control.value;
      csgFBInputValidation.unitId = +(unitRef && unitRef !== null && unitRef.preference && unitRef.preference != null ? unitRef.preference.value : 0);

      this.cleanSteamGeneratorFBService.validateCleanSteamGeneratorFBInput(csgFBInputValidation).subscribe((result: Array<CleanSteamGeneratorFBValidationMessage>) => {
        // Check if there's any validation errors? If so, set form control and error message accordingly.
        if (result && result.length > 0) {
          msgRef.value = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value + (unitRef !== null ? ' ' + this.translatePipe.transform(unitRef.preference.masterTextKey, false) : '') + ')';
          control.setErrors({ 'incorrect': true });
        }
      });
    }

    // This is required for custo validator attached with form control.
    //return { customError: false }
    return null;
  }

  /*
  * Validates input process conditions.
  */
  //validateProcessConditions(): void {
  //  this.pressureDifferentialErrorMessage = '';

  //  // 8.7.3	Pressure Differential Data Entry Note (NoteΔP)
  //  if (this.plantsteampressure.value != "" && this.cleansteampressure.value != "") {
  //    var csgInputsValidation: CleanSteamGeneratorProcessConditionsValidation = new CleanSteamGeneratorProcessConditionsValidation();
  //    csgInputsValidation.controlName = 'cleansteampressure';
  //    csgInputsValidation.value1 = this.plantsteampressure.value;
  //    csgInputsValidation.value2 = this.cleansteampressure.value;
  //    csgInputsValidation.unitId = parseInt(this.pressureRef.preference.value);

  //    this.cleanSteamGeneratorService.validateCleanSteamGeneratorProcessConditions(csgInputsValidation).subscribe((result: Array<CleanSteamGeneratorValidationMessage>) => {
  //      // Check if cross validation errors returned?
  //      if (result && result.length > 0) {
  //        this.pressureDifferentialErrorMessage = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value + (this.pressureRef !== null ? ' ' + this.translatePipe.transform(this.pressureRef.preference.masterTextKey, false) : '') + ')';
  //        this.sizingModuleForm.setErrors({ 'incorrect': true });
  //      }
  //    });
  //  }
  //}

  onResetModuleForm() {
    console.info("Resetting the CSG FB form");

    // Default TDS Blowdown Percentage = 5%
    this.sizingModuleForm.controls["tdsblowdownpercentage"].setValue("5");
    this.sizingModuleForm.controls["flowrateofnoncondensiblegases"].setValue("0");

    //this.pressureDifferentialErrorMessage = '';
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
    this.plantsteampressure.updateValueAndValidity();
    this.cleansteampressure.updateValueAndValidity();
    this.feedwaterpressure.updateValueAndValidity();
    this.feedwatertemperature.updateValueAndValidity();
    this.requiredcleansteamflowrate.updateValueAndValidity();
    this.tdsblowdownpercentage.updateValueAndValidity();
    this.flowrateofnoncondensiblegases.updateValueAndValidity();
  }

  /*
  * Method to reset csg sizing results.
  */
  resetResults() {
    this.csgFBOutputData = [];
    this.isCSGFBSizingDone = false;
    this.isCSGFBModelSelected = false;

    //this.sellingMarkupUpdated = false;
    //this.grossMarginUpdated = false;

    this.translatedMessagesList = [];

    this.loadOptions = false;
    this.gridSelectedRow = false;
  }

  /*
  * Method to reset the isLoadingJob flag.
  */
  resetLoadingJobStatus() {
    this.isLoadingJob = false;
  }

  onNewSizingForm() {
    // ToDo: Implement!

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
    let tiRequestModel: TiRequestModel = new TiRequestModel();

    // ToDo: Add missing Ti table data!
    tiRequestModel.moduleId = 8; // CSG ModuleId is 8 (child, Product Sizing), moduleGroupId=12 (parent)
    tiRequestModel.languageId = -1; // not supported yet, will get default Ti language, normally 'en'
    tiRequestModel.code = "CSG";//this.modelName; // Selected CSG Model
    tiRequestModel.params = "CSG-FB"; // any selected CSG Model extra parameters for a Ti selection?

    let trans_Ti_Error = this.translatePipe.transform('TI_ERROR', true);
    let trans_Ti_Information = this.translatePipe.transform('TI_INFORMATION', true);
    let trans_Ti_Failed_To_Download = this.translatePipe.transform('TI_FAILED_TO_DOWNLOAD', true);
    let trans_Ti_The_Product_Technical_Information_sheet = this.translatePipe.transform('TI_THE_PRODUCT_TECHNICAL_INFORMATION_SHEET', true);
    let trans_Ti_missing = this.translatePipe.transform('TI_THE_PRODUCT_TECHNICAL_INFORMATION_SHEET_DOCUMENT_IS_UNAVAILABLE_OR_MISSING', true);

    // Get Ti url/path
    this.docGenService.getTiDocumentInfo(tiRequestModel).subscribe((response: TiDocumentInfo[]) => {

      // ToDo: Better manage multiple Ti documents returned?
      if (!!response && response.length > 0) {

        response.forEach(ti => {
          // Get first Ti url from result.
          let tiUrlPath = ti.tiPath + ti.tiFileName;// pdf

          if (!!tiUrlPath) {
            if (tiUrlPath.indexOf('.ashx') < 0) {
              // Open old style regular Ti PDF in new browser tab/window.
              window.open(tiUrlPath, "_blank");
            }
            else {
              // Download file served from .ashx path on Spirax document API, direct to client:
              // Note: downloading direct doesn't work: this.docGenService.downloadFromAnyAPI(ti.tiPath).subscribe(data => saveAs(data, ti.tiFileName)); not working yet: //has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access - Control - Allow - Origin' header is present on the requested resource.


              // Download file served from.ashx path to WebAPI then serve the data blob to the Client. Works.
              this.docGenService.getTiDocumentFile(ti).subscribe((response: any) => {
                if (response.size > 0) {
                  FileSaver.saveAs(response, ti.tiFileName);
                  // ToDo: Can't open the file in a new tab once it's downloaded. Spoof the Headers?
                }
                else {
                  // Notify UI, Ti failed to download.
                  // ToDo : Translation support?
                  swal({
                    title: trans_Ti_Error + ':',
                    text: trans_Ti_The_Product_Technical_Information_sheet + ' "' + ti.tiPath + '" ' + trans_Ti_Failed_To_Download + '.',
                    icon: "error",
                    dangerMode: false,
                    //buttons: ['Ok', 'Cancel']
                  }).then((okbuttoncClicked?: boolean) => {
                    console.info("Ok clicked...");
                    // The parameter can also enter as null
                    const returnVal = !(okbuttoncClicked === null);
                  });
                } // end of if

              }); // end of getTiDocumentFile() Subscribe

            } // end of else

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
    //this.docGen = new DocGen;
    //this.docGen.specItems = new Array<SpecSheetItem>();
    //this.docGen.moduleId = 12;
    //this.docGen.template = "pdf";
    //this.docGen.headerImage = "sxsLogo.jpg";
    //this.docGen.bodyImage = "CSG.png";

    //// Pass data only, labels are retrieved from database in Doc Gen dll.
    //this.setSpecSheetValues();

    //this.docGenService.getPdf(this.docGen).subscribe((response: any) => {

    //  let filename = 'CSG-SpecificationSheet.pdf';
    //  FileSaver.saveAs(response, filename);

    //});

  }

  //setSpecSheetValues() {

  //  var currentDate = new Date();

  //  var projName = this.projectId != "" ? this.project.name : "-";
  //  var projRef = this.projectId != "" ? this.project.projectReference : "-";
  //  var projLocation = this.projectId != "" ? this.project.customerLocation : "-";
  //  var projQuoteRef = this.projectId != "" ? this.project.quoteReference : "-";
  //  var projCusName = this.projectId != "" ? this.project.customerName : "-";
  //  var jobName = this.jobId != "" ? this.job.name : "-";
  //  var voltage = "";

  //  var airSupplyMessage = this.translatePipe.transform('MINIMUM', false) + " " + this.minAirSupply;
  //  var phases = "";

  //  if (this.phase_Voltage_Enumeration.value === "Single Phase 100 - 240V") {
  //    phases = this.translatePipe.transform('SINGLE', false);
  //    voltage = "100-240";
  //  } else {
  //    phases = "3";
  //    if (this.phase_Voltage_Enumeration.value === "Three Phase 200-240V") {
  //      voltage = "200-240";
  //    } else {
  //      voltage = "380-480";
  //    }
  //  }
  //  // this.specSheetLanguage = 'fr-fr';
  //  // Pass data only, labels are retrieved from database in Doc Gen dll.
  //  this.docGen.specItems.push({ name: 'Date', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: currentDate.toDateString() });
  //  this.docGen.specItems.push({ name: 'Quotation Ref', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projQuoteRef });
  //  this.docGen.specItems.push({ name: 'Prepared By', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.user.firstname + ' ' + this.user.lastname });
  //  this.docGen.specItems.push({ name: 'Sheet', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.sheet.value == null ? "-" : this.sheet.value });
  //  this.docGen.specItems.push({ name: 'Revision No', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.revisionNumber.value == null ? "-" : this.revisionNumber.value });
  //  this.docGen.specItems.push({ name: 'Email', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.user.email });
  //  this.docGen.specItems.push({ name: 'Quantity', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.quantity.value == null ? "-" : this.quantity.value});
  //  this.docGen.specItems.push({ name: 'AO Number', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.aoNumber.value == null ? "-" : this.aoNumber.value });
  //  this.docGen.specItems.push({ name: 'Telephone', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.user.telephone });
  //  this.docGen.specItems.push({ name: 'Customer', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projCusName });
  //  this.docGen.specItems.push({ name: 'Order No', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.orderNumber.value == null ? "-" : this.orderNumber.value});
  //  this.docGen.specItems.push({ name: 'Project Type', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: this.projectType.value == null ? "-" : this.projectType.value });
  //  this.docGen.specItems.push({ name: 'Location', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projLocation });
  //  this.docGen.specItems.push({ name: 'Project Name', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projName });
  //  this.docGen.specItems.push({ name: 'Project Ref', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: projRef });
  //  this.docGen.specItems.push({ name: 'Job Name', type: 'Header', masterTextKey: '', sectionName: '', targetLanguage: this.specSheetLanguage, value: jobName });

  //  //Process Data
  //  this.docGen.specItems.push({ name: 'Plant steam pressure', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.plantsteampressure.value });
  //  this.docGen.specItems.push({ name: 'Plant steam pressure unit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.name });
  //  this.docGen.specItems.push({ name: 'Plant steam flowrate', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.displayPlantSteamFlowrate });
  //  this.docGen.specItems.push({ name: 'Plant steam flowrate unit', type: 'Unit', masterTextKey: this.massFlowRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.massFlowRef.preference.name });
  //  this.docGen.specItems.push({ name: 'Clean steam pressure', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.cleansteampressure.value });
  //  this.docGen.specItems.push({ name: 'Clean steam pressure unit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.name });
  //  this.docGen.specItems.push({ name: 'Feed water pressure', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.feedwaterpressure.value });
  //  this.docGen.specItems.push({ name: 'Feed water pressure unit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.name });
  //  this.docGen.specItems.push({ name: 'Feed water temperature', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.feedwatertemperature.value });
  //  this.docGen.specItems.push({ name: 'Feed water temperature unit', type: 'Unit', masterTextKey: this.temperatureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.temperatureRef.preference.name });
  //  this.docGen.specItems.push({ name: 'Clean steam flowrate', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.displayCleanSteamFlowrate });
  //  this.docGen.specItems.push({ name: 'Clean steam flowrate unit', type: 'Unit', masterTextKey: this.massFlowRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.massFlowRef.preference.name });
  //  this.docGen.specItems.push({ name: 'TDS Blow Down Percentage', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.tdsblowdownpercentage.value });
  //  this.docGen.specItems.push({ name: 'TDS Blow Down Percentage Unit', type: 'Unit', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: '%' });

  //  // Utilities
  //  this.docGen.specItems.push({ name: 'Phases', type: 'Section', masterTextKey: '', sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: phases.toString() });
  //  this.docGen.specItems.push({ name: 'Phases Unit', type: 'Unit', masterTextKey: '', sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: '-' });
  //  this.docGen.specItems.push({ name: 'Supply Voltage', type: 'Section', masterTextKey: '', sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: voltage });
  //  this.docGen.specItems.push({ name: 'Supply Voltage Unit', type: 'Unit', masterTextKey: '', sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: 'V' });
  //  this.docGen.specItems.push({ name: 'Frequency', type: 'Section', masterTextKey: '', sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: '50/60' });
  //  this.docGen.specItems.push({ name: 'Frequency Unit', type: 'Unit', masterTextKey: '', sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: 'Hz' });
  //  this.docGen.specItems.push({ name: 'Air Supply', type: 'Section', masterTextKey: '', sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: airSupplyMessage.toString() });
  //  this.docGen.specItems.push({ name: 'Air Supply Unit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.name });

  //  // Configuration
  //  let designCodeTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).design_Code, this.design_Code_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Design code', type: 'Section', masterTextKey: '', sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(designCodeTrans, false) });

  //  let shellTypeTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).shell_Type, this.shell_Type_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Shell type', type: 'Section', masterTextKey: '', sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(shellTypeTrans, false) });

  //  this.docGen.specItems.push({ name: 'Unit size', type: 'Section', masterTextKey: '', sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.modelName });

  //  let valveActuationTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).valve_Actuation, this.valve_Actuation_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Valve actuation type', type: 'Section', masterTextKey: '', sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(valveActuationTrans, false) });

  //  let control = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).control, this.control_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Control', type: 'Section', masterTextKey: '', sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(control, false) });

  //  let communicationInterfaceTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).communication_Interface, this.communication_Interface_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Communication interface', type: 'Section', masterTextKey: '', sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(communicationInterfaceTrans, false) });

  //  let frameAndCabinetTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).frame_And_Cabinet, this.frame_And_Cabinet_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Unit frame', type: 'Section', masterTextKey: '', sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(frameAndCabinetTrans, false) });

  //  let controlPanelLocationTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).control_Panel_Location, this.control_Panel_Location_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Control panel location', type: 'Section', masterTextKey: '', sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(controlPanelLocationTrans, false) });

  //  let insulationTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).insulation, this.insulation_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Insulation', type: 'Section', masterTextKey: '', sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(insulationTrans, false) });

  //  let wheelsAndFeetTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).wheels_And_Feet, this.wheels_And_Feet_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Handling wheels and feet', type: 'Section', masterTextKey: '', sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(wheelsAndFeetTrans, false) });

  //  // Options
  //  let plantSteamInletShutOffValve = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).plant_Steam_Inlet_Shut_Off_Valve, this.plant_Steam_Inlet_Shut_Off_Valve_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Plant steam inlet shut-off valve', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(plantSteamInletShutOffValve, false) });

  //  let plantSteamLineTrappingTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).plant_Steam_Line_Trapping, this.plant_Steam_Line_Trapping_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Plant steam line trapping', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(plantSteamLineTrappingTrans, false) });

  //  let tdsControlSystemTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).tds_Control_System, this.tds_Control_System_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'TDS control system', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(tdsControlSystemTrans, false) });

  //  let sampleCoolerTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).sample_Cooler, this.sample_Cooler_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Sampling cooler', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(sampleCoolerTrans, false) });

  //  this.docGen.specItems.push({ name: 'Length', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.length.toString() });
  //  this.docGen.specItems.push({ name: 'Length Unit', type: 'Unit', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.lengthPrefUnit });

  //  let feed = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).feedwater_Pressurisation, this.feedwater_Pressurisation_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Feedwater pressurisation system', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(feed, false) });

  //  this.docGen.specItems.push({ name: 'Height', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.height.toString() });
  //  this.docGen.specItems.push({ name: 'Height Unit', type: 'Unit', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.lengthPrefUnit });

  //  let independentLowLevelAlarmTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).independent_Low_Level_Alarm, this.independent_Low_Level_Alarm_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Independent low level alarm', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(independentLowLevelAlarmTrans, false) });

  //  this.docGen.specItems.push({ name: 'Width', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.width.toString() });
  //  this.docGen.specItems.push({ name: 'Width Unit', type: 'Unit', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.lengthPrefUnit });

  //  this.docGen.specItems.push({ name: 'Dry weight', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.dryWeight.toString() });
  //  this.docGen.specItems.push({ name: 'Weight Unit', type: 'Unit', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.weightPrefUnit });

  //  let feedwaterPreHeatingDegassingTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).feedwater_Pre_Heating_Degassing, this.feedwater_Pre_Heating_Degassing_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Feedwater pre-heating', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(feedwaterPreHeatingDegassingTrans, false) });

  //  let intelligentDiagnosticsTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).intelligent_Diagnostics, this.intelligent_Diagnostics_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Intelligent diagnostics', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(intelligentDiagnosticsTrans, false) });

  //  let cleanSteamOutletShutOffValveTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).clean_Steam_Outlet_Shut_Off_Valve, this.clean_Steam_Outlet_Shut_Off_Valve_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Clean steam outlet shut-off valve', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(cleanSteamOutletShutOffValveTrans, false) });

  //  let testAndCertificationTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).test_And_Certification, this.test_And_Certification_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Test and certifications', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(testAndCertificationTrans, false) });

  //  let otherTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).other, this.other_Enum.internalValue);
  //  this.docGen.specItems.push({ name: 'Other', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(otherTrans, false) });

  //  // Product
  //  this.docGen.specItems.push({ name: 'Unit nomenclature build', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.nomenclature });
  //  this.docGen.specItems.push({ name: 'Plant steam inlet connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.plantSteamInletConnection });
  //  this.docGen.specItems.push({ name: 'Condensate outlet connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.condensateOutletConnection });
  //  this.docGen.specItems.push({ name: 'Clean steam outlet connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.cleanSteamOutletConnection });
  //  this.docGen.specItems.push({ name: 'Feedwater inlet connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.feedwaterInletConnection });
  //  this.docGen.specItems.push({ name: 'Safety valve discharge', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.safetyValveDischarge });
  //  this.docGen.specItems.push({ name: 'Not condensable vent connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.notCondensableVentConnection });
  //  this.docGen.specItems.push({ name: 'Drain connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.drainConnection });
  //  this.docGen.specItems.push({ name: 'Plant steam condensate drain connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.plantSteamCondensateDrainConnection });
  //  this.docGen.specItems.push({ name: 'TDS Blowdown connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.tdsBlowdownConnection });
  //  this.docGen.specItems.push({ name: 'Sampling System', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.samplingSystem });

  //  // Messages
  //  this.docGen.specItems.push({ name: 'Message 1', type: 'Section', masterTextKey: '', sectionName: 'Messages', targetLanguage: this.specSheetLanguage, value: this.translatedMessagesList[0] });
  //  this.docGen.specItems.push({ name: 'Message 2', type: 'Section', masterTextKey: '', sectionName: 'Messages', targetLanguage: this.specSheetLanguage, value: this.translatedMessagesList[1] });
  //  this.docGen.specItems.push({ name: 'Message 3', type: 'Section', masterTextKey: '', sectionName: 'Messages', targetLanguage: this.specSheetLanguage, value: this.translatedMessagesList[2] });
  //  this.docGen.specItems.push({ name: 'Message 4', type: 'Section', masterTextKey: '', sectionName: 'Messages', targetLanguage: this.specSheetLanguage, value: this.translatedMessagesList[3] });
  //  this.docGen.specItems.push({ name: 'Message 5', type: 'Section', masterTextKey: '', sectionName: 'Messages', targetLanguage: this.specSheetLanguage, value: this.translatedMessagesList[4] });

  //  // Notes
  //  this.docGen.specItems.push({ name: 'Note 1', type: 'Section', masterTextKey: '', sectionName: 'Notes', targetLanguage: this.specSheetLanguage, value: this.notes.value == "" ? "-" : this.notes.value });

  //}

  onExcelSubmit() {
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

  get csgFBOutputDataRows(): CleanSteamGeneratorFBOutput[] {
    return this.csgFBOutputData;
  }

  /**
   * Data table selection changed method
   */
  onSelect(event: any) {
    var selectedRow = event.selected as CleanSteamGeneratorFBOutput[];

    this.selectCSGFBOutputDataRow(selectedRow[0]);
  }

  /**
   * Data table selection changed method implementation.
   */
  selectCSGFBOutputDataRow(selectedRow: CleanSteamGeneratorFBOutput) {

    this.selectedOutputData[0] = selectedRow;

    this.isCSGFBModelSelected = true;

    //this.modelId = selectedRow.modelId;
    //this.modelName = selectedRow.modelName;
    //this.length = selectedRow.length;
    //this.height = selectedRow.height;
    //this.width = selectedRow.width;
    //this.dryWeight = selectedRow.dryWeight;
    //this.plantSteamInletConnection = selectedRow.plantSteamInletConnection;
    //this.condensateOutletConnection = selectedRow.condensateOutletConnection;
    //this.cleanSteamOutletConnection = selectedRow.cleanSteamOutletConnection;
    //this.feedwaterInletConnection = selectedRow.feedwaterInletConnection;
    //this.safetyValveDischarge = selectedRow.safetyValveDischarge;
    //this.notCondensableVentConnection = selectedRow.notCondensableVentConnection;
    //this.drainConnection = selectedRow.drainConnection;
    //this.plantSteamCondensateDrainConnection = selectedRow.plantSteamCondensateDrainConnection;
    //this.tdsBlowdownConnection = selectedRow.tdsBlowdownConnection;
    //this.samplingSystem = selectedRow.samplingSystem;
    //this.plantSteamFlowrate = selectedRow.plantSteamFlowrate;
    //this.displayPlantSteamFlowrate = selectedRow.displayPlantSteamFlowrate;
    //this.displayCleanSteamFlowrate = selectedRow.displayCleanSteamFlowrate;
    //this.minAirSupply = selectedRow.minAirSupply;

    var messages = this.messagesService.messages;

    // messages may already be loaded via load job - don't re-add
    if (this.translatedMessagesList.length < 1) {

      // no previously loaded messages via load job. Are there any new messages to add.
      if (messages.length > 0) {
        for (var i = 0; i < 5; i++) {
          if (messages[i] != null) {
            var messageKey = messages[i].messageKey;
            var unitKey = messages[i].unitKey;
            var translatedMessage = "";

            if (unitKey == null) {
              translatedMessage = this.translatePipe.transform(messageKey, false);
            } else {
              translatedMessage = this.translatePipe.transform(messageKey, false) +
                " (" + messages[i].value.toFixed(2) + " " + this.translatePipe.transform(messages[i].unitKey, false) + ")";
            }

            this.translatedMessagesList.push(translatedMessage);
          } else {
            this.translatedMessagesList.push("-");
          }
        }
      } else {

        for (var i = 0; i < 5; i++) {
          this.translatedMessagesList.push("-");

        }
      }
    }

    // Expand Row Details if any.
    if (this.csgFBOutputDataTable) {
      this.csgFBOutputDataTable.rowDetail.toggleExpandRow(selectedRow);
    }

    //this.design_Code_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).design_Code;
    //this.shell_Type_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).shell_Type;
    //this.valve_Actuation_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).valve_Actuation;
    //this.control_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).control;
    //this.communication_Interface_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).communication_Interface;
    //this.frame_And_Cabinet_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).frame_And_Cabinet;
    //this.control_Panel_Location_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).control_Panel_Location;
    //this.insulation_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).insulation;
    //this.wheels_And_Feet_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).wheels_And_Feet;
    //this.plant_Steam_Inlet_Shut_Off_Valve_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).plant_Steam_Inlet_Shut_Off_Valve;
    //this.plant_Steam_Line_Trapping_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).plant_Steam_Line_Trapping;
    //this.tds_Control_System_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).tds_Control_System;
    //this.sample_Cooler_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).sample_Cooler;
    //this.independent_Low_Level_Alarm_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).independent_Low_Level_Alarm;
    //this.feedwater_Pre_Heating_Degassing_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).feedwater_Pre_Heating_Degassing;
    //this.intelligent_Diagnostics_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).intelligent_Diagnostics;
    //this.clean_Steam_Outlet_Shut_Off_Valve_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).clean_Steam_Outlet_Shut_Off_Valve;
    //this.test_And_Certification_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).test_And_Certification;
    //this.other_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).other;
    //this.feedwater_Pressurisation_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).feedwater_Pressurisation;

    // Update the flag so that spec sheet could be generated.
    //this.isSpecSheetEnabled = true;

    //// Calculate the CSG price.
    //setTimeout(() => {
    //   this.calculatePrice();
    //}, 100);
  }

  /**
   * Method to calculate total price based on selected model and options.
   */
  //calculatePrice() {
  //  console.info(this.sizingModuleForm.value);

  //  // Ensure that the prices are displayed in current selling currency from the module prefs.
  //  this.sellingCurrencySymbol = this.sellingCurrency.symbol;

  //  this.csgPricing.modelId = this.modelId;
  //  this.csgPricing.manufacturerId = this.manufacturerId;
  //  this.csgPricing.basePriceOption = this.basePriceOption;
  //  this.csgPricing.localRecommendedSalesPriceOption = this.localRecommendedSalesPriceOption;
  //  this.csgPricing.landedCostIncreaseFactor = this.landedCostIncreaseFactor;
  //  this.csgPricing.pricingOptions = [];

  //  this.csgPricing.sizingMessages = this.messagesService.messages;

  //  // Check and add options
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.design_Code_Enum.enumerationName, selectedValue: this.design_Code_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.shell_Type_Enum.enumerationName, selectedValue: this.shell_Type_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.valve_Actuation_Enum.enumerationName, selectedValue: this.valve_Actuation_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.control_Enum.enumerationName, selectedValue: this.control_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.communication_Interface_Enum.enumerationName, selectedValue: this.communication_Interface_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.frame_And_Cabinet_Enum.enumerationName, selectedValue: this.frame_And_Cabinet_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.control_Panel_Location_Enum.enumerationName, selectedValue: this.control_Panel_Location_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.insulation_Enum.enumerationName, selectedValue: this.insulation_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.wheels_And_Feet_Enum.enumerationName, selectedValue: this.wheels_And_Feet_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.plant_Steam_Inlet_Shut_Off_Valve_Enum.enumerationName, selectedValue: this.plant_Steam_Inlet_Shut_Off_Valve_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.plant_Steam_Line_Trapping_Enum.enumerationName, selectedValue: this.plant_Steam_Line_Trapping_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.tds_Control_System_Enum.enumerationName, selectedValue: this.tds_Control_System_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.sample_Cooler_Enum.enumerationName, selectedValue: this.sample_Cooler_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.independent_Low_Level_Alarm_Enum.enumerationName, selectedValue: this.independent_Low_Level_Alarm_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.feedwater_Pre_Heating_Degassing_Enum.enumerationName, selectedValue: this.feedwater_Pre_Heating_Degassing_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.intelligent_Diagnostics_Enum.enumerationName, selectedValue: this.intelligent_Diagnostics_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.clean_Steam_Outlet_Shut_Off_Valve_Enum.enumerationName, selectedValue: this.clean_Steam_Outlet_Shut_Off_Valve_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.test_And_Certification_Enum.enumerationName, selectedValue: this.test_And_Certification_Enum.internalValue });
  //  this.csgPricing.pricingOptions.push({ enumerationName: this.other_Enum.enumerationName, selectedValue: this.other_Enum.internalValue });

  //  this.csgPricing.pricingOptions.push({ enumerationName: this.feedwater_Pressurisation_Enum.enumerationName, selectedValue: this.feedwater_Pressurisation_Enum.internalValue });

  //  this.cleanSteamGeneratorService.calculateTotalPrice(this.csgPricing).subscribe((response: CleanSteamGeneratorPricingOutput) => {
  //   // First, check if any valid data returned?
  //    if (response && response.totalSalesPrice > 0 && response.totalRecommendedSalesPrice > 0) {
  //      // Price data returned, so convert them before using them for calculations below.
  //      this.csgPricingOutputData.totalSalesPrice = response.totalSalesPrice / this.currencyConversionRate;
  //      this.csgPricingOutputData.totalRecommendedSalesPrice = response.totalRecommendedSalesPrice / this.currencyConversionRate;

  //      // Now, calculate the following factors and also calculate the total cost.
  //      this.internal_SSP = this.csgPricingOutputData.totalSalesPrice;
  //      this.internal_SellingPrice = this.csgPricingOutputData.totalRecommendedSalesPrice;

  //      this.display_SSP = this.localizeValue(this.internal_SSP, 2);
  //      this.display_SellingPrice = this.localizeValue(this.internal_SellingPrice, 2);
  //      this.display_DeliveryPrice = this.localizeValue(this.deliveryCost, 2);

  //      this.calculateTotalPrice();

  //      // Finally, calculate selling markup/gross margin. However, before calculating these figures, first check if this is initial calc or any of these fields have been manually updated? If so then re-calculate them accordingly.
  //      if (!this.sellingMarkupUpdated && !this.grossMarginUpdated) {
  //        this.calculateSellingMarkup();
  //        this.calculateGrossMargin();
  //      } else {
  //        if (this.sellingMarkupUpdated) {
  //          this.calculateSellingPriceFromSellingMarkup(this.sellingMarkupFormControl.value);
  //        } else {
  //          this.calculateSellingPriceFromGrossMargin(this.grossMarginFormControl.value);
  //        }
  //      }
  //    }
  //  });

  //  this.buildNomenclature();
  //}

  //calculateSellingMarkup() {
  //  if (this.internal_SSP > 0 && this.internal_SellingPrice > 0) {
  //    this.sellingMarkupFormControl.setValue((this.internal_SellingPrice / this.internal_SSP).toFixed(2));
  //  }
  //}

  //calculateGrossMargin() {
  //  if (this.internal_SSP > 0 && this.internal_SellingPrice > 0) {
  //    this.grossMarginFormControl.setValue((((this.internal_SellingPrice - this.internal_SSP) / this.internal_SellingPrice) * 100).toFixed(2));
  //  }
  //}

  //calculateSellingPriceFromSellingMarkup(value: any) {
  //  if (this.internal_SSP > 0 && value && value > 0) {
  //    this.internal_SellingPrice = this.internal_SSP * value;
  //    this.display_SellingPrice = this.localizeValue(this.internal_SellingPrice, 2);

  //    // Update gross margin.
  //    this.calculateGrossMargin();
  //  }

  //  this.calculateTotalPrice();
  //}

  //calculateSellingPriceFromGrossMargin(value: any) {
  //  if (this.internal_SSP > 0 && value && value > 0) {
  //    this.internal_SellingPrice = value >= 100
  //      ? this.internal_SSP * (value / 100)
  //      : (this.internal_SSP / (100 - value)) * 100;
  //    this.display_SellingPrice = this.localizeValue(this.internal_SellingPrice, 2);

  //    // Update selling markup.
  //    this.calculateSellingMarkup();
  //  }

  //  this.calculateTotalPrice();
  //}

  ///*
  //* Method to update Selling price on Selling Markup change.
  //*/
  //onSellingMarkupChange(value: any) {
  //  // Update the appropriate flags.
  //  this.sellingMarkupUpdated = true;
  //  this.grossMarginUpdated = false;

  //  this.calculateSellingPriceFromSellingMarkup(value);
  //}

  ///*
  //* Method to update Selling price on Gross Margin change.
  //*/
  //onGrossMarginChange(value: any) {
  //  // Update the appropriate flags.
  //  this.sellingMarkupUpdated = false;
  //  this.grossMarginUpdated = true;

  //  this.calculateSellingPriceFromGrossMargin(value);
  //}

  ///*
  //* Method to build the nomenclature from the CSG model and options selections.
  //*/
  //buildNomenclature() {
  //  this.nomenclature = this.modelName.split(" ")[0];

  //  this.nomenclature += '-' + this.design_Code_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.shell_Type_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.modelName.split(" ")[1];
  //  this.nomenclature += this.valve_Actuation_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.control_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.communication_Interface_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.frame_And_Cabinet_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.control_Panel_Location_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.insulation_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.wheels_And_Feet_Enum.internalValue.split("_")[1];

  //  this.nomenclature += '-' + this.plant_Steam_Inlet_Shut_Off_Valve_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.plant_Steam_Line_Trapping_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.tds_Control_System_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.sample_Cooler_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.feedwater_Pressurisation_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.independent_Low_Level_Alarm_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.feedwater_Pre_Heating_Degassing_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.intelligent_Diagnostics_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.clean_Steam_Outlet_Shut_Off_Valve_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.test_And_Certification_Enum.internalValue.split("_")[1];
  //  this.nomenclature += this.other_Enum.internalValue.split("_")[1];
  //}

  ///*
  //* Method to calculate the total price.
  //*/
  //calculateTotalPrice()
  //{
  //  this.internal_TotalPrice = this.internal_SellingPrice + this.internal_ServiceOfferingPrice + this.deliveryCost;
  //  this.display_TotalPrice = this.localizeValue(this.internal_TotalPrice, 2);
  //}

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

    if (!savedProjectDetails) {
      return null;
    }

    jobSizing = this.saveData(jobSizing, this.project, job, sizingData, processConditions, processInputs, unitPreferences, outputGridRow, outputGridRows, outputItems);

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

    job.moduleId = 8;
    job.productName = "CSG FB";
    this.moduleId = 8;
    this.productName = "CSG FB";

    if (this.csgFBOutputDataRows.length > 1) {
      job.jobStatusId = 2; // Calculated
      this.jobStatusId = 2;
    } else {
      job.jobStatusId = 1; // Input
      this.jobStatusId = 1;
    }

    if (this.gridSelectedRow) {
      job.jobStatusId = 3; // Selected
      this.jobStatusId = 3;
    }

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

    return jobSizing;
  }

  saveData(jobSizing: JobSizing, project: Project, job: Job,
    sizingData: SizingData, processConditions: Array<ProcessCondition>,
    processInputs: Array<ProcessInput>, unitPreferences: Array<Preference>, outputGridRow: OutputGridRow,
    outputGridRows: Array<OutputGridRow>, outputItems: Array<OutputItem>): JobSizing {

    //save process conditions
    processInputs.push({ name: "Primary Steam Pressure", value: this.plantsteampressure.value, unitId: parseInt(this.pressureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Clean Steam Pressure", value: this.cleansteampressure.value, unitId: parseInt(this.pressureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Feedwater Pressure", value: this.feedwaterpressure.value, unitId: parseInt(this.pressureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Feedwater Temperature", value: this.feedwatertemperature.value, unitId: parseInt(this.temperatureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Required Clean Steam Flowrate", value: this.requiredcleansteamflowrate.value, unitId: parseInt(this.massFlowRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Tds Blowdown Percentage", value: this.tdsblowdownpercentage.value, unitId: null, listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Flowrate of Non Condensible Gases", value: this.flowrateofnoncondensiblegases.value, unitId: parseInt(this.massFlowRef.preference.value), listItemId: null, value2: "", childInputs: null });

    // Save unit preferences.
    unitPreferences.push(this.pressureRef.preference);
    unitPreferences.push(this.temperatureRef.preference);
    unitPreferences.push(this.massFlowRef.preference);
    unitPreferences.push(this.loadRef.preference);

    processConditions.push({ name: "csg fb sizing", processInputs: processInputs, unitPreferences: unitPreferences });

    sizingData.processConditions = new Array<ProcessCondition>();
    sizingData.processConditions = processConditions;

    //save sizing grid results
    outputGridRow.outputItems = [];
    outputGridRow.messages = [];

    //this.csgFBOutputDataRows.forEach(obj => {

    //  if (this.selectedOutputData.length > 0) {
    //    if (obj.modelId === this.selectedOutputData[0].modelId) {
    //      this.gridSelectedRow = true;
    //      this.loadOptions = true;

    //      if (!!this.selectedOutputData[0].modelSizingMessages) {

    //        this.selectedOutputData[0].modelSizingMessages.forEach(m => {

    //          outputGridRow.messages.push({
    //            messageKey: m.messageKey,
    //            value: m.value,
    //            unitKey: m.unitKey,
    //            severity: m.severity,
    //            displayValue: m.displayValue
    //          });
    //        });
    //      }

    //    } else {
    //      this.gridSelectedRow = false;
    //    }
    //  } else {
    //    this.gridSelectedRow = false;
    //  }

    //  outputGridRow.outputItems.push({
    //    name: "Model Id",
    //    value: obj.modelId.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "Model Name",
    //    value: obj.modelName,
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "Clean Steam Flow Rate",
    //    value: obj.cleanSteamFlowrate.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "Plant Steam Flow Rate",
    //    value: obj.plantSteamFlowrate.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "Feed Water Flow Rate",
    //    value: obj.feedwaterFlowrate.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "Blow Down Flow Rate",
    //    value: obj.blowDownFlowrate.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "Pressurised Deaerator Inlet Flow Rate",
    //    value: obj.pressurisedDeaeratorOutletFlowrate.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "Pressurised Deaerator Outlet Flow Rate",
    //    value: obj.pressurisedDeaeratorOutletFlowrate.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "Heat Exchanger Duty",
    //    value: obj.heatExchangerDuty.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "OverDesign",
    //    value: obj.overdesign.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "Length",
    //    value: obj.length.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "Height",
    //    value: obj.height.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "Width",
    //    value: obj.width.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "DryWeight",
    //    value: obj.dryWeight.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "PlantSteamInletConnection",
    //    value: obj.plantSteamInletConnection.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "CondensateOutletConnection",
    //    value: obj.condensateOutletConnection.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "CleanSteamOutletConnection",
    //    value: obj.cleanSteamOutletConnection.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "FeedwaterInletConnection",
    //    value: obj.feedwaterInletConnection.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "SafetyValveDischarge",
    //    value: obj.safetyValveDischarge.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "NotCondensableVentConnection",
    //    value: obj.notCondensableVentConnection.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "DrainConnection",
    //    value: obj.drainConnection.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "PlantSteamCondensateDrainConnection",
    //    value: obj.plantSteamCondensateDrainConnection.toString(), //"DN25 PN40","DN25 PN40",
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "TdsBlowdownConnection",
    //    value: obj.tdsBlowdownConnection.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "SamplingSystem",
    //    value: obj.samplingSystem.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "MinAirSupply",
    //    value: obj.minAirSupply.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRow.outputItems.push({
    //    name: "IsPumpMandatory",
    //    value: obj.isPumpMandatory.toString(),
    //    unitId: null,
    //    selected: this.gridSelectedRow,
    //    listItemId: null,
    //    type: null
    //  });

    //  outputGridRows.push(outputGridRow);

    //  //clear for next iteration
    //  outputGridRow = new OutputGridRow();
    //  outputGridRow.outputItems = [];
    //  outputGridRow.messages = [];
    //});

    //save options and price
    //if (this.loadOptions) {
    //  outputItems.push({ name: this.design_Code_Enum_Name, value: this.sizingModuleForm.controls["design_Code_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.shell_Type_Enum_Name, value: this.sizingModuleForm.controls["shell_Type_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.valve_Actuation_Enum_Name, value: this.sizingModuleForm.controls["valve_Actuation_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.control_Enum_Name, value: this.sizingModuleForm.controls["control_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.communication_Interface_Enum_Name, value: this.sizingModuleForm.controls["communication_Interface_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.frame_And_Cabinet_Enum_Name, value: this.sizingModuleForm.controls["frame_And_Cabinet_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.control_Panel_Location_Enum_Name, value: this.sizingModuleForm.controls["control_Panel_Location_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.insulation_Enum_Name, value: this.sizingModuleForm.controls["insulation_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.wheels_And_Feet_Enum_Name, value: this.sizingModuleForm.controls["wheels_And_Feet_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.plant_Steam_Inlet_Shut_Off_Valve_Enum_Name, value: this.sizingModuleForm.controls["plant_Steam_Inlet_Shut_Off_Valve_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.plant_Steam_Line_Trapping_Enum_Name, value: this.sizingModuleForm.controls["plant_Steam_Line_Trapping_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.tds_Control_System_Enum_Name, value: this.sizingModuleForm.controls["tds_Control_System_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.sample_Cooler_Enum_Name, value: this.sizingModuleForm.controls["sample_Cooler_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.independent_Low_Level_Alarm_Enum_Name, value: this.sizingModuleForm.controls["independent_Low_Level_Alarm_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.feedwater_Pre_Heating_Degassing_Enum_Name, value: this.sizingModuleForm.controls["feedwater_Pre_Heating_Degassing_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.intelligent_Diagnostics_Enum_Name, value: this.sizingModuleForm.controls["intelligent_Diagnostics_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.clean_Steam_Outlet_Shut_Off_Valve_Enum_Name, value: this.sizingModuleForm.controls["clean_Steam_Outlet_Shut_Off_Valve_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.test_And_Certification_Enum_Name, value: this.sizingModuleForm.controls["test_And_Certification_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: this.other_Enum_Name, value: this.sizingModuleForm.controls["other_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  // Pump and Phase/voltage selections.
    //  outputItems.push({ name: this.feedwater_Pressurisation_Enum_Name, value: this.sizingModuleForm.controls["feedwater_Pressurisation_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "CSG_Phase_Voltage", value: this.sizingModuleForm.controls["phase_Voltage_Enumeration"].value, unitId: null, selected: false, listItemId: null, type: null });

    //  // Option visibility status
    //  outputItems.push({ name: "Show_Plant_Steam_Line_Trapping",          value: this.show_plant_Steam_Line_Trapping.toString(),          unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "Show_Sample_Cooler",                      value: this.show_sample_Cooler.toString(),                      unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "Show_Independent_Low_Level_Alarm",        value: this.show_independent_Low_Level_Alarm.toString(),        unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "Show_Feedwater_Pre_Heating_Degassing",    value: this.show_feedwater_Pre_Heating_Degassing.toString(),    unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "Show_Intelligent_Diagnostics",            value: this.show_intelligent_Diagnostics.toString(),            unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "Show_Clean_Steam_Outlet_Shut_Off_Valve",  value: this.show_clean_Steam_Outlet_Shut_Off_Valve.toString(),  unitId: null, selected: false, listItemId: null, type: null });

    //  // Pricing details
    //  outputItems.push({ name: "SellingCurrencySymbol",                   value: this.sellingCurrencySymbol,                              unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "SSP",                                     value: this.internal_SSP.toString(),                            unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "Selling Price",                           value: this.internal_SellingPrice.toString(),                   unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "Service Offering Label",                  value: this.serviceOfferingKey,                                 unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "Service Offering Price",                  value: this.internal_ServiceOfferingPrice.toString(),           unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "Delivery Cost",                           value: this.deliveryCost.toString(),                            unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "Total Price",                             value: this.internal_TotalPrice.toString(),                     unitId: null, selected: false, listItemId: null, type: null });

    //  outputItems.push({ name: "Selling Markup",                          value: this.sellingMarkupFormControl.value,                     unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "Gross Margin",                            value: this.grossMarginFormControl.value,                       unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "Service Offering Enumeration",            value: this.sizingModuleForm.controls["serviceOfferingOptionsFormControl"].value, unitId: null, selected: false, listItemId: null, type: null });

    //  outputItems.push({ name: "SellingMarkupUpdated",                    value: this.sellingMarkupUpdated.toString(),                    unitId: null, selected: false, listItemId: null, type: null });
    //  outputItems.push({ name: "GrossMarginUpdated",                      value: this.grossMarginUpdated.toString(),                      unitId: null, selected: false, listItemId: null, type: null });

    //  outputItems.push({ name: "Nomenclature", value: this.nomenclature, unitId: null, selected: false, listItemId: null, type: null });
    //}


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

    if (this.translatedMessagesList.length > 0) {

      for (var i = 0; i < 5; i++) {
        if (this.translatedMessagesList[i] != null) {
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

  repackageSizing() {

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

    jobSizing = this.saveData(jobSizing, this.project, job, sizingData, processConditions, processInputs, unitPreferences, outputGridRow, outputGridRows, outputItems);

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

  /**
   * Detemines row color based on overdesign.
   * @param row
   */
  getOverdesignColor(row): string {
    if (row.overdesign < - this.overdesign_Limit_10) {
      return "overdesign-red-class";
    }
    else if (row.overdesign >= - this.overdesign_Limit_10 && row.overdesign <= this.overdesign_Limit_0) {
      return "overdesign-yellow-class";
    }
    else {
      return "overdesign-green-class";
    }
  }

  //onServiceOfferingLoad(event: any) {
  //  if (!this.isLoadingJob) {
  //    this.calculateServiceOfferingPrice(event);
  //  }
  //}

  //onServiceOfferingChange(event: any) {
  //  this.resetLoadingJobStatus();

  //  this.calculateServiceOfferingPrice(event);
  //}

  /**
   * Method to select service offerings cost based on service offering selections.
  */
  //calculateServiceOfferingPrice(event: any) {
  //  switch (event.selectedValue) {
  //    case "No Commissioning":
  //      this.internal_ServiceOfferingPrice = 0;
  //      this.serviceOfferingKey = this.translatePipe.transform('NO_COMMISSIONING', false);
  //      break;
  //    case "Commission Only":
  //      this.internal_ServiceOfferingPrice = this.commissionCost;
  //      this.serviceOfferingKey = this.translatePipe.transform('COMMISSION_ONLY', false);
  //      break;
  //    case "Extended Warranty Year 1":
  //      this.internal_ServiceOfferingPrice = this.oneYearWarrantyCost;
  //      this.serviceOfferingKey = this.translatePipe.transform('1_YEAR_EXTENDED_WARRANTY', false);
  //      break;
  //    case "Extended Warranty Year 2":
  //      this.internal_ServiceOfferingPrice = this.twoYearWarrantyCost;
  //      this.serviceOfferingKey = this.translatePipe.transform('2_YEAR_EXTENDED_WARRANTY', false);
  //      break;
  //    case "Extended Warranty Year 3":
  //      this.internal_ServiceOfferingPrice = this.threeYearWarrantyCost;
  //      this.serviceOfferingKey = this.translatePipe.transform('3_YEAR_EXTENDED_WARRANTY', false);
  //      break;
  //  }

  //  this.display_ServiceOfferingPrice = this.localizeValue(this.internal_ServiceOfferingPrice, 2);

  //  // Update total price.
  //  this.calculateTotalPrice();
  //}

  //onLoadOptionEvent(optionName: string, event: any) {
  //  if (!this.isLoadingJob) {
  //    this.filterOptionList(optionName, event);
  //  }
  //}

  //onChangeOptionEvent(optionName: string, event: any) {
  //  this.resetLoadingJobStatus();

  //  this.filterOptionList(optionName, event);
  //}


  ///**
  // * Method to handle pricing options based on selections of other options.
  //*/
  //filterOptionList(optionName: string, event: any) {
  //  if (event && event.selectedValue) {
  //    switch (optionName) {
  //      case 'frame_And_Cabinet_Enum':
  //        this.frame_And_Cabinet_Enumeration.setValue(event.selectedValue);

  //        // Control Panel Location
  //        //switch (event.selectedValue.split("_")[1]) {
  //        //  case "0":
  //        //  case "3":
  //        //    this.control_Panel_Location_List = ['Side_S'];
  //        //    break;

  //        //  case "1":
  //        //  case "2":
  //        //  case "4":
  //        //  case "5":
  //        //    this.control_Panel_Location_List = ['Front_F'];
  //        //    break;
  //        //}
  //        //// Set the default selection.
  //        //if (this.control_Panel_Location_List.length > 0) {
  //        //  this.control_Panel_Location_Enumeration.setValue(this.control_Panel_Location_List[0]);
  //        //}

  //        // Plant Steam Inlet Shut-Off Valve
  //        this.filterPlantSteamInletShutOffValveList();
  //        break;

  //      case 'valve_Actuation_Enum':
  //        this.valve_Actuation_Enumeration.setValue(event.selectedValue);

  //        // Plant Steam Inlet Shut-Off Valve
  //        this.filterPlantSteamInletShutOffValveList();

  //        // Clean Steam Outlet Shut-Off Valve
  //        this.filterCleanSteamOutletShutOffValveList();

  //        // Intelligent Diagnostics
  //        this.filterIntelligentDiagnosticsList();
  //        break;

  //      case 'feedwater_Pressurisation_Enum':
  //        this.filterPhaseVoltageList(event.selectedValue);
  //        break;

  //      case 'plant_Steam_Line_Trapping_Enum':
  //        this.show_plant_Steam_Line_Trapping = this.getOptionVisibilityStatus(event);
  //        break;

  //      case 'sample_Cooler_Enum':
  //        this.show_sample_Cooler = this.getOptionVisibilityStatus(event);
  //        break;

  //      case 'independent_Low_Level_Alarm_Enum':
  //        this.show_independent_Low_Level_Alarm = this.getOptionVisibilityStatus(event);
  //        break;

  //      case 'feedwater_Pre_Heating_Degassing_Enum':
  //        this.show_feedwater_Pre_Heating_Degassing = this.getOptionVisibilityStatus(event);
  //        break;

  //      case 'intelligent_Diagnostics_Enum':
  //        this.show_intelligent_Diagnostics = this.getOptionVisibilityStatus(event);
  //        break;

  //      case 'clean_Steam_Outlet_Shut_Off_Valve_Enum':
  //        this.show_clean_Steam_Outlet_Shut_Off_Valve = this.getOptionVisibilityStatus(event);
  //        break;
  //    }
  //  }

  //  this.cdRef.detectChanges();
  //}

  /*
   * Filters plant steam inlet shut off valve list based on frame & cabinet and valve actuation selections.
   */
  //filterPlantSteamInletShutOffValveList() {
  //  // Ensure that the dependencies are set before accessing them.
  //  if (this.frame_And_Cabinet_Enumeration && this.valve_Actuation_Enumeration) {
  //    switch (this.frame_And_Cabinet_Enumeration.value.split("_")[1]) {
  //    case "0":
  //    case "1":
  //    case "3":
  //    case "4":
  //        switch (this.valve_Actuation_Enumeration.value.split("_")[1]) {
  //      case "PN":
  //        this.plant_Steam_Inlet_Shut_Off_Valve_List = ['Inlet Manual stop valve_M', 'Inlet Automatic stop valve (pneumatic)_AP'];
  //        break;
  //      case "EL":
  //        this.plant_Steam_Inlet_Shut_Off_Valve_List = ['Inlet Manual stop valve_M', 'Inlet Automatic stop valve (electric)_AE'];
  //        break;
  //      }
  //      break;

  //    case "2":
  //    case "5":
  //        switch (this.valve_Actuation_Enumeration.value.split("_")[1]) {
  //      case "PN":
  //        this.plant_Steam_Inlet_Shut_Off_Valve_List = ['Inlet Automatic stop valve (pneumatic)_AP'];
  //        break;
  //      case "EL":
  //        this.plant_Steam_Inlet_Shut_Off_Valve_List = ['Inlet Automatic stop valve (electric)_AE'];
  //        break;
  //      }
  //      break;
  //    }

  //    // Set the default selection.
  //    if (this.plant_Steam_Inlet_Shut_Off_Valve_List.length > 0) {
  //      this.plant_Steam_Inlet_Shut_Off_Valve_Enumeration.setValue(this.plant_Steam_Inlet_Shut_Off_Valve_List[0]);
  //    }
  //  }
  //}

  ///*
  // * Filters clean steam outlet shut off valve list based on valve actuation selection.
  // */
  //filterCleanSteamOutletShutOffValveList() {
  //  // Ensure that the dependencies are set before accessing them.
  //  if (this.valve_Actuation_Enumeration) {
  //    switch (this.valve_Actuation_Enumeration.value.split("_")[1]) {
  //    case "PN":
  //        this.clean_Steam_Outlet_Shut_Off_Valve_List = ['None_N', 'Outlet Manual stop valve_M', 'Outlet Automatic stop valve (pneumatic)_AP'];
  //      break;
  //    case "EL":
  //        this.clean_Steam_Outlet_Shut_Off_Valve_List = ['None_N', 'Outlet Manual stop valve_M', 'Outlet Automatic stop valve (electric)_AE'];
  //      break;
  //    }

  //    // Set the default selection.
  //    if (this.clean_Steam_Outlet_Shut_Off_Valve_List.length > 0) {
  //      this.clean_Steam_Outlet_Shut_Off_Valve_Enumeration.setValue(this.clean_Steam_Outlet_Shut_Off_Valve_List[0]);
  //    }
  //  }
  //}

  //filterIntelligentDiagnosticsList() {
  //  // Ensure that the dependencies are set before accessing them.
  //  if (this.valve_Actuation_Enumeration) {
  //    switch (this.valve_Actuation_Enumeration.value.split("_")[1]) {
  //    case "PN":
  //      this.intelligent_Diagnostics_List = [
  //        'None_N', 'System Diagnostics_I1', 'Performance and condition monitoring_I2', 'Integrity test_I3',
  //        'System Diagnostics + Integrity test_I4', 'System Diagnostics + Performance monitoring_I5',
  //        'Performance and condition monitoring + Integrity test_I6',
  //        'System Diagnostics + Performance monitoring + Integrity test_I7'
  //      ];
  //      break;
  //    case "EL":
  //      this.intelligent_Diagnostics_List = [
  //        'None_N', 'System Diagnostics_I1', 'Integrity test_I3', 'System Diagnostics + Integrity test_I4',
  //        'System Diagnostics + Performance monitoring_I5', 'Performance and condition monitoring + Integrity test_I6',
  //        'System Diagnostics + Performance monitoring + Integrity test_I7'
  //      ];
  //      break;
  //    }

  //    // Set the default selection.
  //    if (this.intelligent_Diagnostics_List.length > 0) {
  //      this.intelligent_Diagnostics_Enumeration.setValue(this.intelligent_Diagnostics_List[0]);
  //    }
  //  }
  //}

  //filterFeedwaterPressurisationList(isPumpMandatory: boolean) {
  //  // Check if pump must be selected?
  //  this.feedwater_Pressurisation_List = isPumpMandatory ? ['Pump with VFD_P'] : ['None_N', 'Pump with VFD_P'];

  //  // Set the default selection.
  //  if (this.feedwater_Pressurisation_List.length > 0) {
  //    this.feedwater_Pressurisation_Enumeration.setValue(this.feedwater_Pressurisation_List[0]);
  //  }
  //}

  //filterPhaseVoltageList(feedwaterPressurisationSelectedValue: string) {
  //  // Select the list first.
  //  if (feedwaterPressurisationSelectedValue === 'Pump with VFD_P') {
  //    this.phaseVoltageList = ['Three Phase 200-240V', 'Three Phase 380-480V'];
  //  }
  //  else if (feedwaterPressurisationSelectedValue === 'None_N') {
  //    this.phaseVoltageList = ['Single Phase 100-240V', 'Three Phase 200-240V', 'Three Phase 380-480V'];
  //  }

  //  // Set the default selection.
  //  if (this.phaseVoltageList.length > 0) {
  //    this.phase_Voltage_Enumeration.setValue(this.phaseVoltageList[0]);
  //  }
  //}

  ///**
  // Method to determine visibility of CSG options.
  // Returns False if the list contains only 'None' option, Else returns True.
  //*/
  //getOptionVisibilityStatus(event: any) {
  //  if (event.selectedValue === 'None_N' && event.itemsCount === 1) {
  //    return false;
  //  } else {
  //    return true;
  //  }
  //}

  /**
   Method to localize csg output data display values.
  */
  localizeCSGFBOutputData() {
    if (this.csgFBOutputData && this.csgFBOutputData.length > 0) {
      this.csgFBOutputData.forEach(o => {
        o.displayCleanSteamFlowrate = this.localizeValue(o.cleanSteamFlowrate, this.massFlowRef.preference.decimalPlaces);
        o.displayPlantSteamFlowrate = this.localizeValue(o.plantSteamFlowrate, this.massFlowRef.preference.decimalPlaces);
        o.displayFeedwaterFlowrate = this.localizeValue(o.feedwaterFlowrate, this.massFlowRef.preference.decimalPlaces);
        o.displayBlowDownFlowrate = this.localizeValue(o.blowDownFlowrate, this.massFlowRef.preference.decimalPlaces);
        o.displayEnthalpyOfWaterAtHotsideOutletTemperature = this.localizeValue(o.enthalpyOfWaterAtHotsideOutletTemperature, this.massFlowRef.preference.decimalPlaces);

        o.displayHeatExchangerDuty = this.localizeValue(o.heatExchangerDuty, this.loadRef.preference.decimalPlaces);
        o.displayOverdesign = this.localizeValue(o.overdesign, 2);
      });
    }
  }

  /**
   Method to localize values.
  */
  localizeValue(value: any, decimalPoints: number) {
    return this.localeService.formatDecimal(value.toFixed(decimalPoints));
  }
}
