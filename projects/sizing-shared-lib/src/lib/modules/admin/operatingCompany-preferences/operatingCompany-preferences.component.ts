import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { AdminService } from "../admin.service";
import { PreferenceService } from "../../../shared/preference/preference.service";

import { Preference } from "../../../shared/preference/preference.model";
import { Currency } from "../currency/currency.model";
import { Language } from "../language.model";

import { Observable } from 'rxjs';
import { Validators } from '@angular/forms';
import { IGenericChanges } from "../../generic.changes.interface";
import { fail } from 'assert';


@Component({
  templateUrl: './operatingCompany-preferences.component.html',
  styleUrls: ['./operatingCompany-preferences.component.scss']
})
export class OperatingCompanyPreferencesComponent implements OnInit, IGenericChanges {

  arePreferencesLoaded: boolean = false;
  isSuccess: boolean = false;
  alertVisible: boolean = false;
  formSubmitted: boolean = false;

  preferencesForm: FormGroup;

  currencies: Currency[];
  languages: Language[];

  boilerHouseCurrency: Preference;
  reverseOsmosis: Preference;
  taxRate: Preference;
  annualInflation: Preference;
  capitalAllowance: Preference;

  cvDesignStandard: Preference;
  specLanguage: Preference;
  clientDownload: Preference;

  // Units of measure
  pressurePrefFormControl: FormControl;
  areaPrefFormControl: FormControl;
  temperaturePrefFormControl: FormControl;
  forcePrefFormControl: FormControl;
  massFlowPrefFormControl: FormControl;
  lengthPrefFormControl: FormControl;
  volumetricFlowPrefFormControl: FormControl;
  weightPrefFormControl: FormControl;
  capacityPrefFormControl: FormControl;
  velocityPrefFormControl: FormControl;
  loadPrefFormControl: FormControl;
  energyPrefFormControl: FormControl;
  gaseousFuelPrefFormControl: FormControl;
  liquidFuelPrefFormControl: FormControl;
  solidFuelPrefFormControl: FormControl;

  // Boiler house units
  boilerHouseVolumePrefFormControl: FormControl;
  boilerHouseVolumetricFlowPrefFormControl: FormControl;
  boilerHouseWeightPrefFormControl: FormControl;
  boilerHouseTdsPrefFormControl: FormControl;
  boilerHouseMassFlowPrefFormControl: FormControl;
  boilerHouseEnergyPrefFormControl: FormControl;
  boilerHouseSpecificEnergyPrefFormControl: FormControl;
  boilerHouseCo2EmissionsPrefFormControl: FormControl;
  boilerHouseCurrencyPrefFormControl: FormControl;
  boilerHouseGaseousFuelPrefFormControl: FormControl;
  boilerHouseLiquidFuelPrefFormControl: FormControl;
  boilerHouseSolidFuelPrefFormControl: FormControl;
  boilerHouseElectricalFuelPrefFormControl: FormControl;

  // Others
  currencyPrefFormControl: FormControl;
  reverseOsmosisPrefFormControl: FormControl;
  taxRatePrefFormControl: FormControl;
  annualInflationPrefFormControl: FormControl;
  capitalAllowancePrefFormControl: FormControl;

  cvDesignStandardPrefFormControl: FormControl;
  specLanguagePrefFormControl: FormControl;
  clientDownloadPrefFormControl: FormControl;

  theFormGroup: FormGroup; // to drive GenericChangesGuard
  hasUnsavedDataChanges: boolean; // to drive GenericChangesGuard

  constructor(private adminService: AdminService, private preferenceService: PreferenceService, private fb: FormBuilder) {

    // Units of measure
    this.pressurePrefFormControl = new FormControl('');
    this.areaPrefFormControl = new FormControl('');
    this.temperaturePrefFormControl = new FormControl('');
    this.forcePrefFormControl = new FormControl('');
    this.massFlowPrefFormControl = new FormControl('');
    this.lengthPrefFormControl = new FormControl('');
    this.volumetricFlowPrefFormControl = new FormControl('');
    this.weightPrefFormControl = new FormControl('');
    this.capacityPrefFormControl = new FormControl('');
    this.velocityPrefFormControl = new FormControl('');
    this.loadPrefFormControl = new FormControl('');
    this.energyPrefFormControl = new FormControl('');
    this.gaseousFuelPrefFormControl = new FormControl('');
    this.liquidFuelPrefFormControl = new FormControl('');
    this.solidFuelPrefFormControl = new FormControl('');

    // Boiler house units
    this.boilerHouseVolumePrefFormControl = new FormControl('');
    this.boilerHouseVolumetricFlowPrefFormControl = new FormControl('');
    this.boilerHouseWeightPrefFormControl = new FormControl('');
    this.boilerHouseTdsPrefFormControl = new FormControl('');
    this.boilerHouseMassFlowPrefFormControl = new FormControl('');
    this.boilerHouseEnergyPrefFormControl = new FormControl('');
    this.boilerHouseSpecificEnergyPrefFormControl = new FormControl('');
    this.boilerHouseCo2EmissionsPrefFormControl = new FormControl('');
    this.boilerHouseCurrencyPrefFormControl = new FormControl('');
    this.boilerHouseGaseousFuelPrefFormControl = new FormControl('');
    this.boilerHouseLiquidFuelPrefFormControl = new FormControl('');
    this.boilerHouseSolidFuelPrefFormControl = new FormControl('');
    this.boilerHouseElectricalFuelPrefFormControl = new FormControl('');

    // Others
    this.currencyPrefFormControl = new FormControl('');
    this.reverseOsmosisPrefFormControl = new FormControl('');
    this.taxRatePrefFormControl = new FormControl('', [Validators.required]);
    this.annualInflationPrefFormControl = new FormControl('', [Validators.required]);
    this.capitalAllowancePrefFormControl = new FormControl('', [Validators.required]);

    this.cvDesignStandardPrefFormControl = new FormControl('');
    this.specLanguagePrefFormControl = new FormControl('');
    this.clientDownloadPrefFormControl = new FormControl('');

    // Setup the form group.
    this.preferencesForm = this.fb.group({
      pressurePreference: this.pressurePrefFormControl,
      areaPreference: this.areaPrefFormControl,
      temperaturePreference: this.temperaturePrefFormControl,
      forcePreference: this.forcePrefFormControl,
      massFlowPreference: this.massFlowPrefFormControl,
      lengthPreference: this.lengthPrefFormControl,
      volumetricFlowPreference: this.volumetricFlowPrefFormControl,
      weightPreference: this.weightPrefFormControl,
      capacityPreference: this.capacityPrefFormControl,
      velocityPreference: this.velocityPrefFormControl,
      loadPreference: this.loadPrefFormControl,
      energyPreference: this.energyPrefFormControl,
      gaseousFuelPreference: this.gaseousFuelPrefFormControl,
      liquidFuelPreference: this.liquidFuelPrefFormControl,
      solidFuelPreference: this.solidFuelPrefFormControl,

      // Boiler house units
      boilerHouseVolumePreference: this.boilerHouseVolumePrefFormControl,
      boilerHouseVolumetricFlowPreference: this.boilerHouseVolumetricFlowPrefFormControl,
      boilerHouseWeightPreference: this.boilerHouseWeightPrefFormControl,
      boilerHouseTdsPreference: this.boilerHouseTdsPrefFormControl,
      boilerHouseMassFlowPreference: this.boilerHouseMassFlowPrefFormControl,
      boilerHouseEnergyPreference: this.boilerHouseEnergyPrefFormControl,
      boilerHouseSpecificEnergyPreference: this.boilerHouseSpecificEnergyPrefFormControl,
      boilerHouseCo2EmissionsPreference: this.boilerHouseCo2EmissionsPrefFormControl,
      boilerHouseCurrencyPreference: this.boilerHouseCurrencyPrefFormControl,
      boilerHouseGaseousFuelPreference: this.boilerHouseGaseousFuelPrefFormControl,
      boilerHouseLiquidFuelPreference: this.boilerHouseLiquidFuelPrefFormControl,
      boilerHouseSolidFuelPreference: this.boilerHouseSolidFuelPrefFormControl,
      boilerHouseElectricalFuelPreference: this.boilerHouseElectricalFuelPrefFormControl,

      // Others
      reverseOsmosisPreference: this.reverseOsmosisPrefFormControl,
      taxRatePreference: this.taxRatePrefFormControl,
      annualInflationPreference: this.annualInflationPrefFormControl,
      capitalAllowancePreference: this.capitalAllowancePrefFormControl,
      
      cvDesignStandardPreference: this.cvDesignStandardPrefFormControl,
      specLanguagePreference: this.specLanguagePrefFormControl,
      clientDownloadPreference: this.clientDownloadPrefFormControl
    }, { updateOn: "blur" });
  }

  ngOnInit() {

    // Fire off the service calls and wait for the observables to resolve themselves before subscribing by using the forkJoin function.
    Observable.forkJoin(
      this.preferenceService.getOperatingCompanyPreferences(),
      this.adminService.getCurrencyData(),
      this.adminService.getLanguages())
      .subscribe((result: [Preference[], Currency[], Language[]]) => {
        let prefDetails = result[0];

        // Assign the currencies and sort them alphabetically by translated text.
        this.currencies = result[1].sort((currentCurrency, nextCurrency) => {
          if (currentCurrency.translationText > nextCurrency.translationText) {
            return 1;
          }

          if (currentCurrency.translationText < nextCurrency.translationText) {
            return -1;
          }

          return 0;
        });

        // Assign the languages and sort them alphabetically by name.
        this.languages = result[2].sort((currentLang, nextLang) => {
          if (currentLang.name > nextLang.name) {
            return 1;
          }

          if (currentLang.name < nextLang.name) {
            return -1;
          }

          return 0;
        });

        /**
         * Fetch all the various preferences.
         */
        // Units of measure
        const pressurePref = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "PressureUnit");
        const areaPref = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "AreaUnit");
        const temperaturePref = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "TemperatureUnit");
        const forcePref = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "ForceUnit");
        const massFlowPref = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "MassFlowUnit");
        const lengthPref = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "LengthUnit");
        const volumetricFlowPref = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "VolumetricFlowUnit");
        const weightPref = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "WeightUnit");
        const capacityPref = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "CapacityUnit");
        const velocityPref = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "VelocityUnit");
        const loadPref = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "LoadUnit");
        const energyPref = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "EnergyUnits");
        const gaseousFuelPref = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "GaseousFuelUnits");
        const liquidFuel = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "LiquidFuelUnits");
        const solidFuelPref = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "SolidFuelUnits");

        // Boiler house units
        const boilerHouseVolume = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "BoilerHouseVolumeUnits");
        const boilerHouseVolumetricFlow = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "BoilerHouseVolumetricFlowUnits");
        const boilerHouseWeight = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "BoilerHouseWeightUnits");
        const boilerHouseTds = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "BoilerHouseTDSUnits");
        const boilerHouseMassFlow = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "BoilerHouseMassFlowUnits");
        const boilerHouseEnergy = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "BoilerHouseEnergyUnits");
        const boilerHouseSpecificEnergy = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "BoilerHouseSpecificEnergyUnits");
        const boilerHouseCo2Emissions = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "BoilerHouseEmissionUnits");
        
        const boilerHouseGaseousFuel = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "BoilerHouseGasFuelUnits");
        const boilerHouseLiquidFuel = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "BoilerHouseLiquidFuelUnits");
        const boilerHouseSolidFuel = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "BoilerHouseSolidFuelUnits");
        
        const boilerHouseElectricalFuel = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "BoilerHouseElectricalFuelUnits");

        // Others
        this.boilerHouseCurrency = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "BHCurrency");
        this.reverseOsmosis = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "ReverseOsmosisAvailable");
        this.taxRate = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "Tax");
        this.annualInflation = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "AnnualInflation");
        this.capitalAllowance = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "CapitalAllowanceRate");
        this.cvDesignStandard = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "CvDesignStandard");
        this.specLanguage = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "SpecLanguage");
        this.clientDownload = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "DownloadAccess");
        
        /**
         * Set the preferences to the form controls.
         */
        // Units of measure
        this.pressurePrefFormControl.setValue(pressurePref);
        this.areaPrefFormControl.setValue(areaPref);
        this.temperaturePrefFormControl.setValue(temperaturePref);
        this.forcePrefFormControl.setValue(forcePref);
        this.massFlowPrefFormControl.setValue(massFlowPref);
        this.lengthPrefFormControl.setValue(lengthPref);
        this.volumetricFlowPrefFormControl.setValue(volumetricFlowPref);
        this.weightPrefFormControl.setValue(weightPref);
        this.capacityPrefFormControl.setValue(capacityPref);
        this.velocityPrefFormControl.setValue(velocityPref);
        this.loadPrefFormControl.setValue(loadPref);
        this.energyPrefFormControl.setValue(energyPref);
        this.gaseousFuelPrefFormControl.setValue(gaseousFuelPref);
        this.liquidFuelPrefFormControl.setValue(liquidFuel);
        this.solidFuelPrefFormControl.setValue(solidFuelPref);

        // Boiler house units
        this.boilerHouseVolumePrefFormControl.setValue(boilerHouseVolume);
        this.boilerHouseVolumetricFlowPrefFormControl.setValue(boilerHouseVolumetricFlow);
        this.boilerHouseWeightPrefFormControl.setValue(boilerHouseWeight);
        this.boilerHouseTdsPrefFormControl.setValue(boilerHouseTds);
        this.boilerHouseMassFlowPrefFormControl.setValue(boilerHouseMassFlow);
        this.boilerHouseEnergyPrefFormControl.setValue(boilerHouseEnergy);
        this.boilerHouseSpecificEnergyPrefFormControl.setValue(boilerHouseSpecificEnergy);
        this.boilerHouseCo2EmissionsPrefFormControl.setValue(boilerHouseCo2Emissions);

        this.boilerHouseGaseousFuelPrefFormControl.setValue(boilerHouseGaseousFuel);
        this.boilerHouseLiquidFuelPrefFormControl.setValue(boilerHouseLiquidFuel);
        this.boilerHouseSolidFuelPrefFormControl.setValue(boilerHouseSolidFuel);
        this.boilerHouseElectricalFuelPrefFormControl.setValue(boilerHouseElectricalFuel);

        // Others that are a bit more unique
        this.boilerHouseCurrencyPrefFormControl.setValue(this.boilerHouseCurrency.value);
        this.reverseOsmosisPrefFormControl.setValue(this.reverseOsmosis.value);

        this.taxRatePrefFormControl.setValue(this.taxRate.value == null ? "10" : this.taxRate.value);
        this.annualInflationPrefFormControl.setValue(this.annualInflation.value == null ? "2" : this.annualInflation.value);
        this.capitalAllowancePrefFormControl.setValue(this.capitalAllowance.value == null ? "20" : this.capitalAllowance.value);

        this.cvDesignStandardPrefFormControl.setValue(this.cvDesignStandard.value == null ? "EN" : this.cvDesignStandard.value);
        this.cvDesignStandardPrefFormControl.updateValueAndValidity(); // To prevent sticky form validation for no prefs initialisation scenerio.

        this.specLanguagePrefFormControl.setValue(this.specLanguage.value == null ? "en-gb" : this.specLanguage.value);
        this.clientDownloadPrefFormControl.setValue(this.clientDownload.value == null ? "0" : this.clientDownload.value);



        // Inform the view that preferences are now loaded.
        this.arePreferencesLoaded = true;
        this.theFormGroup = this.preferencesForm; // to drive GenericChangesGuard
      }
    );
  }

  /**
   * Rationalises the value for the reverse osmosis check control.
   * @param control The HTML checkbox.
   */
  setReverseOsmosis(control: HTMLInputElement) {

    this.reverseOsmosis.value = control.checked ? "1" : "0";

    this.reverseOsmosisPrefFormControl.setValue(this.reverseOsmosis.value);
  }

  /**
   * Submits the form for saving to the server.
   * @param $ev The submission event.
   */
  submitForm($ev) {
    $ev.preventDefault();

    // Mark the form as submitted.
    this.formSubmitted = true;

    const newPreferences: Preference[] = [];

    // Get the currency
    const currencyPref = this.preferencesForm.controls["boilerHouseCurrencyPreference"];

    this.boilerHouseCurrency.value = currencyPref.value;

    newPreferences.push(this.boilerHouseCurrency);

    // Reverse osmosis
    const reverseOsmosisPref = this.preferencesForm.controls["reverseOsmosisPreference"];

    this.reverseOsmosis.value = reverseOsmosisPref.value;

    // if reverseOsmosisPref.value is null then set it false '0'
    if (!!this.reverseOsmosis && this.reverseOsmosis.value === null) {
      this.reverseOsmosis.value = "0";
    }

    newPreferences.push(this.reverseOsmosis);

    // Tax Rate
    const taxRatePref = this.preferencesForm.controls["taxRatePreference"];

    this.taxRate.value = taxRatePref.value;

    newPreferences.push(this.taxRate);

    // Annual inflation
    const annualInflationPref = this.preferencesForm.controls["annualInflationPreference"];

    this.annualInflation.value = annualInflationPref.value;

    newPreferences.push(this.annualInflation);

    // Capital allowance
    const capitalAllowancePref = this.preferencesForm.controls["capitalAllowancePreference"];

    this.capitalAllowance.value = capitalAllowancePref.value;

    newPreferences.push(this.capitalAllowance);

    // CV Design standard
    const cvDesignStandardPref = this.preferencesForm.controls["cvDesignStandardPreference"];

    this.cvDesignStandard.value = cvDesignStandardPref.value;

    // if cvDesignStandardPref.value is null then set it false '0'
    if (!!this.cvDesignStandard && this.cvDesignStandard.value === null) {
      this.cvDesignStandard.value = "EN";
    }

    newPreferences.push(this.cvDesignStandard);

    // Spec language
    const specLanguagePref = this.preferencesForm.controls["specLanguagePreference"];

    this.specLanguage.value = specLanguagePref.value;

    // if specLanguagePref.value is null then set it false '0'
    if (!!this.specLanguage && this.specLanguage.value === null) {
      this.specLanguage.value = "en-gb";
    }

    newPreferences.push(this.specLanguage);

    // Client download
    const clientDownloadPref = this.preferencesForm.controls["clientDownloadPreference"];

    this.clientDownload.value = clientDownloadPref.value;

    newPreferences.push(this.clientDownload);

    // Get all the other preferences
    // Units of measure
    newPreferences.push(this.preferencesForm.controls["pressurePreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["areaPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["temperaturePreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["forcePreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["massFlowPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["lengthPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["volumetricFlowPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["weightPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["capacityPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["velocityPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["loadPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["energyPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["gaseousFuelPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["liquidFuelPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["solidFuelPreference"].value as Preference);

    // Boiler house units
    newPreferences.push(this.preferencesForm.controls["boilerHouseVolumePreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["boilerHouseVolumetricFlowPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["boilerHouseWeightPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["boilerHouseTdsPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["boilerHouseMassFlowPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["boilerHouseEnergyPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["boilerHouseSpecificEnergyPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["boilerHouseCo2EmissionsPreference"].value as Preference);
    
    newPreferences.push(this.preferencesForm.controls["boilerHouseGaseousFuelPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["boilerHouseLiquidFuelPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["boilerHouseSolidFuelPreference"].value as Preference);
    newPreferences.push(this.preferencesForm.controls["boilerHouseElectricalFuelPreference"].value as Preference);
    
    // Save the changed preferences as an array of preferences
    this.preferenceService.manageOperatingCompanyPreferences(newPreferences).subscribe((response: boolean) => {
      
      // The form can be submitted again.
      this.formSubmitted = false;

      // Set the operation based on the response.
      this.isSuccess = response;
      this.alertVisible = true;

      this.preferencesForm.markAsPristine();
    },
      error => {
        // The form can be submitted again.
        this.formSubmitted = false;

        // Set the operation based on the response.
        this.isSuccess = false;
        this.alertVisible = true;

    });
  }

  closeAlert(): void {
    // Reset the flag
    this.alertVisible = false;
  }

  public onDeactivate(componentRef: IGenericChanges) {
    console.info(`Deactivating`);
  }

}
