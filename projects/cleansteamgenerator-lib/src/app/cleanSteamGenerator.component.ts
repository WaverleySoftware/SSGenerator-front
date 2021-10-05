import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';

import { BaseSizingModule } from "sizing-shared-lib";
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

import * as FileSaver from 'file-saver';

import { CleanSteamGeneratorProcessConditions } from "./cleanSteamGeneratorInput.model";
import { CleanSteamGeneratorOutput } from "./cleanSteamGeneratorOutput.model";
import { CleanSteamGeneratorInputValidation } from "./cleanSteamGeneratorInputValidation.model";
import { CleanSteamGeneratorProcessConditionsValidation } from "./cleanSteamGeneratorInputValidation.model";
import { CleanSteamGeneratorValidationMessage } from "./cleanSteamGeneratorInputValidation.model";
import { CleanSteamGeneratorValidationErrorMessage } from "./cleanSteamGeneratorInputValidation.model";

import { CleanSteamGeneratorPricing, CleanSteamGeneratorBOMPriceOutput, BOMItem } from "./cleanSteamGeneratorPricingOptions.model";
import { CleanSteamGeneratorPricingOutput } from "./cleanSteamGeneratorPricingOptions.model";

import { CleanSteamGeneratorService } from "./cleanSteamGenerator.service";

import { Observable, combineLatest } from 'rxjs';
import { Validators } from '@angular/forms';

import { DatatableComponent } from '@swimlane/ngx-datatable';
import { TranslatePipe } from "sizing-shared-lib";
import { takeWhile } from 'rxjs-compat/operator/takeWhile';
import { DisplayPreferenceDirective } from "sizing-shared-lib";
import { EnumerationComponent } from "sizing-shared-lib";
import { ModulePreferenceService } from "sizing-shared-lib";
import { DocGen, TiRequestModel, TiDocumentInfosModel, TiDocumentInfo } from "sizing-shared-lib";
import { PreferenceService } from "sizing-shared-lib";

import { TranslationService } from "sizing-shared-lib";
import { Preference } from "sizing-shared-lib";
import { SpecSheetItem } from "./doc-gen.model";
import { DocGenService } from "sizing-shared-lib";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UserProfileService } from "sizing-shared-lib";
import { User } from "sizing-shared-lib";
import { csgDocGenService } from "./csgDocGen.service";

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

import { debug } from 'util';
import { HttpClient } from '@angular/common/http';
import { __await } from 'tslib';
import { take } from 'rxjs-compat/operator/take';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { debounce } from 'rxjs/operators';
import { IGenericChanges } from '../../../sizing-shared-lib/src/lib/modules/generic.changes.interface';

@Component({
  selector: 'clean-steam-generator',
  templateUrl: './cleanSteamGenerator.component.html',
  styleUrls: ['./cleanSteamGenerator.component.scss'],
  providers: [CleanSteamGeneratorService]
})

export class CleanSteamGeneratorComponent extends BaseSizingModule implements OnInit, IGenericChanges {

  @BlockUI('conditions-section') blockUi: NgBlockUI;
  private blockUiTimeOut;
  readonly moduleGroupId: number = 12;
  // ModuleGroupId = 12, ModuleId = 8	CSG Healthcare Product Sizing

  theFormGroup: FormGroup; // to drive GenericChangesGuard
  hasUnsavedDataChanges: boolean; // to drive GenericChangesGuard

  readonly moduleName: string = "Clean Steam Generator"; // CLEAN_STEAM_GENERATOR for CSG Healthcare sizing

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
    
  public plantSteamValidationErrorMessage:            CleanSteamGeneratorValidationErrorMessage;
  public cleanSteamValidationErrorMessage:            CleanSteamGeneratorValidationErrorMessage;
  public feedwaterPressureValidationErrorMessage:     CleanSteamGeneratorValidationErrorMessage;
  public feedwaterTemperatureValidationErrorMessage:  CleanSteamGeneratorValidationErrorMessage;
  public cleanSteamFlowrateValidationErrorMessage:    CleanSteamGeneratorValidationErrorMessage;
  public tdsBlowdownValidationErrorMessage:           CleanSteamGeneratorValidationErrorMessage;

  public pressureDifferentialErrorMessage: string;  

  csgProcessConditions: CleanSteamGeneratorProcessConditions;
    
  public csgOutputData: CleanSteamGeneratorOutput[] = [];
  public selectedOutputData: CleanSteamGeneratorOutput[] = [];

  public csgPricing: CleanSteamGeneratorPricing;
  public csgPricingOutputData: CleanSteamGeneratorPricingOutput;
  public csgBOMOutputData: CleanSteamGeneratorBOMPriceOutput;
  public augmentPriceDataDone: boolean = false;
  public csgBOMOutputDataRows: BOMItem[] = [];
  public docGen: DocGen; 
  public bOMExpanded: boolean = false;
  public quoteExpired = false;
  public priceValidityMessage: string;
  public loadedJobSizingData: SizingData;

  private sellingMarkupUpdated: boolean;
  private grossMarginUpdated: boolean;
    
  // Flags to control the visibility of different CSG options.
  public show_clean_Steam_Outlet_Shut_Off_Valve: boolean = true;
  public show_plant_Steam_Line_Trapping: boolean = true;
  public show_sample_Cooler: boolean = true;
  public show_independent_Low_Level_Alarm: boolean = true;
  public show_feedwater_Pre_Heating_Degassing: boolean = true;
  public show_feedwater_Pre_Heating_Option_Message: boolean = false;

  public show_intelligent_Diagnostics: boolean = true;

  public gridSelectedRow = false;
  public loadOptions = false;

  public debugData: string;
  public debugDataEnabled: boolean;

  public alertVisible: boolean = false;
  private jobParams: boolean = false;

  // The view reference variables are declared here  
  @ViewChild("design_Code_Enum", { static: false }) design_Code_Enum: EnumerationComponent;
  @ViewChild("shell_Type_Enum", { static: false }) shell_Type_Enum: EnumerationComponent;
  @ViewChild("valve_Actuation_Enum", { static: false }) valve_Actuation_Enum: EnumerationComponent;
  @ViewChild("control_Enum", { static: false }) control_Enum: EnumerationComponent;
  @ViewChild("communication_Interface_Enum", { static: false }) communication_Interface_Enum: EnumerationComponent;
  @ViewChild("frame_And_Cabinet_Enum", { static: false }) frame_And_Cabinet_Enum: EnumerationComponent;
  @ViewChild("control_Panel_Location_Enum", { static: false }) control_Panel_Location_Enum: EnumerationComponent;
  @ViewChild("insulation_Enum", { static: false }) insulation_Enum: EnumerationComponent;
  @ViewChild("wheels_And_Feet_Enum", { static: false }) wheels_And_Feet_Enum: EnumerationComponent;
  @ViewChild("plant_Steam_Inlet_Shut_Off_Valve_Enum", { static: false }) plant_Steam_Inlet_Shut_Off_Valve_Enum: EnumerationComponent;
  @ViewChild("plant_Steam_Line_Trapping_Enum", { static: false }) plant_Steam_Line_Trapping_Enum: EnumerationComponent;
  @ViewChild("tds_Control_System_Enum", { static: false }) tds_Control_System_Enum: EnumerationComponent;
  @ViewChild("sample_Cooler_Enum", { static: false }) sample_Cooler_Enum: EnumerationComponent;
  @ViewChild("independent_Low_Level_Alarm_Enum", { static: false }) independent_Low_Level_Alarm_Enum: EnumerationComponent;
  @ViewChild("feedwater_Pre_Heating_Degassing_Enum", { static: false }) feedwater_Pre_Heating_Degassing_Enum: EnumerationComponent;
  @ViewChild("intelligent_Diagnostics_Enum", { static: false }) intelligent_Diagnostics_Enum: EnumerationComponent;
  @ViewChild("clean_Steam_Outlet_Shut_Off_Valve_Enum", { static: false }) clean_Steam_Outlet_Shut_Off_Valve_Enum: EnumerationComponent;
  @ViewChild("test_And_Certification_Enum", { static: false }) test_And_Certification_Enum: EnumerationComponent;
  @ViewChild("level_Indicator_Enum", { static: false }) level_Indicator_Enum: EnumerationComponent;

  @ViewChild("feedwater_Pressurisation_Enum", { static: false }) feedwater_Pressurisation_Enum: EnumerationComponent;
  @ViewChild("pump_Enum", { static: false }) pumpEnum: EnumerationComponent;


  @ViewChild('priceResultsTop', { static: false }) priceResultsContent: ElementRef; // for scroll to view
   
  /*   
   * CSG-HS 400 => CSG-HS 020
   * CSG-HS 500 => CSG-HS 055
   * CSG-HS 601 => CSG-HS 125
   * CSG-HS 602 => CSG-HS 180
   */
  private hashTable = [
    {
      name: 'CSG-HS 020',
      design_Code: 'CSG_HS_020_Design_Code',
      shell_Type: 'CSG_HS_020_Shell_Type',
      valve_Actuation: 'CSG_HS_020_Valve_Actuation',
      control: 'CSG_HS_020_Control',
      communication_Interface: 'CSG_HS_020_Communication_Interface',
      frame_And_Cabinet: 'CSG_HS_020_Frame_And_Cabinet',
      control_Panel_Location: 'CSG_HS_020_Control_Panel_Location',
      insulation: 'CSG_HS_020_Insulation',
      wheels_And_Feet: 'CSG_HS_020_Wheels_And_Feet',
      plant_Steam_Inlet_Shut_Off_Valve: 'CSG_HS_020_Plant_Steam_Inlet_Shut_Off_Valve',
      plant_Steam_Line_Trapping: 'CSG_HS_020_Plant_Steam_Line_Trapping',
      tds_Control_System: 'CSG_HS_020_TDS_Control_System',
      sample_Cooler: 'CSG_HS_020_Sample_Cooler',
      independent_Low_Level_Alarm: 'CSG_HS_020_Independent_Low_Level_Alarm',
      feedwater_Pre_Heating_Degassing: 'CSG_HS_020_Feedwater_Pre_Heating_Degassing',
      intelligent_Diagnostics: 'CSG_HS_020_Intelligent_Diagnostics',
      clean_Steam_Outlet_Shut_Off_Valve: 'CSG_HS_020_Clean_Steam_Outlet_Shut_Off_Valve',
      test_And_Certification: 'CSG_HS_020_Test_And_Certification',
      level_Indicator: 'CSG_HS_020_Level_Indicator',

      feedwater_Pressurisation: 'CSG_HS_020_Feedwater_Pressurisation'
    },
    {
      name: 'CSG-HS 055',
      design_Code: 'CSG_HS_055_Design_Code',
      shell_Type: 'CSG_HS_055_Shell_Type',
      valve_Actuation: 'CSG_HS_055_Valve_Actuation',
      control: 'CSG_HS_055_Control',
      communication_Interface: 'CSG_HS_055_Communication_Interface',
      frame_And_Cabinet: 'CSG_HS_055_Frame_And_Cabinet',
      control_Panel_Location: 'CSG_HS_055_Control_Panel_Location',
      insulation: 'CSG_HS_055_Insulation',
      wheels_And_Feet: 'CSG_HS_055_Wheels_And_Feet',
      plant_Steam_Inlet_Shut_Off_Valve: 'CSG_HS_055_Plant_Steam_Inlet_Shut_Off_Valve',
      plant_Steam_Line_Trapping: 'CSG_HS_055_Plant_Steam_Line_Trapping',
      tds_Control_System: 'CSG_HS_055_TDS_Control_System',
      sample_Cooler: 'CSG_HS_055_Sample_Cooler',
      independent_Low_Level_Alarm: 'CSG_HS_055_Independent_Low_Level_Alarm',
      feedwater_Pre_Heating_Degassing: 'CSG_HS_055_Feedwater_Pre_Heating_Degassing',
      intelligent_Diagnostics: 'CSG_HS_055_Intelligent_Diagnostics',
      clean_Steam_Outlet_Shut_Off_Valve: 'CSG_HS_055_Clean_Steam_Outlet_Shut_Off_Valve',
      test_And_Certification: 'CSG_HS_055_Test_And_Certification',
      level_Indicator: 'CSG_HS_055_Level_Indicator',

      feedwater_Pressurisation: 'CSG_HS_055_Feedwater_Pressurisation'      
    },
    {
      name: 'CSG-HS 125',
      design_Code: 'CSG_HS_125_Design_Code',
      shell_Type: 'CSG_HS_125_Shell_Type',
      valve_Actuation: 'CSG_HS_125_Valve_Actuation',
      control: 'CSG_HS_125_Control',
      communication_Interface: 'CSG_HS_125_Communication_Interface',
      frame_And_Cabinet: 'CSG_HS_125_Frame_And_Cabinet',
      control_Panel_Location: 'CSG_HS_125_Control_Panel_Location',
      insulation: 'CSG_HS_125_Insulation',
      wheels_And_Feet: 'CSG_HS_125_Wheels_And_Feet',
      plant_Steam_Inlet_Shut_Off_Valve: 'CSG_HS_125_Plant_Steam_Inlet_Shut_Off_Valve',
      plant_Steam_Line_Trapping: 'CSG_HS_125_Plant_Steam_Line_Trapping',
      tds_Control_System: 'CSG_HS_125_TDS_Control_System',
      sample_Cooler: 'CSG_HS_125_Sample_Cooler',
      independent_Low_Level_Alarm: 'CSG_HS_125_Independent_Low_Level_Alarm',
      feedwater_Pre_Heating_Degassing: 'CSG_HS_125_Feedwater_Pre_Heating_Degassing',
      intelligent_Diagnostics: 'CSG_HS_125_Intelligent_Diagnostics',
      clean_Steam_Outlet_Shut_Off_Valve: 'CSG_HS_125_Clean_Steam_Outlet_Shut_Off_Valve',
      test_And_Certification: 'CSG_HS_125_Test_And_Certification',
      level_Indicator: 'CSG_HS_125_Level_Indicator',

      feedwater_Pressurisation: 'CSG_HS_125_Feedwater_Pressurisation'      
    },
    {
      name: 'CSG-HS 180',
      design_Code: 'CSG_HS_180_Design_Code',
      shell_Type: 'CSG_HS_180_Shell_Type',
      valve_Actuation: 'CSG_HS_180_Valve_Actuation',
      control: 'CSG_HS_180_Control',
      communication_Interface: 'CSG_HS_180_Communication_Interface',
      frame_And_Cabinet: 'CSG_HS_180_Frame_And_Cabinet',
      control_Panel_Location: 'CSG_HS_180_Control_Panel_Location',
      insulation: 'CSG_HS_180_Insulation',
      wheels_And_Feet: 'CSG_HS_180_Wheels_And_Feet',
      plant_Steam_Inlet_Shut_Off_Valve: 'CSG_HS_180_Plant_Steam_Inlet_Shut_Off_Valve',
      plant_Steam_Line_Trapping: 'CSG_HS_180_Plant_Steam_Line_Trapping',
      tds_Control_System: 'CSG_HS_180_TDS_Control_System',
      sample_Cooler: 'CSG_HS_180_Sample_Cooler',
      independent_Low_Level_Alarm: 'CSG_HS_180_Independent_Low_Level_Alarm',
      feedwater_Pre_Heating_Degassing: 'CSG_HS_180_Feedwater_Pre_Heating_Degassing',
      intelligent_Diagnostics: 'CSG_HS_180_Intelligent_Diagnostics',
      clean_Steam_Outlet_Shut_Off_Valve: 'CSG_HS_180_Clean_Steam_Outlet_Shut_Off_Valve',
      test_And_Certification: 'CSG_HS_180_Test_And_Certification',
      level_Indicator: 'CSG_HS_180_Level_Indicator',

      feedwater_Pressurisation: 'CSG_HS_180_Feedwater_Pressurisation'      
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
  
  isCSGSizingDone: boolean = false;
  isCSGModelSelected: boolean = false;

  @ViewChild("csgOutputDataTable", { static: false }) csgOutputDataTable: DatatableComponent;

  @ViewChild("pressureRef", { static: false }) pressureRef: DisplayPreferenceDirective;
  @ViewChild("temperatureRef", { static: false }) temperatureRef: DisplayPreferenceDirective;
  @ViewChild("massFlowRef", { static: false }) massFlowRef: DisplayPreferenceDirective;
  @ViewChild("loadRef", { static: false }) loadRef: DisplayPreferenceDirective;  

  public sizingModuleForm: FormGroup;
  public user: User; 

  plantsteampressure: FormControl;
  cleansteampressure: FormControl;
  feedwaterpressure: FormControl;
  feedwatertemperature: FormControl;
  requiredcleansteamflowrate: FormControl;
  tdsblowdownpercentage: FormControl;
    
  design_Code_Enumeration: FormControl;
  shell_Type_Enumeration: FormControl;
  valve_Actuation_Enumeration: FormControl;
  control_Enumeration: FormControl;
  communication_Interface_Enumeration: FormControl;
  frame_And_Cabinet_Enumeration: FormControl;
  control_Panel_Location_Enumeration: FormControl;
  insulation_Enumeration: FormControl;
  wheels_And_Feet_Enumeration: FormControl;
  plant_Steam_Inlet_Shut_Off_Valve_Enumeration: FormControl;
  plant_Steam_Line_Trapping_Enumeration: FormControl;
  tds_Control_System_Enumeration: FormControl;
  sample_Cooler_Enumeration: FormControl;
  independent_Low_Level_Alarm_Enumeration: FormControl;
  feedwater_Pre_Heating_Degassing_Enumeration: FormControl;
  intelligent_Diagnostics_Enumeration: FormControl;
  clean_Steam_Outlet_Shut_Off_Valve_Enumeration: FormControl;
  test_And_Certification_Enumeration: FormControl;
  level_Indicator_Enumeration: FormControl;
    
  feedwater_Pressurisation_Enumeration: FormControl;
  phase_Voltage_Enumeration: FormControl;  

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

  selectedRow: CleanSteamGeneratorOutput;
    
  design_Code_List: any[];
  shell_Type_List: any[];
  valve_Actuation_List: any[];
  control_List: any[];
  communication_Interface_List: any[];
  frame_And_Cabinet_List: any[];
  control_Panel_Location_List: any[];
  insulation_List: any[];
  wheels_And_Feet_List: any[];
  plant_Steam_Inlet_Shut_Off_Valve_List: any[];
  plant_Steam_Line_Trapping_List: any[];
  tds_Control_System_List: any[];
  sample_Cooler_List: any[];
  independent_Low_Level_Alarm_List: any[];
  feedwater_Pre_Heating_Degassing_List: any[];
  intelligent_Diagnostics_List: any[];
  clean_Steam_Outlet_Shut_Off_Valve_List: any[];
  test_And_Certification_List: any[];
  level_Indicator_List: any[];
  
  feedwater_Pressurisation_List: any[];
  phaseVoltageList: any[];    

  modelId: number;
  modelName: string;  
  length: number;
  height: number;
  width: number;
  dryWeight: number;
  plantSteamInletConnection: string;
  condensateOutletConnection: string;
  cleanSteamOutletConnection: string;
  feedwaterInletConnection: string;
  safetyValveDischarge: string;
  notCondensableVentConnection: string;
  drainConnection: string;
  plantSteamCondensateDrainConnection: string;
  tdsBlowdownConnection: string;
  samplingSystem: string;

  nomenclature: string = "-";

  plantSteamFlowrate: number;
  minAirSupply: number = 0.0;

  displayPlantSteamFlowrate: string;
  displayCleanSteamFlowrate: string;

  design_Code_Enum_Name: string;
  shell_Type_Enum_Name: string;
  valve_Actuation_Enum_Name: string;
  control_Enum_Name: string;
  communication_Interface_Enum_Name: string;
  frame_And_Cabinet_Enum_Name: string;
  control_Panel_Location_Enum_Name: string;
  insulation_Enum_Name: string;
  wheels_And_Feet_Enum_Name: string;
  plant_Steam_Inlet_Shut_Off_Valve_Enum_Name: string;
  plant_Steam_Line_Trapping_Enum_Name: string;
  tds_Control_System_Enum_Name: string;
  sample_Cooler_Enum_Name: string;
  independent_Low_Level_Alarm_Enum_Name: string;
  feedwater_Pre_Heating_Degassing_Enum_Name: string;
  intelligent_Diagnostics_Enum_Name: string;
  clean_Steam_Outlet_Shut_Off_Valve_Enum_Name: string;
  test_And_Certification_Enum_Name: string;
  level_Indicator_Enum_Name: string;

  feedwater_Pressurisation_Enum_Name: string;

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

  // Option list post filtering preservations.
  // Used as global options tracker to attempt to restore after options list filters are changed / applied
  // that will otherwise reset to the default list item. 
  design_Code_Selected_Option_Item_Value: string;
  shell_Type_Selected_Option_Item_Value: string;
  valve_Actuation_Selected_Option_Item_Value: string;
  control_Selected_Option_Item_Value: string;
  communication_Interface_Selected_Option_Item_Value: string;
  frame_And_Cabinet_Selected_Option_Item_Value: string;
  control_Panel_Location_Selected_Option_Item_Value: string;
  insulation_Selected_Option_Item_Value: string;
  wheels_And_Feet_Selected_Option_Item_Value: string;
  plant_Steam_Inlet_Shut_Off_Valve_Selected_Option_Item_Value: string;
  plant_Steam_Line_Trapping_Selected_Option_Item_Value: string;
  tds_Control_System_Selected_Option_Item_Value: string;
  sample_Cooler_Selected_Option_Item_Value: string;
  independent_Low_Level_Alarm_Selected_Option_Item_Value: string;
  feedwater_Pre_Heating_Degassing_Selected_Option_Item_Value: string;
  intelligent_Diagnostics_Selected_Option_Item_Value: string;
  clean_Steam_Outlet_Shut_Off_Valve_Selected_Option_Item_Value: string;
  test_And_Certification_Selected_Option_Item_Value: string;
  level_Indicator_Selected_Option_Item_Value: string;
  feedwater_Pressurisation_Selected_Option_Item_Value: string;
  phase_Voltage_Selected_Option_Item_Value: string;

  translatedMessagesList: any[];
  
  constructor(private activatedRoute: ActivatedRoute, private projectsJobsService: ProjectsJobsService, private fb: FormBuilder,
    private cleanSteamGeneratorService: CleanSteamGeneratorService, private modulePreferenceService: ModulePreferenceService,
    private translationService: TranslationService, private preferenceService: PreferenceService, private docGenService: DocGenService, private csgDocGenService: csgDocGenService,  private translatePipe: TranslatePipe,
    private sanitizer: DomSanitizer, private userProfileService: UserProfileService, private adminService: AdminService,
    private messagesService: MessagesService, private cdRef: ChangeDetectorRef, private localeService: LocaleService, private localeValidation: LocaleValidation,
    private http: HttpClient
  )

  {

    // Call the abstract class' constructor.
    super();

    // Initialize.    
    this.csgProcessConditions = new CleanSteamGeneratorProcessConditions();

    this.csgPricing = new CleanSteamGeneratorPricing();
    this.csgPricingOutputData = new CleanSteamGeneratorPricingOutput();
    this.csgBOMOutputData = new CleanSteamGeneratorBOMPriceOutput();
    
    // Validation messages.
    this.plantSteamValidationErrorMessage           = new CleanSteamGeneratorValidationErrorMessage();
    this.cleanSteamValidationErrorMessage           = new CleanSteamGeneratorValidationErrorMessage();
    this.feedwaterPressureValidationErrorMessage    = new CleanSteamGeneratorValidationErrorMessage();
    this.feedwaterTemperatureValidationErrorMessage = new CleanSteamGeneratorValidationErrorMessage();
    this.cleanSteamFlowrateValidationErrorMessage   = new CleanSteamGeneratorValidationErrorMessage();
    this.tdsBlowdownValidationErrorMessage          = new CleanSteamGeneratorValidationErrorMessage();
    // Form controls with custom validators.
    this.plantsteampressure         = new FormControl('', [Validators.required, (c) => this.validateFormControlInput(c, 'plantsteampressure', this.pressureRef, this.plantSteamValidationErrorMessage)]);
    this.cleansteampressure         = new FormControl('', [Validators.required, (c) => this.validateFormControlInput(c, 'cleansteampressure', this.pressureRef, this.cleanSteamValidationErrorMessage)]);
    this.feedwaterpressure          = new FormControl('', [Validators.required, (c) => this.validateFormControlInput(c, 'feedwaterpressure', this.pressureRef, this.feedwaterPressureValidationErrorMessage)]);
    this.feedwatertemperature       = new FormControl('', [Validators.required, (c) => this.validateFormControlInput(c, 'feedwatertemperature', this.temperatureRef, this.feedwaterTemperatureValidationErrorMessage)]);
    this.requiredcleansteamflowrate = new FormControl('', [Validators.required, (c) => this.validateFormControlInput(c, 'requiredcleansteamflowrate', this.massFlowRef, this.cleanSteamFlowrateValidationErrorMessage)]);
    this.tdsblowdownpercentage      = new FormControl('5', [Validators.required, (c) => this.validateFormControlInput(c, 'tdsblowdownpercentage', null, this.tdsBlowdownValidationErrorMessage)]);
        
    this.design_Code_Enumeration = new FormControl('');
    this.shell_Type_Enumeration = new FormControl('');
    this.valve_Actuation_Enumeration = new FormControl('');
    this.control_Enumeration = new FormControl('');
    this.communication_Interface_Enumeration = new FormControl('');
    this.frame_And_Cabinet_Enumeration = new FormControl('');
    this.control_Panel_Location_Enumeration = new FormControl('');
    this.insulation_Enumeration = new FormControl('');
    this.wheels_And_Feet_Enumeration = new FormControl('');
    this.plant_Steam_Inlet_Shut_Off_Valve_Enumeration = new FormControl('');
    this.plant_Steam_Line_Trapping_Enumeration = new FormControl('');
    this.tds_Control_System_Enumeration = new FormControl('');
    this.sample_Cooler_Enumeration = new FormControl('');
    this.independent_Low_Level_Alarm_Enumeration = new FormControl('');
    this.feedwater_Pre_Heating_Degassing_Enumeration = new FormControl('');
    this.intelligent_Diagnostics_Enumeration = new FormControl('');
    this.clean_Steam_Outlet_Shut_Off_Valve_Enumeration = new FormControl('');
    this.test_And_Certification_Enumeration = new FormControl('');
    this.level_Indicator_Enumeration = new FormControl('');
        
    this.feedwater_Pressurisation_Enumeration = new FormControl('');
    this.phase_Voltage_Enumeration = new FormControl('');    

    this.totalPriceFormControl = new FormControl({ value: 0, disabled: true });

    this.totalSSPFormControl = new FormControl({ value: 0, disabled: true });
    this.sellingMarkupFormControl = new FormControl('');
    this.nomenclatureFormControl = new FormControl('');    
    this.grossMarginFormControl = new FormControl('');
    this.totalSellingPriceFormControl = new FormControl({ value: 0, disabled: true });
    this.deliveryCostFormControl = new FormControl({ value: 0, disabled: true });

    this.serviceOfferingOptionsFormControl = new FormControl('');
    this.serviceOfferingFormControl = new FormControl({ value: 0.00, disabled: true });

    this.translatedMessagesList = [];
       
    this.design_Code_List = [];
    this.shell_Type_List = [];
    this.valve_Actuation_List = [];
    this.control_List = [];
    this.communication_Interface_List = [];
    this.frame_And_Cabinet_List = [];
    this.control_Panel_Location_List = [];
    this.insulation_List = [];
    this.wheels_And_Feet_List = [];
    this.plant_Steam_Inlet_Shut_Off_Valve_List = [];
    this.plant_Steam_Line_Trapping_List = [];
    this.tds_Control_System_List = [];
    this.sample_Cooler_List = [];
    this.independent_Low_Level_Alarm_List = [];
    this.feedwater_Pre_Heating_Degassing_List = [];
    this.intelligent_Diagnostics_List = [];
    this.clean_Steam_Outlet_Shut_Off_Valve_List = [];
    this.test_And_Certification_List = [];
    this.level_Indicator_List = [];

    this.feedwater_Pressurisation_List = [];

    this.modelId = 0;
        
    this.design_Code_Enum_Name = '';
    this.shell_Type_Enum_Name = '';
    this.valve_Actuation_Enum_Name = '';
    this.control_Enum_Name = '';
    this.communication_Interface_Enum_Name = '';
    this.frame_And_Cabinet_Enum_Name = '';
    this.control_Panel_Location_Enum_Name = '';
    this.insulation_Enum_Name = '';
    this.wheels_And_Feet_Enum_Name = '';
    this.plant_Steam_Inlet_Shut_Off_Valve_Enum_Name = '';
    this.plant_Steam_Line_Trapping_Enum_Name = '';
    this.tds_Control_System_Enum_Name = '';
    this.sample_Cooler_Enum_Name = '';
    this.independent_Low_Level_Alarm_Enum_Name = '';
    this.feedwater_Pre_Heating_Degassing_Enum_Name = '';
    this.intelligent_Diagnostics_Enum_Name = '';
    this.clean_Steam_Outlet_Shut_Off_Valve_Enum_Name = '';
    this.test_And_Certification_Enum_Name = '';
    this.level_Indicator_Enum_Name = '';

    this.feedwater_Pressurisation_Enum_Name = '';   

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
      plantsteampressure: this.plantsteampressure,
      cleansteampressure: this.cleansteampressure,
      feedwaterpressure: this.feedwaterpressure,
      feedwatertemperature: this.feedwatertemperature,
      requiredcleansteamflowrate: this.requiredcleansteamflowrate,
      tdsblowdownpercentage: this.tdsblowdownpercentage,
       
      
      pricingOptions: this.fb.group({
        communication_Interface_Enumeration: this.communication_Interface_Enumeration,
        design_Code_Enumeration: this.design_Code_Enumeration,
        shell_Type_Enumeration: this.shell_Type_Enumeration,
        valve_Actuation_Enumeration: this.valve_Actuation_Enumeration,
        control_Panel_Location_Enumeration: this.control_Panel_Location_Enumeration,
        insulation_Enumeration: this.insulation_Enumeration,
        wheels_And_Feet_Enumeration: this.wheels_And_Feet_Enumeration,
        control_Enumeration: this.control_Enumeration,
        frame_And_Cabinet_Enumeration: this.frame_And_Cabinet_Enumeration,
        plant_Steam_Inlet_Shut_Off_Valve_Enumeration: this.plant_Steam_Inlet_Shut_Off_Valve_Enumeration,
        plant_Steam_Line_Trapping_Enumeration: this.plant_Steam_Line_Trapping_Enumeration,
        tds_Control_System_Enumeration: this.tds_Control_System_Enumeration,
        sample_Cooler_Enumeration: this.sample_Cooler_Enumeration,
        independent_Low_Level_Alarm_Enumeration: this.independent_Low_Level_Alarm_Enumeration,
        feedwater_Pre_Heating_Degassing_Enumeration: this.feedwater_Pre_Heating_Degassing_Enumeration,
        intelligent_Diagnostics_Enumeration: this.intelligent_Diagnostics_Enumeration,
        clean_Steam_Outlet_Shut_Off_Valve_Enumeration: this.clean_Steam_Outlet_Shut_Off_Valve_Enumeration,
        test_And_Certification_Enumeration: this.test_And_Certification_Enumeration,
        level_Indicator_Enumeration: this.level_Indicator_Enumeration,
        feedwater_Pressurisation_Enumeration: this.feedwater_Pressurisation_Enumeration,
        phase_Voltage_Enumeration: this.phase_Voltage_Enumeration,
      }),
        
        totalPriceFormControl: this.totalPriceFormControl,

        totalSSPFormControl: this.totalSSPFormControl,
        sellingMarkupFormControl: this.sellingMarkupFormControl,
        nomenclatureFormControl: this.nomenclatureFormControl,
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

    }, { updateOn: "change" });
  }

  getModulePreferenceValues() {

    // Get all the required module prefs.
    var manufacturerPref = this.modulePreferenceService.getModulePreferenceByName("CSGManufacturer");
    if (manufacturerPref) {
      this.manufacturerId = +manufacturerPref.value;
    }
    else {
      // Module preferences data is missing or failed to load!
      debugger;
    }

    var basePricePref = this.modulePreferenceService.getModulePreferenceByName("CSGBasePriceOption");
    if (basePricePref) {
      this.basePriceOption = +basePricePref.value;
    }
    var localRecommendedSalesPricePref = this.modulePreferenceService.getModulePreferenceByName("CSGLocalRecommendedSalesPriceOption");
    if (localRecommendedSalesPricePref) {
      this.localRecommendedSalesPriceOption = +localRecommendedSalesPricePref.value;
    }
    var landedCostIncreasePref = this.modulePreferenceService.getModulePreferenceByName("CSGLandCostIncrease");
    if (landedCostIncreasePref) {
      this.landedCostIncreaseFactor = (100 + (+landedCostIncreasePref.value)) / 100;
    }
    var deliveryCostPref = this.modulePreferenceService.getModulePreferenceByName("CSGDeliveryCost");
    if (deliveryCostPref) {
      this.deliveryCost = +deliveryCostPref.value;
    }

    var commissionCostCostPref = this.modulePreferenceService.getModulePreferenceByName("CSGCommission");
    if (commissionCostCostPref) {
      this.commissionCost = +commissionCostCostPref.value;
    }
    var oneYearWarrantyCostPref = this.modulePreferenceService.getModulePreferenceByName("CSGYearOne");
    if (oneYearWarrantyCostPref) {
      this.oneYearWarrantyCost = +oneYearWarrantyCostPref.value;
    }
    var twoYearWarrantyCostPref = this.modulePreferenceService.getModulePreferenceByName("CSGYearTwo");
    if (twoYearWarrantyCostPref) {
      this.twoYearWarrantyCost = +twoYearWarrantyCostPref.value;
    }
    var threeYearWarrantyCostPref = this.modulePreferenceService.getModulePreferenceByName("CSGYearThree");
    if (threeYearWarrantyCostPref) {
      this.threeYearWarrantyCost = +threeYearWarrantyCostPref.value;
    }

    var manufacturerCurrencyPref = this.modulePreferenceService.getModulePreferenceByName("CSGManufacturerCurrency");
    if (manufacturerCurrencyPref) {
      this.manufacturerCurrencyId = +manufacturerCurrencyPref.value;
    }
    var sellingCurrencyPref = this.modulePreferenceService.getModulePreferenceByName("CSGSellingCurrency");
    if (sellingCurrencyPref) {
      this.sellingCurrencyId = +sellingCurrencyPref.value;
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
  }

  ngOnInit() {      

    this.jobStatusId = 1;
    this.moduleId = 8;
    this.productName = "CSG";

    this.preferenceService.getUserPreferences().subscribe((prefs: Array<Preference>) => {
      
      this.userPrefs = prefs;
      this.specSheetLanguage = this.userPrefs.find(m => m.name === "SpecLanguage").value;
      this.lengthPref = this.userPrefs.find(m => m.name === "LengthUnit").value;
      this.lengthPrefUnit = this.userPrefs.find(m => m.name === "LengthUnit").unitName;
      this.weightPref = this.userPrefs.find(m => m.name === "WeightUnit").value;
      this.weightPrefUnit = this.userPrefs.find(m => m.name === "WeightUnit").unitName;

      this.sizingModuleForm.markAsPristine();
      this.sizingModuleForm.markAsUntouched();
    });

    this.userProfileService.getUserDetails().subscribe(user => {
      this.user = user;
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

    this.theFormGroup = this.sizingModuleForm; // to drive GenericChangesGuard

    // Update the flag so that Ti sheet could be generated.
    this.isTiEnabled = true;

    this.handleLoadingJob();

  }

  ngOnDestroy() {
    console.log("Component will be destroyed");
    this.paramsSubscription.unsubscribe();
  }

  handleLoadingJob()
  {
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
          }
          else return;
         
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

            this.isLoadingJob = false; 
          });

        });
      }
    });
  }
  
  loadJob() {
    try {
      // load process conditions
      let processConditions = this.loadedJobSizingData.processConditions[0];
      this.plantsteampressure.setValue(processConditions.processInputs.find(m => m.name === "Plant Steam Pressure").value);
      this.cleansteampressure.setValue(processConditions.processInputs.find(m => m.name === "Clean Steam Pressure").value);
      this.feedwaterpressure.setValue(processConditions.processInputs.find(m => m.name === "Feedwater Pressure").value);
      this.feedwatertemperature.setValue(processConditions.processInputs.find(m => m.name === "Feedwater Temperature").value);
      this.requiredcleansteamflowrate.setValue(processConditions.processInputs.find(m => m.name === "Required Clean Steam Flowrate").value);
      this.tdsblowdownpercentage.setValue(processConditions.processInputs.find(m => m.name === "Tds Blowdown Percentage").value);

      // Load unit preferences.
      let unitPreferences = this.loadedJobSizingData.processConditions[0].unitPreferences;
      this.preferenceService.addSizingUnitPreference(unitPreferences.find(u => u.name === this.pressureRef.preference.name), "PressureUnits", "PRESSURE", this.moduleGroupId);
      this.preferenceService.addSizingUnitPreference(unitPreferences.find(u => u.name === this.temperatureRef.preference.name), "TemperatureUnits", "TEMPERATURE", this.moduleGroupId);
      this.preferenceService.addSizingUnitPreference(unitPreferences.find(u => u.name === this.massFlowRef.preference.name), "MassFlowUnits", "MASS_FLOW", this.moduleGroupId);
      this.preferenceService.addSizingUnitPreference(unitPreferences.find(u => u.name === this.loadRef.preference.name), "LoadUnits", "LOAD", this.moduleGroupId);

      // load sizing grid
      if (this.loadedJobSizingData.sizingOutput.outputGrid != null &&
        this.loadedJobSizingData.sizingOutput.outputGrid.outputGridRows != null && this.loadedJobSizingData.sizingOutput.outputGrid.outputGridRows.length > 0) {

        this.isCSGSizingDone = true;

        this.csgOutputData = new Array<CleanSteamGeneratorOutput>();
      
        var row = new CleanSteamGeneratorOutput();

        for (let model of this.loadedJobSizingData.sizingOutput.outputGrid.outputGridRows) {

          row.modelId                             = +model.outputItems.find(m => m.name === "Model Id").value;
          row.modelName                           = model.outputItems.find(m => m.name === "Model Name").value;
          row.cleanSteamFlowrate                  = +model.outputItems.find(m => m.name === "Clean Steam Flow Rate").value;
          row.plantSteamFlowrate                  = +model.outputItems.find(m => m.name === "Plant Steam Flow Rate").value;
          row.feedwaterFlowrate                   = +model.outputItems.find(m => m.name === "Feed Water Flow Rate").value;
          row.blowDownFlowrate                    = +model.outputItems.find(m => m.name === "Blow Down Flow Rate").value;
          row.pressurisedDeaeratorInletFlowrate   = +model.outputItems.find(m => m.name === "Pressurised Deaerator Inlet Flow Rate").value;
          row.pressurisedDeaeratorOutletFlowrate  = +model.outputItems.find(m => m.name === "Pressurised Deaerator Outlet Flow Rate").value;
          row.heatExchangerDuty                   = +model.outputItems.find(m => m.name === "Heat Exchanger Duty").value;
          row.overdesign                          = +model.outputItems.find(m => m.name === "OverDesign").value;

          row.length                              = +model.outputItems.find(m => m.name === "Length").value;
          row.height                              = +model.outputItems.find(m => m.name === "Height").value;
          row.width                               = +model.outputItems.find(m => m.name === "Width").value;
          row.dryWeight                           = +model.outputItems.find(m => m.name === "DryWeight").value;
          row.plantSteamInletConnection           = model.outputItems.find(m => m.name === "PlantSteamInletConnection").value;
          row.condensateOutletConnection          = model.outputItems.find(m => m.name === "CondensateOutletConnection").value;
          row.cleanSteamOutletConnection          = model.outputItems.find(m => m.name === "CleanSteamOutletConnection").value;
          row.feedwaterInletConnection            = model.outputItems.find(m => m.name === "FeedwaterInletConnection").value;
          row.safetyValveDischarge                = model.outputItems.find(m => m.name === "SafetyValveDischarge").value;
          row.notCondensableVentConnection        = model.outputItems.find(m => m.name === "NotCondensableVentConnection").value;
          row.drainConnection = model.outputItems.find(m => m.name === "DrainConnection").value;
          row.plantSteamCondensateDrainConnection = model.outputItems.find(m => m.name === "PlantSteamCondensateDrainConnection").value;
          row.tdsBlowdownConnection               = model.outputItems.find(m => m.name === "TdsBlowdownConnection").value;
          row.samplingSystem                      = model.outputItems.find(m => m.name === "SamplingSystem").value;
          row.minAirSupply                        = +model.outputItems.find(m => m.name === "MinAirSupply").value;
          row.isPumpMandatory                     = <boolean>JSON.parse(model.outputItems.find(m => m.name === "IsPumpMandatory").value);

          let selectedRow = model.outputItems.find(m => m.name === "Model Id").selected;

          if (selectedRow) {
            // selected row

            this.validateQuotaion(this.job.updated);

            this.selectedOutputData[0] = row;
            this.modelId = row.modelId;
            this.modelName = row.modelName;
            let modelDetails = this.hashTable.find(m => m.name === row.modelName);

            this.design_Code_Enum_Name = modelDetails.design_Code;
            this.shell_Type_Enum_Name = modelDetails.shell_Type;
            this.valve_Actuation_Enum_Name = modelDetails.valve_Actuation;
            this.control_Enum_Name = modelDetails.control;
            this.communication_Interface_Enum_Name = modelDetails.communication_Interface;
            this.frame_And_Cabinet_Enum_Name = modelDetails.frame_And_Cabinet;
            this.control_Panel_Location_Enum_Name = modelDetails.control_Panel_Location;
            this.insulation_Enum_Name = modelDetails.insulation;
            this.wheels_And_Feet_Enum_Name = modelDetails.wheels_And_Feet;
            this.plant_Steam_Inlet_Shut_Off_Valve_Enum_Name = modelDetails.plant_Steam_Inlet_Shut_Off_Valve;    
            this.plant_Steam_Line_Trapping_Enum_Name = modelDetails.plant_Steam_Line_Trapping;
            this.tds_Control_System_Enum_Name = modelDetails.tds_Control_System;
            this.sample_Cooler_Enum_Name = modelDetails.sample_Cooler;
            this.independent_Low_Level_Alarm_Enum_Name = modelDetails.independent_Low_Level_Alarm;
            this.feedwater_Pre_Heating_Degassing_Enum_Name = modelDetails.feedwater_Pre_Heating_Degassing;
            this.intelligent_Diagnostics_Enum_Name = modelDetails.intelligent_Diagnostics;
            this.clean_Steam_Outlet_Shut_Off_Valve_Enum_Name = modelDetails.clean_Steam_Outlet_Shut_Off_Valve;
            this.test_And_Certification_Enum_Name = modelDetails.test_And_Certification;
            this.level_Indicator_Enum_Name = modelDetails.level_Indicator;

            this.feedwater_Pressurisation_Enum_Name = this.hashTable.find(m => m.name === row.modelName).feedwater_Pressurisation;

            this.length = +model.outputItems.find(m => m.name === "Length").value;
            this.height = +model.outputItems.find(m => m.name === "Height").value;
            this.width = +model.outputItems.find(m => m.name === "Width").value;
            this.dryWeight = +model.outputItems.find(m => m.name === "DryWeight").value;
            this.plantSteamInletConnection = model.outputItems.find(m => m.name === "PlantSteamInletConnection").value;
            this.condensateOutletConnection = model.outputItems.find(m => m.name === "CondensateOutletConnection").value;
            this.cleanSteamOutletConnection = model.outputItems.find(m => m.name === "CleanSteamOutletConnection").value;
            this.feedwaterInletConnection = model.outputItems.find(m => m.name === "FeedwaterInletConnection").value;
            this.safetyValveDischarge = model.outputItems.find(m => m.name === "SafetyValveDischarge").value;
            this.notCondensableVentConnection = model.outputItems.find(m => m.name === "NotCondensableVentConnection").value;
            this.tdsBlowdownConnection = model.outputItems.find(m => m.name === "TdsBlowdownConnection").value;
            this.drainConnection = model.outputItems.find(m => m.name === "DrainConnection").value;
            this.plantSteamCondensateDrainConnection = model.outputItems.find(m => m.name === "PlantSteamCondensateDrainConnection").value;
            this.samplingSystem = model.outputItems.find(m => m.name === "SamplingSystem").value;

            // Set documentation options by selected Design Code
            this.filterTestAndCertificationList();

            // Check if pump must be selected?
            this.filterFeedwaterPressurisationList(row.isPumpMandatory);
            if (this.feedwater_Pressurisation_List.length > 0) {
              this.feedwater_Pressurisation_Enumeration.setValue(this.feedwater_Pressurisation_List[0]); // Use Form Touched flag or setting this default will overwrite loaded job data on filter dependant Lists!
            }

            // Setup selected row data
            this.minAirSupply = row.minAirSupply;
            this.displayCleanSteamFlowrate = this.localizeValue(row.cleanSteamFlowrate, this.massFlowRef.preference.decimalPlaces);
            this.displayPlantSteamFlowrate = this.localizeValue(row.plantSteamFlowrate, this.massFlowRef.preference.decimalPlaces);

            //messages
            if (model.messages && model.messages.length > 0) {
              row.modelSizingMessages = new Array<Message>();

              model.messages.forEach(m => {

                row.modelSizingMessages.push({
                  messageKey: m.messageKey,
                  value: m.value,
                  unitKey: m.unitKey,
                  severity: m.severity,
                  displayValue: m.displayValue
                });

              });
            }

            this.isCSGModelSelected = true;

          } // end of selected row

          this.csgOutputData.push(row);
          row = new CleanSteamGeneratorOutput();

        }

        let outputItems = this.loadedJobSizingData.sizingOutput.outputItems;
        // Localize display values.
        this.localizeCSGOutputData();
      
        // load saved options and price
        if (this.isCSGModelSelected) {
        
          // this.sizingModuleForm.controls["design_Code_Enumeration"].setValue(test);
          this.design_Code_Enumeration.setValue(outputItems.find(m => m.name === this.design_Code_Enum_Name).value);
        
          this.shell_Type_Enumeration.setValue(outputItems.find(m => m.name === this.shell_Type_Enum_Name).value);
          this.valve_Actuation_Enumeration.setValue(outputItems.find(m => m.name === this.valve_Actuation_Enum_Name).value);          
          this.control_Enumeration.setValue(outputItems.find(m => m.name === this.control_Enum_Name).value);
          // communication_Interface_Enumeration.setValue(outputItems.find(m => m.name === this.communication_Interface_Enum_Name).value);
          this.communication_Interface_Enumeration.setValue(outputItems.find(m => m.name === this.communication_Interface_Enum_Name).value);

          var frameAndCabinetSelectedListOption = outputItems.find(m => m.name === this.frame_And_Cabinet_Enum_Name).value;
          this.frame_And_Cabinet_Enumeration.setValue(frameAndCabinetSelectedListOption); //outputItems.find(m => m.name === this.frame_And_Cabinet_Enum_Name).value);
          // Set available Trapping list options based on the selected Frame and Cabinet (Basement or Frame)
          this.filterPlantSteamLineTrappingList();

          this.control_Panel_Location_Enumeration.setValue(outputItems.find(m => m.name === this.control_Panel_Location_Enum_Name).value);
          this.insulation_Enumeration.setValue(outputItems.find(m => m.name === this.insulation_Enum_Name).value);
          this.wheels_And_Feet_Enumeration.setValue(outputItems.find(m => m.name === this.wheels_And_Feet_Enum_Name).value);
          this.plant_Steam_Inlet_Shut_Off_Valve_Enumeration.setValue(outputItems.find(m => m.name === this.plant_Steam_Inlet_Shut_Off_Valve_Enum_Name).value);

          // Handle legacy list if saved in a job
          var trappingSelectedListOption = outputItems.find(m => m.name === this.plant_Steam_Line_Trapping_Enum_Name).value;
          
          if (trappingSelectedListOption == 'Plant Steam Line Trapping_T') { // legacy option was saved in job
            if (frameAndCabinetSelectedListOption) {
              var frameAndCabinetCode = (frameAndCabinetSelectedListOption.split("_")[1] === '0'
                || frameAndCabinetSelectedListOption.split("_")[1] === '3') ? 'Plant steam line trapping station - frame type 1 2 4 5_T' : 'Plant steam line trapping station - basement type 0 3_T';

            }
          }          
          this.plant_Steam_Line_Trapping_Enumeration.setValue(trappingSelectedListOption); // outputItems.find(m => m.name === this.plant_Steam_Line_Trapping_Enum_Name).value);
     
          this.tds_Control_System_Enumeration.setValue(outputItems.find(m => m.name === this.tds_Control_System_Enum_Name).value);
          this.sample_Cooler_Enumeration.setValue(outputItems.find(m => m.name === this.sample_Cooler_Enum_Name).value);
          this.independent_Low_Level_Alarm_Enumeration.setValue(outputItems.find(m => m.name === this.independent_Low_Level_Alarm_Enum_Name).value);
          this.feedwater_Pre_Heating_Degassing_Enumeration.setValue(outputItems.find(m => m.name === this.feedwater_Pre_Heating_Degassing_Enum_Name).value);
          this.intelligent_Diagnostics_Enumeration.setValue(outputItems.find(m => m.name === this.intelligent_Diagnostics_Enum_Name).value);
          this.clean_Steam_Outlet_Shut_Off_Valve_Enumeration.setValue(outputItems.find(m => m.name === this.clean_Steam_Outlet_Shut_Off_Valve_Enum_Name).value);
          this.test_And_Certification_Enumeration.setValue(outputItems.find(m => m.name === this.test_And_Certification_Enum_Name).value);
          
          var levelIndicatorSelectedListOption = "";
            // Handle legacy list if saved in a job. List name ..._Other changed to ..._Level_Indicator
          if (!outputItems.find(m => m.name === this.level_Indicator_Enum_Name)) { // Level Indicator selected Item was missing from job, check the old List name
            var old_other_level_Indicator_Enum_Name = this.level_Indicator_Enum_Name.replace("_Level_Indicator", "_Other");
            levelIndicatorSelectedListOption = outputItems.find(m => m.name === old_other_level_Indicator_Enum_Name).value;
          }
          else {
            levelIndicatorSelectedListOption = outputItems.find(m => m.name === this.level_Indicator_Enum_Name).value;
          }
          this.level_Indicator_Enumeration.setValue(levelIndicatorSelectedListOption);

          // LP30/LP20 list visibility rule.
          this.filterIndependentLowLevelAlarmList(levelIndicatorSelectedListOption);

          // Pump and Phase/voltage selections.
          this.feedwater_Pressurisation_Enumeration.setValue(outputItems.find(m => m.name === this.feedwater_Pressurisation_Enum_Name).value);
          // Filter Phase/Voltage list base on feedwater pressurisation selection.
          var feedwaterPressurisationSelectedValue = (outputItems.find(m => m.name === this.feedwater_Pressurisation_Enum_Name).value);
          this.filterPhaseVoltageList(outputItems.find(m => m.name === this.feedwater_Pressurisation_Enum_Name).value);
          if (this.phaseVoltageList.length > 0 && feedwaterPressurisationSelectedValue === "None_N") {
            // Support old job compatibility. No pump for pressurisation means we can only be Single phase option.
            this.phase_Voltage_Enumeration.setValue(this.phaseVoltageList[0]);
          }
          else {
            // Use either of the 2x  '3 phase' options saved in the job data
            this.phase_Voltage_Enumeration.setValue(outputItems.find(m => m.name === "CSG_Phase_Voltage").value);
          }

          // Option visibility status          
          this.show_plant_Steam_Line_Trapping         = <boolean>JSON.parse(outputItems.find(m => m.name === "Show_Plant_Steam_Line_Trapping").value);
          this.show_sample_Cooler                     = <boolean>JSON.parse(outputItems.find(m => m.name === "Show_Sample_Cooler").value);
          this.show_independent_Low_Level_Alarm       = <boolean>JSON.parse(outputItems.find(m => m.name === "Show_Independent_Low_Level_Alarm").value);
          this.show_feedwater_Pre_Heating_Degassing = <boolean>JSON.parse(outputItems.find(m => m.name === "Show_Feedwater_Pre_Heating_Degassing").value);         
          this.show_intelligent_Diagnostics           = <boolean>JSON.parse(outputItems.find(m => m.name === "Show_Intelligent_Diagnostics").value);
          this.show_clean_Steam_Outlet_Shut_Off_Valve = <boolean>JSON.parse(outputItems.find(m => m.name === "Show_Clean_Steam_Outlet_Shut_Off_Valve").value);

          if (!!outputItems.find(m => m.name === "Show_feedwater_Pre_Heating_Option_Message") && this.show_feedwater_Pre_Heating_Degassing) { // legacy job load support
            this.show_feedwater_Pre_Heating_Option_Message = <boolean>JSON.parse(outputItems.find(m => m.name === "Show_feedwater_Pre_Heating_Option_Message").value);
          }

          this.sellingCurrencySymbol          = outputItems.find(m => m.name === "SellingCurrencySymbol").value;

          this.internal_SSP                   = +outputItems.find(m => m.name === "SSP").value;
          this.internal_SellingPrice          = +outputItems.find(m => m.name === "Selling Price").value;
          this.internal_ServiceOfferingPrice  = +outputItems.find(m => m.name === "Service Offering Price").value;
          this.deliveryCost                   = +outputItems.find(m => m.name === "Delivery Cost").value;
          this.internal_TotalPrice            = +outputItems.find(m => m.name === "Total Price").value;

          this.display_SSP                    = this.localizeValue(this.internal_SSP, 0);
          this.display_SellingPrice           = this.localizeValue(this.internal_SellingPrice, 0);
          this.display_ServiceOfferingPrice   = this.localizeValue(this.internal_ServiceOfferingPrice, 0);
          this.display_DeliveryPrice          = this.localizeValue(this.deliveryCost, 0);
          this.display_TotalPrice             = this.localizeValue(this.internal_TotalPrice, 0);

          this.serviceOfferingKey = outputItems.find(m => m.name === "Service Offering Label").value;

          this.sellingMarkupFormControl.setValue(outputItems.find(m => m.name === "Selling Markup").value);
          this.grossMarginFormControl.setValue(outputItems.find(m => m.name === "Gross Margin").value);        
          this.sizingModuleForm.controls["serviceOfferingOptionsFormControl"].setValue(outputItems.find(m => m.name === "Service Offering Enumeration").value);

          this.sellingMarkupUpdated = <boolean>JSON.parse(outputItems.find(m => m.name === "SellingMarkupUpdated").value);
          this.grossMarginUpdated = <boolean>JSON.parse(outputItems.find(m => m.name === "GrossMarginUpdated").value);        

          this.nomenclature = outputItems.find(m => m.name === "Nomenclature").value;
          this.nomenclatureFormControl.setValue(!!this.nomenclature ? this.nomenclature : '-');
        }      

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
      } else {
        this.isCSGSizingDone = false;
      }

      // Reset button status
      if (<boolean>JSON.parse(this.loadedJobSizingData.sizingOutput.outputItems.find(m => m.name === "IsResetEnabled").value)) {
        this.sizingModuleForm.markAsDirty();        
      }

    } catch(err) {
      console.log(`LoadJob() failed err=${err}`);
      this.showJobLoadError();
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
  

  /*
  * Method to calculate csg sizing.
  */
  onCalculateSizing(formGroup: FormGroup) {
    console.info("Calculating CSG!");
    this.disableUiInputs();
    this.debugData = "";
    this.debugDataEnabled = false;
    
    this.resetResults();
    
    this.resetLoadingJobStatus();

    // Process conditions
    this.csgProcessConditions.plantSteamPressure         = +this.plantsteampressure.value;
    this.csgProcessConditions.cleanSteamPressure         = +this.cleansteampressure.value;
    this.csgProcessConditions.feedwaterPressure          = +this.feedwaterpressure.value;
    this.csgProcessConditions.feedwaterTemperature       = +this.feedwatertemperature.value;
    this.csgProcessConditions.requiredCleanSteamFlowrate = +this.requiredcleansteamflowrate.value;
    this.csgProcessConditions.tdsBlowDownPercentage = +(this.tdsblowdownpercentage.value);

    // Unit Details
    this.csgProcessConditions.pressureUnitId            = +(this.pressureRef.preference.value);
    this.csgProcessConditions.pressureUnitMasterTextKey = this.pressureRef.preference.masterTextKey;
    this.csgProcessConditions.pressureUnitDecimalPlaces = this.pressureRef.preference.decimalPlaces;

    this.csgProcessConditions.temperatureUnitId             = +(this.temperatureRef.preference.value);
    this.csgProcessConditions.temperatureUnitMasterTextKey  = this.temperatureRef.preference.masterTextKey;
    this.csgProcessConditions.temperatureUnitDecimalPlaces  = this.temperatureRef.preference.decimalPlaces;

    this.csgProcessConditions.massFlowUnitId            = +(this.massFlowRef.preference.value);
    this.csgProcessConditions.massFlowUnitMasterTextKey = this.massFlowRef.preference.masterTextKey;
    this.csgProcessConditions.massFlowUnitDecimalPlaces = this.massFlowRef.preference.decimalPlaces;

    this.csgProcessConditions.loadUnitId = +(this.loadRef.preference.value);

    this.csgProcessConditions.LengthUnitId = +(this.lengthPref);

    this.csgProcessConditions.WeightUnitId = +(this.weightPref);

    this.cleanSteamGeneratorService.sizeCleanSteamGenerator(this.csgProcessConditions).subscribe((cleanSteamGeneratorOutputData: Array<CleanSteamGeneratorOutput>) => {
      this.disableUiInputs();
      //check for csg ranges
      if (cleanSteamGeneratorOutputData[0] == null) {
        return;
      }

      // Update the subject with the data that's just been retrieved (see the constructor).
      // Also, ensure that the output data is ordered by overdesign.
      this.csgOutputData = cleanSteamGeneratorOutputData.sort((a, b) => a.overdesign > b.overdesign ? 1 : 0);

      // Localize display values.
      this.localizeCSGOutputData();

      // Set documentation options by selected Design Code
      this.filterTestAndCertificationList();

      // Set available Trapping list options based on the selected Frame and Cabinet (Basement or Frame)
      this.filterPlantSteamLineTrappingList();

      // Check if pump must be selected?
      this.filterFeedwaterPressurisationList(this.csgOutputData.findIndex(od => od.isPumpMandatory) > -1);
      if (this.feedwater_Pressurisation_List.length > 0) {
        this.feedwater_Pressurisation_Enumeration.setValue(this.feedwater_Pressurisation_List[0]);
      }

      this.filterPhaseVoltageList(this.feedwater_Pressurisation_Enumeration.value);

      this.isCSGSizingDone = true;

      //NOTE: CSG Options loaded via enumerations

      // Check and select any data row with overdesign greter than 0.
      var idx = this.csgOutputData.findIndex(i => i.overdesign > this.overdesign_Limit_0);
      if (idx > -1) {
        // The following timeout is required for "#csgOutputDataTable" to finish loading for the first time before we are able to make a default row selection.
        setTimeout(() => {

          this.setupDefaultOptionsForSizingSelection(this.csgOutputData[idx]);
          this.selectCSGOutputDataRow(this.csgOutputData[idx]);

          if (this.csgOutputDataRows.length > 1) {
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

          this.sizingModuleForm.markAsDirty();
          this.sizingModuleForm.markAsTouched();
        }, 100); // delay for UI (csgOutputDataTable) to load.
      }

      this.enableUiInputs();

    });   

    this.moduleId = 8;
    this.productName = "CSG";

    this.sizingModuleForm.markAsPristine();
    this.sizingModuleForm.markAsUntouched();

    
  }



  setupDefaultOptionsForSizingSelection(selectedRow: CleanSteamGeneratorOutput) {

    // We need the selected row to get the Model type and associated list names. List names not yet set up on first sizing.
    this.design_Code_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).design_Code;
    this.shell_Type_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).shell_Type;
    this.valve_Actuation_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).valve_Actuation;
    this.frame_And_Cabinet_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).frame_And_Cabinet;


    var design_Code_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === true && mp.enumerationName === this.design_Code_Enum_Name)[0];
    if (!!design_Code_Items && !!design_Code_Items.enumerationDefinitions && design_Code_Items.enumerationDefinitions.length > 0) {
      // Set Design Code
      this.design_Code_Enumeration.setValue(design_Code_Items.enumerationDefinitions[0].value);// Set default to first item
    }

    var shell_Type_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === true && mp.enumerationName === this.shell_Type_Enum_Name)[0];
    if (!!shell_Type_Items && !!shell_Type_Items.enumerationDefinitions && shell_Type_Items.enumerationDefinitions.length > 0) {
      // Set Design Code
      this.shell_Type_Enumeration.setValue(shell_Type_Items.enumerationDefinitions[0].value);// Set default to first item
    }

    var valve_Actuation_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === true && mp.enumerationName === this.valve_Actuation_Enum_Name)[0];
    if (!!valve_Actuation_Items && !!valve_Actuation_Items.enumerationDefinitions && valve_Actuation_Items.enumerationDefinitions.length > 0) {
      // Set Actuation
      this.valve_Actuation_Enumeration.setValue(valve_Actuation_Items.enumerationDefinitions[0].value);// Set default to first item
    }

    var frame_And_Cabinet_Items = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === true && mp.enumerationName === this.frame_And_Cabinet_Enum_Name)[0];
    if (!!frame_And_Cabinet_Items && !!frame_And_Cabinet_Items.enumerationDefinitions && frame_And_Cabinet_Items.enumerationDefinitions.length > 0) {
      // Set Design Code
      this.frame_And_Cabinet_Enumeration.setValue(frame_And_Cabinet_Items.enumerationDefinitions[0].value);// Set default to first item
    }

  }



  /*
  * Custom validator for all the form control inputs.
  */
  validateFormControlInput(control: AbstractControl, controlName, unitRef, msgRef) {

    // Reset results
    this.resetResults();

    if (control.value == null) {
      return null;
    }

    if (control.value !== "") {
      // Reset error messages first.
      msgRef.value = '';

      // Add details into the validation model.
      var csgInputValidation: CleanSteamGeneratorInputValidation = new CleanSteamGeneratorInputValidation();
      csgInputValidation.controlName = controlName;
      csgInputValidation.value = +control.value;
      csgInputValidation.unitId = +(unitRef !== null ? unitRef.preference.value : 0);

      this.cleanSteamGeneratorService.validateCleanSteamGeneratorInput(csgInputValidation).subscribe((result: Array<CleanSteamGeneratorValidationMessage>) => {
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
  validateProcessConditions(): void {
    this.pressureDifferentialErrorMessage = '';

    // 8.7.3	Pressure Differential Data Entry Note (NoteΔP)
    if (this.plantsteampressure.value != "" && this.cleansteampressure.value != "") {
      var csgInputsValidation: CleanSteamGeneratorProcessConditionsValidation = new CleanSteamGeneratorProcessConditionsValidation();
      csgInputsValidation.controlName = 'cleansteampressure';
      csgInputsValidation.value1 = +this.plantsteampressure.value;
      csgInputsValidation.value2 = +this.cleansteampressure.value;
      csgInputsValidation.unitId = +(this.pressureRef.preference.value);

      this.cleanSteamGeneratorService.validateCleanSteamGeneratorProcessConditions(csgInputsValidation).subscribe((result: Array<CleanSteamGeneratorValidationMessage>) => {
        // Check if cross validation errors returned?
        if (result && result.length > 0) {
          this.pressureDifferentialErrorMessage = this.translatePipe.transform(result[0].messageKey, false) + ' (' + result[0].value + (this.pressureRef !== null ? ' ' + this.translatePipe.transform(this.pressureRef.preference.masterTextKey, false) : '') + ')';
          this.sizingModuleForm.setErrors({ 'incorrect': true });
        }
      });
    }
  }

  onResetModuleForm() {
    console.info("Resetting the CSG form");

    // Default TDS Blowdown Percentage = 5% -> setTimeout to avoid being overide by doSizingModuleReset() in sizingModule.component.ts
    setTimeout(() => {
      this.sizingModuleForm.controls["tdsblowdownpercentage"].setValue("5");
    }, 150);        
    
    this.pressureDifferentialErrorMessage = '';

    //this.forgetCurrentlySelectedOptionItemValues();
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
  }

  /*
  * Method to reset csg sizing results.
  */
  resetResults() {
    this.csgOutputData = [];
    this.isCSGSizingDone = false;
    this.isCSGModelSelected = false;

    //if (!this.isLoadingJob && !!this.design_Code_Enumeration && !!this.design_Code_Enumeration.value) { this.storeCurrentlySelectedOptionItemValues(); }
    if (!!this.sizingModuleForm) { this.sizingModuleForm.controls["pricingOptions"].reset(); }

    this.sellingMarkupUpdated = false;
    this.grossMarginUpdated = false;

    this.translatedMessagesList = [];

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

    //tiRequestModel.moduleId = 10; // CSG ModuleId is 8 (child, Product Sizing), moduleGroupId=12 (parent)
    //tiRequestModel.code = "EVC";//this.modelName; // Selected CSG Model
    //tiRequestModel.params = ""; // any selected CSG Model extra parameters for a Ti selection?

    //tiRequestModel.moduleId = 7; // CSG ModuleId is 8 (child, Product Sizing), moduleGroupId=12 (parent)
    //tiRequestModel.code = "Safety Valve";//this.modelName; // Selected CSG Model
    //tiRequestModel.params = "SV405-TI1"; // any selected CSG Model extra parameters for a Ti selection?

    //missing http://www.spiraxsarco.com/Documents/TI/p663_01.pdf missing
    tiRequestModel.moduleId = 8; // CSG ModuleId is 8 (child, Product Sizing), moduleGroupId=12 (parent)
    tiRequestModel.languageId = -1; // not supported yet, will get default Ti language, normally 'en'
    tiRequestModel.code = "CSG";//this.modelName; // Selected CSG Model
    tiRequestModel.params = "CSG-HS"; // any selected CSG Model extra parameters for a Ti selection?

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
          title: trans_Ti_Information  + ':',
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
    this.docGen.moduleId = 12;
    this.docGen.template = "pdf";
    this.docGen.headerImage = "sxsLogo.jpg";
    this.docGen.bodyImage = "CSG.png";

    // Pass data only, labels are retrieved from database in Doc Gen dll.
    this.setSpecSheetValues();

    this.csgDocGenService.getCSGPdf(this.docGen);

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

    if (this.phase_Voltage_Enumeration.value === "Single Phase 100-240V") {
      phaseMasterText = 'SINGLE';
      phases = this.translatePipe.transform('SINGLE', false); // ToDo: This will be wrong if the SpecSheet language is not the same as the UI lLanguage.
      voltage = "100-240";
    } else {
      phaseMasterText = 'THREE';
      phases = this.translatePipe.transform('THREE', false); // ToDo: This will be wrong if the SpecSheet language is not the same as the UI lLanguage.
      if (this.phase_Voltage_Enumeration.value === "Three Phase 200-240V") {
        voltage = "200-240";
      } else {
        voltage = "380-480";
      }
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
    this.docGen.specItems.push({ name: 'Plant steam pressure', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.plantsteampressure.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Plant steam pressure unit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Plant steam flowrate', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.displayPlantSteamFlowrate, calculation: "" });
    this.docGen.specItems.push({ name: 'Plant steam flowrate unit', type: 'Unit', masterTextKey: this.massFlowRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.massFlowRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Clean steam pressure', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.cleansteampressure.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Clean steam pressure unit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Feed water pressure', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.feedwaterpressure.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Feed water pressure unit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Feed water temperature', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.feedwatertemperature.value, calculation: "" });
    this.docGen.specItems.push({ name: 'Feed water temperature unit', type: 'Unit', masterTextKey: this.temperatureRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.temperatureRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'Clean steam flowrate', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.displayCleanSteamFlowrate, calculation: "" });
    this.docGen.specItems.push({ name: 'Clean steam flowrate unit', type: 'Unit', masterTextKey: this.massFlowRef.preference.masterTextKey, sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.massFlowRef.preference.unitName, calculation: "" });
    this.docGen.specItems.push({ name: 'TDS Blow Down Percentage', type: 'Section', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: this.tdsblowdownpercentage.value, calculation: "" });
    this.docGen.specItems.push({ name: 'TDS Blow Down Percentage Unit', type: 'Unit', masterTextKey: '', sectionName: 'Process Data', targetLanguage: this.specSheetLanguage, value: '%', calculation: "" });

    // Utilities
    this.docGen.specItems.push({ name: 'Phases', type: 'Section', masterTextKey: '', sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: phases.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Phases Unit', type: 'Unit', masterTextKey: '', sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: '-', calculation: "" });
    this.docGen.specItems.push({ name: 'Supply Voltage', type: 'Section', masterTextKey: '', sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: voltage, calculation: "" });
    this.docGen.specItems.push({ name: 'Supply Voltage Unit', type: 'Unit', masterTextKey: '', sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: 'V', calculation: "" });
    this.docGen.specItems.push({ name: 'Frequency', type: 'Section', masterTextKey: '', sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: '50/60', calculation: "" });
    this.docGen.specItems.push({ name: 'Frequency Unit', type: 'Unit', masterTextKey: '', sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: 'Hz', calculation: "" });

    var airSupplyValue = this.localizeValue(this.minAirSupply, this.pressureRef.preference.decimalPlaces);
    this.docGen.specItems.push({ name: 'Air Supply Minimum', type: 'Section', masterTextKey: '', sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: airSupplyValue.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Air Supply Unit', type: 'Unit', masterTextKey: this.pressureRef.preference.masterTextKey, sectionName: 'Utilities', targetLanguage: this.specSheetLanguage, value: this.pressureRef.preference.unitName, calculation: "" });

    // Configuration
    let designCodeTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).design_Code, this.design_Code_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Design code', type: 'Section', masterTextKey: designCodeTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(designCodeTrans, false), calculation: "" });

    let shellTypeTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).shell_Type, this.shell_Type_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Shell type', type: 'Section', masterTextKey: shellTypeTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(shellTypeTrans, false), calculation: "" });

    this.docGen.specItems.push({ name: 'Unit size', type: 'Section', masterTextKey: '', sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.modelName, calculation: "" });

    let valveActuationTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).valve_Actuation, this.valve_Actuation_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Valve actuation type', type: 'Section', masterTextKey: valveActuationTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(valveActuationTrans, false), calculation: "" });

    let control = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).control, this.control_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Control', type: 'Section', masterTextKey: control, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(control, false), calculation: "" });

    let communicationInterfaceTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).communication_Interface, this.communication_Interface_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Communication interface', type: 'Section', masterTextKey: communicationInterfaceTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(communicationInterfaceTrans, false), calculation: "" });

    let frameAndCabinetTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).frame_And_Cabinet, this.frame_And_Cabinet_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Unit frame', type: 'Section', masterTextKey: frameAndCabinetTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(frameAndCabinetTrans, false), calculation: "" });

    let controlPanelLocationTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).control_Panel_Location, this.control_Panel_Location_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Control panel location', type: 'Section', masterTextKey: controlPanelLocationTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(controlPanelLocationTrans, false), calculation: "" });

    let insulationTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).insulation, this.insulation_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Insulation', type: 'Section', masterTextKey: insulationTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(insulationTrans, false), calculation: "" });

    let wheelsAndFeetTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).wheels_And_Feet, this.wheels_And_Feet_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Handling wheels and feet', type: 'Section', masterTextKey: wheelsAndFeetTrans, sectionName: 'Configuration', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(wheelsAndFeetTrans, false), calculation: "" });

    // Options
    let plantSteamInletShutOffValve = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).plant_Steam_Inlet_Shut_Off_Valve, this.plant_Steam_Inlet_Shut_Off_Valve_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Plant steam inlet shut-off valve', type: 'Section', masterTextKey: plantSteamInletShutOffValve, sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(plantSteamInletShutOffValve, false), calculation: "" });

    let plantSteamLineTrappingTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).plant_Steam_Line_Trapping, this.plant_Steam_Line_Trapping_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Plant steam line trapping', type: 'Section', masterTextKey: plantSteamLineTrappingTrans, sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(plantSteamLineTrappingTrans, false), calculation: "" });

    let tdsControlSystemTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).tds_Control_System, this.tds_Control_System_Enum.internalValue);
    this.docGen.specItems.push({ name: 'TDS control system', type: 'Section', masterTextKey: tdsControlSystemTrans, sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(tdsControlSystemTrans, false), calculation: "" });

    let sampleCoolerTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).sample_Cooler, this.sample_Cooler_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Sampling cooler', type: 'Section', masterTextKey: sampleCoolerTrans, sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(sampleCoolerTrans, false), calculation: "" });

    let lengthDecimalPlaces = this.userPrefs.find(m => m.name === "LengthUnit").decimalPlaces;

    let formattedLength = this.localeService.formatDecimal(this.length.toFixed(lengthDecimalPlaces));
    this.docGen.specItems.push({ name: 'Length', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: formattedLength.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Length Unit', type: 'Unit', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.lengthPrefUnit, calculation: "" });

    let feed = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).feedwater_Pressurisation, this.feedwater_Pressurisation_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Feedwater pressurisation system', type: 'Section', masterTextKey: feed, sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(feed, false), calculation: "" });

    let formattedHeight = this.localeService.formatDecimal(this.height.toFixed(lengthDecimalPlaces));
    this.docGen.specItems.push({ name: 'Height', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: formattedHeight.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Height Unit', type: 'Unit', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.lengthPrefUnit, calculation: "" });

    let independentLowLevelAlarmTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).independent_Low_Level_Alarm, this.independent_Low_Level_Alarm_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Independent low level alarm', type: 'Section', masterTextKey: independentLowLevelAlarmTrans, sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(independentLowLevelAlarmTrans, false), calculation: "" });

    let formattedWidth = this.localeService.formatDecimal(this.width.toFixed(lengthDecimalPlaces));
    this.docGen.specItems.push({ name: 'Width', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: formattedWidth.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Width Unit', type: 'Unit', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.lengthPrefUnit, calculation: "" });

    let massDecimalPlaces = this.userPrefs.find(m => m.name === "WeightUnit").decimalPlaces;
    let formattedDryWeight = this.localeService.formatDecimal(this.dryWeight.toFixed(massDecimalPlaces));
    this.docGen.specItems.push({ name: 'Dry weight', type: 'Section', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: formattedDryWeight.toString(), calculation: "" });
    this.docGen.specItems.push({ name: 'Weight Unit', type: 'Unit', masterTextKey: '', sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.weightPrefUnit, calculation: "" });

    let feedwaterPreHeatingDegassingTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).feedwater_Pre_Heating_Degassing, this.feedwater_Pre_Heating_Degassing_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Feedwater pre-heating', type: 'Section', masterTextKey: feedwaterPreHeatingDegassingTrans, sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(feedwaterPreHeatingDegassingTrans, false), calculation: "" });

    let intelligentDiagnosticsTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).intelligent_Diagnostics, this.intelligent_Diagnostics_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Intelligent diagnostics', type: 'Section', masterTextKey: intelligentDiagnosticsTrans, sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(intelligentDiagnosticsTrans, false), calculation: "" });

    let cleanSteamOutletShutOffValveTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).clean_Steam_Outlet_Shut_Off_Valve, this.clean_Steam_Outlet_Shut_Off_Valve_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Clean steam outlet shut-off valve', type: 'Section', masterTextKey: cleanSteamOutletShutOffValveTrans, sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(cleanSteamOutletShutOffValveTrans, false), calculation: "" });

    let testAndCertificationTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).test_And_Certification, this.test_And_Certification_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Test and certifications', type: 'Section', masterTextKey: testAndCertificationTrans, sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(testAndCertificationTrans, false), calculation: "" });

    // "Level indicator" was legacy known as "Other"
    let levelIndicatorTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).level_Indicator, this.level_Indicator_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Level indicator', type: 'Section', masterTextKey: levelIndicatorTrans, sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(levelIndicatorTrans, false), calculation: "" });
    let otherTrans = this.translationService.getEnumerationMasterKeyText(this.hashTable.find(m => m.name === this.modelName).level_Indicator, this.level_Indicator_Enum.internalValue);
    this.docGen.specItems.push({ name: 'Other', type: 'Section', masterTextKey: otherTrans, sectionName: 'Options', targetLanguage: this.specSheetLanguage, value: this.translatePipe.transform(otherTrans, false), calculation: "" });

    // Product
    this.docGen.specItems.push({ name: 'Unit nomenclature build', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.nomenclature, calculation: "" });
    this.docGen.specItems.push({ name: 'Plant steam inlet connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.plantSteamInletConnection, calculation: "" });
    this.docGen.specItems.push({ name: 'Condensate outlet connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.condensateOutletConnection, calculation: "" });
    this.docGen.specItems.push({ name: 'Clean steam outlet connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.cleanSteamOutletConnection, calculation: "" });
    this.docGen.specItems.push({ name: 'Feedwater inlet connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.feedwaterInletConnection, calculation: "" });
    this.docGen.specItems.push({ name: 'Safety valve discharge', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.safetyValveDischarge, calculation: "" });
    this.docGen.specItems.push({ name: 'Not condensable vent connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.notCondensableVentConnection, calculation: "" });
    this.docGen.specItems.push({ name: 'Drain connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.drainConnection, calculation: "" });
    this.docGen.specItems.push({ name: 'Plant steam condensate drain connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.plantSteamCondensateDrainConnection, calculation: "" });
    this.docGen.specItems.push({ name: 'TDS Blowdown connection', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.tdsBlowdownConnection, calculation: "" });
    this.docGen.specItems.push({ name: 'Sampling System', type: 'Section', masterTextKey: '', sectionName: 'Product', targetLanguage: this.specSheetLanguage, value: this.samplingSystem, calculation: "" });

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
      this.docGen.specItems.push({ name: 'Message ' + (i + 1).toString(), type: 'Section', masterTextKey: messageMasterTextKey, sectionName: 'Messages', targetLanguage: this.specSheetLanguage, value: messageValue, calculation: "" });
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

  get csgOutputDataRows(): CleanSteamGeneratorOutput[] {
    return this.csgOutputData;
  }

  /**
   * Data table selection changed method
   */
  onSelect(event: any) {
    var selectedRow = event.selected as CleanSteamGeneratorOutput[];

//    this.storeCurrentlySelectedOptionItemValues();
    this.setupDefaultOptionsForSizingSelection(selectedRow[0]);
    this.selectCSGOutputDataRow(selectedRow[0]);
  }

  /**
   * Data table selection changed method implementation.
   */
  selectCSGOutputDataRow(selectedRow: CleanSteamGeneratorOutput) {

    this.selectedOutputData[0] = selectedRow;

    this.isCSGModelSelected = true;

    this.modelId = selectedRow.modelId;
    this.modelName = selectedRow.modelName;
    this.length = selectedRow.length;
    this.height = selectedRow.height;
    this.width = selectedRow.width;
    this.dryWeight = selectedRow.dryWeight;
    this.plantSteamInletConnection = selectedRow.plantSteamInletConnection;
    this.condensateOutletConnection = selectedRow.condensateOutletConnection;
    this.cleanSteamOutletConnection = selectedRow.cleanSteamOutletConnection;
    this.feedwaterInletConnection = selectedRow.feedwaterInletConnection;
    this.safetyValveDischarge = selectedRow.safetyValveDischarge;
    this.notCondensableVentConnection = selectedRow.notCondensableVentConnection;
    this.drainConnection = selectedRow.drainConnection;
    this.plantSteamCondensateDrainConnection = selectedRow.plantSteamCondensateDrainConnection;
    this.tdsBlowdownConnection = selectedRow.tdsBlowdownConnection;
    this.samplingSystem = selectedRow.samplingSystem;
    this.plantSteamFlowrate = selectedRow.plantSteamFlowrate;
    this.displayPlantSteamFlowrate = selectedRow.displayPlantSteamFlowrate;
    this.displayCleanSteamFlowrate = selectedRow.displayCleanSteamFlowrate;
    this.minAirSupply = selectedRow.minAirSupply;
    this.show_feedwater_Pre_Heating_Option_Message = false;

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
    if (this.csgOutputDataTable) {
      this.csgOutputDataTable.rowDetail.toggleExpandRow(selectedRow);
    }

    this.design_Code_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).design_Code;
    this.shell_Type_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).shell_Type;
    this.valve_Actuation_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).valve_Actuation;
    this.control_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).control;
    this.communication_Interface_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).communication_Interface;
    this.frame_And_Cabinet_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).frame_And_Cabinet;
    this.control_Panel_Location_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).control_Panel_Location;
    this.insulation_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).insulation;
    this.wheels_And_Feet_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).wheels_And_Feet;
    this.plant_Steam_Inlet_Shut_Off_Valve_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).plant_Steam_Inlet_Shut_Off_Valve;
    this.plant_Steam_Line_Trapping_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).plant_Steam_Line_Trapping;
    this.tds_Control_System_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).tds_Control_System;
    this.sample_Cooler_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).sample_Cooler;
    this.independent_Low_Level_Alarm_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).independent_Low_Level_Alarm;
    this.feedwater_Pre_Heating_Degassing_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).feedwater_Pre_Heating_Degassing;
    this.intelligent_Diagnostics_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).intelligent_Diagnostics;
    this.clean_Steam_Outlet_Shut_Off_Valve_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).clean_Steam_Outlet_Shut_Off_Valve;
    this.test_And_Certification_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).test_And_Certification;
    this.level_Indicator_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).level_Indicator;
    this.feedwater_Pressurisation_Enum_Name = this.hashTable.find(m => m.name === selectedRow.modelName).feedwater_Pressurisation;

    // LP30/LP20 list visibility rule.
    this.filterIndependentLowLevelAlarmList(this.level_Indicator_Enumeration.value);

    //if (!this.isLoadingJob) {
    //  this.restoreCurrentlySelectedOptionItemValues();
    //}

    // Update the flag so that spec sheet could be generated.
    this.isSpecSheetEnabled = true;
    
    this.alertVisible = true;
    
    // Calculate the CSG price.
    setTimeout(() => {
       this.calculatePrice();
    }, 100);        
  }

  restoreOrDefaultSelectedListItem(optionName: string, last_Selected_Option_Item_Value: string, enum_Name: string, filter_Scope_Of_Values_List: any[], theFromControl:FormControl) {

    if (!!last_Selected_Option_Item_Value) {      

      // Get the specific module prefernce OpCo overide enumeration list for this specific CSG model
      var trans_List = this.translationService.displayGroup.enumerations.filter(mp => mp.opCoOverride === true && mp.enumerationName === enum_Name)[0];

      // Is the store value not null?
      // Is the stored list item available in the current list for?
      if (!!last_Selected_Option_Item_Value && filter_Scope_Of_Values_List.indexOf(last_Selected_Option_Item_Value) >= 0) {

        // If the selected item has changed then set it.
        //if (theFromControl.value !== last_Selected_Option_Item_Value) {
          // restore selected list item option
          theFromControl.setValue(last_Selected_Option_Item_Value);
        //}
      }
      else {
        // If list item not available anymore then get current list set, default first item and notify user.

        // The previously selected list item is not available on this model, put in the default remaining item(s) from translations.
        if (!!trans_List && !!trans_List.enumerationDefinitions && trans_List.enumerationDefinitions.length > 0) {

          // Is the stored list item available in the enum list for?
          if (!trans_List.enumerationDefinitions.find(l => l.value == last_Selected_Option_Item_Value)) {
            // set list default item and notify user
            theFromControl.setValue(trans_List.enumerationDefinitions[0].value); // Set default to first item
            this.notifyAvailableOptionsHaveChanged(optionName);
          }
          else {
            // If the selected item has changed then set it.
            //if (theFromControl.value !== last_Selected_Option_Item_Value) {
              // restore selected list item option
              theFromControl.setValue(last_Selected_Option_Item_Value);
            //}
          }
        }
      }
    }
  }

  // Set list option and notify user if list item avalability has changed
  filterRestoreOrDefaultSelectedListItem(optionName: string, last_Selected_Option_Item_Value: string, enum_Name: string, filter_Scope_Of_Values_List: any[], theFromControl: FormControl) {

    //if (theFromControl.value === last_Selected_Option_Item_Value) {
    //  theFromControl.setValue(last_Selected_Option_Item_Value);
    //  return;
    //}

    // if the stored selected list item is in the new filter_list then use it, otherwise  use default from filter_list
    if (!!last_Selected_Option_Item_Value && filter_Scope_Of_Values_List.indexOf(last_Selected_Option_Item_Value) < 0) {
      // List Item not in the filer list, so cannot select the item, revert to default and notify.

      last_Selected_Option_Item_Value = filter_Scope_Of_Values_List[0]; // deafult to the first item
      if (theFromControl.value !== last_Selected_Option_Item_Value) {
        theFromControl.setValue(last_Selected_Option_Item_Value);
      }

      this.notifyAvailableOptionsHaveChanged(optionName);
    }
    else {
        // List item is available in the filter list, select it.
        // Attempt to restore or default the list option
        this.restoreOrDefaultSelectedListItem(optionName, last_Selected_Option_Item_Value, enum_Name, filter_Scope_Of_Values_List, theFromControl);      
    }
  }

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

    if (!this.sellingCurrency || !this.sellingCurrency.symbol || this.sellingCurrency === null || this.sellingCurrency.symbol === null) {
      // try to get module prefs again
      this.getModulePreferenceValues();

      if (!this.sellingCurrency || !this.sellingCurrency.symbol || this.sellingCurrency === null || this.sellingCurrency.symbol === null) {

        let trans_Error = "DEBUG!"; // this.translatePipe.transform('ERROR', true);
        let trans_Message = "Unable to caclculate Pricing data. Module Preferences have failed to load, please refresh the page and try again."; // this.translatePipe.transform('SELECTED_JOB_WAS_NOT_FOUND_MESSAGE', true);

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

    // Ensure that the prices are displayed in current selling currency from the module prefs.
    this.sellingCurrencySymbol = this.sellingCurrency.symbol;
    
    this.csgPricing.modelId = this.modelId;    
    this.csgPricing.manufacturerId = this.manufacturerId;
    this.csgPricing.basePriceOption = this.basePriceOption;
    this.csgPricing.localRecommendedSalesPriceOption = this.localRecommendedSalesPriceOption;
    this.csgPricing.landedCostIncreaseFactor = this.landedCostIncreaseFactor;
    this.csgPricing.pricingOptions = [];

    this.csgPricing.sizingMessages = this.messagesService.messages;

    // Check and add options    
    // this.csgPricing.pricingOptions.push({ enumerationName: this.design_Code_Enum.enumerationName, selectedValue: this.design_Code_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.design_Code_Enum.enumerationName, selectedValue: this.design_Code_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.shell_Type_Enum.enumerationName, selectedValue: this.shell_Type_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.valve_Actuation_Enum.enumerationName, selectedValue: this.valve_Actuation_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.control_Enum.enumerationName, selectedValue: this.control_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.communication_Interface_Enum.enumerationName, selectedValue: this.communication_Interface_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.frame_And_Cabinet_Enum.enumerationName, selectedValue: this.frame_And_Cabinet_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.control_Panel_Location_Enum.enumerationName, selectedValue: this.control_Panel_Location_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.insulation_Enum.enumerationName, selectedValue: this.insulation_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.wheels_And_Feet_Enum.enumerationName, selectedValue: this.wheels_And_Feet_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.plant_Steam_Inlet_Shut_Off_Valve_Enum.enumerationName, selectedValue: this.plant_Steam_Inlet_Shut_Off_Valve_Enum.internalValue });

    // SSP for Plant steam line trapping is dependant on Frame And Cabinet selection.
    this.csgPricing.pricingOptions.push({ enumerationName: this.plant_Steam_Line_Trapping_Enum.enumerationName, selectedValue: this.plant_Steam_Line_Trapping_Enum.internalValue});
    this.csgPricing.pricingOptions.push({ enumerationName: this.tds_Control_System_Enum.enumerationName, selectedValue: this.tds_Control_System_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.sample_Cooler_Enum.enumerationName, selectedValue: this.sample_Cooler_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.independent_Low_Level_Alarm_Enum.enumerationName, selectedValue: this.independent_Low_Level_Alarm_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.feedwater_Pre_Heating_Degassing_Enum.enumerationName, selectedValue: this.feedwater_Pre_Heating_Degassing_Enum.internalValue });
    // SSP for Intelligent diagnostics is dependant on Valve Actuation selection.
    this.csgPricing.pricingOptions.push({ enumerationName: this.intelligent_Diagnostics_Enum.enumerationName, selectedValue: this.intelligent_Diagnostics_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.clean_Steam_Outlet_Shut_Off_Valve_Enum.enumerationName, selectedValue: this.clean_Steam_Outlet_Shut_Off_Valve_Enum.internalValue });

    // Defend condition wher Bad ModPref and UI filtering remove the None_N option, crashes pricing API and subsequent nomenclature build.
    this.csgPricing.pricingOptions.push({ enumerationName: this.test_And_Certification_Enum.enumerationName, selectedValue: !this.test_And_Certification_Enum.internalValue ? "None_N" : this.test_And_Certification_Enum.internalValue });
    this.csgPricing.pricingOptions.push({ enumerationName: this.level_Indicator_Enum.enumerationName, selectedValue: this.level_Indicator_Enum.internalValue });

    this.csgPricing.pricingOptions.push({ enumerationName: this.feedwater_Pressurisation_Enum.enumerationName, selectedValue: this.feedwater_Pressurisation_Enum.internalValue });

    this.cleanSteamGeneratorService.calculateTotalPrice(this.csgPricing).subscribe((response: CleanSteamGeneratorPricingOutput) => {
     // First, check if any valid data returned?
      if (response && response.totalSalesPrice > 0 && response.totalRecommendedSalesPrice > 0) {

        //this.debugData = this.debugData + "*----------------------------- calculatePrice() start -----------------------------";
        //this.debugData = this.debugData + "\n manufacturerCurrency=" + this.manufacturerCurrency.translationText + " " + this.manufacturerCurrency.symbol + ", rateToGbp=" + this.manufacturerCurrency.rateToGbp + ", Id=" + this.manufacturerCurrency.id + ", currencyCode=" + this.manufacturerCurrency.currencyCode;
        //this.debugData = this.debugData + "\n sellingCurrency=" + this.sellingCurrency.translationText + " " + this.sellingCurrency.symbol + ", rateToGbp=" + this.sellingCurrency.rateToGbp + ", Id=" + this.sellingCurrency.id + ", currencyCode=" + this.sellingCurrency.currencyCode;
        //this.debugData = this.debugData + "\n landedCostIncreaseFactor=" + this.landedCostIncreaseFactor + "(~ " + (this.landedCostIncreaseFactor - 1) * 100 + "%)" + ", modelId=" + this.modelId + ", manufacturerId=" + this.manufacturerId + ", basePriceOption=" + this.basePriceOption + ", localRecommendedSalesPriceOption=" + this.localRecommendedSalesPriceOption + ", hideAllPricingUserPref=" + this.hideAllPricingUserPref + ", hideManufactureCostsUserPref=" + this.hideManufactureCostsUserPref;

        // Price data returned, so convert them before using them for calculations below.
        this.csgPricingOutputData.totalSalesPrice = response.totalSalesPrice / this.currencyConversionRate;
        //this.debugData = this.debugData + "\n landed totalSalesPrice=" + response.totalSalesPrice + ", currencyConversionRate=" + this.currencyConversionRate + ", sellingCurrency.symbol=" + this.sellingCurrency.symbol + ", totalSalesPrice / currencyConversionRate=" + this.csgPricingOutputData.totalSalesPrice + " " + this.sellingCurrency.symbol;

        this.csgPricingOutputData.totalRecommendedSalesPrice = response.totalRecommendedSalesPrice / this.currencyConversionRate;
        //this.debugData = this.debugData + "\n landed totalRecommendedSalesPrice=" + response.totalRecommendedSalesPrice + ", totalRecommendedSalesPrice / currencyConversionRate=" + this.csgPricingOutputData.totalRecommendedSalesPrice + " " + this.sellingCurrency.symbol;

        // Now, calculate the following factors and also calculate the total cost.
        this.internal_SSP = this.csgPricingOutputData.totalSalesPrice;
        ////this.debugData = this.debugData + "\n internal_SSP=" + this.internal_SSP;

        this.internal_SellingPrice = this.csgPricingOutputData.totalRecommendedSalesPrice;
        ////this.debugData = this.debugData + "\n internal_SellingPrice=" + this.internal_SellingPrice;

        this.display_SSP = this.localizeValue(this.internal_SSP, 0);

        this.display_SellingPrice = this.localizeValue(this.internal_SellingPrice, 0);

        this.display_DeliveryPrice = this.localizeValue(this.deliveryCost, 0);
        //this.debugData = this.debugData + "\n display_SSP=" + this.display_SSP + " " + this.sellingCurrency.symbol + ", display_SellingPrice=" + this.display_SellingPrice + " " + this.sellingCurrency.symbol + ", display_DeliveryPrice=" + this.display_DeliveryPrice + " " + this.sellingCurrency.symbol;

        this.calculateTotalPrice();

        this.setQuotationValidationMessage(new Date);

        // Finally, calculate selling markup/gross margin. However, before calculating these figures, first check if this is initial calc or any of these fields have been manually updated? If so then re-calculate them accordingly.
        if (!this.sellingMarkupUpdated && !this.grossMarginUpdated) {
          this.calculateSellingMarkup();
          this.calculateGrossMargin();
        } else {
          if (this.sellingMarkupUpdated) {
            this.calculateSellingPriceFromSellingMarkup(this.sellingMarkupFormControl.value);
          } else {
            this.calculateSellingPriceFromGrossMargin(this.grossMarginFormControl.value);
          }
        }
      } else if (response.totalSalesPrice == 0 && response.totalRecommendedSalesPrice == 0) {

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

        });
        //return;

    }

      //this.debugData = this.debugData + "\n*----------------------------- calculatePrice() end   -----------------------------";
      if (!this.debugDataEnabled) {
        this.debugData = "";
      }
      //this.scrollToElement(this.priceResultsContent, "start");
    });

    this.buildNomenclature();

    this.augmentPriceDataToOptionsLists();
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
      this.display_SellingPrice = this.localizeValue(this.internal_SellingPrice, 0);

      //this.debugData = this.debugData + "\n\n calculateSellingPriceFromSellingMarkup(sellingMarkupFormControl.value)" + ", internal_SellingPrice=" + "internal_SSP * sellingMarkupFormControl.value";
      //this.debugData = this.debugData + "\n internal_SellingPrice=" + this.internal_SSP + " * " + value;
      //this.debugData = this.debugData + "\n display_SellingPrice=" + this.display_SellingPrice;

      // Update gross margin.
      this.calculateGrossMargin();
    }

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

      this.display_SellingPrice = this.localizeValue(this.internal_SellingPrice, 0);
      //this.debugData = this.debugData + "\n display_SellingPrice=" + this.display_SellingPrice;

      // Update selling markup.
      this.calculateSellingMarkup();
    }

    this.calculateTotalPrice();
  }

  /*
  * Method to update Selling price on Selling Markup change.
  */
  onSellingMarkupChange(value: any) {
    // Update the appropriate flags.
    this.sellingMarkupUpdated = true;
    this.grossMarginUpdated = false;

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

    this.calculateSellingPriceFromGrossMargin(value);

    //this.scrollToElement(this.priceResultsContent, "start");
  }

  /*
  * Method to build the nomenclature from the CSG model and options selections.
  */
  buildNomenclature() {
    this.nomenclature = this.modelName.split(" ")[0];

    this.nomenclature += '-' + this.design_Code_Enum.internalValue.split("_")[1];
    this.nomenclature += this.shell_Type_Enum.internalValue.split("_")[1];
    this.nomenclature += this.modelName.split(" ")[1];
    this.nomenclature += this.valve_Actuation_Enum.internalValue.split("_")[1];
    this.nomenclature += this.control_Enum.internalValue.split("_")[1];
    this.nomenclature += this.communication_Interface_Enum.internalValue.split("_")[1];
    this.nomenclature += this.frame_And_Cabinet_Enum.internalValue.split("_")[1];
    this.nomenclature += this.control_Panel_Location_Enum.internalValue.split("_")[1];
    this.nomenclature += this.insulation_Enum.internalValue.split("_")[1];
    this.nomenclature += this.wheels_And_Feet_Enum.internalValue.split("_")[1];

    this.nomenclature += '-' + this.plant_Steam_Inlet_Shut_Off_Valve_Enum.internalValue.split("_")[1];
    this.nomenclature += this.plant_Steam_Line_Trapping_Enum.internalValue.split("_")[1];
    this.nomenclature += this.tds_Control_System_Enum.internalValue.split("_")[1];
    this.nomenclature += this.sample_Cooler_Enum.internalValue.split("_")[1];
    this.nomenclature += this.feedwater_Pressurisation_Enum.internalValue.split("_")[1];
    this.nomenclature += this.independent_Low_Level_Alarm_Enum.internalValue.split("_")[1];
    this.nomenclature += this.feedwater_Pre_Heating_Degassing_Enum.internalValue.split("_")[1];
    this.nomenclature += this.intelligent_Diagnostics_Enum.internalValue.split("_")[1];
    this.nomenclature += this.clean_Steam_Outlet_Shut_Off_Valve_Enum.internalValue.split("_")[1];

    // Defend condition wher Bad ModPref and UI filtering remove the None_N option, crashes pricing API and subsequent nomenclature build.
    this.nomenclature += !this.test_And_Certification_Enum.internalValue ? "N" : this.test_And_Certification_Enum.internalValue.split("_")[1];
    this.nomenclature += this.level_Indicator_Enum.internalValue.split("_")[1];

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

  augmentPriceDataToOptionsLists() {

    // Only done once when any price change first happens and user can see RSPs (not a 1 star or user pref set to hide pricing).
    if (this.augmentPriceDataDone || this.hideAllPricing) {
      return;
    }

    this.csgPricing.modelId = -1; // Get prices for all models

    // Get RSP Display price data for List item Augmentation
    this.cleanSteamGeneratorService.calculateBOMPrice(this.csgPricing).subscribe((response: CleanSteamGeneratorBOMPriceOutput) => {
      if (response) {
        this.csgBOMOutputData = response;
        let localPrices: string = "";

        this.csgBOMOutputData.bomItems.forEach(t => {
          // Translate table of BOM items :
          //t.itemTranslation = this.translatePipe.transform(t.itemMasterTextKey, false).toString();
          //t.parentTranslation = this.translatePipe.transform(t.parentMasterTextKey, false).toString();
          //t.sDisplayedRSP = this.localizeValue(t.sDisplayedRSP, 0);

          // Append prices to list translation on UI
          this.translationService.displayGroup.enumerations.forEach(e => {
            e.enumerationDefinitions.forEach(d => {
              if (d.value == t.item && e.enumerationName == t.parent) { // && d.translationText.indexOf(' ' + this.sellingCurrencySymbol + ' ') < 0) {
                var signText = (parseFloat(t.sDisplayedRSP) > 0.0) ? "+" : ""; // add '+' to positive prices.
                localPrices = ' ' + this.sellingCurrencySymbol + ' ' + signText + this.localizeValue(t.sDisplayedRSP, 0)

                // Set the UI text
                d.extraPostText = localPrices;
              }
            });
          });

        })// of append prices

        this.csgBOMOutputDataRows = this.csgBOMOutputData.bomItems;
        //this.debugData = JSON.stringify(this.csgBOMOutputData.bomItems);

        this.augmentPriceDataDone = true;
      }
    }); // end of service response
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
    job.productName = "CSG";
    this.moduleId = 8;
    this.productName = "CSG";

    if (this.csgOutputDataRows.length > 1) {
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

    this.sizingModuleForm.markAsUntouched();

    return jobSizing;
  }

  saveData(jobSizing: JobSizing, project: Project, job: Job,
    sizingData: SizingData, processConditions: Array<ProcessCondition>,
    processInputs: Array<ProcessInput>, unitPreferences: Array<Preference>, outputGridRow: OutputGridRow,
    outputGridRows: Array<OutputGridRow>, outputItems: Array<OutputItem>): JobSizing {

    //save process conditions
    processInputs.push({ name: "Plant Steam Pressure", value: this.plantsteampressure.value, unitId: parseInt(this.pressureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Clean Steam Pressure", value: this.cleansteampressure.value, unitId: parseInt(this.pressureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Feedwater Pressure", value: this.feedwaterpressure.value, unitId: parseInt(this.pressureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Feedwater Temperature", value: this.feedwatertemperature.value, unitId: parseInt(this.temperatureRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Required Clean Steam Flowrate", value: this.requiredcleansteamflowrate.value, unitId: parseInt(this.massFlowRef.preference.value), listItemId: null, value2: "", childInputs: null });
    processInputs.push({ name: "Tds Blowdown Percentage", value: this.tdsblowdownpercentage.value, unitId: null, listItemId: null, value2: "", childInputs: null });

    // Save unit preferences.
    unitPreferences.push(this.pressureRef.preference);
    unitPreferences.push(this.temperatureRef.preference);
    unitPreferences.push(this.massFlowRef.preference);
    unitPreferences.push(this.loadRef.preference);

    processConditions.push({ name: "csg sizing", processInputs: processInputs, unitPreferences: unitPreferences });

    sizingData.processConditions = new Array<ProcessCondition>();
    sizingData.processConditions = processConditions;

    //save sizing grid results
    outputGridRow.outputItems = [];
    outputGridRow.messages = [];

    this.csgOutputDataRows.forEach(obj => {

      if (this.selectedOutputData.length > 0) {
        if (obj.modelId === this.selectedOutputData[0].modelId) {
          this.gridSelectedRow = true;
          this.loadOptions = true;

          if (!!this.selectedOutputData[0].modelSizingMessages) {

            this.selectedOutputData[0].modelSizingMessages.forEach(m => {

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
          this.gridSelectedRow = false;
        }
      } else {
        this.gridSelectedRow = false;
      }

      outputGridRow.outputItems.push({
        name: "Model Id",
        value: obj.modelId.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Model Name",
        value: obj.modelName,
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Clean Steam Flow Rate",
        value: obj.cleanSteamFlowrate.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Plant Steam Flow Rate",
        value: obj.plantSteamFlowrate.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Feed Water Flow Rate",
        value: obj.feedwaterFlowrate.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Blow Down Flow Rate",
        value: obj.blowDownFlowrate.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Pressurised Deaerator Inlet Flow Rate",
        value: obj.pressurisedDeaeratorOutletFlowrate.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Pressurised Deaerator Outlet Flow Rate",
        value: obj.pressurisedDeaeratorOutletFlowrate.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Heat Exchanger Duty",
        value: obj.heatExchangerDuty.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "OverDesign",
        value: obj.overdesign.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Length",
        value: obj.length.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Height",
        value: obj.height.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "Width",
        value: obj.width.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "DryWeight",
        value: obj.dryWeight.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "PlantSteamInletConnection",
        value: obj.plantSteamInletConnection.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "CondensateOutletConnection",
        value: obj.condensateOutletConnection.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "CleanSteamOutletConnection",
        value: obj.cleanSteamOutletConnection.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "FeedwaterInletConnection",
        value: obj.feedwaterInletConnection.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "SafetyValveDischarge",
        value: obj.safetyValveDischarge.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "NotCondensableVentConnection",
        value: obj.notCondensableVentConnection.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "DrainConnection",
        value: obj.drainConnection.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "PlantSteamCondensateDrainConnection",
        value: obj.plantSteamCondensateDrainConnection.toString(), //"DN25 PN40","DN25 PN40",
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "TdsBlowdownConnection",
        value: obj.tdsBlowdownConnection.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "SamplingSystem",
        value: obj.samplingSystem.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "MinAirSupply",
        value: obj.minAirSupply.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRow.outputItems.push({
        name: "IsPumpMandatory",
        value: obj.isPumpMandatory.toString(),
        unitId: null,
        selected: this.gridSelectedRow,
        listItemId: null,
        type: null
      });

      outputGridRows.push(outputGridRow);

      //clear for next iteration
      outputGridRow = new OutputGridRow();
      outputGridRow.outputItems = [];
      outputGridRow.messages = [];
    });

    //save options and price
    if (this.loadOptions) {
      outputItems.push({ name: this.design_Code_Enum_Name, value: this.design_Code_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.shell_Type_Enum_Name, value: this.shell_Type_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.valve_Actuation_Enum_Name, value: this.valve_Actuation_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.control_Enum_Name, value: this.control_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.communication_Interface_Enum_Name, value: this.communication_Interface_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.frame_And_Cabinet_Enum_Name, value: this.frame_And_Cabinet_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.control_Panel_Location_Enum_Name, value: this.control_Panel_Location_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.insulation_Enum_Name, value: this.insulation_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.wheels_And_Feet_Enum_Name, value: this.wheels_And_Feet_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.plant_Steam_Inlet_Shut_Off_Valve_Enum_Name, value: this.plant_Steam_Inlet_Shut_Off_Valve_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.plant_Steam_Line_Trapping_Enum_Name, value: this.plant_Steam_Line_Trapping_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.tds_Control_System_Enum_Name, value: this.tds_Control_System_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.sample_Cooler_Enum_Name, value: this.sample_Cooler_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.independent_Low_Level_Alarm_Enum_Name, value: this.independent_Low_Level_Alarm_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.feedwater_Pre_Heating_Degassing_Enum_Name, value: this.feedwater_Pre_Heating_Degassing_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.intelligent_Diagnostics_Enum_Name, value: this.intelligent_Diagnostics_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.clean_Steam_Outlet_Shut_Off_Valve_Enum_Name, value: this.clean_Steam_Outlet_Shut_Off_Valve_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.test_And_Certification_Enum_Name, value: this.test_And_Certification_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: this.level_Indicator_Enum_Name, value: this.level_Indicator_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });

      // Pump and Phase/voltage selections.
      outputItems.push({ name: this.feedwater_Pressurisation_Enum_Name, value: this.feedwater_Pressurisation_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "CSG_Phase_Voltage", value: this.phase_Voltage_Enumeration.value, unitId: null, selected: false, listItemId: null, type: null });

      // Option visibility status
      outputItems.push({ name: "Show_Plant_Steam_Line_Trapping", value: this.show_plant_Steam_Line_Trapping.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Show_Sample_Cooler", value: this.show_sample_Cooler.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Show_Independent_Low_Level_Alarm", value: this.show_independent_Low_Level_Alarm.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Show_Feedwater_Pre_Heating_Degassing", value: this.show_feedwater_Pre_Heating_Degassing.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Show_feedwater_Pre_Heating_Option_Message", value: this.show_feedwater_Pre_Heating_Option_Message.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Show_Intelligent_Diagnostics", value: this.show_intelligent_Diagnostics.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Show_Clean_Steam_Outlet_Shut_Off_Valve", value: this.show_clean_Steam_Outlet_Shut_Off_Valve.toString(), unitId: null, selected: false, listItemId: null, type: null });

      // Pricing details
      outputItems.push({ name: "SellingCurrencySymbol", value: this.sellingCurrencySymbol, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "SSP", value: this.internal_SSP.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Selling Price", value: this.internal_SellingPrice.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Service Offering Label", value: this.serviceOfferingKey, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Service Offering Price", value: this.internal_ServiceOfferingPrice.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Delivery Cost", value: this.deliveryCost.toString(), unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Total Price", value: this.internal_TotalPrice.toString(), unitId: null, selected: false, listItemId: null, type: null });

      outputItems.push({ name: "Selling Markup", value: this.sellingMarkupFormControl.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Gross Margin", value: this.grossMarginFormControl.value, unitId: null, selected: false, listItemId: null, type: null });
      outputItems.push({ name: "Service Offering Enumeration", value: this.serviceOfferingOptionsFormControl.value, unitId: null, selected: false, listItemId: null, type: null });

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

    this.sizingModuleForm.markAsPristine();
    this.sizingModuleForm.markAsUntouched();
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
      case "No Commissioning":
        this.internal_ServiceOfferingPrice = 0;
        this.serviceOfferingKey = this.translatePipe.transform('NO_COMMISSIONING', false);
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
    if (event && event.selectedValue) {

      switch (optionName) {

        case 'design_Code_Enum':
          this.filterTestAndCertificationList();
          break;

        case 'frame_And_Cabinet_Enum':
          // Set available Trapping list options based on the selected Frame and Cabinet (Basement or Frame)
          this.filterPlantSteamLineTrappingList();

          // Control Panel Location
          //switch (event.selectedValue.split("_")[1]) {
          //  case "0":
          //  case "3":
          //    this.control_Panel_Location_List = ['Side_S'];
          //    break;

          //  case "1":
          //  case "2":
          //  case "4":
          //  case "5":
          //    this.control_Panel_Location_List = ['Front_F'];
          //    break;
          //}
          //// Set the default selection.
          //if (this.control_Panel_Location_List.length > 0) {
          //  this.control_Panel_Location_Enumeration.setValue(this.control_Panel_Location_List[0]);
          //}
          
          // Plant Steam Inlet Shut-Off Valve
          this.filterPlantSteamInletShutOffValveList();

          break;
          
        case 'valve_Actuation_Enum':
          
          // Plant Steam Inlet Shut-Off Valve
          //this.filterPlantSteamInletShutOffValveList();

          // Clean Steam Outlet Shut-Off Valve
          this.filterCleanSteamOutletShutOffValveList();

          // Intelligent Diagnostics
          this.filterIntelligentDiagnosticsList();
          break;

        case 'feedwater_Pressurisation_Enum':          
          this.filterPhaseVoltageList(event.selectedValue);
          break;

        case 'plant_Steam_Line_Trapping_Enum':
          this.show_plant_Steam_Line_Trapping = this.getOptionVisibilityStatus(event);
          if (!this.isLoadingJob && this.show_plant_Steam_Line_Trapping) {
            // Default or Restore previously selected list item for 'Plant steam line trapping' when filter changed by 'Frame and Cabinet' list item change, see filterPlantSteamLineTrappingList().
            // Set list option and notify user if list item avalability has changed.
            this.filterRestoreOrDefaultSelectedListItem('PLANT_STEAM_LINE_TRAPPING', this.plant_Steam_Line_Trapping_Selected_Option_Item_Value, this.plant_Steam_Line_Trapping_Enum_Name, this.plant_Steam_Line_Trapping_List, this.plant_Steam_Line_Trapping_Enumeration);
          }
          break;

        case 'sample_Cooler_Enum':
          this.show_sample_Cooler = this.getOptionVisibilityStatus(event);
          break;

        case 'independent_Low_Level_Alarm_Enum':
          this.show_independent_Low_Level_Alarm = this.getOptionVisibilityStatus(event);
          if (!this.isLoadingJob && this.show_independent_Low_Level_Alarm) {
            // Default or Restore previously selected list item for 'Independent Downstream Plant Protection' when filter changed by 'Level Indicator' list item change, see filterIndependentLowLevelAlarmList().
            // Set list option and notify user if list item avalability has changed.
            this.filterRestoreOrDefaultSelectedListItem('INDEPENDENT_LOW_LEVEL_ALARM', this.independent_Low_Level_Alarm_Selected_Option_Item_Value, this.independent_Low_Level_Alarm_Enum_Name, this.independent_Low_Level_Alarm_List, this.independent_Low_Level_Alarm_Enumeration);
          }
          break;

        case 'feedwater_Pre_Heating_Degassing_Enum':
          this.show_feedwater_Pre_Heating_Degassing = this.getOptionVisibilityStatus(event);
          
          if (!this.isLoadingJob && !this.sizingModuleForm.pristine) {
            this.show_feedwater_Pre_Heating_Option_Message = this.isFeedwaterPreheaterSelected(event);
          }
          break;

        case 'intelligent_Diagnostics_Enum':
          this.show_intelligent_Diagnostics = this.getOptionVisibilityStatus(event);
          if (!this.isLoadingJob && this.show_intelligent_Diagnostics) {
            // Default or Restore previously selected list item for 'Intelligent diagnostics' when filter changed by 'Valve Actuation' list item change, see filterIntelligentDiagnosticsList().
            // Set list option and notify user if list item avalability has changed.
            this.filterRestoreOrDefaultSelectedListItem('INTELLIGENT_DIAGNOSTICS', this.intelligent_Diagnostics_Selected_Option_Item_Value, this.intelligent_Diagnostics_Enum_Name, this.intelligent_Diagnostics_List, this.intelligent_Diagnostics_Enumeration);
          }         
          break;

        case 'clean_Steam_Outlet_Shut_Off_Valve_Enum':
          this.show_clean_Steam_Outlet_Shut_Off_Valve = this.getOptionVisibilityStatus(event);
          break;

        case 'level_Indicator_Enum':
          this.filterIndependentLowLevelAlarmList(event.selectedValue);
          break;
      }
    }

    this.cdRef.detectChanges(); // This ain't good, I wonder why we call this here?
  }

  /*
   * Filters plant steam inlet shut off valve list based on frame selections.
   */
  filterPlantSteamInletShutOffValveList() {    
    // Ensure that the dependencies are set before accessing them.
    //if (this.frame_And_Cabinet_Enumeration) {
    //  switch (this.frame_And_Cabinet_Enumeration.value.split("_")[1]) {
    //  case "0":
    //  case "1":
    //  case "3":
    //      switch (this.valve_Actuation_Enumeration.value.split("_")[1]) {
    //        case "PN":
    //          this.plant_Steam_Inlet_Shut_Off_Valve_List = ['Inlet Manual stop valve_M', 'Inlet Automatic stop valve (pneumatic)_AP'];
    //          break;
    //        case "EL":
    //          this.plant_Steam_Inlet_Shut_Off_Valve_List = ['Inlet Manual stop valve_M', 'Inlet Automatic stop valve (electric)_AE'];
    //          break;
    //      }
    //      break;

    //    case "2":
    //    case "5":
    //      switch (this.valve_Actuation_Enumeration.value.split("_")[1]) {
    //        case "PN":
    //          this.plant_Steam_Inlet_Shut_Off_Valve_List = ['Inlet Automatic stop valve (pneumatic)_AP'];
    //          break;
    //        case "EL":
    //          this.plant_Steam_Inlet_Shut_Off_Valve_List = ['Inlet Automatic stop valve (electric)_AE'];
    //          break;
    //      }
    //      break;

    //  }

    //  // Set the default selection.
    //  if (this.plant_Steam_Inlet_Shut_Off_Valve_List.length > 0 && this.sizingModuleForm.touched) {
    //    this.plant_Steam_Inlet_Shut_Off_Valve_Enumeration.setValue(this.plant_Steam_Inlet_Shut_Off_Valve_List[0]); // Use Form Touched flag or setting this default will overwrite loaded job data on filter dependant Lists!
    //  }
    //}//
  }

  /*
   * Filters clean steam outlet shut off valve list based on valve actuation selection.
   */
  filterCleanSteamOutletShutOffValveList() {
    // Ensure that the dependencies are set before accessing them.
    //if (this.valve_Actuation_Enumeration) {
    //  switch (this.valve_Actuation_Enumeration.value.split("_")[1]) {
    //    case "PN":
    //      this.clean_Steam_Outlet_Shut_Off_Valve_List = ['None_N', 'Outlet Manual stop valve_M', 'Outlet Automatic stop valve (pneumatic)_AP'];
    //      break;
    //    case "EL":
    //      this.clean_Steam_Outlet_Shut_Off_Valve_List = ['None_N', 'Outlet Manual stop valve_M', 'Outlet Automatic stop valve (electric)_AE'];
    //      break;
    //  }

    //  // Set the default selection.
    //  if (this.clean_Steam_Outlet_Shut_Off_Valve_List.length > 0 && this.sizingModuleForm.touched) {
    //    this.clean_Steam_Outlet_Shut_Off_Valve_Enumeration.setValue(this.clean_Steam_Outlet_Shut_Off_Valve_List[0]); // Use Form Touched flag or setting this default will overwrite loaded job data on filter dependant Lists!
    //  }
    //}
  }


  /*
   * Filters CSG_xx_xxx_Test_And_Certification list based on Design Code selection (EN or GB Spec), added for AsiaPac.
   */
  filterTestAndCertificationList() {

    // Store current list item selected (Warning: if you are preserving a list item, this can cause problems if ModPrefslist item ordering/existance isn't what you expect in the future!)
    //this.test_And_Certification_Selected_Option_Item_Value = this.test_And_Certification_Enumeration.value;

    // Ensure that the dependencies are set before accessing them.
    if (!!this.design_Code_Enumeration && !!this.design_Code_Enumeration.value && this.design_Code_Enumeration.value.length > 0) {
      switch (this.design_Code_Enumeration.value.split("_")[1]) {
        case "E": // EN_E allowable Test And Cert Options
          this.test_And_Certification_List = [
            'EU PED test and CE marking of the assembly_S',
            'DOSH compliance_D',
            'KGS compliance_K',
              'MOM compliance_M',
              'None (as assembly) - only for the individual equipment_SF'
          ];
          break;

        case "G": // GB Spec_G allowable Test And Cert Options
          this.test_And_Certification_List = [
            'GB Standard (in Chinese language)_GC',
            'GB Standard (in English language)_GE',
            'None (as assembly) - only for the individual equipment_SF'
          ];
          break;

        case "A": // 'ASME_A' design code allowable Test And Cert Options
          this.test_And_Certification_List = [
            'ASME_U_STAMP_U',
            'None (as assembly) - only for the individual equipment_SF'
          ];
          break;

        default:
          this.test_And_Certification_List = []; // no filter
          break;
      }

      // Set the default selection.
      if (this.test_And_Certification_List.length > 0 && this.sizingModuleForm.touched) {// Use Form Touched flag or setting this default will overwrite loaded job data on filter dependant Lists!
        this.setSizingOptionListToDefault(this.test_And_Certification_Enum, this.test_And_Certification_List, this.test_And_Certification_Enumeration);
      }

      // Set list option and notify user if list item avalability has changed
      //this.filterRestoreOrDefaultSelectedListItem('TEST_AND_CERTIFICATIONS', this.test_And_Certification_Selected_Option_Item_Value, this.test_And_Certification_Enum_Name, this.test_And_Certification_List, this.test_And_Certification_Enumeration);
    }
  }

  /*
  * Filters CSG_xx_xxx_Plant_Steam_Line_Trapping list based on Frame or Cabinet.
  */
  filterPlantSteamLineTrappingList() {

    // Store current list item selected (Warning: if you are preserving a list item, this can cause problems if ModPrefslist item ordering/existance isn't what you expect in the future!)
    if (!!this.plant_Steam_Line_Trapping_Enumeration && !!this.plant_Steam_Line_Trapping_Enumeration.value) { this.plant_Steam_Line_Trapping_Selected_Option_Item_Value = this.plant_Steam_Line_Trapping_Enumeration.value; }

    // Ensure that the dependencies are set before accessing them.
    if (!!this.frame_And_Cabinet_Enumeration && !!this.frame_And_Cabinet_Enumeration.value && this.frame_And_Cabinet_Enumeration.value.length > 0
    //  && !!this.frame_And_Cabinet_Enum && !!this.frame_And_Cabinet_Enum.internalValue && this.frame_And_Cabinet_Enum.internalValue.length > 0
    ) {

      var frameAndCabinetCode = (this.frame_And_Cabinet_Enumeration.value.split("_")[1] === '0'
                              || this.frame_And_Cabinet_Enumeration.value.split("_")[1] === '3') ? ' - basement type 0 3' : ' - frame type 1 2 4 5';

      switch (frameAndCabinetCode) {
        case " - basement type 0 3": 
          this.plant_Steam_Line_Trapping_List = [
            'None_N',
            'Plant steam line trapping station - basement type 0 3_T'
          ];
          break;

        case " - frame type 1 2 4 5":
          this.plant_Steam_Line_Trapping_List = [
            'None_N',
            'Plant steam line trapping station - frame type 1 2 4 5_T'
          ];
          break;

        default:
          this.plant_Steam_Line_Trapping_List = [];
          break;
      }

      // Set the default selection.
      if (this.plant_Steam_Line_Trapping_List.length > 0 && this.sizingModuleForm.touched) {// Use Form Touched flag or setting this default will overwrite loaded job data on filter dependant Lists!
        //this.setSizingOptionListToDefault(this.plant_Steam_Line_Trapping_Enum, this.plant_Steam_Line_Trapping_List, this.plant_Steam_Line_Trapping_Enumeration);

        // Set list option and notify user if list item avalability has changed
        // new filter change overrides any changes here changes! See post filter processing applied in filterOptionList() at "case 'intelligent_Diagnostics_Enum':"
        // not here! this.filterRestoreOrDefaultSelectedListItem('PLANT_STEAM_LINE_TRAPPING', this.plant_Steam_Line_Trapping_Selected_Option_Item_Value, this.plant_Steam_Line_Trapping_Enum_Name, this.plant_Steam_Line_Trapping_List, this.plant_Steam_Line_Trapping_Enumeration);

      }
    }
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

  filterIntelligentDiagnosticsList() {

    // Store current list item selected (Warning: if you are preserving a list item, this can cause problems if ModPrefslist item ordering/existance isn't what you expect in the future!)
    if (!!this.intelligent_Diagnostics_Enumeration && !!this.intelligent_Diagnostics_Enumeration.value) { this.intelligent_Diagnostics_Selected_Option_Item_Value = this.intelligent_Diagnostics_Enumeration.value; }
    
    // Ensure that the dependencies are set before accessing them.
    if (this.valve_Actuation_Enumeration && !!this.valve_Actuation_Enumeration.value) {
      switch (this.valve_Actuation_Enumeration.value.split("_")[1]) {
        case "PN":
          this.intelligent_Diagnostics_List = [
            'None_N',
            'System Diagnostics (pneumatic)_I1',
            'Performance and condition monitoring_I2',
            'Integrity test_I3',
            'System Diagnostics + Integrity test (pneumatic)_I4',
            'System Diagnostics + Performance monitoring_I5',
            'Performance and condition monitoring + Integrity test_I6',
            'System Diagnostics + Performance monitoring + Integrity test_I7'
          ];
          break;
        case "EL":
          this.intelligent_Diagnostics_List = [
            'None_N',
            'System Diagnostics (electric)_I1',
            'Performance and condition monitoring_I2',
            'Integrity test_I3',
            'System Diagnostics + Integrity test (electric)_I4',
            'System Diagnostics + Performance monitoring_I5',
            'Performance and condition monitoring + Integrity test_I6',
            'System Diagnostics + Performance monitoring + Integrity test_I7'
          ];
          break;
      }

      // Set the default selection.
      if (this.intelligent_Diagnostics_List.length > 0 && this.sizingModuleForm.touched) {
        //this.intelligent_Diagnostics_Enumeration.setValue(this.intelligent_Diagnostics_List[0]); // Use Form Touched flag or setting this default will overwrite loaded job data on filter dependant Lists!

        // Set list option and notify user if list item avalability has changed
        // new filter change overrides any changes here changes! See post filter processing applied in filterOptionList() at "case 'intelligent_Diagnostics_Enum':"
        // not here! this.filterRestoreOrDefaultSelectedListItem('INTELLIGENT_DIAGNOSTICS', this.intelligent_Diagnostics_Selected_Option_Item_Value, this.intelligent_Diagnostics_Enum_Name, this.intelligent_Diagnostics_List, this.intelligent_Diagnostics_Enumeration);
      }
    }
  }
  
  filterFeedwaterPressurisationList(isPumpMandatory: boolean) {

    // Store current list item selected (Warning: if you are preserving a list item, this can cause problems if ModPrefslist item ordering/existance isn't what you expect in the future!)
    //this.feedwater_Pressurisation_Selected_Option_Item_Value = this.feedwater_Pressurisation_Enumeration.value;

    // Check if pump must be selected?
    this.feedwater_Pressurisation_List = isPumpMandatory ? ['Pump with VFD_P'] : ['None_N', 'Pump with VFD_P'];

    // Set the default selection.
    if (this.feedwater_Pressurisation_List.length > 0 && this.sizingModuleForm.touched) {
      this.feedwater_Pressurisation_Enumeration.setValue(this.feedwater_Pressurisation_List[0]); // Use Form Touched flag or setting this default will overwrite loaded job data on filter dependant Lists!

      // Set list option and notify user if list item avalability has changed
      //this.filterRestoreOrDefaultSelectedListItem('FEEDWATER_PRESSURISATION', this.feedwater_Pressurisation_Selected_Option_Item_Value, this.feedwater_Pressurisation_Enum_Name, this.feedwater_Pressurisation_List, this.feedwater_Pressurisation_Enumeration);

    }
  }

  filterPhaseVoltageList(feedwaterPressurisationSelectedValue: string) {

    // Store current list item selected (Warning: if you are preserving a list item, this can cause problems if ModPrefslist item ordering/existance isn't what you expect in the future!)
    this.phase_Voltage_Selected_Option_Item_Value = this.phase_Voltage_Enumeration.value;

    // Select the list first.
    if (feedwaterPressurisationSelectedValue === 'Pump with VFD_P') {
      // If a pump is selected then there are just 2 x (3 phase) options shown to the user.
      this.phaseVoltageList = ['Three Phase 200-240V', 'Three Phase 380-480V'];
    }
    else if (feedwaterPressurisationSelectedValue === 'None_N') {
      // The requirement is when a pump is NOT selected, only show the single phase option and to remove the 3 phase options.
      this.phaseVoltageList = ['Single Phase 100-240V']; //, 'Three Phase 200-240V', 'Three Phase 380-480V'];
    }

    // Set the default selection.
    if (this.phaseVoltageList.length > 0 && this.sizingModuleForm.touched) {
       this.phase_Voltage_Enumeration.setValue(this.phaseVoltageList[0]);  // Use Form Touched flag or setting this default will overwrite loaded job data on filter dependant Lists!

       // Set list option and notify user if list item avalability has changed
       //this.filterRestoreOrDefaultSelectedListItem('PHASE_AND_VOLTAGE', this.phase_Voltage_Selected_Option_Item_Value, this.phase_Voltage_Enum_Name, this.phase_Voltage_List, this.phase_Voltage_Enumeration);

    }
  }

  /*
   * With reference to the Independent Downstream Plant Protection (see Section 8.12.17)
   * There are rules which are shown where applicable, and in this case it clearly states
   * that you can only have Self monitoring low level probe LP30 if Level indicator option L is selected
   * (see Section 8.12.22) option L = LP20.
   * eg. PlanProtection.LP30 only available when levelIndicator.LP20 list item is selected.
   * 
   * Test and Defend behaviour for: Page load initialise lists, first sizing, new/reset sizing, model/result selection change, save/load with all list combinations.
   * Then swap/remove ModPref allocations, move default and re-order items then retest all those variations with all cases above again.
   * It is NOT easy to catch everything! 100s of possible UI/data sequence behaviours to handle. Change any code and restart tests from scratch!
   * 
   */
  filterIndependentLowLevelAlarmList(levelIndicatorSelectedValue: string) {   
    
    console.log('filterIndependentLowLevelAlarmList()');

    // Store current list item selected (Warning: if you are preserving a list item, this can cause problems if ModPrefslist item ordering/existance isn't what you expect in the future!)
    this.independent_Low_Level_Alarm_Selected_Option_Item_Value = this.independent_Low_Level_Alarm_Enumeration.value;
    //this.level_Indicator_Selected_Option_Item_Value = this.level_Indicator_Enumeration.value;

    // Select the list first.
    if (levelIndicatorSelectedValue === 'LP20 (Capacitance Level Probe)_L') {
      this.independent_Low_Level_Alarm_List = ['None_N', 'Self monitoring low level probe LP30_L', 'Safety temperature limiter_T'];
    }
    else if (!levelIndicatorSelectedValue || levelIndicatorSelectedValue === 'Viscorol (Magnetic Level Indicator)_V') {
      this.independent_Low_Level_Alarm_List = ['None_N', 'Safety temperature limiter_T'];
    }

    // Set the default selection.
    if (this.independent_Low_Level_Alarm_List.length > 0 && this.sizingModuleForm.touched) {
      //this.independent_Low_Level_Alarm_Enumeration.setValue(this.independent_Low_Level_Alarm_List[0]); //Use Form Touched flag or setting this default will overwrite loaded job data on filter dependant Lists!

      // Set list option and notify user if list item avalability has changed
      // new filter change overrides any changes here changes! See post filter processing applied in filterOptionList() at "case 'independent_Low_Level_Alarm_Enum':"
      // not here! this.filterRestoreOrDefaultSelectedListItem('INDEPENDENT_LOW_LEVEL_ALARM', this.independent_Low_Level_Alarm_Selected_Option_Item_Value, this.independent_Low_Level_Alarm_Enum_Name, this.independent_Low_Level_Alarm_List, this.independent_Low_Level_Alarm_Enumeration);
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

  isFeedwaterPreheaterSelected(event: any) {
    if (event.selectedValue === 'FW pre-heating by heat recovery from primary condensate_PR' && this.show_feedwater_Pre_Heating_Degassing) {
      return true;
    } else {
      return false;
    }
  }

  /**
   Method to localize csg output data display values.
  */
  localizeCSGOutputData() {
    if (this.csgOutputData && this.csgOutputData.length > 0) {
      this.csgOutputData.forEach(o => {
        o.displayCleanSteamFlowrate                 = this.localizeValue(o.cleanSteamFlowrate, this.massFlowRef.preference.decimalPlaces);
        o.displayPlantSteamFlowrate                 = this.localizeValue(o.plantSteamFlowrate, this.massFlowRef.preference.decimalPlaces);
        o.displayFeedwaterFlowrate                  = this.localizeValue(o.feedwaterFlowrate, this.massFlowRef.preference.decimalPlaces);
        o.displayBlowDownFlowrate                   = this.localizeValue(o.blowDownFlowrate, this.massFlowRef.preference.decimalPlaces);
        o.displayPressurisedDeaeratorInletFlowrate  = this.localizeValue(o.pressurisedDeaeratorInletFlowrate, this.massFlowRef.preference.decimalPlaces);
        o.displayPressurisedDeaeratorOutletFlowrate = this.localizeValue(o.pressurisedDeaeratorOutletFlowrate, this.massFlowRef.preference.decimalPlaces);
        o.displayHeatExchangerDuty                  = this.localizeValue(o.heatExchangerDuty, this.loadRef.preference.decimalPlaces);
        o.displayOverdesign                         = this.localizeValue(o.overdesign, 2);
      });
    }
  }

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

  onBOMClick(event: any) {
    if (!!event.srcElement.parentElement.ariaExpanded) {
      
      this.bOMExpanded = event.srcElement.parentElement.ariaExpanded === "true" ? false : true; // click show the historic state, going to be opposite.
      console.log(`bOMExpanded=${this.bOMExpanded}`);
    }
  }

  transBOMLable():string {
    let trans_lable = "";
    if (!this.bOMExpanded) {
      trans_lable = this.translatePipe.transform('BOM_SHOW');
    }
    else {
      trans_lable = this.translatePipe.transform('BOM_HIDE');
    }
    return trans_lable;
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

  
}

