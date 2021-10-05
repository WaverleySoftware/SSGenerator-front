/// <reference path="../../../modules/admin/admin.service.ts" />
/// <reference path="../../../modules/admin/admin.service.ts" />
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Form } from '@angular/forms';

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
import { EasiHeatBOMPriceOutput, EasiHeatPricing, BOMItem } from './easiHeatPricingOptions.model';
import { EasiHeatService } from './easiHeat.service';

import { LocaleService } from 'node_modules/angular-l10n';

import { User } from "../../../modules/user-profile/user.model";
import { UserProfileService } from "../../../modules/user-profile/user-profile.service";

@Component({
  selector: 'easiHeat-module-preferences',
  templateUrl: './easiHeat.component.html',
  styleUrls: ['./easiHeat.component.scss'],
  providers: [EasiHeatService]
})
export class EasiHeatPreferencesComponent implements OnInit, IGenericChanges {
  readonly moduleId: string = "5";
  readonly moduleGroupId: number = 3;
  public cloneDeep = cloneDeep_;
  readonly moduleName: string = "EasiHeat";

  @ViewChild("easiHeatBOMOutputDataTable", { static: false }) easiHeatBOMOutputDataTable: DatatableComponent;
  @ViewChild('collapsePriceDataTop', { static: false }) collapsePriceDataTop: ElementRef; // for scroll to view

  theFormGroup: FormGroup; // to drive GenericChangesGuard
  hasUnsavedDataChanges: boolean; // to drive GenericChangesGuard

  isSuccess: boolean = false;
  alertVisible: boolean = false;
  formSubmitted: boolean = false;

  easiHeatOptionsSelectedItem: string;

  //*** Regular module prefs ***
  // Currency Options
  manufacturerList: Manufacturer[] = [];
  currencyList: Currency[] = [];

  public easiHeatManufacturerCurrencyId: number;
  public easiHeatManufacturerCurrency: Currency;
  public easiHeatManufacturerCurrencySymbol: string;
  public easiHeatSellingCurrencyId: number;
  public easiHeatSellingCurrencySymbol: string;
  public easiHeatCurrencyConversion: number;

  // Pricing Options
  public easiHeatLandedCostIncrease: number;
  public easiHeatDeliveryCost: number;
  public easiHeatCommissionOnlyPrice: number;
  public easiHeatWarrantyOneYear: number;
  public easiHeatWarrantyTwoYears: number;
  public easiHeatWarrantyThreeYears: number;
  // Heat Exchanger
  easiHeatHeatExchangerTS6: FormControl;
  easiHeatHeatExchangerT6: FormControl;
  easiHeatHeatExchangerT8: FormControl;
  easiHeatHeatExchangerT10: FormControl;

  easiHeatPricingCurrency: FormControl;
  easiHeatOverrideMarkup: FormControl;
  easiHeatOverrideMarkupActive: FormControl;

  easiHeatSellingMarkup: FormControl;
  easiHeatLandedCostIncreaseModPref: FormControl;
  easiHeatDeliveryCostModPref: FormControl;
  easiHeatCommissionOnly: FormControl;
  easiHeatCvSplitRange: FormControl;
  easiHeatSteamSideControlOnHTG: FormControl;
  easiHeatMotiveInletPressureAvailable: FormControl;
  easiHeatPRVAvailableOnEHHCC: FormControl;
  easiHeatHideHEModelFromSizing: FormControl;

  easi_Heat_DHW_And_HTG_Sc_Options_Actuator: FormControl;
  easi_HTG_CC_Options_Actuator: FormControl;

  easiHeatDHWandHTGScOptions_DesignCode: FormControl;
  easi_HTG_CC_Options_DesignCode: FormControl;

  easiHeatDHWandHTGScOptions_HighLimit: FormControl;
  easi_HTG_CC_Options_HighLimit: FormControl;

  easiHeatDHWandHTGScOptions_HighLimitActuation: FormControl;
  easi_HTG_CC_Options_HighLimitActuation: FormControl;

  easiHeatDHWandHTGScOptions_Isolation: FormControl;
  easi_HTG_CC_Options_Isolation: FormControl;

  easiHeatDHWandHTGScOptions_ControlPanel: FormControl;
  easi_HTG_CC_Options_ControlPanel: FormControl;

  easiHeatDHWandHTGScOptions_ServiceOffering: FormControl;
  easi_HTG_CC_Options_ServiceOffering: FormControl;

  easiHeatDHWandHTGScOptions_Gasket: FormControl;
  easi_HTG_CC_Options_Gasket: FormControl;

  easiHeatDHWandHTGScOptions_RemoteAccess: FormControl;
  easi_HTG_CC_Options_RemoteAccess: FormControl;

  easiHeatDHWandHTGScOptions_Communications: FormControl;
  easi_HTG_CC_Options_Communications: FormControl;

  easiHeat_DHW_AdditionalOptions: FormControl;
  easiHeat_HTG_AdditionalOptions: FormControl;

  easiHeatDHWAvailable: FormControl;
  easiHeatDHWOn: FormControl;
  easiHeatDHWOff: FormControl;
  easiHeatHTGAvailable: FormControl;
  easiHeatHTGOn: FormControl;
  easiHeatHTGOff: FormControl;

  easiHeatEnergyMonitoring_Available_DHW: FormControl;
  easiHeatEnergyMonitoring_Default_DHW: FormControl;

  easiHeatJackingWheels_Available_DHW: FormControl;
  easiHeatJackingWheels_Default_DHW: FormControl;

  easiHeatENCompliant_Available_DHW: FormControl;
  easiHeatENCompliant_Default_DHW: FormControl;

  easiHeatEnergyMonitoring_Available_HTG: FormControl;
  easiHeatEnergyMonitoring_Default_HTG: FormControl;

  easiHeatJackingWheels_Available_HTG: FormControl;
  easiHeatJackingWheels_Default_HTG: FormControl;

  easiHeatENCompliant_Available_HTG: FormControl;
  easiHeatENCompliant_Default_HTG: FormControl;

  // Option Configuration
  modulePreferencesForm: FormGroup;

  easiHeatManufacturerPrefFormControl: FormControl;
  easiHeatManufacturerCurrencyModulePreference: FormControl;
  easiHeatSellingCurrencyPrefFormControl: FormControl;

  easiHeatLandedCostIncreasePrefFormControl: FormControl;
  easiHeatDeliveryCostPrefFormControl: FormControl;
  easiHeatCommissionOnlyPricePrefFormControl: FormControl;
  easiHeatWarrantyOneYearPrefFormControl: FormControl;
  easiHeatWarrantyTwoYearsPrefFormControl: FormControl;
  easiHeatWarrantyThreeYearsPrefFormControl: FormControl;

  // *** Enumerations module prefs ***  
  easiHeatOptionsFormControl: FormControl;

  serviceOffereingMessage: string;
  deliveryCostMessage: string;

  easiHeatPricing: EasiHeatPricing;
  easiHeatBOMOutputData: EasiHeatBOMPriceOutput;
  easiHeatBOMOutputDataRows: BOMItem[] = [];
  manufacturerId: number;
  DHW_OPTIONS: string;
  HTG_CC_AND_SC_OPTIONS: string;
  DHW_AND_HTG_SC_OPTIONS: string;
  HTG_CC_OPTIONS: string;
  DHW: string;
  HTG: string;
  showPrices: Boolean = false;
  augmentPriceDataProcessing: Boolean = true; // disable button whilst page loading
  overrideMarkupActive: Boolean = false;
  cvSplitRange: Boolean = false;
  SellSteamControl: Boolean = false;
  MotiveInletPressureAvailable: Boolean = false;
  YearOne: Boolean = false;
  YearTwo: Boolean = false;
  YearThree: Boolean = false;
  PrvAllowed: Boolean = false;
  HideHEmodelFromSizing: Boolean = false;

  constructor(private routesService: RoutesService,
    private adminService: AdminService,
    private translationService: TranslationService,
    private fb: FormBuilder,
    private translatePipe: TranslatePipe,
    private modulePreferenceService: ModulePreferenceService,
    private easiHeatService: EasiHeatService,
    private localeService: LocaleService,
    private userProfileService: UserProfileService,
    private user: User
  ) {

    this.easiHeatBOMOutputData = new EasiHeatBOMPriceOutput();


    //var userType = this.

    this.easiHeatManufacturerPrefFormControl = new FormControl({ value: ''});
    this.easiHeatManufacturerCurrencyModulePreference = new FormControl({ value: ''});
    this.easiHeatSellingCurrencyPrefFormControl = new FormControl('');

    this.easiHeatLandedCostIncreasePrefFormControl = new FormControl('', [Validators.required, CustomValidators.range([0, 100])]);
    this.easiHeatDeliveryCostPrefFormControl = new FormControl('', [Validators.required]);
    this.easiHeatCommissionOnlyPricePrefFormControl = new FormControl('', [Validators.required]);
    this.easiHeatWarrantyOneYearPrefFormControl = new FormControl('', [Validators.required]);
    this.easiHeatWarrantyTwoYearsPrefFormControl = new FormControl('', [Validators.required]);
    this.easiHeatWarrantyThreeYearsPrefFormControl = new FormControl('', [Validators.required]);

    this.easiHeatOptionsFormControl = new FormControl({ value: '', disabled: false });

    //Heat Exchanger
    this.easiHeatHeatExchangerTS6 = new FormControl('', [Validators.required, CustomValidators.range([0, 100])]);
    this.easiHeatHeatExchangerT6 = new FormControl('', [Validators.required, CustomValidators.range([0, 100])]);
    this.easiHeatHeatExchangerT8 = new FormControl('', [Validators.required, CustomValidators.range([0, 100])]);
    this.easiHeatHeatExchangerT10 = new FormControl('', [Validators.required, CustomValidators.range([0, 100])]);

    this.easiHeatPricingCurrency = new FormControl({ value: '', disabled: false });
    this.easiHeatOverrideMarkup = new FormControl('', [Validators.required, CustomValidators.range([0, 100])]);
    this.easiHeatOverrideMarkupActive = new FormControl(false); //checkbox  

    this.easiHeatSellingMarkup = new FormControl({ value: '', disabled: false });
    this.easiHeatLandedCostIncreaseModPref = new FormControl('', [Validators.required]);
    this.easiHeatDeliveryCostModPref = new FormControl('', [Validators.required]);
    this.easiHeatCommissionOnly = new FormControl('', [Validators.required]);
    this.easiHeatCvSplitRange = new FormControl(false); //checkbox
    this.easiHeatSteamSideControlOnHTG = new FormControl(false); //checkbox
    this.easiHeatMotiveInletPressureAvailable = new FormControl(false); //checkbox
    this.easiHeatPRVAvailableOnEHHCC = new FormControl(false); //checkbox 
    this.easiHeatHideHEModelFromSizing = new FormControl(false); //checkbox

    this.easi_Heat_DHW_And_HTG_Sc_Options_Actuator = new FormControl(null);
    this.easi_HTG_CC_Options_Actuator = new FormControl(null);

    this.easiHeatDHWandHTGScOptions_DesignCode = new FormControl(null);
    this.easi_HTG_CC_Options_DesignCode = new FormControl(null);

    this.easiHeatDHWandHTGScOptions_HighLimit = new FormControl(null);
    this.easi_HTG_CC_Options_HighLimit = new FormControl(null);

    this.easiHeatDHWandHTGScOptions_HighLimitActuation = new FormControl(null);
    this.easi_HTG_CC_Options_HighLimitActuation = new FormControl(null);

    this.easiHeatDHWandHTGScOptions_Isolation = new FormControl(null);
    this.easi_HTG_CC_Options_Isolation = new FormControl(null);

    this.easiHeatDHWandHTGScOptions_ControlPanel = new FormControl(null);
    this.easi_HTG_CC_Options_ControlPanel = new FormControl(null);

    this.easiHeatDHWandHTGScOptions_ServiceOffering = new FormControl(null);
    this.easi_HTG_CC_Options_ServiceOffering = new FormControl(null);

    this.easiHeatDHWandHTGScOptions_Gasket = new FormControl(null);
    this.easi_HTG_CC_Options_Gasket = new FormControl(null);

    this.easiHeatDHWandHTGScOptions_RemoteAccess = new FormControl(null);
    this.easi_HTG_CC_Options_RemoteAccess = new FormControl(null);

    this.easiHeatDHWandHTGScOptions_Communications = new FormControl(null);
    this.easi_HTG_CC_Options_Communications = new FormControl(null);

    this.easiHeat_DHW_AdditionalOptions = new FormControl(null);
    this.easiHeat_HTG_AdditionalOptions = new FormControl(null);

    this.easiHeatDHWAvailable = new FormControl({ value: false, disabled: false });
    this.easiHeatDHWOn = new FormControl({ value: false, disabled: false });
    this.easiHeatDHWOff = new FormControl({ value: false, disabled: false });
    this.easiHeatHTGAvailable = new FormControl({ value: false, disabled: false });
    this.easiHeatHTGOn = new FormControl({ value: false, disabled: false });
    this.easiHeatHTGOff = new FormControl({ value: false, disabled: false });

    this.easiHeatEnergyMonitoring_Available_DHW = new FormControl(false); //Checkbox
    this.easiHeatEnergyMonitoring_Default_DHW = new FormControl(false); //Checkbox

    this.easiHeatJackingWheels_Available_DHW = new FormControl(false); //Checkbox
    this.easiHeatJackingWheels_Default_DHW = new FormControl(false); //Checkbox

    this.easiHeatENCompliant_Available_DHW = new FormControl(false); //Checkbox
    this.easiHeatENCompliant_Default_DHW = new FormControl(false); //Checkbox

    this.easiHeatEnergyMonitoring_Available_HTG = new FormControl(false); //Checkbox
    this.easiHeatEnergyMonitoring_Default_HTG = new FormControl(false); //Checkbox

    this.easiHeatJackingWheels_Available_HTG = new FormControl(false); //Checkbox
    this.easiHeatJackingWheels_Default_HTG = new FormControl(false); //Checkbox

    this.easiHeatENCompliant_Available_HTG = new FormControl(false); //Checkbox
    this.easiHeatENCompliant_Default_HTG = new FormControl(false); //Checkbox

    // Setup the form group.
    this.modulePreferencesForm = this.fb.group({
      // Currency Options
      easiHeatManufacturerModulePreference: this.easiHeatManufacturerPrefFormControl,
      easiHeatManufacturerCurrencyModulePreference: this.easiHeatManufacturerCurrencyModulePreference,
      easiHeatSellingCurrencyModulePreference: this.easiHeatSellingCurrencyPrefFormControl,

      //Heat Exchanger
      easiHeatHeatExchangerTS6: this.easiHeatHeatExchangerTS6,
      easiHeatHeatExchangerT6: this.easiHeatHeatExchangerT6,
      easiHeatHeatExchangerT8: this.easiHeatHeatExchangerT8,
      easiHeatHeatExchangerT10: this.easiHeatHeatExchangerT10,

      easiHeatPricingCurrency: this.easiHeatPricingCurrency,
      easiHeatOverrideMarkup: this.easiHeatOverrideMarkup,
      easiHeatOverrideMarkupActive: this.easiHeatOverrideMarkupActive,

      easiHeatSellingMarkup: this.easiHeatSellingMarkup,
      easiHeatLandedCostIncreaseModPref: this.easiHeatLandedCostIncreaseModPref,
      easiHeatDeliveryCostModPref: this.easiHeatDeliveryCostModPref,
      easiHeatCommissionOnly: this.easiHeatCommissionOnly,
      easiHeatCvSplitRange: this.easiHeatCvSplitRange,
      easiHeatSteamSideControlOnHTG: this.easiHeatSteamSideControlOnHTG,
      easiHeatMotiveInletPressureAvailable: this.easiHeatMotiveInletPressureAvailable,
      easiHeatPRVAvailableOnEHHCC: this.easiHeatPRVAvailableOnEHHCC,
      easiHeatHideHEModelFromSizing: this.easiHeatHideHEModelFromSizing,

      easi_Heat_DHW_And_HTG_Sc_Options_Actuator: this.easi_Heat_DHW_And_HTG_Sc_Options_Actuator,
      easi_HTG_CC_Options_Actuator: this.easi_HTG_CC_Options_Actuator,

      easiHeatDHWandHTGScOptions_DesignCode: this.easiHeatDHWandHTGScOptions_DesignCode,
      easi_HTG_CC_Options_DesignCode: this.easi_HTG_CC_Options_DesignCode,

      easiHeatDHWandHTGScOptions_HighLimit: this.easiHeatDHWandHTGScOptions_HighLimit,
      easi_HTG_CC_Options_HighLimit: this.easi_HTG_CC_Options_HighLimit,

      easiHeatDHWandHTGScOptions_HighLimitActuation: this.easiHeatDHWandHTGScOptions_HighLimitActuation,
      easi_HTG_CC_Options_HighLimitActuation: this.easi_HTG_CC_Options_HighLimitActuation,

      easiHeatDHWandHTGScOptions_Isolation: this.easiHeatDHWandHTGScOptions_Isolation,
      easi_HTG_CC_Options_Isolation: this.easi_HTG_CC_Options_Isolation,

      easiHeatDHWandHTGScOptions_ControlPanel: this.easiHeatDHWandHTGScOptions_ControlPanel,
      easi_HTG_CC_Options_ControlPanel: this.easi_HTG_CC_Options_ControlPanel,

      easiHeatDHWandHTGScOptions_ServiceOffering: this.easiHeatDHWandHTGScOptions_ServiceOffering,
      easi_HTG_CC_Options_ServiceOffering: this.easi_HTG_CC_Options_ServiceOffering,

      easiHeatDHWandHTGScOptions_Gasket: this.easiHeatDHWandHTGScOptions_Gasket,
      easi_HTG_CC_Options_Gasket: this.easi_HTG_CC_Options_Gasket,

      easiHeatDHWandHTGScOptions_RemoteAccess: this.easiHeatDHWandHTGScOptions_RemoteAccess,
      easi_HTG_CC_Options_RemoteAccess: this.easi_HTG_CC_Options_RemoteAccess,

      easiHeatDHWandHTGScOptions_Communications: this.easiHeatDHWandHTGScOptions_Communications,
      easi_HTG_CC_Options_Communications: this.easi_HTG_CC_Options_Communications,

      easiHeat_DHW_AdditionalOptions: this.easiHeat_DHW_AdditionalOptions,
      easiHeat_HTG_AdditionalOptions: this.easiHeat_HTG_AdditionalOptions,

      easiHeatDHWAvailable: this.easiHeatDHWAvailable,
      easiHeatDHWOn: this.easiHeatDHWOn,
      easiHeatDHWOff: this.easiHeatDHWOff,
      easiHeatHTGAvailable: this.easiHeatHTGAvailable,
      easiHeatHTGOn: this.easiHeatHTGOn,
      easiHeatHTGOff: this.easiHeatHTGOff,


      easiHeatEnergyMonitoring_Available_DHW: this.easiHeatEnergyMonitoring_Available_DHW,
      easiHeatEnergyMonitoring_Default_DHW: this.easiHeatEnergyMonitoring_Default_DHW,

      easiHeatJackingWheels_Available_DHW: this.easiHeatJackingWheels_Available_DHW,
      easiHeatJackingWheels_Default_DHW: this.easiHeatJackingWheels_Default_DHW,

      easiHeatENCompliant_Available_DHW: this.easiHeatENCompliant_Available_DHW,
      easiHeatENCompliant_Default_DHW: this.easiHeatENCompliant_Default_DHW,

      easiHeatEnergyMonitoring_Available_HTG: this.easiHeatEnergyMonitoring_Available_HTG,
      easiHeatEnergyMonitoring_Default_HTG: this.easiHeatEnergyMonitoring_Default_HTG,

      easiHeatJackingWheels_Available_HTG: this.easiHeatJackingWheels_Available_HTG,
      easiHeatJackingWheels_Default_HTG: this.easiHeatJackingWheels_Default_HTG,

      easiHeatENCompliant_Available_HTG: this.easiHeatENCompliant_Available_HTG,
      easiHeatENCompliant_Default_HTG: this.easiHeatENCompliant_Default_HTG,


      // Pricing Options
      easiHeatLandedCostIncreaseModulePreference: this.easiHeatLandedCostIncreasePrefFormControl,
      easiHeatDeliveryCostModulePreference: this.easiHeatDeliveryCostPrefFormControl,
      easiHeatCommissionOnlyPriceModulePreference: this.easiHeatCommissionOnlyPricePrefFormControl,
      easiHeatWarrantyOneYearModulePreference: this.easiHeatWarrantyOneYearPrefFormControl,
      easiHeatWarrantyTwoYearsModulePreference: this.easiHeatWarrantyTwoYearsPrefFormControl,
      easiHeatWarrantyThreeYearsModulePreference: this.easiHeatWarrantyThreeYearsPrefFormControl,

      // Option Configuration
      easiHeatOptionsSelection: this.easiHeatOptionsFormControl,

    }, { updateOn: "change" });
  }

  ngOnInit() {

    // When Angular looks at a guard decision, page navigation has already occurred.
    // Reset the page load progress
    //this.routesService.pageLoadProgress = 0;
    //this.routesService.pageLoading = true;
    //this.routesService.startPageLoadProgress();
    // First, get all the module preferences.
    //this.modulePreferencesForm.markAsPristine();

    // this.easiHeatCvSplitRange.markAsDirty();

    this.userProfileService.getUserDetails().subscribe(user => {
      this.user = user;

      //3 = sales admin
      //4 = super admin
      if (this.user.roleId == 3 || this.user.roleId == 4) {

      } else {
        this.easiHeatManufacturerPrefFormControl.disable();
        this.easiHeatManufacturerCurrencyModulePreference.disable();
      }
    });



    //    this.easiHeatManufacturerPrefFormControl = new FormControl({ value: '', disabled: true });
    //    this.easiHeatManufacturerCurrencyModulePreference = new FormControl({ value: '', disabled: true });

    this.modulePreferenceService.getOperatingCompanyModulePreferences(this.moduleId).subscribe((result: Array<ModulePreference>) => {   

      if (result && result.length > 0) {
        // And set their values accordingly.

        this.manufacturerId = +this.getModulePreferenceValue(result, "Manufacturer");
        this.easiHeatManufacturerPrefFormControl.setValue(this.manufacturerId);

        this.easiHeatManufacturerCurrencyId = +this.getModulePreferenceValue(result, "ManufacturerCurrency");
        this.easiHeatManufacturerCurrencyModulePreference.setValue(this.easiHeatManufacturerCurrencyId);

        this.easiHeatSellingCurrencyId = +this.getModulePreferenceValue(result, "SellingCurrency");
        this.easiHeatSellingCurrencyPrefFormControl.setValue(this.easiHeatSellingCurrencyId);
        // Calculate the currency conversion rate.
        this.onSellingCurrencyChange(this.easiHeatSellingCurrencyId);
        //this.easiHeatManufacturerCurrencyModulePreference.setValue(this.getModulePreferenceValue(result, "CurrencyConversion"));
        this.easiHeatHeatExchangerTS6.setValue(this.getModulePreferenceValue(result, "HETS6Discount")); //ts6
        this.easiHeatHeatExchangerT6.setValue(this.getModulePreferenceValue(result, "HEM6Discount")); //t6
        this.easiHeatHeatExchangerT8.setValue(this.getModulePreferenceValue(result, "HEM10Discount")) //t8
        this.easiHeatHeatExchangerT10.setValue(this.getModulePreferenceValue(result, "HET10")); //t10 
        this.easiHeatPricingCurrency.setValue(this.getModulePreferenceValue(result, "HEPricingCurrency"));
        this.easiHeatOverrideMarkup.setValue(this.getModulePreferenceValue(result, "HEOverridenP251MarkupValue"));  
    

        this.easiHeatSellingMarkup.setValue(this.getModulePreferenceValue(result, "SellingMarkup"));

        this.easiHeatLandedCostIncrease = this.getModulePreferenceValue(result, "LandCostIncrease");
        this.easiHeatLandedCostIncreaseModPref.setValue(this.easiHeatLandedCostIncrease); 

        this.easiHeatDeliveryCostModPref.setValue(this.getModulePreferenceValue(result, "DeliveryCost"));
        this.easiHeatCommissionOnly.setValue(this.getModulePreferenceValue(result, "Commission"));

        //Below is a temporary fix as to ensure that a boolean is passed through for the checkboxes.
        //Fix is necessary as the data reads as a string and not a boolean. The data types needs changing/fixing in the database.
        //Table:  OperatingCompanyModulePreferences
        if (this.getModulePreferenceValue(result, "HEOverridenP251Markup") == "True" || this.getModulePreferenceValue(result, "HEOverridenP251Markup") == "true") {
          this.overrideMarkupActive = true;
        } else {
          this.overrideMarkupActive = false;
        }

        if (this.getModulePreferenceValue(result, "CVSplitRange") == "True" || this.getModulePreferenceValue(result, "CVSplitRange") == "true") {
          this.cvSplitRange = true;
        } else {
          this.cvSplitRange = false;
        }
        if (this.getModulePreferenceValue(result, "SellSteamControl") == "True" || this.getModulePreferenceValue(result, "SellSteamControl") == "true") {
          this.SellSteamControl = true;
        } else {
          this.SellSteamControl = false;
        }
        if (this.getModulePreferenceValue(result, "MotiveInletPressureAvailable") == "True" || this.getModulePreferenceValue(result, "MotiveInletPressureAvailable") == "true") {
          this.MotiveInletPressureAvailable = true;
        } else {
          this.MotiveInletPressureAvailable = false;
        }
        if (this.getModulePreferenceValue(result, "PrvAllowed") == "True" || this.getModulePreferenceValue(result, "PrvAllowed") == "true") {
          this.PrvAllowed = true;
        } else {
          this.PrvAllowed = false;
        }
        if (this.getModulePreferenceValue(result, "HideHEmodelFromSizing") == "True" || this.getModulePreferenceValue(result, "HideHEmodelFromSizing") == "true") {
          this.HideHEmodelFromSizing = true;
        } else {
          this.HideHEmodelFromSizing = false;
        }

        this.easiHeatOverrideMarkupActive.setValue(this.overrideMarkupActive)
        this.easiHeatCvSplitRange.setValue(this.cvSplitRange);
        this.easiHeatSteamSideControlOnHTG.setValue(this.SellSteamControl);
        this.easiHeatMotiveInletPressureAvailable.setValue(this.MotiveInletPressureAvailable);
        this.easiHeatPRVAvailableOnEHHCC.setValue(this.PrvAllowed);
        this.easiHeatHideHEModelFromSizing.setValue(this.HideHEmodelFromSizing);
        this.easiHeatWarrantyOneYearPrefFormControl.setValue(this.getModulePreferenceValue(result, "YearOne"));
        this.easiHeatWarrantyTwoYearsPrefFormControl.setValue(this.getModulePreferenceValue(result, "YearTwo"));
        this.easiHeatWarrantyThreeYearsPrefFormControl.setValue(this.getModulePreferenceValue(result, "YearThree"));

        if (this.getModulePreferenceValue(result, "EnergyMonitoringAvailableDHW") == "True" || this.getModulePreferenceValue(result, "EnergyMonitoringAvailableDHW") == "true") {
          this.easiHeatEnergyMonitoring_Available_DHW.setValue(true);
        } else {
          this.easiHeatEnergyMonitoring_Available_DHW.setValue(false);
        }
        if (this.getModulePreferenceValue(result, "EnergyMonitoringDefaultDHW") == "True" || this.getModulePreferenceValue(result, "EnergyMonitoringDefaultDHW") == "true") {
          this.easiHeatEnergyMonitoring_Default_DHW.setValue(true);
        } else {
          this.easiHeatEnergyMonitoring_Default_DHW.setValue(false);
        }
        if (this.getModulePreferenceValue(result, "JackingWheelsAvailableDHW") == "True" || this.getModulePreferenceValue(result, "JackingWheelsAvailableDHW") == "true") {
          this.easiHeatJackingWheels_Available_DHW.setValue(true);
        } else {
          this.easiHeatJackingWheels_Available_DHW.setValue(false);
        }
        if (this.getModulePreferenceValue(result, "JackingWheelsDefaultDHW") == "True" || this.getModulePreferenceValue(result, "JackingWheelsDefaultDHW") == "true") {
          this.easiHeatJackingWheels_Default_DHW.setValue(true);
        } else {
          this.easiHeatJackingWheels_Default_DHW.setValue(false);
        }
        if (this.getModulePreferenceValue(result, "ENCompliantAvailableDHW") == "True" || this.getModulePreferenceValue(result, "ENCompliantAvailableDHW") == "true") {
          this.easiHeatENCompliant_Available_DHW.setValue(true);
        } else {
          this.easiHeatENCompliant_Available_DHW.setValue(false);
        }
        if (this.getModulePreferenceValue(result, "ENCompliantDefaultDHW") == "True" || this.getModulePreferenceValue(result, "ENCompliantDefaultDHW") == "true") {
          this.easiHeatENCompliant_Default_DHW.setValue(true);
        } else {
          this.easiHeatENCompliant_Default_DHW.setValue(false);
        }

        if (this.getModulePreferenceValue(result, "EnergyMonitoringAvailableHTG") == "True" || this.getModulePreferenceValue(result, "EnergyMonitoringAvailableHTG") == "true") {
          this.easiHeatEnergyMonitoring_Available_HTG.setValue(true);
        } else {
          this.easiHeatEnergyMonitoring_Available_HTG.setValue(false);
        }
        if (this.getModulePreferenceValue(result, "EnergyMonitoringDefaultHTG") == "True" || this.getModulePreferenceValue(result, "EnergyMonitoringDefaultHTG") == "true") {
          this.easiHeatEnergyMonitoring_Default_HTG.setValue(true);
        } else {
          this.easiHeatEnergyMonitoring_Default_HTG.setValue(false);
        }
        if (this.getModulePreferenceValue(result, "JackingWheelsAvailableHTG") == "True" || this.getModulePreferenceValue(result, "JackingWheelsAvailableHTG") == "true") {
          this.easiHeatJackingWheels_Available_HTG.setValue(true);
        } else {
          this.easiHeatJackingWheels_Available_HTG.setValue(false);
        }
        if (this.getModulePreferenceValue(result, "JackingWheelsDefaultHTG") == "True" || this.getModulePreferenceValue(result, "JackingWheelsDefaultHTG") == "true") {
          this.easiHeatJackingWheels_Default_HTG.setValue(true);
        } else {
          this.easiHeatJackingWheels_Default_HTG.setValue(false);
        }
        if (this.getModulePreferenceValue(result, "ENCompliantAvailableHTG") == "True" || this.getModulePreferenceValue(result, "ENCompliantAvailableHTG") == "true") {
          this.easiHeatENCompliant_Available_HTG.setValue(true);
        } else {
          this.easiHeatENCompliant_Available_HTG.setValue(false);
        }
        if (this.getModulePreferenceValue(result, "ENCompliantDefaultHTG") == "True" || this.getModulePreferenceValue(result, "ENCompliantDefaultHTG") == "true") {
          this.easiHeatENCompliant_Default_HTG.setValue(true);
        } else {
          this.easiHeatENCompliant_Default_HTG.setValue(false);
        }

        // Get the currency data.
        this.adminService.getCurrencyData().subscribe(data => {
          this.currencyList = data;
          //this.easiHeatManufacturerCurrencyId = data.find(c => c.id === this.easiHeatManufacturerCurrencyId)

          // Selling currency found, so try to calculate the currency conversion rate.
          this.onSellingCurrencyChange(this.easiHeatSellingCurrencyId);

          this.augmentPriceDataProcessing = false; // loaded enable toggle prices button
        });
      }

      // Get the currency data.
      this.adminService.getCurrencyData().subscribe(data => {
        this.currencyList = data;
        //this.easiHeatManufacturerCurrencyId = data.find(c => c.id === this.easiHeatManufacturerCurrencyId)

        // Selling currency found, so try to calculate the currency conversion rate.
        this.onSellingCurrencyChange(this.easiHeatSellingCurrencyId);

        this.augmentPriceDataProcessing = false; // loaded enable toggle prices button
      });

   
    });

    // Get the list of manufacturers.
    this.adminService.getManufacturerData(this.moduleGroupId).subscribe((result: Array<Manufacturer>) => {
      // Update the subject with the data that's just been retrieved (see the constructor).  
      this.manufacturerList = result;
    });


    // Now, set the "OpCo Selected Options" for the different EasiHeat options.
    // Actuator
    this.setOpCoPreferences("NomActuatorDHW_EasiHeat", this.easi_Heat_DHW_And_HTG_Sc_Options_Actuator);
    this.setOpCoPreferences("NomActuatorHTG_EasiHeat", this.easi_HTG_CC_Options_Actuator);
    // Design Code
    this.setOpCoPreferences("NomDesignCodeDHW_EasiHeat", this.easiHeatDHWandHTGScOptions_DesignCode);
    this.setOpCoPreferences("NomDesignCodeHTG_EasiHeat", this.easi_HTG_CC_Options_DesignCode);
    // High Limit
    this.setOpCoPreferences("NomHighLimitDHW_EasiHeat", this.easiHeatDHWandHTGScOptions_HighLimit);
    this.setOpCoPreferences("NomHighLimitHTG_EasiHeat", this.easi_HTG_CC_Options_HighLimit);
    // High Limit Actuation
    this.setOpCoPreferences("NomHighLimitActuationDHW_EasiHeat", this.easiHeatDHWandHTGScOptions_HighLimitActuation);
    this.setOpCoPreferences("NomHighLimitActuationHTG_EasiHeat", this.easi_HTG_CC_Options_HighLimitActuation);
    // Isolation
    this.setOpCoPreferences("NomIsolationDHW_EasiHeat", this.easiHeatDHWandHTGScOptions_Isolation);
    this.setOpCoPreferences("NomIsolationHTG_EasiHeat", this.easi_HTG_CC_Options_Isolation);
    // Control Panel
    this.setOpCoPreferences("NomPanelTypeDHW_EasiHeat", this.easiHeatDHWandHTGScOptions_ControlPanel);
    this.setOpCoPreferences("NomPanelTypeHTG_EasiHeat", this.easi_HTG_CC_Options_ControlPanel);
    // Service Offering
    this.setOpCoPreferences("WarrantyDHW_EasiHeat", this.easiHeatDHWandHTGScOptions_ServiceOffering);
    this.setOpCoPreferences("WarrantyHTG_EasiHeat", this.easi_HTG_CC_Options_ServiceOffering);
    // Gasket
    this.setOpCoPreferences("NomGasketDHW_EasiHeat", this.easiHeatDHWandHTGScOptions_Gasket);
    this.setOpCoPreferences("NomGasketHTG_EasiHeat", this.easi_HTG_CC_Options_Gasket);
    // Remote Access
    this.setOpCoPreferences("NomRemoteAccessDHW_EasiHeat", this.easiHeatDHWandHTGScOptions_RemoteAccess);
    this.setOpCoPreferences("NomRemoteAccessHTG_EasiHeat", this.easi_HTG_CC_Options_RemoteAccess);
    // Communications
    this.setOpCoPreferences("NomCommunicationsDHW_EasiHeat", this.easiHeatDHWandHTGScOptions_Communications);
    this.setOpCoPreferences("NomCommunicationsHTG_EasiHeat", this.easi_HTG_CC_Options_Communications);
    //Additional Options
    this.setOpCoPreferences("NomAdditionalOptionsDHW_EasiHeat", this.easiHeat_DHW_AdditionalOptions);
    this.setOpCoPreferences("NomAdditionalOptionsHTG_EasiHeat", this.easiHeat_HTG_AdditionalOptions);

    this.easiHeatOptionsSelectedItem = "Actuator";

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

  onChangeData() {
    //debugger;
    //this.modulePreferencesForm.markAsPristine(); 
  }

  toggleSave() {
    if (this.easiHeatHeatExchangerTS6.valid == false || this.easiHeatHeatExchangerT6.valid == false || this.easiHeatHeatExchangerT8.valid == false ||
      this.easiHeatHeatExchangerT10.valid == false || this.easiHeatOverrideMarkup.valid == false || this.easiHeatSellingMarkup.valid == false || 
      this.easiHeatLandedCostIncreaseModPref.valid == false || this.easiHeatDeliveryCostModPref.valid == false || this.easiHeatCommissionOnly.valid == false ||
      this.easiHeatWarrantyOneYearPrefFormControl.valid == false || this.easiHeatWarrantyTwoYearsPrefFormControl.valid == false || this.easiHeatWarrantyThreeYearsPrefFormControl.valid == false) {
      this.modulePreferencesForm.markAsPristine();
    }
  }


  augmentPricesToOptionsLists(showPrices: Boolean = true) {

    this.easiHeatPricing = new EasiHeatPricing();
    this.easiHeatPricing.modelId = -1; // All BOM items    
    this.easiHeatPricing.pricingOptions = [];
    this.easiHeatPricing.basePriceOption = -1;
    this.easiHeatPricing.localRecommendedSalesPriceOption = -1;
    this.easiHeatPricing.landedCostIncreaseFactor = -1;

    this.easiHeatSellingCurrencySymbol = !!this.easiHeatSellingCurrencySymbol ? this.easiHeatSellingCurrencySymbol : "?";
    this.easiHeatPricing.manufacturerId = +(!!this.manufacturerId ? this.manufacturerId : -1);

    this.easiHeatManufacturerCurrency = this.currencyList.find(c => c.id === this.easiHeatManufacturerCurrencyId);
    this.easiHeatManufacturerCurrencySymbol = !!this.easiHeatManufacturerCurrency ? this.easiHeatManufacturerCurrency.symbol : "?";

    if (showPrices) {
      // Get RSP Display price data for List item Augmentation
      this.easiHeatService.calculateBOMPrice(this.easiHeatPricing).subscribe((response: EasiHeatBOMPriceOutput) => {
        if (response) {
          this.easiHeatBOMOutputData = response;
          let manPrice: string = "";
          let localPrices: string = "";
          let isOverride: string = "";

          this.easiHeatBOMOutputData.bomItems.forEach(t => {

            if (showPrices && t.itemType == "Base") {

              // Price the models
              if (t.sRecommendedSalesPrice != 0.0 && t.sRecommendedSalesPrice != parseFloat(t.sDisplayedRSP)) {
                isOverride = 'o';
              }

              manPrice = ' SSP=' + this.easiHeatManufacturerCurrencySymbol + ' ' + this.localizeValue(t.ssp, 0);
              localPrices = ' RSP' + isOverride + '=' + this.easiHeatManufacturerCurrencySymbol + ' ' + this.localizeValue(t.displayedRSP, 0);

              if (t.ssp != t.sSSP) { // if not the same currency data
                manPrice = manPrice + ' (' + this.easiHeatSellingCurrencySymbol + ' ' + this.localizeValue(t.sSSP, 0) + ')'
                localPrices = localPrices + ' (' + this.easiHeatSellingCurrencySymbol + ' ' + this.localizeValue(t.sDisplayedRSP, 0) + ')';
              }


            }

            // Set option item enabled?
            var newEnumerationModulePreferences = this.GetNewEnumerationModulePreferences();
            this.easiHeatBOMOutputData.bomItems.forEach(p => {

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

                    manPrice = ' SSP=' + this.easiHeatManufacturerCurrencySymbol + ' ' + this.localizeValue(t.ssp, 0);
                    localPrices = ' RSP' + isOverride + '=' + this.easiHeatManufacturerCurrencySymbol + ' ' + this.localizeValue(t.displayedRSP, 0);

                    if (t.ssp != t.sSSP) { // if not the same currency data
                      manPrice = manPrice + ' (' + this.easiHeatSellingCurrencySymbol + ' ' + this.localizeValue(t.sSSP, 0) + ')'
                      localPrices = localPrices + ' (' + this.easiHeatSellingCurrencySymbol + ' ' + this.localizeValue(t.sDisplayedRSP, 0) + ')';
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
      //this.CSG_HS_020_Price = "";
      //this.CSG_HS_055_Price = "";
      //this.CSG_HS_125_Price = "";
      //this.CSG_HS_180_Price = "";

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
  setOpCoPreferences(enumerationPickerName, formControlName) {
    // Get the collection list first.
    let easiHeatOpCoPref = this.getEnumerationPickerCollection(enumerationPickerName, true);

    // Check if any OpCo Overrides Data found? If NOT then get the base list populated.
    if (!easiHeatOpCoPref) {
      easiHeatOpCoPref = this.cloneDeep(this.getEnumerationPickerCollection(enumerationPickerName, false));
    }

    // Check and set the list.
    if (!!easiHeatOpCoPref && easiHeatOpCoPref.length > 0) {
      formControlName.setValue(easiHeatOpCoPref);
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
   
    var sellingCurrency = this.getSelectedPreferences("SellingCurrency", "easiHeatSellingCurrencyModulePreference");
    var manufacturer = this.getSelectedPreferences("Manufacturer", "easiHeatManufacturerModulePreference");
    var manufacturerCurrency = this.getSelectedPreferences("ManufacturerCurrency", "easiHeatManufacturerCurrencyModulePreference");
    
    //Heat exchanger options
    var HETS6Discount = this.getSelectedPreferences("HETS6Discount", "easiHeatHeatExchangerTS6"); //TS6
    var HEM6Discount = this.getSelectedPreferences("HEM6Discount", "easiHeatHeatExchangerT6"); //T6
    var HEM8Discount = this.getSelectedPreferences("HEM10Discount", "easiHeatHeatExchangerT8"); //T8
    var HEM10Discount = this.getSelectedPreferences("HET10", "easiHeatHeatExchangerT10"); //T10  
    var HEPricingCurrency = this.getSelectedPreferences("HEPricingCurrency", "easiHeatPricingCurrency");
    var HEOverridenP251MarkupValue = this.getSelectedPreferences("HEOverridenP251MarkupValue", "easiHeatOverrideMarkup");
    var HEOverridenP251Markup = this.getSelectedPreferences("HEOverridenP251Markup", "easiHeatOverrideMarkupActive");

    //Pricing Options
    var SellingMarkup = this.getSelectedPreferences("SellingMarkup", "easiHeatSellingMarkup")
    var LandedCostIncrease = this.getSelectedPreferences("LandCostIncrease", "easiHeatLandedCostIncreaseModPref")//easiHeatLandedCostIncreaseModPref
    var DeliveryCost = this.getSelectedPreferences("DeliveryCost", "easiHeatDeliveryCostModPref")
    var Commission = this.getSelectedPreferences("Commission", "easiHeatCommissionOnly")
    var CVSplitRange = this.getSelectedPreferences("CVSplitRange", "easiHeatCvSplitRange")
    var SellSteamControl = this.getSelectedPreferences("SellSteamControl", "easiHeatSteamSideControlOnHTG")
    var MotiveInletPressureAvailable = this.getSelectedPreferences("MotiveInletPressureAvailable", "easiHeatMotiveInletPressureAvailable")
    var YearOne = this.getSelectedPreferences("YearOne", "easiHeatWarrantyOneYearModulePreference")
    var YearTwo = this.getSelectedPreferences("YearTwo", "easiHeatWarrantyTwoYearsModulePreference")
    var YearThree = this.getSelectedPreferences("YearThree", "easiHeatWarrantyThreeYearsModulePreference")
    var PrvAllowed = this.getSelectedPreferences("PrvAllowed", "easiHeatPRVAvailableOnEHHCC")
    var HideHEmodelFromSizing = this.getSelectedPreferences("HideHEmodelFromSizing", "easiHeatHideHEModelFromSizing")

    var EnergyMonitoringAvailableDHW = this.getSelectedPreferences("EnergyMonitoringAvailableDHW", "easiHeatEnergyMonitoring_Available_DHW")
    var EnergyMonitoringDefaultDHW = this.getSelectedPreferences("EnergyMonitoringDefaultDHW", "easiHeatEnergyMonitoring_Default_DHW")
    var JackingWheelsAvailableDHW = this.getSelectedPreferences("JackingWheelsAvailableDHW", "easiHeatJackingWheels_Available_DHW")
    var JackingWheelsDefaultDHW = this.getSelectedPreferences("JackingWheelsDefaultDHW", "easiHeatJackingWheels_Default_DHW")
    var ENCompliantAvailableDHW = this.getSelectedPreferences("ENCompliantAvailableDHW", "easiHeatENCompliant_Available_DHW")
    var ENCompliantDefaultDHW = this.getSelectedPreferences("ENCompliantDefaultDHW", "easiHeatENCompliant_Default_DHW")

    var EnergyMonitoringAvailableHTG = this.getSelectedPreferences("EnergyMonitoringAvailableHTG", "easiHeatEnergyMonitoring_Available_HTG")
    var EnergyMonitoringDefaultHTG = this.getSelectedPreferences("EnergyMonitoringDefaultHTG", "easiHeatEnergyMonitoring_Default_HTG")
    var JackingWheelsAvailableHTG = this.getSelectedPreferences("JackingWheelsAvailableHTG", "easiHeatJackingWheels_Available_HTG")
    var JackingWheelsDefaultHTG = this.getSelectedPreferences("JackingWheelsDefaultHTG", "easiHeatJackingWheels_Default_HTG")
    var ENCompliantAvailableHTG = this.getSelectedPreferences("ENCompliantAvailableHTG", "easiHeatENCompliant_Available_HTG")
    var ENCompliantDefaultHTG = this.getSelectedPreferences("ENCompliantDefaultHTG", "easiHeatENCompliant_Default_HTG")
    
    newModulePreferences.push(sellingCurrency);
    newModulePreferences.push(manufacturer);
    newModulePreferences.push(manufacturerCurrency);

    newModulePreferences.push(HETS6Discount);
    newModulePreferences.push(HEM6Discount);
    newModulePreferences.push(HEM8Discount);
    newModulePreferences.push(HEM10Discount);
    newModulePreferences.push(HEPricingCurrency);
    newModulePreferences.push(HEOverridenP251MarkupValue);
    newModulePreferences.push(HEOverridenP251Markup);

    newModulePreferences.push(SellingMarkup);
    newModulePreferences.push(LandedCostIncrease);
    newModulePreferences.push(DeliveryCost);
    newModulePreferences.push(Commission);
    newModulePreferences.push(CVSplitRange);
    newModulePreferences.push(SellSteamControl);
    newModulePreferences.push(MotiveInletPressureAvailable);
    newModulePreferences.push(YearOne);
    newModulePreferences.push(YearTwo);
    newModulePreferences.push(YearThree);
    newModulePreferences.push(PrvAllowed);
    newModulePreferences.push(HideHEmodelFromSizing);

    newModulePreferences.push(EnergyMonitoringAvailableDHW);
    newModulePreferences.push(EnergyMonitoringDefaultDHW);
    newModulePreferences.push(JackingWheelsAvailableDHW);
    newModulePreferences.push(JackingWheelsDefaultDHW);
    newModulePreferences.push(ENCompliantAvailableDHW);
    newModulePreferences.push(ENCompliantDefaultDHW);

    newModulePreferences.push(EnergyMonitoringAvailableHTG);
    newModulePreferences.push(EnergyMonitoringDefaultHTG);
    newModulePreferences.push(JackingWheelsAvailableHTG);
    newModulePreferences.push(JackingWheelsDefaultHTG);
    newModulePreferences.push(ENCompliantAvailableHTG);
    newModulePreferences.push(ENCompliantDefaultHTG);

    // Save the changed preferences as an array of preferences
    this.adminService.manageModulePreferences(newModulePreferences).subscribe((response: boolean) => {

      // The form can be submitted again.
      this.formSubmitted = false;

      // Set the operation based on the response.
      this.isSuccess = response;
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
    // Actuator
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomActuatorDHW_EasiHeat", "easi_Heat_DHW_And_HTG_Sc_Options_Actuator"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomActuatorHTG_EasiHeat", "easi_HTG_CC_Options_Actuator"));
    // Design Code
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomDesignCodeDHW_EasiHeat", "easiHeatDHWandHTGScOptions_DesignCode"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomDesignCodeHTG_EasiHeat", "easi_HTG_CC_Options_DesignCode"));
    // High Limit
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomHighLimitDHW_EasiHeat", "easiHeatDHWandHTGScOptions_HighLimit"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomHighLimitHTG_EasiHeat", "easi_HTG_CC_Options_HighLimit"));
    // High Limit Actuation
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomHighLimitActuationDHW_EasiHeat", "easiHeatDHWandHTGScOptions_HighLimitActuation"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomHighLimitActuationHTG_EasiHeat", "easi_HTG_CC_Options_HighLimitActuation"));
    // Isolation
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomIsolationDHW_EasiHeat", "easiHeatDHWandHTGScOptions_Isolation"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomIsolationHTG_EasiHeat", "easi_HTG_CC_Options_Isolation"));
    // Control Panel
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomPanelTypeDHW_EasiHeat", "easiHeatDHWandHTGScOptions_ControlPanel"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomPanelTypeHTG_EasiHeat", "easi_HTG_CC_Options_ControlPanel"));
    // Service Offering
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("WarrantyDHW_EasiHeat", "easiHeatDHWandHTGScOptions_ServiceOffering"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("WarrantyHTG_EasiHeat", "easi_HTG_CC_Options_ServiceOffering"));
    // Gasket
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomGasketDHW_EasiHeat", "easiHeatDHWandHTGScOptions_Gasket"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomGasketHTG_EasiHeat", "easi_HTG_CC_Options_Gasket"));
    // Remote Access
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomRemoteAccessDHW_EasiHeat", "easiHeatDHWandHTGScOptions_RemoteAccess"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomRemoteAccessHTG_EasiHeat", "easi_HTG_CC_Options_RemoteAccess"));
    // Communications
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomCommunicationsDHW_EasiHeat", "easiHeatDHWandHTGScOptions_Communications"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("NomCommunicationsHTG_EasiHeat", "easi_HTG_CC_Options_Communications"));
    // Additional Options
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("easiHeat_DHW_AdditionalOptions", "easiHeat_DHW_AdditionalOptions"));
    newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("easiHeat_HTG_AdditionalOptions", "easiHeat_HTG_AdditionalOptions"));

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
    //modPrefs.enumerationDefinitions.find(e => e.value == prefsFormKeyName);
    //this.modulePreferencesForm.controls[prefsFormKeyName].value;

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
    modPrefs.OperatingCompanyId = 42;

    return modPrefs;
  }

  closeAlert(): void {
    // Reset the flag
    this.alertVisible = false;
  }

  onChange() {
    this.modulePreferencesForm.markAsDirty();
    // this.modulePreferencesForm.disabled == false;

  }

  onChangeAnyOption(): void {
    // Any enumeration-picker (on-change) set the form data to dirty.
    this.modulePreferencesForm.markAsDirty();
  }

  onEasiHeatOptionsChange(event: any) {   
    this.easiHeatOptionsSelectedItem = event.selectedValue;
    this.easiHeatOptionsFormControl.markAsPristine(); // Options list selector is not a data change item, so ignore changes.
    
  }

  /*
  * Method to calculate the currency conversion rate.
  */
  onSellingCurrencyChange(selectedValue: any): void {
    this.easiHeatManufacturerCurrencyId = +this.easiHeatManufacturerCurrencyModulePreference.value;

    if (selectedValue > 0 && this.easiHeatManufacturerCurrencyId > 0 && this.currencyList.length > 0) {
      let sellingCurrency = this.currencyList.find(c => c.id === +selectedValue);
      let manufacturerCurrency = this.currencyList.find(c => c.id === this.easiHeatManufacturerCurrencyId);

      this.easiHeatSellingCurrencySymbol = sellingCurrency.symbol;
      this.easiHeatCurrencyConversion = +((manufacturerCurrency.rateToGbp * (1 / sellingCurrency.rateToGbp)).toFixed(5));
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

  setOverrideMarkup() {
    this.overrideMarkupActive = !this.overrideMarkupActive
    this.easiHeatOverrideMarkupActive.setValue(this.overrideMarkupActive);
    if (this.overrideMarkupActive == false) {
      this.easiHeatOverrideMarkup.setValue("0");
    }

    this.toggleSave();
    
  }

}
