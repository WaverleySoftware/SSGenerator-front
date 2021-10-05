import { Component, OnInit, ViewChild } from '@angular/core';
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
import { RoutesService } from '../../../modules/routes.service';

import { Currency } from "../../../modules/admin/currency/currency.model";

import { Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { IGenericChanges } from "../../../modules/generic.changes.interface";
import * as cloneDeep_ from 'lodash/cloneDeep';

@Component({
  selector: 'cleansteamgenerator-fb-module-preferences',
  templateUrl: './cleanSteamGeneratorFB.component.html',
  styleUrls: ['./cleanSteamGeneratorFB.component.scss']
})
export class CleanSteamGeneratorFBModulePreferencesComponent implements OnInit, IGenericChanges {

  readonly moduleId: string = "11";
  readonly moduleGroupId: number = 13;
  public cloneDeep = cloneDeep_;
  theFormGroup: FormGroup; // to drive GenericChangesGuard
  hasUnsavedDataChanges: boolean; // to drive GenericChangesGuard

  isSuccess: boolean = false;
  alertVisible: boolean = false;
  formSubmitted: boolean = false;

  //csgOptionsSelectedItem: string;

  //*** Regular module prefs ***
  // Currency Options
  manufacturerList: Manufacturer[] = [];
  currencyList: Currency[] = [];
  
  public csgFBManufacturerCurrencyId: number;
  public csgFBSellingCurrencyId: number;
  public csgFBSellingCurrencySymbol: string;
  public csgFBCurrencyConversion: number;

  // Pricing Options
  public csgFBLandedCostIncrease: number;
  public csgFBDeliveryCost: number;
  public csgFBCommissionOnlyPrice: number;
  public csgFBWarrantyOneYear: number;
  public csgFBWarrantyTwoYears: number;
  public csgFBWarrantyThreeYears: number;  

  // Option Configuration
  modulePreferencesForm: FormGroup;

  csgFBManufacturerPrefFormControl: FormControl;
  csgFBManufacturerCurrencyPrefFormControl: FormControl;
  csgFBSellingCurrencyPrefFormControl: FormControl;  

  csgFBLandedCostIncreasePrefFormControl: FormControl;
  csgFBDeliveryCostPrefFormControl: FormControl;
  csgFBCommissionOnlyPricePrefFormControl: FormControl;
  csgFBWarrantyOneYearPrefFormControl: FormControl;
  csgFBWarrantyTwoYearsPrefFormControl: FormControl;
  csgFBWarrantyThreeYearsPrefFormControl: FormControl;  

  //// *** Enumerations module prefs ***  
  //csgOptionsFormControl: FormControl;
  
  //// Design Code
  //csg020DesignCodePrefFormControl: FormControl;
  //csg055DesignCodePrefFormControl: FormControl;
  //csg125DesignCodePrefFormControl: FormControl;
  //csg180DesignCodePrefFormControl: FormControl;
  //// Shell Type
  //csg020ShellTypePrefFormControl: FormControl;
  //csg055ShellTypePrefFormControl: FormControl;
  //csg125ShellTypePrefFormControl: FormControl;
  //csg180ShellTypePrefFormControl: FormControl;
  

  constructor(private routesService: RoutesService, private adminService: AdminService, private translationService: TranslationService, private fb: FormBuilder, private translatePipe: TranslatePipe, private modulePreferenceService: ModulePreferenceService) {

    this.csgFBManufacturerPrefFormControl         = new FormControl({ value: '', disabled: true });
    this.csgFBManufacturerCurrencyPrefFormControl = new FormControl({ value: '', disabled: true });
    this.csgFBSellingCurrencyPrefFormControl      = new FormControl('');    

    this.csgFBLandedCostIncreasePrefFormControl   = new FormControl('', [Validators.required, CustomValidators.range([0, 100])]);
    this.csgFBDeliveryCostPrefFormControl         = new FormControl('', [Validators.required]);
    this.csgFBCommissionOnlyPricePrefFormControl  = new FormControl('', [Validators.required]);
    this.csgFBWarrantyOneYearPrefFormControl      = new FormControl('', [Validators.required]);
    this.csgFBWarrantyTwoYearsPrefFormControl     = new FormControl('', [Validators.required]);
    this.csgFBWarrantyThreeYearsPrefFormControl   = new FormControl('', [Validators.required]);    

    //this.csgOptionsFormControl = new FormControl('');    
    
    //// Design Code
    //this.csg020DesignCodePrefFormControl = new FormControl(null);
    //this.csg055DesignCodePrefFormControl = new FormControl(null);
    //this.csg125DesignCodePrefFormControl = new FormControl(null);
    //this.csg180DesignCodePrefFormControl = new FormControl(null);
    //// Shell Type
    //this.csg020ShellTypePrefFormControl = new FormControl(null);
    //this.csg055ShellTypePrefFormControl = new FormControl(null);
    //this.csg125ShellTypePrefFormControl = new FormControl(null);
    //this.csg180ShellTypePrefFormControl = new FormControl(null);
      

    //// Setup the form group.
    this.modulePreferencesForm = this.fb.group({      
      // Currency Options
      csgFBManufacturerModulePreference: this.csgFBManufacturerPrefFormControl,
      csgFBManufacturerCurrencyModulePreference: this.csgFBManufacturerCurrencyPrefFormControl,
      csgFBSellingCurrencyModulePreference: this.csgFBSellingCurrencyPrefFormControl,

      // Pricing Options
      csgFBLandedCostIncreaseModulePreference: this.csgFBLandedCostIncreasePrefFormControl,
      csgFBDeliveryCostModulePreference: this.csgFBDeliveryCostPrefFormControl,
      csgFBCommissionOnlyPriceModulePreference: this.csgFBCommissionOnlyPricePrefFormControl,
      csgFBWarrantyOneYearModulePreference: this.csgFBWarrantyOneYearPrefFormControl,
      csgFBWarrantyTwoYearsModulePreference: this.csgFBWarrantyTwoYearsPrefFormControl,
      csgFBWarrantyThreeYearsModulePreference: this.csgFBWarrantyThreeYearsPrefFormControl,      

    //  // Option Configuration
    //  csgOptionsSelection: this.csgOptionsFormControl,
      
    //  // Design Code
    //  csg020DesignCodePreference: this.csg020DesignCodePrefFormControl,
    //  csg055DesignCodePreference: this.csg055DesignCodePrefFormControl,
    //  csg125DesignCodePreference: this.csg125DesignCodePrefFormControl,
    //  csg180DesignCodePreference: this.csg180DesignCodePrefFormControl,
    //  // Shell Type
    //  csg020ShellTypePreference: this.csg020ShellTypePrefFormControl,
    //  csg055ShellTypePreference: this.csg055ShellTypePrefFormControl,
    //  csg125ShellTypePreference: this.csg125ShellTypePrefFormControl,
    //  csg180ShellTypePreference: this.csg180ShellTypePrefFormControl,
    
      
    }, { updateOn: "blur" });
  }

  ngOnInit() {
    // When Angular looks at a guard decision, page navigation has already occurred.
    // Reset the page load progress
    this.routesService.pageLoadProgress = 0;
    this.routesService.pageLoading = true;
    this.routesService.startPageLoadProgress();

    // First, get all the module preferences.
    this.modulePreferenceService.getOperatingCompanyModulePreferences(this.moduleId).subscribe((result: Array<ModulePreference>) => {
      if (result && result.length > 0)
      {
        // And set their values accordingly.
        this.csgFBManufacturerPrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGFBManufacturer"));        
        
        this.csgFBManufacturerCurrencyId = +this.getModulePreferenceValue(result, "CSGFBManufacturerCurrency");
        this.csgFBManufacturerCurrencyPrefFormControl.setValue(this.csgFBManufacturerCurrencyId);

        this.csgFBSellingCurrencyId = +this.getModulePreferenceValue(result, "CSGFBSellingCurrency");
        this.csgFBSellingCurrencyPrefFormControl.setValue(this.csgFBSellingCurrencyId);
        // Calculate the currency conversion rate.
        this.onSellingCurrencyChange(this.csgFBSellingCurrencyId);

        this.csgFBLandedCostIncreasePrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGFBLandCostIncrease"));        
        this.csgFBDeliveryCostPrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGFBDeliveryCost"));
        this.csgFBCommissionOnlyPricePrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGFBCommission"));
        this.csgFBWarrantyOneYearPrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGFBYearOne"));
        this.csgFBWarrantyTwoYearsPrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGFBYearTwo"));
        this.csgFBWarrantyThreeYearsPrefFormControl.setValue(this.getModulePreferenceValue(result, "CSGFBYearThree"));
      }
    });

    // Get the list of manufacturers.
    this.adminService.getManufacturerData(this.moduleGroupId).subscribe((result: Array<Manufacturer>) => {
      // Update the subject with the data that's just been retrieved (see the constructor).
      this.manufacturerList = result;
    });

    // Get the currency data.
    this.adminService.getCurrencyData().subscribe(data => {
      this.currencyList = data;

      // Selling currency found, so try to calculate the currency conversion rate.
      this.onSellingCurrencyChange(this.csgFBSellingCurrencyId);
    });
    
    //// Now, set the "OpCo Selected Options" for the different CSG options.
    //// Design Code
    //this.setOpCoPreferences("CSG_HS_020_Design_Code", this.csg020DesignCodePrefFormControl);
    //this.setOpCoPreferences("CSG_HS_055_Design_Code", this.csg055DesignCodePrefFormControl);
    //this.setOpCoPreferences("CSG_HS_125_Design_Code", this.csg125DesignCodePrefFormControl);
    //this.setOpCoPreferences("CSG_HS_180_Design_Code", this.csg180DesignCodePrefFormControl);
    //// Shell Type
    //this.setOpCoPreferences("CSG_HS_020_Shell_Type", this.csg020ShellTypePrefFormControl);
    //this.setOpCoPreferences("CSG_HS_055_Shell_Type", this.csg055ShellTypePrefFormControl);
    //this.setOpCoPreferences("CSG_HS_125_Shell_Type", this.csg125ShellTypePrefFormControl);
    //this.setOpCoPreferences("CSG_HS_180_Shell_Type", this.csg180ShellTypePrefFormControl);
    

    //this.csgOptionsSelectedItem = "Design Code";

    this.theFormGroup = this.modulePreferencesForm; // to drive GenericChangesGuard
  }

  /*
  * Method to get and set the OpCo selected options.
  */
  //setOpCoPreferences(enumerationPickerName, formControlName)
  //{
  //  // Get the collection list first.
  //  let csgOpCoPref = this.getEnumerationPickerCollection(enumerationPickerName, true);

  //  // Check if any OpCo Overrides Data found? If NOT then get the base list populated.
  //  if (!csgOpCoPref)
  //  {
  //    csgOpCoPref = cloneDeep(this.getEnumerationPickerCollection(enumerationPickerName, false));
  //  }

  //  // Check and set the list.
  //  if (!!csgOpCoPref && csgOpCoPref.length > 0) {
  //    formControlName.setValue(csgOpCoPref);
  //  }
  //}

  ///*
  //* Method to get the Enumeration list by Name.
  //*/
  //getEnumerationPickerCollection(enumerationPickerName, opCoOverride) {
  //  const enumeration = this.translationService.displayGroup.enumerations.filter(us => us.enumerationName === enumerationPickerName && us.opCoOverride === opCoOverride);

  //  if (!!enumeration && enumeration.length > 0) {
  //    let definitions = enumeration[0].enumerationDefinitions.sort((currentenumeration, nextenumeration) => {
  //      if (currentenumeration.sequence > nextenumeration.sequence) {
  //        return 1;
  //      }

  //      if (currentenumeration.sequence < nextenumeration.sequence) {
  //        return -1;
  //      }

  //      return 0;
  //    });      

  //    //this.onChange(definitions);
  //    definitions.forEach(i => i.isDeleted = false);

  //    return definitions;
  //  }
  //}

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
    newModulePreferences.push(this.getSelectedPreferences("CSGFBSellingCurrency",   "csgFBSellingCurrencyModulePreference"));
    newModulePreferences.push(this.getSelectedPreferences("CSGFBLandCostIncrease",  "csgFBLandedCostIncreaseModulePreference"));
    newModulePreferences.push(this.getSelectedPreferences("CSGFBDeliveryCost",      "csgFBDeliveryCostModulePreference"));
    newModulePreferences.push(this.getSelectedPreferences("CSGFBCommission",        "csgFBCommissionOnlyPriceModulePreference"));
    newModulePreferences.push(this.getSelectedPreferences("CSGFBYearOne",           "csgFBWarrantyOneYearModulePreference"));
    newModulePreferences.push(this.getSelectedPreferences("CSGFBYearTwo",           "csgFBWarrantyTwoYearsModulePreference")); 
    newModulePreferences.push(this.getSelectedPreferences("CSGFBYearThree",         "csgFBWarrantyThreeYearsModulePreference"));

    // Save the changed preferences as an array of preferences
    this.adminService.manageModulePreferences(newModulePreferences).subscribe((response: boolean) => {

      // The form can be submitted again.
      this.formSubmitted = false;

      // Set the operation based on the response.
      //this.isSuccess = response;
      this.alertVisible = true;
    });

    //// Enumeration Module Preferences.
    //const newEnumerationModulePreferences: Enumeration[] = [];
    
    //// Design Code
    //newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Design_Code", "csg020DesignCodePreference"));
    //newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Design_Code", "csg055DesignCodePreference"));
    //newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Design_Code", "csg125DesignCodePreference"));
    //newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Design_Code", "csg180DesignCodePreference"));
    //// Shell Type
    //newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_020_Shell_Type", "csg020ShellTypePreference"));
    //newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_055_Shell_Type", "csg055ShellTypePreference"));
    //newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_125_Shell_Type", "csg125ShellTypePreference"));
    //newEnumerationModulePreferences.push(this.getSelectedEnumerationPreferences("CSG_HS_180_Shell_Type", "csg180ShellTypePreference"));
     

    //// Save the changed preferences as an array of preferences
    //this.adminService.manageEnumerationModulePreferences(newEnumerationModulePreferences).subscribe((response: boolean) => {

    //  // The form can be submitted again.
    //  this.formSubmitted = false;

    //  // Set the operation based on the response.
    //  this.isSuccess = response;
    //  this.alertVisible = true;

      this.modulePreferencesForm.markAsPristine(); // to drive GenericChangesGuard

    //});
  }
  
  /*
  * Method to get opco selected enumeration module prefernce details for each options.
  */
  //getSelectedEnumerationPreferences(enumerationPickerName, prefsFormKeyName) {
  //  var modPrefs: Enumeration = new Enumeration;
  //  modPrefs.enumerationName = enumerationPickerName;
  //  modPrefs.opCoOverride = true;
  //  modPrefs.enumerationDefinitions = this.modulePreferencesForm.controls[prefsFormKeyName].value;

  //  return modPrefs;
  //}

  /*
  * Method to get opco selected module prefernce details.
  */
  getSelectedPreferences(enumerationPickerName, prefsFormKeyName) {
    var modPrefs: ModulePreferenceDetails = new ModulePreferenceDetails;
    modPrefs.name = enumerationPickerName;
    modPrefs.value = this.modulePreferencesForm.controls[prefsFormKeyName].value;
    modPrefs.moduleId = +this.moduleId;
    modPrefs.isDeleted = false;

    return modPrefs;
  }

  closeAlert(): void {
    // Reset the flag
    this.alertVisible = false;
  }

  //onCSGOptionsChange(event: any) {
  //  this.csgOptionsSelectedItem = event.selectedValue;
  //}

  /*
  * Method to calculate the currency conversion rate.
  */
  onSellingCurrencyChange(selectedValue: any): void {
    this.csgFBManufacturerCurrencyId = +this.csgFBManufacturerCurrencyPrefFormControl.value;


    if (selectedValue > 0 && this.csgFBManufacturerCurrencyId > 0 && this.currencyList.length > 0)
    {      
      let sellingCurrency = this.currencyList.find(c => c.id === +selectedValue);
      let manufacturerCurrency = this.currencyList.find(c => c.id === this.csgFBManufacturerCurrencyId);

      this.csgFBSellingCurrencySymbol = sellingCurrency.symbol;
      this.csgFBCurrencyConversion = +((manufacturerCurrency.rateToGbp * (1 / sellingCurrency.rateToGbp)).toFixed(5));
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
}
