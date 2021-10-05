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
import { CleanSteamGeneratorBOMPriceOutput, CleanSteamGeneratorPricing, BOMItem } from './cleanSteamGeneratorPricingOptions.model';
import { CleanSteamGeneratorService } from './cleanSteamGenerator.service';

import { LocaleService } from 'node_modules/angular-l10n';
import { UserProfileService } from '../../../modules/user-profile/user-profile.service';
import { User } from '../../../modules/user-profile/user.model';

@Component({
  selector: 'cleansteamgenerator-module-preferences',
  templateUrl: './cleansteamgenerator.component.html',
  styleUrls: ['./cleansteamgenerator.component.scss'],
  providers: [CleanSteamGeneratorService]
})
export class CleanSteamGeneratorModulePreferencesComponent implements OnInit, IGenericChanges {
  readonly moduleId: string = "8";
  readonly moduleGroupId: number = 12;
  public cloneDeep = cloneDeep_;
  readonly moduleName: string = "Clean Steam Generator";

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
 // public csgDeliveryCost: string;
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
  csg020DesignCodePrefFormControl: FormControl;
  csg055DesignCodePrefFormControl: FormControl;
  csg125DesignCodePrefFormControl: FormControl;
  csg180DesignCodePrefFormControl: FormControl;
  // Shell Type
  csg020ShellTypePrefFormControl: FormControl;
  csg055ShellTypePrefFormControl: FormControl;
  csg125ShellTypePrefFormControl: FormControl;
  csg180ShellTypePrefFormControl: FormControl;
  // Valve Actuation
  csg020ValveActuationPrefFormControl: FormControl;
  csg055ValveActuationPrefFormControl: FormControl;
  csg125ValveActuationPrefFormControl: FormControl;
  csg180ValveActuationPrefFormControl: FormControl;
  // FeedwaterPressurisation
  csg020FeedwaterPressurisationPrefFormControl: FormControl;
  csg055FeedwaterPressurisationPrefFormControl: FormControl;
  csg125FeedwaterPressurisationPrefFormControl: FormControl;
  csg180FeedwaterPressurisationPrefFormControl: FormControl;
  // Control
  csg020ControlPrefFormControl: FormControl;
  csg055ControlPrefFormControl: FormControl;
  csg125ControlPrefFormControl: FormControl;
  csg180ControlPrefFormControl: FormControl;
  // Communication Interface
  csg020CommunicationInterfacePrefFormControl: FormControl;
  csg055CommunicationInterfacePrefFormControl: FormControl;
  csg125CommunicationInterfacePrefFormControl: FormControl;
  csg180CommunicationInterfacePrefFormControl: FormControl;
  // Frame and Cabinet
  csg020FrameAndCabinetPrefFormControl: FormControl;
  csg055FrameAndCabinetPrefFormControl: FormControl;
  csg125FrameAndCabinetPrefFormControl: FormControl;
  csg180FrameAndCabinetPrefFormControl: FormControl;
  // Control Panel Location
  csg020ControlPanelLocationPrefFormControl: FormControl;
  csg055ControlPanelLocationPrefFormControl: FormControl;
  csg125ControlPanelLocationPrefFormControl: FormControl;
  csg180ControlPanelLocationPrefFormControl: FormControl;
  // Insulation
  csg020InsulationPrefFormControl: FormControl;
  csg055InsulationPrefFormControl: FormControl;
  csg125InsulationPrefFormControl: FormControl;
  csg180InsulationPrefFormControl: FormControl;
  // Wheels And Feet
  csg020WheelsAndFeetPrefFormControl: FormControl;
  csg055WheelsAndFeetPrefFormControl: FormControl;
  csg125WheelsAndFeetPrefFormControl: FormControl;
  csg180WheelsAndFeetPrefFormControl: FormControl;
  // Plant Steam Inlet Shut Off Valve
  csg020PlantSteamInletShutOffValvePrefFormControl: FormControl;
  csg055PlantSteamInletShutOffValvePrefFormControl: FormControl;
  csg125PlantSteamInletShutOffValvePrefFormControl: FormControl;
  csg180PlantSteamInletShutOffValvePrefFormControl: FormControl;
  // Plant Steam Line Trapping
  csg020PlantSteamLineTrappingPrefFormControl: FormControl;
  csg055PlantSteamLineTrappingPrefFormControl: FormControl;
  csg125PlantSteamLineTrappingPrefFormControl: FormControl;
  csg180PlantSteamLineTrappingPrefFormControl: FormControl;
  // TDS control system
  csg020TDSControlSystemPrefFormControl: FormControl;
  csg055TDSControlSystemPrefFormControl: FormControl;
  csg125TDSControlSystemPrefFormControl: FormControl;
  csg180TDSControlSystemPrefFormControl: FormControl;
  // Sample Coolers
  csg020SampleCoolerPrefFormControl: FormControl;
  csg055SampleCoolerPrefFormControl: FormControl;
  csg125SampleCoolerPrefFormControl: FormControl;
  csg180SampleCoolerPrefFormControl: FormControl;
  // Independent low level alarm
  csg020IndependentLowLevelAlarmPrefFormControl: FormControl;
  csg055IndependentLowLevelAlarmPrefFormControl: FormControl;
  csg125IndependentLowLevelAlarmPrefFormControl: FormControl;
  csg180IndependentLowLevelAlarmPrefFormControl: FormControl;
  // Feedwater pre-heating / Degassing
  csg020FeedwaterPreHeatingDegassingPrefFormControl: FormControl;
  csg055FeedwaterPreHeatingDegassingPrefFormControl: FormControl;
  csg125FeedwaterPreHeatingDegassingPrefFormControl: FormControl;
  csg180FeedwaterPreHeatingDegassingPrefFormControl: FormControl;
  // Intelligent diagnostics
  csg020IntelligentDiagnosticsPrefFormControl: FormControl;
  csg055IntelligentDiagnosticsPrefFormControl: FormControl;
  csg125IntelligentDiagnosticsPrefFormControl: FormControl;
  csg180IntelligentDiagnosticsPrefFormControl: FormControl;
  // Clean steam outlet shut-off valve
  csg020CleanSteamOutletShutOffValvePrefFormControl: FormControl;
  csg055CleanSteamOutletShutOffValvePrefFormControl: FormControl;
  csg125CleanSteamOutletShutOffValvePrefFormControl: FormControl;
  csg180CleanSteamOutletShutOffValvePrefFormControl: FormControl;
  // Test and certifications
  csg020TestAndCertificationPrefFormControl: FormControl;
  csg055TestAndCertificationPrefFormControl: FormControl;
  csg125TestAndCertificationPrefFormControl: FormControl;
  csg180TestAndCertificationPrefFormControl: FormControl;
  // Level_Indicator
  csg020Level_IndicatorPrefFormControl: FormControl;
  csg055Level_IndicatorPrefFormControl: FormControl;
  csg125Level_IndicatorPrefFormControl: FormControl;
  csg180Level_IndicatorPrefFormControl: FormControl;

  serviceOffereingMessage: string;
  deliveryCostMessage: string;

  csgPricing: CleanSteamGeneratorPricing;
  csgBOMOutputData: CleanSteamGeneratorBOMPriceOutput;
  csgBOMOutputDataRows: BOMItem[] = [];
  manufacturerId: number;
  CSG_HS_020_Price: string;
  CSG_HS_055_Price: string;
  CSG_HS_125_Price: string;
  CSG_HS_180_Price: string;
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
    private cleanSteamGeneratorService: CleanSteamGeneratorService,
    private localeService: LocaleService,
    private userProfileService: UserProfileService) {

    this.userProfileService.getUserDetails().subscribe(user => {
      this.user = user;
      if (!!this.user) {
        this.operatingCompany = " : " + this.user.operatingCompanyName;
      } 
    });

    this.csgBOMOutputData = new CleanSteamGeneratorBOMPriceOutput();

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
    this.csg020DesignCodePrefFormControl = new FormControl(null);
    this.csg055DesignCodePrefFormControl = new FormControl(null);
    this.csg125DesignCodePrefFormControl = new FormControl(null);
    this.csg180DesignCodePrefFormControl = new FormControl(null);
    // Shell Type
    this.csg020ShellTypePrefFormControl = new FormControl(null);
    this.csg055ShellTypePrefFormControl = new FormControl(null);
    this.csg125ShellTypePrefFormControl = new FormControl(null);
    this.csg180ShellTypePrefFormControl = new FormControl(null);
    // Valve Actuation
    this.csg020ValveActuationPrefFormControl = new FormControl(null);
    this.csg055ValveActuationPrefFormControl = new FormControl(null);
    this.csg125ValveActuationPrefFormControl = new FormControl(null);
    this.csg180ValveActuationPrefFormControl = new FormControl(null);
    // FeedwaterPressurisation
    this.csg020FeedwaterPressurisationPrefFormControl = new FormControl(null);
    this.csg055FeedwaterPressurisationPrefFormControl = new FormControl(null);
    this.csg125FeedwaterPressurisationPrefFormControl = new FormControl(null);
    this.csg180FeedwaterPressurisationPrefFormControl = new FormControl(null);
    // Control
    this.csg020ControlPrefFormControl = new FormControl(null);
    this.csg055ControlPrefFormControl = new FormControl(null);
    this.csg125ControlPrefFormControl = new FormControl(null);
    this.csg180ControlPrefFormControl = new FormControl(null);
    // Communication Interface
    this.csg020CommunicationInterfacePrefFormControl = new FormControl(null);
    this.csg055CommunicationInterfacePrefFormControl = new FormControl(null);
    this.csg125CommunicationInterfacePrefFormControl = new FormControl(null);
    this.csg180CommunicationInterfacePrefFormControl = new FormControl(null);
    // Frame and Cabinet
    this.csg020FrameAndCabinetPrefFormControl = new FormControl(null);
    this.csg055FrameAndCabinetPrefFormControl = new FormControl(null);
    this.csg125FrameAndCabinetPrefFormControl = new FormControl(null);
    this.csg180FrameAndCabinetPrefFormControl = new FormControl(null);
    // Control Panel Location
    this.csg020ControlPanelLocationPrefFormControl = new FormControl(null);
    this.csg055ControlPanelLocationPrefFormControl = new FormControl(null);
    this.csg125ControlPanelLocationPrefFormControl = new FormControl(null);
    this.csg180ControlPanelLocationPrefFormControl = new FormControl(null);
    // Insulation
    this.csg020InsulationPrefFormControl = new FormControl(null);
    this.csg055InsulationPrefFormControl = new FormControl(null);
    this.csg125InsulationPrefFormControl = new FormControl(null);
    this.csg180InsulationPrefFormControl = new FormControl(null);
    // Wheels And Feet
    this.csg020WheelsAndFeetPrefFormControl = new FormControl(null);
    this.csg055WheelsAndFeetPrefFormControl = new FormControl(null);
    this.csg125WheelsAndFeetPrefFormControl = new FormControl(null);
    this.csg180WheelsAndFeetPrefFormControl = new FormControl(null);
    // Plant Steam Inlet Shut Off Valve
    this.csg020PlantSteamInletShutOffValvePrefFormControl = new FormControl(null);
    this.csg055PlantSteamInletShutOffValvePrefFormControl = new FormControl(null);
    this.csg125PlantSteamInletShutOffValvePrefFormControl = new FormControl(null);
    this.csg180PlantSteamInletShutOffValvePrefFormControl = new FormControl(null);
    // Plant Steam Line Trapping
    this.csg020PlantSteamLineTrappingPrefFormControl = new FormControl(null);
    this.csg055PlantSteamLineTrappingPrefFormControl = new FormControl(null);
    this.csg125PlantSteamLineTrappingPrefFormControl = new FormControl(null);
    this.csg180PlantSteamLineTrappingPrefFormControl = new FormControl(null);
    // TDS control system
    this.csg020TDSControlSystemPrefFormControl = new FormControl(null);
    this.csg055TDSControlSystemPrefFormControl = new FormControl(null);
    this.csg125TDSControlSystemPrefFormControl = new FormControl(null);
    this.csg180TDSControlSystemPrefFormControl = new FormControl(null);
    // Sample Coolers
    this.csg020SampleCoolerPrefFormControl = new FormControl(null);
    this.csg055SampleCoolerPrefFormControl = new FormControl(null);
    this.csg125SampleCoolerPrefFormControl = new FormControl(null);
    this.csg180SampleCoolerPrefFormControl = new FormControl(null);
    // Independent low level alarm
    this.csg020IndependentLowLevelAlarmPrefFormControl = new FormControl(null);
    this.csg055IndependentLowLevelAlarmPrefFormControl = new FormControl(null);
    this.csg125IndependentLowLevelAlarmPrefFormControl = new FormControl(null);
    this.csg180IndependentLowLevelAlarmPrefFormControl = new FormControl(null);
    // Feedwater pre-heating / Degassing
    this.csg020FeedwaterPreHeatingDegassingPrefFormControl = new FormControl(null);
    this.csg055FeedwaterPreHeatingDegassingPrefFormControl = new FormControl(null);
    this.csg125FeedwaterPreHeatingDegassingPrefFormControl = new FormControl(null);
    this.csg180FeedwaterPreHeatingDegassingPrefFormControl = new FormControl(null);
    // Intelligent diagnostics
    this.csg020IntelligentDiagnosticsPrefFormControl = new FormControl(null);
    this.csg055IntelligentDiagnosticsPrefFormControl = new FormControl(null);
    this.csg125IntelligentDiagnosticsPrefFormControl = new FormControl(null);
    this.csg180IntelligentDiagnosticsPrefFormControl = new FormControl(null);
    // Clean steam outlet shut-off valve
    this.csg020CleanSteamOutletShutOffValvePrefFormControl = new FormControl(null);
    this.csg055CleanSteamOutletShutOffValvePrefFormControl = new FormControl(null);
    this.csg125CleanSteamOutletShutOffValvePrefFormControl = new FormControl(null);
    this.csg180CleanSteamOutletShutOffValvePrefFormControl = new FormControl(null);
    // Test and certifications
    this.csg020TestAndCertificationPrefFormControl = new FormControl(null);
    this.csg055TestAndCertificationPrefFormControl = new FormControl(null);
    this.csg125TestAndCertificationPrefFormControl = new FormControl(null);
    this.csg180TestAndCertificationPrefFormControl = new FormControl(null);
    // Level_Indicator
    this.csg020Level_IndicatorPrefFormControl = new FormControl(null);
    this.csg055Level_IndicatorPrefFormControl = new FormControl(null);
    this.csg125Level_IndicatorPrefFormControl = new FormControl(null);
    this.csg180Level_IndicatorPrefFormControl = new FormControl(null);

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
      csg020DesignCodePreference: this.csg020DesignCodePrefFormControl,
      csg055DesignCodePreference: this.csg055DesignCodePrefFormControl,
      csg125DesignCodePreference: this.csg125DesignCodePrefFormControl,
      csg180DesignCodePreference: this.csg180DesignCodePrefFormControl,
      // Shell Type
      csg020ShellTypePreference: this.csg020ShellTypePrefFormControl,
      csg055ShellTypePreference: this.csg055ShellTypePrefFormControl,
      csg125ShellTypePreference: this.csg125ShellTypePrefFormControl,
      csg180ShellTypePreference: this.csg180ShellTypePrefFormControl,
      // Valve Actuation
      csg020ValveActuationPreference: this.csg020ValveActuationPrefFormControl,
      csg055ValveActuationPreference: this.csg055ValveActuationPrefFormControl,
      csg125ValveActuationPreference: this.csg125ValveActuationPrefFormControl,
      csg180ValveActuationPreference: this.csg180ValveActuationPrefFormControl,
      // FeedwaterPressurisation
      csg020FeedwaterPressurisationPreference: this.csg020FeedwaterPressurisationPrefFormControl,
      csg055FeedwaterPressurisationPreference: this.csg055FeedwaterPressurisationPrefFormControl,
      csg125FeedwaterPressurisationPreference: this.csg125FeedwaterPressurisationPrefFormControl,
      csg180FeedwaterPressurisationPreference: this.csg180FeedwaterPressurisationPrefFormControl,
     // Control
      csg020ControlPreference: this.csg020ControlPrefFormControl,
      csg055ControlPreference: this.csg055ControlPrefFormControl,
      csg125ControlPreference: this.csg125ControlPrefFormControl,
      csg180ControlPreference: this.csg180ControlPrefFormControl,
      // Communication Interface
      csg020CommunicationInterfacePreference: this.csg020CommunicationInterfacePrefFormControl,
      csg055CommunicationInterfacePreference: this.csg055CommunicationInterfacePrefFormControl,
      csg125CommunicationInterfacePreference: this.csg125CommunicationInterfacePrefFormControl,
      csg180CommunicationInterfacePreference: this.csg180CommunicationInterfacePrefFormControl,
      // Frame and Cabinet
      csg020FrameAndCabinetPreference: this.csg020FrameAndCabinetPrefFormControl,
      csg055FrameAndCabinetPreference: this.csg055FrameAndCabinetPrefFormControl,
      csg125FrameAndCabinetPreference: this.csg125FrameAndCabinetPrefFormControl,
      csg180FrameAndCabinetPreference: this.csg180FrameAndCabinetPrefFormControl,
      // Control Panel Location
      csg020ControlPanelLocationPreference: this.csg020ControlPanelLocationPrefFormControl,
      csg055ControlPanelLocationPreference: this.csg055ControlPanelLocationPrefFormControl,
      csg125ControlPanelLocationPreference: this.csg125ControlPanelLocationPrefFormControl,
      csg180ControlPanelLocationPreference: this.csg180ControlPanelLocationPrefFormControl,
      // Insulation
      csg020InsulationPreference: this.csg020InsulationPrefFormControl,
      csg055InsulationPreference: this.csg055InsulationPrefFormControl,
      csg125InsulationPreference: this.csg125InsulationPrefFormControl,
      csg180InsulationPreference: this.csg180InsulationPrefFormControl,
      // Wheels And Feet
      csg020WheelsAndFeetPreference: this.csg020WheelsAndFeetPrefFormControl,
      csg055WheelsAndFeetPreference: this.csg055WheelsAndFeetPrefFormControl,
      csg125WheelsAndFeetPreference: this.csg125WheelsAndFeetPrefFormControl,
      csg180WheelsAndFeetPreference: this.csg180WheelsAndFeetPrefFormControl,
      // Plant Steam Inlet Shut Off Valve
      csg020PlantSteamInletShutOffValvePreference: this.csg020PlantSteamInletShutOffValvePrefFormControl,
      csg055PlantSteamInletShutOffValvePreference: this.csg055PlantSteamInletShutOffValvePrefFormControl,
      csg125PlantSteamInletShutOffValvePreference: this.csg125PlantSteamInletShutOffValvePrefFormControl,
      csg180PlantSteamInletShutOffValvePreference: this.csg180PlantSteamInletShutOffValvePrefFormControl,
      // Plant Steam Line Trapping
      csg020PlantSteamLineTrappingPreference: this.csg020PlantSteamLineTrappingPrefFormControl,
      csg055PlantSteamLineTrappingPreference: this.csg055PlantSteamLineTrappingPrefFormControl,
      csg125PlantSteamLineTrappingPreference: this.csg125PlantSteamLineTrappingPrefFormControl,
      csg180PlantSteamLineTrappingPreference: this.csg180PlantSteamLineTrappingPrefFormControl,
      // TDS control system
      csg020TDSControlSystemPreference: this.csg020TDSControlSystemPrefFormControl,
      csg055TDSControlSystemPreference: this.csg055TDSControlSystemPrefFormControl,
      csg125TDSControlSystemPreference: this.csg125TDSControlSystemPrefFormControl,
      csg180TDSControlSystemPreference: this.csg180TDSControlSystemPrefFormControl,
      // Sample Coolers
      csg020SampleCoolerPreference: this.csg020SampleCoolerPrefFormControl,
      csg055SampleCoolerPreference: this.csg055SampleCoolerPrefFormControl,
      csg125SampleCoolerPreference: this.csg125SampleCoolerPrefFormControl,
      csg180SampleCoolerPreference: this.csg180SampleCoolerPrefFormControl,
      // Independent low level alarm
      csg020IndependentLowLevelAlarmPreference: this.csg020IndependentLowLevelAlarmPrefFormControl,
      csg055IndependentLowLevelAlarmPreference: this.csg055IndependentLowLevelAlarmPrefFormControl,
      csg125IndependentLowLevelAlarmPreference: this.csg125IndependentLowLevelAlarmPrefFormControl,
      csg180IndependentLowLevelAlarmPreference: this.csg180IndependentLowLevelAlarmPrefFormControl,
      // Feedwater pre-heating / Degassing
      csg020FeedwaterPreHeatingDegassingPreference: this.csg020FeedwaterPreHeatingDegassingPrefFormControl,
      csg055FeedwaterPreHeatingDegassingPreference: this.csg055FeedwaterPreHeatingDegassingPrefFormControl,
      csg125FeedwaterPreHeatingDegassingPreference: this.csg125FeedwaterPreHeatingDegassingPrefFormControl,
      csg180FeedwaterPreHeatingDegassingPreference: this.csg180FeedwaterPreHeatingDegassingPrefFormControl,
      // Intelligent diagnostics
      csg020IntelligentDiagnosticsPreference: this.csg020IntelligentDiagnosticsPrefFormControl,
      csg055IntelligentDiagnosticsPreference: this.csg055IntelligentDiagnosticsPrefFormControl,
      csg125IntelligentDiagnosticsPreference: this.csg125IntelligentDiagnosticsPrefFormControl,
      csg180IntelligentDiagnosticsPreference: this.csg180IntelligentDiagnosticsPrefFormControl,
      // Clean steam outlet shut-off valve
      csg020CleanSteamOutletShutOffValvePreference: this.csg020CleanSteamOutletShutOffValvePrefFormControl,
      csg055CleanSteamOutletShutOffValvePreference: this.csg055CleanSteamOutletShutOffValvePrefFormControl,
      csg125CleanSteamOutletShutOffValvePreference: this.csg125CleanSteamOutletShutOffValvePrefFormControl,
      csg180CleanSteamOutletShutOffValvePreference: this.csg180CleanSteamOutletShutOffValvePrefFormControl,
      // Test and certifications
      csg020TestAndCertificationPreference: this.csg020TestAndCertificationPrefFormControl,
      csg055TestAndCertificationPreference: this.csg055TestAndCertificationPrefFormControl,
      csg125TestAndCertificationPreference: this.csg125TestAndCertificationPrefFormControl,
      csg180TestAndCertificationPreference: this.csg180TestAndCertificationPrefFormControl,
      // Level_Indicator
      csg020Level_IndicatorPreference: this.csg020Level_IndicatorPrefFormControl,
      csg055Level_IndicatorPreference: this.csg055Level_IndicatorPrefFormControl,
      csg125Level_IndicatorPreference: this.csg125Level_IndicatorPrefFormControl,
      csg180Level_IndicatorPreference: this.csg180Level_IndicatorPrefFormControl,

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
      if (result && result.length > 0) {
        // And set their values accordingly.
        this.manufacturerId = +this.getModulePreferenceValue(result, "CSGManufacturer");
        this.csgManufacturerPrefFormControl.setValue(this.manufacturerId);

        this.csgManufacturerCurrencyId = +this.getModulePreferenceValue(result, "CSGManufacturerCurrency");
        this.csgManufacturerCurrencyPrefFormControl.setValue(this.csgManufacturerCurrencyId);        

        this.csgSellingCurrencyId = this.getModulePreferenceValue(result, "CSGSellingCurrency");
        this.csgSellingCurrencyPrefFormControl.setValue(this.csgSellingCurrencyId);
        // Calculate the currency conversion rate.
        this.onSellingCurrencyChange(this.csgSellingCurrencyId);


        this.csgLandedCostIncrease = this.getModulePreferenceValue(result, "CSGLandCostIncrease");
        this.csgLandedCostIncreasePrefFormControl.setValue(this.csgLandedCostIncrease);

        this.csgDeliveryCostPrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGDeliveryCost"));
        this.csgCommissionOnlyPricePrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGCommission"));
        this.csgWarrantyOneYearPrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGYearOne"));
        this.csgWarrantyTwoYearsPrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGYearTwo"));
        this.csgWarrantyThreeYearsPrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGYearThree"));

        // Get the currency data.
      
       
      }

      this.adminService.getCurrencyData().subscribe(data => {
        this.currencyList = data;

        // Selling currency found, so try to calculate the currency conversion rate.
        this.onSellingCurrencyChange(this.csgSellingCurrencyId);

        this.augmentPriceDataProcessing = false; // loaded enable toggle prices button
      });
    });

    // Get the list of manufacturers.
    this.adminService.getManufacturerData(this.moduleGroupId).subscribe((result: Array<Manufacturer>) => {
      // Update the subject with the data that's just been retrieved (see the constructor).
      this.manufacturerList = result;
    });


    // Now, set the "OpCo Selected Options" for the different CSG options.
    // Design Code
    this.setOpCoPreferences("CSG_HS_020_Design_Code", this.csg020DesignCodePrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Design_Code", this.csg055DesignCodePrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Design_Code", this.csg125DesignCodePrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Design_Code", this.csg180DesignCodePrefFormControl);
    // Shell Type
    this.setOpCoPreferences("CSG_HS_020_Shell_Type", this.csg020ShellTypePrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Shell_Type", this.csg055ShellTypePrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Shell_Type", this.csg125ShellTypePrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Shell_Type", this.csg180ShellTypePrefFormControl);
    // Valve Actuation
    this.setOpCoPreferences("CSG_HS_020_Valve_Actuation", this.csg020ValveActuationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Valve_Actuation", this.csg055ValveActuationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Valve_Actuation", this.csg125ValveActuationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Valve_Actuation", this.csg180ValveActuationPrefFormControl);
    // FeedwaterPressurisation
    this.setOpCoPreferences("CSG_HS_020_Feedwater_Pressurisation", this.csg020FeedwaterPressurisationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Feedwater_Pressurisation", this.csg055FeedwaterPressurisationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Feedwater_Pressurisation", this.csg125FeedwaterPressurisationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Feedwater_Pressurisation", this.csg180FeedwaterPressurisationPrefFormControl);
    // Control
    this.setOpCoPreferences("CSG_HS_020_Control", this.csg020ControlPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Control", this.csg055ControlPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Control", this.csg125ControlPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Control", this.csg180ControlPrefFormControl);
    // Communication Interface
    this.setOpCoPreferences("CSG_HS_020_Communication_Interface", this.csg020CommunicationInterfacePrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Communication_Interface", this.csg055CommunicationInterfacePrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Communication_Interface", this.csg125CommunicationInterfacePrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Communication_Interface", this.csg180CommunicationInterfacePrefFormControl);
    // Frame and Cabinet
    this.setOpCoPreferences("CSG_HS_020_Frame_And_Cabinet", this.csg020FrameAndCabinetPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Frame_And_Cabinet", this.csg055FrameAndCabinetPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Frame_And_Cabinet", this.csg125FrameAndCabinetPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Frame_And_Cabinet", this.csg180FrameAndCabinetPrefFormControl);
    // Control Panel Location
    this.setOpCoPreferences("CSG_HS_020_Control_Panel_Location", this.csg020ControlPanelLocationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Control_Panel_Location", this.csg055ControlPanelLocationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Control_Panel_Location", this.csg125ControlPanelLocationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Control_Panel_Location", this.csg180ControlPanelLocationPrefFormControl);
    // Insulation
    this.setOpCoPreferences("CSG_HS_020_Insulation", this.csg020InsulationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Insulation", this.csg055InsulationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Insulation", this.csg125InsulationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Insulation", this.csg180InsulationPrefFormControl);
    // Wheels And Feet
    this.setOpCoPreferences("CSG_HS_020_Wheels_And_Feet", this.csg020WheelsAndFeetPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Wheels_And_Feet", this.csg055WheelsAndFeetPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Wheels_And_Feet", this.csg125WheelsAndFeetPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Wheels_And_Feet", this.csg180WheelsAndFeetPrefFormControl);
    // Plant Steam Inlet Shut Off Valve
    this.setOpCoPreferences("CSG_HS_020_Plant_Steam_Inlet_Shut_Off_Valve", this.csg020PlantSteamInletShutOffValvePrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Plant_Steam_Inlet_Shut_Off_Valve", this.csg055PlantSteamInletShutOffValvePrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Plant_Steam_Inlet_Shut_Off_Valve", this.csg125PlantSteamInletShutOffValvePrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Plant_Steam_Inlet_Shut_Off_Valve", this.csg180PlantSteamInletShutOffValvePrefFormControl);
    // Plant steam line trapping
    this.setOpCoPreferences("CSG_HS_020_Plant_Steam_Line_Trapping", this.csg020PlantSteamLineTrappingPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Plant_Steam_Line_Trapping", this.csg055PlantSteamLineTrappingPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Plant_Steam_Line_Trapping", this.csg125PlantSteamLineTrappingPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Plant_Steam_Line_Trapping", this.csg180PlantSteamLineTrappingPrefFormControl);
    // TDS control system
    this.setOpCoPreferences("CSG_HS_020_TDS_Control_System", this.csg020TDSControlSystemPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_TDS_Control_System", this.csg055TDSControlSystemPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_TDS_Control_System", this.csg125TDSControlSystemPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_TDS_Control_System", this.csg180TDSControlSystemPrefFormControl);
    // Sample Coolers
    this.setOpCoPreferences("CSG_HS_020_Sample_Cooler", this.csg020SampleCoolerPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Sample_Cooler", this.csg055SampleCoolerPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Sample_Cooler", this.csg125SampleCoolerPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Sample_Cooler", this.csg180SampleCoolerPrefFormControl);
    // Independent low level alarm
    this.setOpCoPreferences("CSG_HS_020_Independent_Low_Level_Alarm", this.csg020IndependentLowLevelAlarmPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Independent_Low_Level_Alarm", this.csg055IndependentLowLevelAlarmPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Independent_Low_Level_Alarm", this.csg125IndependentLowLevelAlarmPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Independent_Low_Level_Alarm", this.csg180IndependentLowLevelAlarmPrefFormControl);
    // Feedwater pre-heating / Degassing
    this.setOpCoPreferences("CSG_HS_020_Feedwater_Pre_Heating_Degassing", this.csg020FeedwaterPreHeatingDegassingPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Feedwater_Pre_Heating_Degassing", this.csg055FeedwaterPreHeatingDegassingPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Feedwater_Pre_Heating_Degassing", this.csg125FeedwaterPreHeatingDegassingPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Feedwater_Pre_Heating_Degassing", this.csg180FeedwaterPreHeatingDegassingPrefFormControl);
    // Intelligent diagnostics
    this.setOpCoPreferences("CSG_HS_020_Intelligent_Diagnostics", this.csg020IntelligentDiagnosticsPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Intelligent_Diagnostics", this.csg055IntelligentDiagnosticsPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Intelligent_Diagnostics", this.csg125IntelligentDiagnosticsPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Intelligent_Diagnostics", this.csg180IntelligentDiagnosticsPrefFormControl);
    // Clean steam outlet shut-off valve
    this.setOpCoPreferences("CSG_HS_020_Clean_Steam_Outlet_Shut_Off_Valve", this.csg020CleanSteamOutletShutOffValvePrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Clean_Steam_Outlet_Shut_Off_Valve", this.csg055CleanSteamOutletShutOffValvePrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Clean_Steam_Outlet_Shut_Off_Valve", this.csg125CleanSteamOutletShutOffValvePrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Clean_Steam_Outlet_Shut_Off_Valve", this.csg180CleanSteamOutletShutOffValvePrefFormControl);
    // Test and certifications
    this.setOpCoPreferences("CSG_HS_020_Test_And_Certification", this.csg020TestAndCertificationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Test_And_Certification", this.csg055TestAndCertificationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Test_And_Certification", this.csg125TestAndCertificationPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Test_And_Certification", this.csg180TestAndCertificationPrefFormControl);
    // Level_Indicator
    this.setOpCoPreferences("CSG_HS_020_Level_Indicator", this.csg020Level_IndicatorPrefFormControl);
    this.setOpCoPreferences("CSG_HS_055_Level_Indicator", this.csg055Level_IndicatorPrefFormControl);
    this.setOpCoPreferences("CSG_HS_125_Level_Indicator", this.csg125Level_IndicatorPrefFormControl);
    this.setOpCoPreferences("CSG_HS_180_Level_Indicator", this.csg180Level_IndicatorPrefFormControl);

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

    this.csgPricing = new CleanSteamGeneratorPricing();    
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
      this.cleanSteamGeneratorService.calculateBOMPrice(this.csgPricing).subscribe((response: CleanSteamGeneratorBOMPriceOutput) => {
        if (response) {
          this.csgBOMOutputData = response;
          let manPrice: string = "";
          let localPrices: string = "";
          let isOverride: string = "";
          this.CSG_HS_020_Price = "";
          this.CSG_HS_055_Price = "";
          this.CSG_HS_125_Price = "";
          this.CSG_HS_180_Price = "";

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
                case "CSG_HS_020":
                  this.CSG_HS_020_Price = manPrice + localPrices;
                  break;

                case "CSG_HS_055":
                  this.CSG_HS_055_Price = manPrice + localPrices;
                  break;

                case "CSG_HS_125":
                  this.CSG_HS_125_Price = manPrice + localPrices;
                  break;

                case "CSG_HS_180":
                  this.CSG_HS_180_Price = manPrice + localPrices;
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
      this.CSG_HS_020_Price = "";
      this.CSG_HS_055_Price = "";
      this.CSG_HS_125_Price = "";
      this.CSG_HS_180_Price = "";

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

    var csgSellingCurrency = this.getSelectedPreferences("CSGSellingCurrency", "csgSellingCurrencyModulePreference");
    var CSGLandCostIncrease = this.getSelectedPreferences("CSGLandCostIncrease", "csgLandedCostIncreaseModulePreference");
    var CSGDeliveryCost = this.getSelectedPreferences("CSGDeliveryCost", "csgDeliveryCostModulePreference");
    var CSGCommission = this.getSelectedPreferences("CSGCommission", "csgCommissionOnlyPriceModulePreference");
    var CSGYearOne = this.getSelectedPreferences("CSGYearOne", "csgWarrantyOneYearModulePreference");
    var CSGYearTwo = this.getSelectedPreferences("CSGYearTwo", "csgWarrantyTwoYearsModulePreference");
    var CSGYearThree = this.getSelectedPreferences("CSGYearThree", "csgWarrantyThreeYearsModulePreference");     

    newModulePreferences.push(csgSellingCurrency);
    newModulePreferences.push(CSGLandCostIncrease);
    newModulePreferences.push(CSGDeliveryCost);
    newModulePreferences.push(CSGCommission);
    newModulePreferences.push(CSGYearOne);
    newModulePreferences.push(CSGYearTwo); 
    newModulePreferences.push(CSGYearThree);

    // Save the changed preferences as an array of preferences
    this.adminService.manageModulePreferences(newModulePreferences).subscribe((response: boolean) => {

      // The form can be submitted again.
      this.formSubmitted = false;

      // Set the operation based on the response.
      //this.isSuccess = response;
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
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Design_Code", "csg020DesignCodePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Design_Code", "csg055DesignCodePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Design_Code", "csg125DesignCodePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Design_Code", "csg180DesignCodePreference"));
    // Shell Type
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Shell_Type", "csg020ShellTypePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Shell_Type", "csg055ShellTypePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Shell_Type", "csg125ShellTypePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Shell_Type", "csg180ShellTypePreference"));
    // Valve Actuation
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Valve_Actuation", "csg020ValveActuationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Valve_Actuation", "csg055ValveActuationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Valve_Actuation", "csg125ValveActuationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Valve_Actuation", "csg180ValveActuationPreference"));

    // Feedwater Pressurisation - does the list have AllowOverride set to true or just readOnly?
    if (!!this.getEnumerationPickerCollection('CSG_HS_020_Feedwater_Pressurisation', true)) {
      // The lists AllowOverride == true, so we can save the OpCo's Module Preference for these lists and list items.
      newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Feedwater_Pressurisation", "csg020FeedwaterPressurisationPreference"));
      newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Feedwater_Pressurisation", "csg055FeedwaterPressurisationPreference"));
      newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Feedwater_Pressurisation", "csg125FeedwaterPressurisationPreference"));
      newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Feedwater_Pressurisation", "csg180FeedwaterPressurisationPreference"));
    }

    // Control
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Control", "csg020ControlPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Control", "csg055ControlPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Control", "csg125ControlPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Control", "csg180ControlPreference"));
    // Communication Interface
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Communication_Interface", "csg020CommunicationInterfacePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Communication_Interface", "csg055CommunicationInterfacePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Communication_Interface", "csg125CommunicationInterfacePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Communication_Interface", "csg180CommunicationInterfacePreference"));
    // Frame and Cabinet
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Frame_And_Cabinet", "csg020FrameAndCabinetPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Frame_And_Cabinet", "csg055FrameAndCabinetPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Frame_And_Cabinet", "csg125FrameAndCabinetPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Frame_And_Cabinet", "csg180FrameAndCabinetPreference"));
    // Control Panel Location
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Control_Panel_Location", "csg020ControlPanelLocationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Control_Panel_Location", "csg055ControlPanelLocationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Control_Panel_Location", "csg125ControlPanelLocationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Control_Panel_Location", "csg180ControlPanelLocationPreference"));
    // Insulation
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Insulation", "csg020InsulationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Insulation", "csg055InsulationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Insulation", "csg125InsulationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Insulation", "csg180InsulationPreference"));
    // Wheels And Feet
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Wheels_And_Feet", "csg020WheelsAndFeetPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Wheels_And_Feet", "csg055WheelsAndFeetPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Wheels_And_Feet", "csg125WheelsAndFeetPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Wheels_And_Feet", "csg180WheelsAndFeetPreference"));
    // Plant Steam Inlet Shut Off Valve
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Plant_Steam_Inlet_Shut_Off_Valve", "csg020PlantSteamInletShutOffValvePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Plant_Steam_Inlet_Shut_Off_Valve", "csg055PlantSteamInletShutOffValvePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Plant_Steam_Inlet_Shut_Off_Valve", "csg125PlantSteamInletShutOffValvePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Plant_Steam_Inlet_Shut_Off_Valve", "csg180PlantSteamInletShutOffValvePreference"));
    // Plant steam line trapping
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Plant_Steam_Line_Trapping", "csg020PlantSteamLineTrappingPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Plant_Steam_Line_Trapping", "csg055PlantSteamLineTrappingPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Plant_Steam_Line_Trapping", "csg125PlantSteamLineTrappingPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Plant_Steam_Line_Trapping", "csg180PlantSteamLineTrappingPreference"));
    // TDS control system
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_TDS_Control_System", "csg020TDSControlSystemPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_TDS_Control_System", "csg055TDSControlSystemPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_TDS_Control_System", "csg125TDSControlSystemPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_TDS_Control_System", "csg180TDSControlSystemPreference"));
    // Sample Coolers
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Sample_Cooler", "csg020SampleCoolerPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Sample_Cooler", "csg055SampleCoolerPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Sample_Cooler", "csg125SampleCoolerPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Sample_Cooler", "csg180SampleCoolerPreference"));
    // Independent low level alarm
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Independent_Low_Level_Alarm", "csg020IndependentLowLevelAlarmPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Independent_Low_Level_Alarm", "csg055IndependentLowLevelAlarmPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Independent_Low_Level_Alarm", "csg125IndependentLowLevelAlarmPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Independent_Low_Level_Alarm", "csg180IndependentLowLevelAlarmPreference"));
    // Feedwater pre-heating / Degassing
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Feedwater_Pre_Heating_Degassing", "csg020FeedwaterPreHeatingDegassingPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Feedwater_Pre_Heating_Degassing", "csg055FeedwaterPreHeatingDegassingPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Feedwater_Pre_Heating_Degassing", "csg125FeedwaterPreHeatingDegassingPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Feedwater_Pre_Heating_Degassing", "csg180FeedwaterPreHeatingDegassingPreference"));
    // Intelligent diagnostics
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Intelligent_Diagnostics", "csg020IntelligentDiagnosticsPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Intelligent_Diagnostics", "csg055IntelligentDiagnosticsPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Intelligent_Diagnostics", "csg125IntelligentDiagnosticsPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Intelligent_Diagnostics", "csg180IntelligentDiagnosticsPreference"));
    // Clean steam outlet shut-off valve
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Clean_Steam_Outlet_Shut_Off_Valve", "csg020CleanSteamOutletShutOffValvePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Clean_Steam_Outlet_Shut_Off_Valve", "csg055CleanSteamOutletShutOffValvePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Clean_Steam_Outlet_Shut_Off_Valve", "csg125CleanSteamOutletShutOffValvePreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Clean_Steam_Outlet_Shut_Off_Valve", "csg180CleanSteamOutletShutOffValvePreference"));
    // Test and certifications
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Test_And_Certification", "csg020TestAndCertificationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Test_And_Certification", "csg055TestAndCertificationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Test_And_Certification", "csg125TestAndCertificationPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Test_And_Certification", "csg180TestAndCertificationPreference"));
    // Level_Indicator
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Level_Indicator", "csg020Level_IndicatorPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Level_Indicator", "csg055Level_IndicatorPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Level_Indicator", "csg125Level_IndicatorPreference"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Level_Indicator", "csg180Level_IndicatorPreference"));    

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
    this.csgManufacturerCurrencyId = +this.csgManufacturerCurrencyPrefFormControl.value;

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
