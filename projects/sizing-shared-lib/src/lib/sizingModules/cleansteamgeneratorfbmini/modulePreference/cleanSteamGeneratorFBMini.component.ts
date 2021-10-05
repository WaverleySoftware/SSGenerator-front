import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { AdminService } from "../../../modules/admin/admin.service";
import { TranslationService } from "../../../shared/translation/translation.service";

import { TranslatePipe } from "../../../shared/translation/translate.pipe";

import { DatatableComponent } from '@swimlane/ngx-datatable';

import { Manufacturer } from "../../../modules/admin/module-preferences/manufacturer.model";
import { Enumeration } from "../../../shared/translation/translation.model";
import { EnumerationDefinition } from "../../../shared/translation/translation.model";

import { ModulePreferenceService } from "../../../shared/module-preference/module-preference.service"
import { ModulePreference } from "../../../shared/module-preference/module-preference.model";
import { ModulePreferenceDetails } from "../../../shared/module-preference/module-preference-details.model";

import { Currency } from "../../../modules/admin/currency/currency.model";

import { Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { IGenericChanges } from "../../../modules/generic.changes.interface";

import * as cloneDeep_ from 'lodash/cloneDeep';
import { RoutesService } from '../../../modules/routes.service';
import { CleanSteamGeneratorFBMiniBOMPriceOutput, CleanSteamGeneratorFBMiniPricing, BOMItem } from './cleanSteamGeneratorFBMiniPricingOptions.model';
import { CleanSteamGeneratorFBMiniService } from './cleanSteamGeneratorFBMini.service';

import { LocaleService } from 'node_modules/angular-l10n';
import { UserProfileService } from '../../../modules/user-profile/user-profile.service';
import { User } from '../../../modules/user-profile/user.model';

@Component({
  selector: 'cleansteamgeneratorFBMini-module-preferences',
  templateUrl: './cleansteamgeneratorFBMini.component.html',
  styleUrls: ['./cleansteamgeneratorFBMini.component.scss'],
  providers: [CleanSteamGeneratorFBMiniService]
})
export class CleanSteamGeneratorFBMiniModulePreferencesComponent implements OnInit, IGenericChanges {
  readonly moduleId: string = "12";
  readonly moduleGroupId: number = 13;
  public cloneDeep = cloneDeep_;
  readonly moduleName: string = "Clean Steam Generator FB Mini";

  @ViewChild("csgBOMOutputDataTable", { static: false }) csgBOMOutputDataTable: DatatableComponent;
  @ViewChild('collapsePriceDataTop', { static: false }) collapsePriceDataTop: ElementRef; // for scroll to view

  theFormGroup: FormGroup; // to drive GenericChangesGuard
  hasUnsavedDataChanges: boolean; // to drive GenericChangesGuard

  isSuccess: boolean = false;
  alertVisible: boolean = false;
  formSubmitted: boolean = false;

  csgOptionsSelectedItem: string;

  //*** Regular module prefs ***
  // Currency Options
  manufacturerList: Manufacturer[] = [];
  currencyList: Currency[] = [];
  
  public csgManufacturerCurrencyId: number;
  public csgManufacturerCurrency: Currency;  
  public csgManufacturerCurrencySymbol: string;
  public csgSellingCurrencyId: string;
  public csgSellingCurrencySymbol: string;
  public csgCurrencyConversion: number;

  // Pricing Options
  public csgLandedCostIncrease: number;
  public csgDeliveryCost: number;
  public csgCommissionOnlyPrice: number;
  public csgWarrantyOneYear: number;
  public csgWarrantyTwoYears: number;
  public csgWarrantyThreeYears: number;

  // Option Configuration
  modulePreferencesForm: FormGroup;

  csgManufacturerPrefFormControl: FormControl;
  csgManufacturerCurrencyPrefFormControl: FormControl;
  csgSellingCurrencyPrefFormControl: FormControl;

  csgLandedCostIncreasePrefFormControl: FormControl;
  csgDeliveryCostPrefFormControl: FormControl;
  csgCommissionOnlyPricePrefFormControl: FormControl;
  csgWarrantyOneYearPrefFormControl: FormControl;
  csgWarrantyTwoYearsPrefFormControl: FormControl;
  csgWarrantyThreeYearsPrefFormControl: FormControl;

  // *** Enumerations module prefs ***  
  csgOptionsFormControl: FormControl;

  // Design Code
  csg200DesignCodePrefFormControl: FormControl;
  csg500DesignCodePrefFormControl: FormControl;
  csg1100DesignCodePrefFormControl: FormControl;
  csg1600DesignCodePrefFormControl: FormControl;
  // Shell Type
  csg200ShellTypePrefFormControl: FormControl;
  csg500ShellTypePrefFormControl: FormControl;
  csg1100ShellTypePrefFormControl: FormControl;
  csg1600ShellTypePrefFormControl: FormControl;
  // Valve Actuation
  csg200ValveActuationPrefFormControl: FormControl;
  csg500ValveActuationPrefFormControl: FormControl;
  csg1100ValveActuationPrefFormControl: FormControl;
  csg1600ValveActuationPrefFormControl: FormControl;
  // FeedwaterPressurisation
  csg0200FeedwaterPressurisationPrefFormControl: FormControl;
  csg0500FeedwaterPressurisationPrefFormControl: FormControl;
  csg1100FeedwaterPressurisationPrefFormControl: FormControl;
  csg1600FeedwaterPressurisationPrefFormControl: FormControl;  
  // Control
  csg200ControlPrefFormControl: FormControl;
  csg500ControlPrefFormControl: FormControl;
  csg1100ControlPrefFormControl: FormControl;
  csg1600ControlPrefFormControl: FormControl;
  // Communication Interface
  csg200CommunicationInterfacePrefFormControl: FormControl;
  csg500CommunicationInterfacePrefFormControl: FormControl;
  csg1100CommunicationInterfacePrefFormControl: FormControl;
  csg1600CommunicationInterfacePrefFormControl: FormControl;
  // Frame and Cabinet
  csg200FrameAndCabinetPrefFormControl: FormControl;
  csg500FrameAndCabinetPrefFormControl: FormControl;
  csg1100FrameAndCabinetPrefFormControl: FormControl;
  csg1600FrameAndCabinetPrefFormControl: FormControl;
  // Control Panel Location
  csg200ControlPanelLocationPrefFormControl: FormControl;
  csg500ControlPanelLocationPrefFormControl: FormControl;
  csg1100ControlPanelLocationPrefFormControl: FormControl;
  csg1600ControlPanelLocationPrefFormControl: FormControl;
  // Insulation
  csg200InsulationPrefFormControl: FormControl;
  csg500InsulationPrefFormControl: FormControl;
  csg1100InsulationPrefFormControl: FormControl;
  csg1600InsulationPrefFormControl: FormControl;
  // Wheels And Feet
  csg200WheelsAndFeetPrefFormControl: FormControl;
  csg500WheelsAndFeetPrefFormControl: FormControl;
  csg1100WheelsAndFeetPrefFormControl: FormControl;
  csg1600WheelsAndFeetPrefFormControl: FormControl;
  // Plant Steam Inlet Shut Off Valve
  csg200PlantSteamInletShutOffValvePrefFormControl: FormControl;
  csg500PlantSteamInletShutOffValvePrefFormControl: FormControl;
  csg1100PlantSteamInletShutOffValvePrefFormControl: FormControl;
  csg1600PlantSteamInletShutOffValvePrefFormControl: FormControl;
  // Plant Steam Line Trapping
  csg200PlantSteamLineTrappingPrefFormControl: FormControl;
  csg500PlantSteamLineTrappingPrefFormControl: FormControl;
  csg1100PlantSteamLineTrappingPrefFormControl: FormControl;
  csg1600PlantSteamLineTrappingPrefFormControl: FormControl;
  // TDS control system
  csg200TDSControlSystemPrefFormControl: FormControl;
  csg500TDSControlSystemPrefFormControl: FormControl;
  csg1100TDSControlSystemPrefFormControl: FormControl;
  csg1600TDSControlSystemPrefFormControl: FormControl;
  // Sample Coolers
  csg200SampleCoolerPrefFormControl: FormControl;
  csg500SampleCoolerPrefFormControl: FormControl;
  csg1100SampleCoolerPrefFormControl: FormControl;
  csg1600SampleCoolerPrefFormControl: FormControl;
  // Independent low level alarm
  csg200IndependentLowLevelAlarmPrefFormControl: FormControl;
  csg500IndependentLowLevelAlarmPrefFormControl: FormControl;
  csg1100IndependentLowLevelAlarmPrefFormControl: FormControl;
  csg1600IndependentLowLevelAlarmPrefFormControl: FormControl;
  // Feedwater pre-heating / Degassing
  csg200FeedwaterPreHeatingDegassingPrefFormControl: FormControl;
  csg500FeedwaterPreHeatingDegassingPrefFormControl: FormControl;
  csg1100FeedwaterPreHeatingDegassingPrefFormControl: FormControl;
  csg1600FeedwaterPreHeatingDegassingPrefFormControl: FormControl;
  // Intelligent diagnostics
  csg200IntelligentDiagnosticsPrefFormControl: FormControl;
  csg500IntelligentDiagnosticsPrefFormControl: FormControl;
  csg1100IntelligentDiagnosticsPrefFormControl: FormControl;
  csg1600IntelligentDiagnosticsPrefFormControl: FormControl;
  // Clean steam outlet shut-off valve
  csg200CleanSteamOutletShutOffValvePrefFormControl: FormControl;
  csg500CleanSteamOutletShutOffValvePrefFormControl: FormControl;
  csg1100CleanSteamOutletShutOffValvePrefFormControl: FormControl;
  csg1600CleanSteamOutletShutOffValvePrefFormControl: FormControl;
  // Test and certifications
  csg200TestAndCertificationPrefFormControl: FormControl;
  csg500TestAndCertificationPrefFormControl: FormControl;
  csg1100TestAndCertificationPrefFormControl: FormControl;
  csg1600TestAndCertificationPrefFormControl: FormControl;
  // Level_Indicator
  csg200Level_IndicatorPrefFormControl: FormControl;
  csg500Level_IndicatorPrefFormControl: FormControl;
  csg1100Level_IndicatorPrefFormControl: FormControl;
  csg1600Level_IndicatorPrefFormControl: FormControl;

  serviceOffereingMessage: string;
  deliveryCostMessage: string;

  csgPricing: CleanSteamGeneratorFBMiniPricing;
  csgBOMOutputData: CleanSteamGeneratorFBMiniBOMPriceOutput;
  csgBOMOutputDataRows: BOMItem[] = [];
  manufacturerId: number;
  CSG_FB_020_Price: string; 
  CSG_FB_050_Price: string;
  CSG_FB_110_Price: string;
  CSG_FB_160_Price: string;
  showPrices: Boolean = false;
  augmentPriceDataProcessing: Boolean = true; // disable button whilst page loading

  user: User;
  public operatingCompany: string;

  constructor(private routesService: RoutesService,
    private adminService: AdminService,
    private translationService: TranslationService,
    private fb: FormBuilder,
    private translatePipe: TranslatePipe,
    private modulePreferenceService: ModulePreferenceService,
    private cleanSteamGeneratorService: CleanSteamGeneratorFBMiniService,
    private localeService: LocaleService,
    private userProfileService: UserProfileService) {

    this.userProfileService.getUserDetails().subscribe(user => {
      this.user = user;
      if (!!this.user) {
        this.operatingCompany = " : " + this.user.operatingCompanyName;
      }
    });

    this.csgBOMOutputData = new CleanSteamGeneratorFBMiniBOMPriceOutput();

    this.csgManufacturerPrefFormControl = new FormControl({ value: '', disabled: true });
    this.csgManufacturerCurrencyPrefFormControl = new FormControl({ value: '', disabled: true });
    this.csgSellingCurrencyPrefFormControl = new FormControl('');

    this.csgLandedCostIncreasePrefFormControl = new FormControl('', [Validators.required, CustomValidators.range([-100, 100])]);
    this.csgDeliveryCostPrefFormControl = new FormControl('', [Validators.required]);
    this.csgCommissionOnlyPricePrefFormControl = new FormControl('', [Validators.required]);
    this.csgWarrantyOneYearPrefFormControl = new FormControl('', [Validators.required]);
    this.csgWarrantyTwoYearsPrefFormControl = new FormControl('', [Validators.required]);
    this.csgWarrantyThreeYearsPrefFormControl = new FormControl('', [Validators.required]);

    this.csgOptionsFormControl = new FormControl('');

    // Design Code
    this.csg200DesignCodePrefFormControl = new FormControl(null);
    this.csg500DesignCodePrefFormControl = new FormControl(null);
    this.csg1100DesignCodePrefFormControl = new FormControl(null);
    this.csg1600DesignCodePrefFormControl = new FormControl(null);
    // Shell Type
    this.csg200ShellTypePrefFormControl = new FormControl(null);
    this.csg500ShellTypePrefFormControl = new FormControl(null);
    this.csg1100ShellTypePrefFormControl = new FormControl(null);
    this.csg1600ShellTypePrefFormControl = new FormControl(null);
    // Valve Actuation
    this.csg200ValveActuationPrefFormControl = new FormControl(null);
    this.csg500ValveActuationPrefFormControl = new FormControl(null);
    this.csg1100ValveActuationPrefFormControl = new FormControl(null);
    this.csg1600ValveActuationPrefFormControl = new FormControl(null);
    // FeedwaterPressurisation
    this.csg0200FeedwaterPressurisationPrefFormControl = new FormControl(null);
    this.csg0500FeedwaterPressurisationPrefFormControl = new FormControl(null);
    this.csg1100FeedwaterPressurisationPrefFormControl = new FormControl(null);
    this.csg1600FeedwaterPressurisationPrefFormControl = new FormControl(null);
    // Control
    this.csg200ControlPrefFormControl = new FormControl(null);
    this.csg500ControlPrefFormControl = new FormControl(null);
    this.csg1100ControlPrefFormControl = new FormControl(null);
    this.csg1600ControlPrefFormControl = new FormControl(null);
    // Communication Interface
    this.csg200CommunicationInterfacePrefFormControl = new FormControl(null);
    this.csg500CommunicationInterfacePrefFormControl = new FormControl(null);
    this.csg1100CommunicationInterfacePrefFormControl = new FormControl(null);
    this.csg1600CommunicationInterfacePrefFormControl = new FormControl(null);
    // Frame and Cabinet
    this.csg200FrameAndCabinetPrefFormControl = new FormControl(null);
    this.csg500FrameAndCabinetPrefFormControl = new FormControl(null);
    this.csg1100FrameAndCabinetPrefFormControl = new FormControl(null);
    this.csg1600FrameAndCabinetPrefFormControl = new FormControl(null);
    // Control Panel Location
    this.csg200ControlPanelLocationPrefFormControl = new FormControl(null);
    this.csg500ControlPanelLocationPrefFormControl = new FormControl(null);
    this.csg1100ControlPanelLocationPrefFormControl = new FormControl(null);
    this.csg1600ControlPanelLocationPrefFormControl = new FormControl(null);
    // Insulation
    this.csg200InsulationPrefFormControl = new FormControl(null);
    this.csg500InsulationPrefFormControl = new FormControl(null);
    this.csg1100InsulationPrefFormControl = new FormControl(null);
    this.csg1600InsulationPrefFormControl = new FormControl(null);
    // Wheels And Feet
    this.csg200WheelsAndFeetPrefFormControl = new FormControl(null);
    this.csg500WheelsAndFeetPrefFormControl = new FormControl(null);
    this.csg1100WheelsAndFeetPrefFormControl = new FormControl(null);
    this.csg1600WheelsAndFeetPrefFormControl = new FormControl(null);
    // Plant Steam Inlet Shut Off Valve
    this.csg200PlantSteamInletShutOffValvePrefFormControl = new FormControl(null);
    this.csg500PlantSteamInletShutOffValvePrefFormControl = new FormControl(null);
    this.csg1100PlantSteamInletShutOffValvePrefFormControl = new FormControl(null);
    this.csg1600PlantSteamInletShutOffValvePrefFormControl = new FormControl(null);
    // Plant Steam Line Trapping
    this.csg200PlantSteamLineTrappingPrefFormControl = new FormControl(null);
    this.csg500PlantSteamLineTrappingPrefFormControl = new FormControl(null);
    this.csg1100PlantSteamLineTrappingPrefFormControl = new FormControl(null);
    this.csg1600PlantSteamLineTrappingPrefFormControl = new FormControl(null);
    // TDS control system
    this.csg200TDSControlSystemPrefFormControl = new FormControl(null);
    this.csg500TDSControlSystemPrefFormControl = new FormControl(null);
    this.csg1100TDSControlSystemPrefFormControl = new FormControl(null);
    this.csg1600TDSControlSystemPrefFormControl = new FormControl(null);
    // Sample Coolers
    this.csg200SampleCoolerPrefFormControl = new FormControl(null);
    this.csg500SampleCoolerPrefFormControl = new FormControl(null);
    this.csg1100SampleCoolerPrefFormControl = new FormControl(null);
    this.csg1600SampleCoolerPrefFormControl = new FormControl(null);
    // Independent low level alarm
    this.csg200IndependentLowLevelAlarmPrefFormControl = new FormControl(null);
    this.csg500IndependentLowLevelAlarmPrefFormControl = new FormControl(null);
    this.csg1100IndependentLowLevelAlarmPrefFormControl = new FormControl(null);
    this.csg1600IndependentLowLevelAlarmPrefFormControl = new FormControl(null);
    // Feedwater pre-heating / Degassing
    this.csg200FeedwaterPreHeatingDegassingPrefFormControl = new FormControl(null);
    this.csg500FeedwaterPreHeatingDegassingPrefFormControl = new FormControl(null);
    this.csg1100FeedwaterPreHeatingDegassingPrefFormControl = new FormControl(null);
    this.csg1600FeedwaterPreHeatingDegassingPrefFormControl = new FormControl(null);
    // Intelligent diagnostics
    this.csg200IntelligentDiagnosticsPrefFormControl = new FormControl(null);
    this.csg500IntelligentDiagnosticsPrefFormControl = new FormControl(null);
    this.csg1100IntelligentDiagnosticsPrefFormControl = new FormControl(null);
    this.csg1600IntelligentDiagnosticsPrefFormControl = new FormControl(null);
    // Clean steam outlet shut-off valve
    this.csg200CleanSteamOutletShutOffValvePrefFormControl = new FormControl(null);
    this.csg500CleanSteamOutletShutOffValvePrefFormControl = new FormControl(null);
    this.csg1100CleanSteamOutletShutOffValvePrefFormControl = new FormControl(null);
    this.csg1600CleanSteamOutletShutOffValvePrefFormControl = new FormControl(null);
    // Test and certifications
    this.csg200TestAndCertificationPrefFormControl = new FormControl(null);
    this.csg500TestAndCertificationPrefFormControl = new FormControl(null);
    this.csg1100TestAndCertificationPrefFormControl = new FormControl(null);
    this.csg1600TestAndCertificationPrefFormControl = new FormControl(null);
    // Level_Indicator
    this.csg200Level_IndicatorPrefFormControl = new FormControl(null);
    this.csg500Level_IndicatorPrefFormControl = new FormControl(null);
    this.csg1100Level_IndicatorPrefFormControl = new FormControl(null);
    this.csg1600Level_IndicatorPrefFormControl = new FormControl(null);    

    // Setup the form group.
    this.modulePreferencesForm = this.fb.group({
      // Currency Options
      csgManufacturerModulePreference: this.csgManufacturerPrefFormControl,
      csgManufacturerCurrencyModulePreference: this.csgManufacturerCurrencyPrefFormControl,
      csgSellingCurrencyModulePreference: this.csgSellingCurrencyPrefFormControl,

      // Pricing Options
      csgLandedCostIncreaseModulePreference: this.csgLandedCostIncreasePrefFormControl,
      csgDeliveryCostModulePreference: this.csgDeliveryCostPrefFormControl,
      csgCommissionOnlyPriceModulePreference: this.csgCommissionOnlyPricePrefFormControl,
      csgWarrantyOneYearModulePreference: this.csgWarrantyOneYearPrefFormControl,
      csgWarrantyTwoYearsModulePreference: this.csgWarrantyTwoYearsPrefFormControl,
      csgWarrantyThreeYearsModulePreference: this.csgWarrantyThreeYearsPrefFormControl,

      // Option Configuration
      csgOptionsSelection: this.csgOptionsFormControl,

      // Design Code
      csg200DesignCodePreference: this.csg200DesignCodePrefFormControl,
      csg500DesignCodePreference: this.csg500DesignCodePrefFormControl,
      csg1100DesignCodePreference: this.csg1100DesignCodePrefFormControl,
      csg1600DesignCodePreference: this.csg1600DesignCodePrefFormControl,
      // Shell Type
      csg200ShellTypePreference: this.csg200ShellTypePrefFormControl,
      csg500ShellTypePreference: this.csg500ShellTypePrefFormControl,
      csg1100ShellTypePreference: this.csg1100ShellTypePrefFormControl,
      csg1600ShellTypePreference: this.csg1600ShellTypePrefFormControl,
      // Valve Actuation
      csg200ValveActuationPreference: this.csg200ValveActuationPrefFormControl,
      csg500ValveActuationPreference: this.csg500ValveActuationPrefFormControl,
      csg1100ValveActuationPreference: this.csg1100ValveActuationPrefFormControl,
      csg1600ValveActuationPreference: this.csg1600ValveActuationPrefFormControl,
      // FeedwaterPressurisation
      csg0200FeedwaterPressurisationPreference: this.csg0200FeedwaterPressurisationPrefFormControl,
      csg0500FeedwaterPressurisationPreference: this.csg0500FeedwaterPressurisationPrefFormControl,
      csg1100FeedwaterPressurisationPreference: this.csg1100FeedwaterPressurisationPrefFormControl,
      csg1600FeedwaterPressurisationPreference: this.csg1600FeedwaterPressurisationPrefFormControl,
      // Control
      csg200ControlPreference: this.csg200ControlPrefFormControl,
      csg500ControlPreference: this.csg500ControlPrefFormControl,
      csg1100ControlPreference: this.csg1100ControlPrefFormControl,
      csg1600ControlPreference: this.csg1600ControlPrefFormControl,
      // Communication Interface
      csg200CommunicationInterfacePreference: this.csg200CommunicationInterfacePrefFormControl,
      csg500CommunicationInterfacePreference: this.csg500CommunicationInterfacePrefFormControl,
      csg1100CommunicationInterfacePreference: this.csg1100CommunicationInterfacePrefFormControl,
      csg1600CommunicationInterfacePreference: this.csg1600CommunicationInterfacePrefFormControl,
      // Frame and Cabinet
      csg200FrameAndCabinetPreference: this.csg200FrameAndCabinetPrefFormControl,
      csg500FrameAndCabinetPreference: this.csg500FrameAndCabinetPrefFormControl,
      csg1100FrameAndCabinetPreference: this.csg1100FrameAndCabinetPrefFormControl,
      csg1600FrameAndCabinetPreference: this.csg1600FrameAndCabinetPrefFormControl,
      // Control Panel Location
      csg200ControlPanelLocationPreference: this.csg200ControlPanelLocationPrefFormControl,
      csg500ControlPanelLocationPreference: this.csg500ControlPanelLocationPrefFormControl,
      csg1100ControlPanelLocationPreference: this.csg1100ControlPanelLocationPrefFormControl,
      csg1600ControlPanelLocationPreference: this.csg1600ControlPanelLocationPrefFormControl,
      // Insulation
      csg200InsulationPreference: this.csg200InsulationPrefFormControl,
      csg500InsulationPreference: this.csg500InsulationPrefFormControl,
      csg1100InsulationPreference: this.csg1100InsulationPrefFormControl,
      csg1600InsulationPreference: this.csg1600InsulationPrefFormControl,
      // Wheels And Feet
      csg200WheelsAndFeetPreference: this.csg200WheelsAndFeetPrefFormControl,
      csg500WheelsAndFeetPreference: this.csg500WheelsAndFeetPrefFormControl,
      csg1100WheelsAndFeetPreference: this.csg1100WheelsAndFeetPrefFormControl,
      csg1600WheelsAndFeetPreference: this.csg1600WheelsAndFeetPrefFormControl,
      // Plant Steam Inlet Shut Off Valve
      csg200PlantSteamInletShutOffValvePreference: this.csg200PlantSteamInletShutOffValvePrefFormControl,
      csg500PlantSteamInletShutOffValvePreference: this.csg500PlantSteamInletShutOffValvePrefFormControl,
      csg1100PlantSteamInletShutOffValvePreference: this.csg1100PlantSteamInletShutOffValvePrefFormControl,
      csg1600PlantSteamInletShutOffValvePreference: this.csg1600PlantSteamInletShutOffValvePrefFormControl,
      // Plant Steam Line Trapping
      csg200PlantSteamLineTrappingPreference: this.csg200PlantSteamLineTrappingPrefFormControl,
      csg500PlantSteamLineTrappingPreference: this.csg500PlantSteamLineTrappingPrefFormControl,
      csg1100PlantSteamLineTrappingPreference: this.csg1100PlantSteamLineTrappingPrefFormControl,
      csg1600PlantSteamLineTrappingPreference: this.csg1600PlantSteamLineTrappingPrefFormControl,
      // TDS control system
      csg200TDSControlSystemPreference: this.csg200TDSControlSystemPrefFormControl,
      csg500TDSControlSystemPreference: this.csg500TDSControlSystemPrefFormControl,
      csg1100TDSControlSystemPreference: this.csg1100TDSControlSystemPrefFormControl,
      csg1600TDSControlSystemPreference: this.csg1600TDSControlSystemPrefFormControl,
      // Sample Coolers
      csg200SampleCoolerPreference: this.csg200SampleCoolerPrefFormControl,
      csg500SampleCoolerPreference: this.csg500SampleCoolerPrefFormControl,
      csg1100SampleCoolerPreference: this.csg1100SampleCoolerPrefFormControl,
      csg1600SampleCoolerPreference: this.csg1600SampleCoolerPrefFormControl,
      // Independent low level alarm
      csg200IndependentLowLevelAlarmPreference: this.csg200IndependentLowLevelAlarmPrefFormControl,
      csg500IndependentLowLevelAlarmPreference: this.csg500IndependentLowLevelAlarmPrefFormControl,
      csg1100IndependentLowLevelAlarmPreference: this.csg1100IndependentLowLevelAlarmPrefFormControl,
      csg1600IndependentLowLevelAlarmPreference: this.csg1600IndependentLowLevelAlarmPrefFormControl,
      // Feedwater pre-heating / Degassing
      csg200FeedwaterPreHeatingDegassingPreference: this.csg200FeedwaterPreHeatingDegassingPrefFormControl,
      csg500FeedwaterPreHeatingDegassingPreference: this.csg500FeedwaterPreHeatingDegassingPrefFormControl,
      csg1100FeedwaterPreHeatingDegassingPreference: this.csg1100FeedwaterPreHeatingDegassingPrefFormControl,
      csg1600FeedwaterPreHeatingDegassingPreference: this.csg1600FeedwaterPreHeatingDegassingPrefFormControl,
      // Intelligent diagnostics
      csg200IntelligentDiagnosticsPreference: this.csg200IntelligentDiagnosticsPrefFormControl,
      csg500IntelligentDiagnosticsPreference: this.csg500IntelligentDiagnosticsPrefFormControl,
      csg1100IntelligentDiagnosticsPreference: this.csg1100IntelligentDiagnosticsPrefFormControl,
      csg1600IntelligentDiagnosticsPreference: this.csg1600IntelligentDiagnosticsPrefFormControl,
      // Clean steam outlet shut-off valve
      csg200CleanSteamOutletShutOffValvePreference: this.csg200CleanSteamOutletShutOffValvePrefFormControl,
      csg500CleanSteamOutletShutOffValvePreference: this.csg500CleanSteamOutletShutOffValvePrefFormControl,
      csg1100CleanSteamOutletShutOffValvePreference: this.csg1100CleanSteamOutletShutOffValvePrefFormControl,
      csg1600CleanSteamOutletShutOffValvePreference: this.csg1600CleanSteamOutletShutOffValvePrefFormControl,
      // Test and certifications
      csg200TestAndCertificationPreference: this.csg200TestAndCertificationPrefFormControl,
      csg500TestAndCertificationPreference: this.csg500TestAndCertificationPrefFormControl,
      csg1100TestAndCertificationPreference: this.csg1100TestAndCertificationPrefFormControl,
      csg1600TestAndCertificationPreference: this.csg1600TestAndCertificationPrefFormControl,
      // Level_Indicator
      csg200Level_IndicatorPreference: this.csg200Level_IndicatorPrefFormControl,
      csg500Level_IndicatorPreference: this.csg500Level_IndicatorPrefFormControl,
      csg1100Level_IndicatorPreference: this.csg1100Level_IndicatorPrefFormControl,
      csg1600Level_IndicatorPreference: this.csg1600Level_IndicatorPrefFormControl,
      
    }, { updateOn: "blur" });
  }

  ngOnInit() {

    // When Angular looks at a guard decision, page navigation has already occurred.
    // Reset the page load progress
    //this.routesService.pageLoadProgress = 0;
    //this.routesService.pageLoading = true;
    //this.routesService.startPageLoadProgress();

    // First, get all the module preferences.
    this.modulePreferenceService.getOperatingCompanyModulePreferences(this.moduleId).subscribe((result: Array<ModulePreference>) => {
      if (result && result.length > 0)
      {
        // And set their values accordingly.
        this.manufacturerId = +this.getModulePreferenceValue(result, "CSGFBMiniManufacturer");
        this.csgManufacturerPrefFormControl.setValue(this.manufacturerId);

        this.csgManufacturerCurrencyId = +this.getModulePreferenceValue(result, "CSGFBMiniManufacturerCurrency");
        this.csgManufacturerCurrencyPrefFormControl.setValue(this.csgManufacturerCurrencyId);

        this.csgSellingCurrencyId = this.getModulePreferenceValue(result, "CSGFBMiniSellingCurrency");
        this.csgSellingCurrencyPrefFormControl.setValue(this.csgSellingCurrencyId);
        // Calculate the currency conversion rate.
        this.onSellingCurrencyChange(this.csgSellingCurrencyId);

        this.csgLandedCostIncreasePrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGFBMiniLandCostIncrease"));
        this.csgDeliveryCostPrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGFBMiniDeliveryCost"));
        this.csgCommissionOnlyPricePrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGFBMiniCommission"));
        this.csgWarrantyOneYearPrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGFBMiniYearOne"));
        this.csgWarrantyTwoYearsPrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGFBMiniYearTwo"));
        this.csgWarrantyThreeYearsPrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGFBMiniYearThree"));
        // Get the currency data.
        this.adminService.getCurrencyData().subscribe(data => {
          this.currencyList = data;

          // Selling currency found, so try to calculate the currency conversion rate.
          this.onSellingCurrencyChange(this.csgSellingCurrencyId);

          this.augmentPriceDataProcessing = false; // loaded enable toggle prices button
        });
       
      }
    });

    // Get the list of manufacturers.
    this.adminService.getManufacturerData(this.moduleGroupId).subscribe((result: Array<Manufacturer>) => {
      // Update the subject with the data that's just been retrieved (see the constructor).
      this.manufacturerList = result;
    });


    // Now, set the "OpCo Selected Options" for the different CSG options.
    // Design Code
    this.setOpCoPreferences("CSG_FB_020_Design_Code", this.csg200DesignCodePrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Design_Code", this.csg500DesignCodePrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Design_Code", this.csg1100DesignCodePrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Design_Code", this.csg1600DesignCodePrefFormControl);
    // Shell Type
    this.setOpCoPreferences("CSG_FB_020_Shell_Type", this.csg200ShellTypePrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Shell_Type", this.csg500ShellTypePrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Shell_Type", this.csg1100ShellTypePrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Shell_Type", this.csg1600ShellTypePrefFormControl);
    // Valve Actuation
    this.setOpCoPreferences("CSG_FB_020_Valve_Actuation", this.csg200ValveActuationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Valve_Actuation", this.csg500ValveActuationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Valve_Actuation", this.csg1100ValveActuationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Valve_Actuation", this.csg1600ValveActuationPrefFormControl);
    // FeedwaterPressurisation
    this.setOpCoPreferences("CSG_FB_020_Feedwater_Pressurisation", this.csg0200FeedwaterPressurisationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Feedwater_Pressurisation", this.csg0500FeedwaterPressurisationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Feedwater_Pressurisation", this.csg1100FeedwaterPressurisationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Feedwater_Pressurisation", this.csg1600FeedwaterPressurisationPrefFormControl);
    // Control
    this.setOpCoPreferences("CSG_FB_020_Control", this.csg200ControlPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Control", this.csg500ControlPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Control", this.csg1100ControlPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Control", this.csg1600ControlPrefFormControl);
    // Communication Interface
    this.setOpCoPreferences("CSG_FB_020_Communication_Interface", this.csg200CommunicationInterfacePrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Communication_Interface", this.csg500CommunicationInterfacePrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Communication_Interface", this.csg1100CommunicationInterfacePrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Communication_Interface", this.csg1600CommunicationInterfacePrefFormControl);
    // Frame and Cabinet
    this.setOpCoPreferences("CSG_FB_020_Frame_And_Cabinet", this.csg200FrameAndCabinetPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Frame_And_Cabinet", this.csg500FrameAndCabinetPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Frame_And_Cabinet", this.csg1100FrameAndCabinetPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Frame_And_Cabinet", this.csg1600FrameAndCabinetPrefFormControl);
    // Control Panel Location
    this.setOpCoPreferences("CSG_FB_020_Control_Panel_Location", this.csg200ControlPanelLocationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Control_Panel_Location", this.csg500ControlPanelLocationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Control_Panel_Location", this.csg1100ControlPanelLocationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Control_Panel_Location", this.csg1600ControlPanelLocationPrefFormControl);
    // Insulation
    this.setOpCoPreferences("CSG_FB_020_Insulation", this.csg200InsulationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Insulation", this.csg500InsulationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Insulation", this.csg1100InsulationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Insulation", this.csg1600InsulationPrefFormControl);
    // Wheels And Feet
    this.setOpCoPreferences("CSG_FB_020_Wheels_And_Feet", this.csg200WheelsAndFeetPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Wheels_And_Feet", this.csg500WheelsAndFeetPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Wheels_And_Feet", this.csg1100WheelsAndFeetPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Wheels_And_Feet", this.csg1600WheelsAndFeetPrefFormControl);
    // Plant Steam Inlet Shut Off Valve
    this.setOpCoPreferences("CSG_FB_020_Plant_Steam_Inlet_Shut_Off_Valve", this.csg200PlantSteamInletShutOffValvePrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Plant_Steam_Inlet_Shut_Off_Valve", this.csg500PlantSteamInletShutOffValvePrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Plant_Steam_Inlet_Shut_Off_Valve", this.csg1100PlantSteamInletShutOffValvePrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Plant_Steam_Inlet_Shut_Off_Valve", this.csg1600PlantSteamInletShutOffValvePrefFormControl);
    // Plant steam line trapping
    this.setOpCoPreferences("CSG_FB_020_Plant_Steam_Line_Trapping", this.csg200PlantSteamLineTrappingPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Plant_Steam_Line_Trapping", this.csg500PlantSteamLineTrappingPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Plant_Steam_Line_Trapping", this.csg1100PlantSteamLineTrappingPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Plant_Steam_Line_Trapping", this.csg1600PlantSteamLineTrappingPrefFormControl);
    // TDS control system
    this.setOpCoPreferences("CSG_FB_020_TDS_Control_System", this.csg200TDSControlSystemPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_TDS_Control_System", this.csg500TDSControlSystemPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_TDS_Control_System", this.csg1100TDSControlSystemPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_TDS_Control_System", this.csg1600TDSControlSystemPrefFormControl);
    // Sample Coolers
    this.setOpCoPreferences("CSG_FB_020_Sample_Cooler", this.csg200SampleCoolerPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Sample_Cooler", this.csg500SampleCoolerPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Sample_Cooler", this.csg1100SampleCoolerPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Sample_Cooler", this.csg1600SampleCoolerPrefFormControl);
    // Independent low level alarm
    this.setOpCoPreferences("CSG_FB_020_Independent_Low_Level_Alarm", this.csg200IndependentLowLevelAlarmPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Independent_Low_Level_Alarm", this.csg500IndependentLowLevelAlarmPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Independent_Low_Level_Alarm", this.csg1100IndependentLowLevelAlarmPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Independent_Low_Level_Alarm", this.csg1600IndependentLowLevelAlarmPrefFormControl);
    // Feedwater pre-heating / Degassing
    this.setOpCoPreferences("CSG_FB_020_Feedwater_Pre_Heating_Degassing", this.csg200FeedwaterPreHeatingDegassingPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Feedwater_Pre_Heating_Degassing", this.csg500FeedwaterPreHeatingDegassingPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Feedwater_Pre_Heating_Degassing", this.csg1100FeedwaterPreHeatingDegassingPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Feedwater_Pre_Heating_Degassing", this.csg1600FeedwaterPreHeatingDegassingPrefFormControl);
    // Intelligent diagnostics
    this.setOpCoPreferences("CSG_FB_020_Intelligent_Diagnostics", this.csg200IntelligentDiagnosticsPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Intelligent_Diagnostics", this.csg500IntelligentDiagnosticsPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Intelligent_Diagnostics", this.csg1100IntelligentDiagnosticsPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Intelligent_Diagnostics", this.csg1600IntelligentDiagnosticsPrefFormControl);
    // Clean steam outlet shut-off valve
    this.setOpCoPreferences("CSG_FB_020_Clean_Steam_Outlet_Shut_Off_Valve", this.csg200CleanSteamOutletShutOffValvePrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Clean_Steam_Outlet_Shut_Off_Valve", this.csg500CleanSteamOutletShutOffValvePrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Clean_Steam_Outlet_Shut_Off_Valve", this.csg1100CleanSteamOutletShutOffValvePrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Clean_Steam_Outlet_Shut_Off_Valve", this.csg1600CleanSteamOutletShutOffValvePrefFormControl);
    // Test and certifications
    this.setOpCoPreferences("CSG_FB_020_Test_And_Certification", this.csg200TestAndCertificationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Test_And_Certification", this.csg500TestAndCertificationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Test_And_Certification", this.csg1100TestAndCertificationPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Test_And_Certification", this.csg1600TestAndCertificationPrefFormControl);
    // Level_Indicator
    this.setOpCoPreferences("CSG_FB_020_Level_Indicator", this.csg200Level_IndicatorPrefFormControl);
    this.setOpCoPreferences("CSG_FB_050_Level_Indicator", this.csg500Level_IndicatorPrefFormControl);
    this.setOpCoPreferences("CSG_FB_110_Level_Indicator", this.csg1100Level_IndicatorPrefFormControl);
    this.setOpCoPreferences("CSG_FB_160_Level_Indicator", this.csg1600Level_IndicatorPrefFormControl);    

    this.csgOptionsSelectedItem = "Design Code";

    this.theFormGroup = this.modulePreferencesForm; // to drive GenericChangesGuard

    // Info ToolTip message translations
    this.serviceOffereingMessage = this.translatePipe.transform('SERVICE_OFFERING_MESSAGE', false);
    this.deliveryCostMessage = this.translatePipe.transform('DELIVERY_COST_MESSAGE', false);

  }

  togglePrices() {
    this.showPrices = !this.showPrices;
    this.augmentPriceDataProcessing = true;
    this.augmentPricesToOptionsLists(this.showPrices);
  }

  augmentPricesToOptionsLists(showPrices: Boolean = true) {

    this.csgPricing = new CleanSteamGeneratorFBMiniPricing();    
    this.csgPricing.modelId = -1; // All BOM items    
    this.csgPricing.pricingOptions = [];
    this.csgPricing.basePriceOption = -1;
    this.csgPricing.localRecommendedSalesPriceOption = -1;
    this.csgPricing.landedCostIncreaseFactor = -1;

    this.csgSellingCurrencySymbol = !!this.csgSellingCurrencySymbol ? this.csgSellingCurrencySymbol : "?";
    this.csgPricing.manufacturerId = +(!!this.manufacturerId ? this.manufacturerId : -1);

    this.csgManufacturerCurrency = this.currencyList.find(c => c.id === this.csgManufacturerCurrencyId);
    this.csgManufacturerCurrencySymbol = !!this.csgManufacturerCurrency ? this.csgManufacturerCurrency.symbol : "?";
    
    if (showPrices) {
      // Get RSP Display price data for List item Augmentation
      this.cleanSteamGeneratorService.calculateBOMPrice(this.csgPricing).subscribe((response: CleanSteamGeneratorFBMiniBOMPriceOutput) => {
        if (response) {
          this.csgBOMOutputData = response;
          let manPrice: string = "";
          let localPrices: string = "";
          let isOverride: string = "";
          this.CSG_FB_020_Price = "";
          this.CSG_FB_050_Price = "";
          this.CSG_FB_110_Price = "";
          this.CSG_FB_160_Price = "";

          this.csgBOMOutputData.bomItems.forEach(t => {

            if (showPrices && t.itemType == "Base") {

              // Price the models
              if (t.sRecommendedSalesPrice != 0.0 && t.sRecommendedSalesPrice != parseFloat(t.sDisplayedRSP)) {
                isOverride = 'o';
              }

              manPrice = ' SSP=' + this.csgManufacturerCurrencySymbol + ' ' + this.localizeValue(t.ssp, 0);
              localPrices = ' RSP' + isOverride + '=' + this.csgManufacturerCurrencySymbol + ' ' + this.localizeValue(t.displayedRSP, 0);

              if (t.ssp != t.sSSP) { // if not the same currency data
                manPrice = manPrice + ' (' + this.csgSellingCurrencySymbol + ' ' + this.localizeValue(t.sSSP, 0) + ')'
                localPrices = localPrices + ' (' + this.csgSellingCurrencySymbol + ' ' + this.localizeValue(t.sDisplayedRSP, 0) + ')';
              }

              switch (t.parentMasterTextKey) {
                case "CSG_FB_020":
                  this.CSG_FB_020_Price = manPrice + localPrices;
                  break;

                case "CSG_FB_050":
                  this.CSG_FB_050_Price = manPrice + localPrices;
                  break;

                case "CSG_FB_110":
                  this.CSG_FB_110_Price = manPrice + localPrices;
                  break;

                case "CSG_FB_160":
                  this.CSG_FB_160_Price = manPrice + localPrices;
                  break;

                default:
                  break;
              }
            }

            // Set option item enabled?
            var newEnumerationModulePreferences = this.GetNewEnumerationModulePreferences();
            this.csgBOMOutputData.bomItems.forEach(p => {              

              var elist = newEnumerationModulePreferences.find(e => e.enumerationName == p.parent);

              if (!!elist) {
                var elistItem = elist.enumerationDefinitions.find(l => l.value == p.item);
              }

              p.isEnabled = !!elistItem ? true : false;

              // Set enabled if base CSG model item or add on (Commisoining, Voltage, Warranty etc.)
              if (!p.parentMasterTextKey
                || (!!p.parentMasterTextKey && p.parentMasterTextKey.indexOf('FEEDWATER_') === 0) // no list override for it
                || (!!p.parentMasterTextKey && p.parentMasterTextKey.indexOf('CSG_') === 0)) {
                p.isEnabled = true;
              }
            });

            // Append prices to list translation on UI
            this.translationService.displayGroup.enumerations.forEach(e => {
              e.enumerationDefinitions.forEach(d => {
                if (e.enumerationName == t.parent && d.value == t.item) { // && d.translationText.indexOf(' ' + this.sellingCurrencySymbol + ' ') < 0) {              
                  if (showPrices) {

                    if (t.sRecommendedSalesPrice != 0.0 && (t.sRecommendedSalesPrice != parseFloat(t.sDisplayedRSP))) {
                      isOverride = 'o';
                    }

                    manPrice = ' SSP=' + this.csgManufacturerCurrencySymbol + ' ' + this.localizeValue(t.ssp, 0);
                    localPrices = ' RSP' + isOverride + '=' + this.csgManufacturerCurrencySymbol + ' ' + this.localizeValue(t.displayedRSP, 0);

                    if (t.ssp != t.sSSP) { // if not the same currency data
                      manPrice = manPrice + ' (' + this.csgSellingCurrencySymbol + ' ' + this.localizeValue(t.sSSP, 0) + ')'
                      localPrices = localPrices + ' (' + this.csgSellingCurrencySymbol + ' ' + this.localizeValue(t.sDisplayedRSP, 0) + ')';
                    }

                    // Set the UI text
                    d.extraPostText = manPrice + localPrices;

                  }
                  else {
                    d.extraPostText = ""; // clear augmented data
                  }
                }
              });
            });

          }) // of append prices
          this.augmentPriceDataProcessing = false; // finished, enable button again
          //this.scrollToElement(this.collapsePriceDataTop, "start");
        }
      }); // end of service response
    } // end of if showPrices
    else {
      // remove price augmentation
      this.CSG_FB_020_Price = "";
      this.CSG_FB_050_Price = "";
      this.CSG_FB_110_Price = "";
      this.CSG_FB_160_Price = "";

      this.translationService.displayGroup.enumerations.forEach(e => {
          e.enumerationDefinitions.forEach(d => d.extraPostText = "") // clear augmented data                              
      });
      this.augmentPriceDataProcessing = false; // finished, enable button again
    }
  }
  
  /**
   Method to localize values.
  */
  localizeValue(value: any, decimalPoints: number) {
    return this.localeService.formatDecimal(value.toFixed(decimalPoints));
  }

  /*
  * Method to get and set the OpCo selected options.
  */
  setOpCoPreferences(enumerationPickerName, formControlName)
  {
    // Get the collection list first.
    let csgOpCoPref = this.getEnumerationPickerCollection(enumerationPickerName, true);

    // Check if any OpCo Overrides Data found? If NOT then get the base list populated.
    if (!csgOpCoPref)
    {
      csgOpCoPref = this.cloneDeep(this.getEnumerationPickerCollection(enumerationPickerName, false));
    }

    // Check and set the list.
    if (!!csgOpCoPref && csgOpCoPref.length > 0) {
      formControlName.setValue(csgOpCoPref);
    }
  }

  /*
  * Method to get the Enumeration list by Name.
  */
  getEnumerationPickerCollection(enumerationPickerName, opCoOverride) {
    const enumeration = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === enumerationPickerName && us.opCoOverride === opCoOverride);

    if (!!enumeration && enumeration.length > 0) {
      let definitions = enumeration[0].enumerationDefinitions.sort((currentenumeration, nextenumeration) => {
        if (currentenumeration.sequence > nextenumeration.sequence) {
          return 1;
        }

        if (currentenumeration.sequence < nextenumeration.sequence) {
          return -1;
        }

        return 0;
      });      

      //this.onChange(definitions);
      definitions.forEach(i => i.isDeleted = false);

      return definitions;
    }
  }

  /**
   * Submits the form for saving to the server.
   * @param $ev The submission event.
   */
  submitForm($event) {
    $event.preventDefault();

    // Mark the form as submitted.
    this.formSubmitted = true;

    // Regular Module Preferences.
    const newModulePreferences: ModulePreferenceDetails[] = [];

    newModulePreferences.push(this.getSelectedPreferences("CSGFBMiniSellingCurrency", "csgSellingCurrencyModulePreference"));
    newModulePreferences.push(this.getSelectedPreferences("CSGFBMiniLandCostIncrease", "csgLandedCostIncreaseModulePreference"));
    newModulePreferences.push(this.getSelectedPreferences("CSGFBMiniDeliveryCost", "csgDeliveryCostModulePreference"));
    newModulePreferences.push(this.getSelectedPreferences("CSGFBMiniCommission", "csgCommissionOnlyPriceModulePreference"));
    newModulePreferences.push(this.getSelectedPreferences("CSGFBMiniYearOne", "csgWarrantyOneYearModulePreference"));
    newModulePreferences.push(this.getSelectedPreferences("CSGFBMiniYearTwo", "csgWarrantyTwoYearsModulePreference")); 
    newModulePreferences.push(this.getSelectedPreferences("CSGFBMiniYearThree", "csgWarrantyThreeYearsModulePreference"));

    // Save the changed preferences as an array of preferences
    this.adminService.manageModulePreferences(newModulePreferences).subscribe((response: boolean) => {

      // The form can be submitted again.
      this.formSubmitted = false;

      // Set the operation based on the response.
     // this.isSuccess = response;
      this.alertVisible = true;
    });

    var newEnumerationModulePreferences = this.GetNewEnumerationModulePreferences();

    // Save the changed preferences as an array of preferences
    this.adminService.manageEnumerationModulePreferences(newEnumerationModulePreferences).subscribe((response: boolean) => {

      // The form can be submitted again.
      this.formSubmitted = false;

      // Set the operation based on the response.
      this.isSuccess = response;
      this.alertVisible = true;

      this.modulePreferencesForm.markAsPristine(); // to drive GenericChangesGuard

    });
  }

  GetNewEnumerationModulePreferences(): Enumeration[] {
    // Enumeration Module Preferences.
    const newEnumerationModulePreferences: Enumeration[] = [];

    // Design Code
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Design_Code", "csg200DesignCodePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Design_Code", "csg500DesignCodePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Design_Code", "csg1100DesignCodePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Design_Code", "csg1600DesignCodePreference"));
    // Shell Type
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Shell_Type", "csg200ShellTypePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Shell_Type", "csg500ShellTypePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Shell_Type", "csg1100ShellTypePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Shell_Type", "csg1600ShellTypePreference"));
    // Valve Actuation
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Valve_Actuation", "csg200ValveActuationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Valve_Actuation", "csg500ValveActuationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Valve_Actuation", "csg1100ValveActuationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Valve_Actuation", "csg1600ValveActuationPreference"));

    // Feedwater Pressurisation - does the list have AllowOverride set to true or just readOnly?
    if (!!this.getEnumerationPickerCollection('CSG_FB_020_Feedwater_Pressurisation', true)) {
      // The lists AllowOverride == true, so we can save the OpCo's Module Preference for these lists and list items.
      newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Feedwater_Pressurisation", "csg0200FeedwaterPressurisationPreference"));
      newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Feedwater_Pressurisation", "csg0500FeedwaterPressurisationPreference"));
      newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Feedwater_Pressurisation", "csg1100FeedwaterPressurisationPreference"));
      newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Feedwater_Pressurisation", "csg1600FeedwaterPressurisationPreference"));
    }

    // Control
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Control", "csg200ControlPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Control", "csg500ControlPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Control", "csg1100ControlPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Control", "csg1600ControlPreference"));
    // Communication Interface
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Communication_Interface", "csg200CommunicationInterfacePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Communication_Interface", "csg500CommunicationInterfacePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Communication_Interface", "csg1100CommunicationInterfacePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Communication_Interface", "csg1600CommunicationInterfacePreference"));
    // Frame and Cabinet
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Frame_And_Cabinet", "csg200FrameAndCabinetPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Frame_And_Cabinet", "csg500FrameAndCabinetPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Frame_And_Cabinet", "csg1100FrameAndCabinetPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Frame_And_Cabinet", "csg1600FrameAndCabinetPreference"));
    // Control Panel Location
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Control_Panel_Location", "csg200ControlPanelLocationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Control_Panel_Location", "csg500ControlPanelLocationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Control_Panel_Location", "csg1100ControlPanelLocationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Control_Panel_Location", "csg1600ControlPanelLocationPreference"));
    // Insulation
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Insulation", "csg200InsulationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Insulation", "csg500InsulationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Insulation", "csg1100InsulationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Insulation", "csg1600InsulationPreference"));
    // Wheels And Feet
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Wheels_And_Feet", "csg200WheelsAndFeetPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Wheels_And_Feet", "csg500WheelsAndFeetPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Wheels_And_Feet", "csg1100WheelsAndFeetPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Wheels_And_Feet", "csg1600WheelsAndFeetPreference"));
    // Plant Steam Inlet Shut Off Valve
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Plant_Steam_Inlet_Shut_Off_Valve", "csg200PlantSteamInletShutOffValvePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Plant_Steam_Inlet_Shut_Off_Valve", "csg500PlantSteamInletShutOffValvePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Plant_Steam_Inlet_Shut_Off_Valve", "csg1100PlantSteamInletShutOffValvePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Plant_Steam_Inlet_Shut_Off_Valve", "csg1600PlantSteamInletShutOffValvePreference"));
    // Plant steam line trapping
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Plant_Steam_Line_Trapping", "csg200PlantSteamLineTrappingPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Plant_Steam_Line_Trapping", "csg500PlantSteamLineTrappingPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Plant_Steam_Line_Trapping", "csg1100PlantSteamLineTrappingPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Plant_Steam_Line_Trapping", "csg1600PlantSteamLineTrappingPreference"));
    // TDS control system
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_TDS_Control_System", "csg200TDSControlSystemPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_TDS_Control_System", "csg500TDSControlSystemPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_TDS_Control_System", "csg1100TDSControlSystemPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_TDS_Control_System", "csg1600TDSControlSystemPreference"));
    // Sample Coolers
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Sample_Cooler", "csg200SampleCoolerPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Sample_Cooler", "csg500SampleCoolerPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Sample_Cooler", "csg1100SampleCoolerPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Sample_Cooler", "csg1600SampleCoolerPreference"));
    // Independent low level alarm
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Independent_Low_Level_Alarm", "csg200IndependentLowLevelAlarmPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Independent_Low_Level_Alarm", "csg500IndependentLowLevelAlarmPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Independent_Low_Level_Alarm", "csg1100IndependentLowLevelAlarmPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Independent_Low_Level_Alarm", "csg1600IndependentLowLevelAlarmPreference"));
    // Feedwater pre-heating / Degassing
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Feedwater_Pre_Heating_Degassing", "csg200FeedwaterPreHeatingDegassingPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Feedwater_Pre_Heating_Degassing", "csg500FeedwaterPreHeatingDegassingPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Feedwater_Pre_Heating_Degassing", "csg1100FeedwaterPreHeatingDegassingPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Feedwater_Pre_Heating_Degassing", "csg1600FeedwaterPreHeatingDegassingPreference"));
    // Intelligent diagnostics
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Intelligent_Diagnostics", "csg200IntelligentDiagnosticsPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Intelligent_Diagnostics", "csg500IntelligentDiagnosticsPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Intelligent_Diagnostics", "csg1100IntelligentDiagnosticsPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Intelligent_Diagnostics", "csg1600IntelligentDiagnosticsPreference"));
    // Clean steam outlet shut-off valve
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Clean_Steam_Outlet_Shut_Off_Valve", "csg200CleanSteamOutletShutOffValvePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Clean_Steam_Outlet_Shut_Off_Valve", "csg500CleanSteamOutletShutOffValvePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Clean_Steam_Outlet_Shut_Off_Valve", "csg1100CleanSteamOutletShutOffValvePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Clean_Steam_Outlet_Shut_Off_Valve", "csg1600CleanSteamOutletShutOffValvePreference"));
    // Test and certifications
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Test_And_Certification", "csg200TestAndCertificationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Test_And_Certification", "csg500TestAndCertificationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Test_And_Certification", "csg1100TestAndCertificationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Test_And_Certification", "csg1600TestAndCertificationPreference"));
    // Level_Indicator
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_020_Level_Indicator", "csg200Level_IndicatorPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_050_Level_Indicator", "csg500Level_IndicatorPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_110_Level_Indicator", "csg1100Level_IndicatorPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_FB_160_Level_Indicator", "csg1600Level_IndicatorPreference"));

    return newEnumerationModulePreferences;
  }

  
  /*
  * Method to get opco selected enumeration module prefernce details for each options.
  */
  getSelectedEnumerationPreferences(enumerationPickerName, prefsFormKeyName) {
    var modPrefs: Enumeration = new Enumeration;
    modPrefs.enumerationName = enumerationPickerName;
    modPrefs.opCoOverride = true;
    modPrefs.enumerationDefinitions = this.modulePreferencesForm.controls[prefsFormKeyName].value;

    return modPrefs;
  }

  /*
  * Method to get opco selected module prefernce details.
  */
  getSelectedPreferences(enumerationPickerName, prefsFormKeyName) {
    var modPrefs: ModulePreferenceDetails = new ModulePreferenceDetails;
    modPrefs.name = enumerationPickerName;
    modPrefs.value = "" + this.modulePreferencesForm.controls[prefsFormKeyName].value;
    modPrefs.moduleId = +this.moduleId;
    modPrefs.isDeleted = false;

    return modPrefs;
  }

  closeAlert(): void {
    // Reset the flag
    this.alertVisible = false;
  }

  onChangeAnyOption(): void {
    // Any enumeration-picker (on-change) set the form data to dirty.
    this.modulePreferencesForm.markAsDirty();
  }

  onCSGOptionsChange(event: any) {
    this.csgOptionsSelectedItem = event.selectedValue;
    this.csgOptionsFormControl.markAsPristine(); // Options list selector is not a data change item, so ignore changes.
  }

  /*
  * Method to calculate the currency conversion rate.
  */
  onSellingCurrencyChange(selectedValue: any): void {
    if (selectedValue > 0 && this.csgManufacturerCurrencyId > 0 && this.currencyList.length > 0)
    {      
      let sellingCurrency = this.currencyList.find(c => c.id === +selectedValue);
      let manufacturerCurrency = this.currencyList.find(c => c.id === this.csgManufacturerCurrencyId);

      this.csgSellingCurrencySymbol = sellingCurrency.symbol;
      this.csgCurrencyConversion = +((manufacturerCurrency.rateToGbp * (1 / sellingCurrency.rateToGbp)).toFixed(5));
    }
  }

  /*
  * Method to retrieve the module pref value from the list.
  */
  getModulePreferenceValue(modulePrefList: any, modulePrefName: string) {
    let modPref = modulePrefList.filter(r => r.name === modulePrefName);
    if (modPref && modPref.length > 0) {
      return modPref[0].value;
    }
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

  getRowClass(row): string {
    if (row.isEnabled) {
      return 'row-color-enabled';
    }
    return 'row-color-disabled';
  }
}
