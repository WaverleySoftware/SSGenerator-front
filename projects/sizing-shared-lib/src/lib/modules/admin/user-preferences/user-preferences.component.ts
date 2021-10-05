import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { AdminService } from "../admin.service";
import { PreferenceService } from "../../../shared/preference/preference.service";

import { Preference } from "../../../shared/preference/preference.model";
import { Language } from "../language.model";
import { Currency } from "../currency/currency.model";
import { Observable } from 'rxjs';

import { IGenericChanges } from "../../../modules/generic.changes.interface";

@Component({
  selector: 'user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent implements OnInit, IGenericChanges {

  arePreferencesLoaded: boolean = false;
  isSuccess: boolean = false;
  alertVisible: boolean = false;
  formSubmitted: boolean = false;

  currencies: Currency[];
  languages: Language[];

  boilerHouseCurrency: Preference;
  hideSalesPrice: Preference;
  hideManufactureCosts: Preference;

  cvDesignStandard: Preference;
  specLanguage: Preference;

  preferencesForm: FormGroup;

  theFormGroup: FormGroup = this.preferencesForm;
  hasUnsavedDataChanges: boolean; // to drive GenericChangesGuard

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
  hideSalesPriceFormControl: FormControl;
  hideManufactureCostsFormControl: FormControl;

  cvDesignStandardPrefFormControl: FormControl;
  specLanguagePrefFormControl: FormControl;

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
    this.hideSalesPriceFormControl = new FormControl('');
    this.hideManufactureCostsFormControl = new FormControl('');

    this.cvDesignStandardPrefFormControl = new FormControl('EN');
    this.specLanguagePrefFormControl = new FormControl('');

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
      hideSalesPricePreference: this.hideSalesPriceFormControl,
      hideManufactureCostsPreference: this.hideManufactureCostsFormControl,

      cvDesignStandardPreference: this.cvDesignStandardPrefFormControl,
      specLanguagePreference: this.specLanguagePrefFormControl
    });

    this.theFormGroup = this.preferencesForm; // to drive GenericChangesGuard
  }

  ngOnInit() {
    // Fire off the service calls and wait for the observables to resolve themselves before subscribing by using the forkJoin function.
    Observable.forkJoin(
      this.preferenceService.getUserPreferences(),
      this.adminService.getCurrencyData(),
      this.adminService.getLanguages())
      .subscribe((result: [Preference[], Currency[], Language[]]) => {

        let prefDetails = result[0];

        if (!this.currencies) {
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
        }

        if (!this.languages) {
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
        }

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
        this.hideSalesPrice = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "EHHideSalesPrice");
        this.hideManufactureCosts = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "EHHideManufactureCosts");

        this.cvDesignStandard = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "CvDesignStandard");
        this.specLanguage = this.preferenceService.rationalisePreferenceObjectByName(prefDetails, "SpecLanguage");

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

        //Sets default currency to United Kingdom Pound if the currency is null.
        if (this.boilerHouseCurrency.value == null) {

          this.boilerHouseCurrency.value = "GBP"
        }

        this.boilerHouseCurrencyPrefFormControl.setValue(this.boilerHouseCurrency.value);
        this.hideSalesPriceFormControl.setValue(this.hideSalesPrice.value);
        this.hideManufactureCostsFormControl.setValue(this.hideManufactureCosts.value);

        this.cvDesignStandardPrefFormControl.setValue(this.cvDesignStandard.value);
        this.specLanguagePrefFormControl.setValue(this.specLanguage.value);

        // Inform the view that preferences are now loaded.
        this.arePreferencesLoaded = true;
      });
  }

  /**
   * Rationalises the value for the Hide Sales Price check control.
   * @param control The HTML checkbox.
   */
  setHideSalesPriceCheck(control: HTMLInputElement) {

    this.hideSalesPrice.value = control.checked ? "1" : "0";

    this.hideSalesPriceFormControl.setValue(this.hideSalesPrice.value);
  }

  /**
   * Rationalises the value for the Hide Manufacturer Costs check control.
   * @param control The HTML checkbox.
   */
  setHideManufactureCostsCheck(control: HTMLInputElement) {

    this.hideManufactureCosts.value = control.checked ? "1" : "0";

    this.hideManufactureCostsFormControl.setValue(this.hideManufactureCosts.value);
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

    // Show/Hide Sales Price
    const hideSalesPricePref = this.preferencesForm.controls["hideSalesPricePreference"];

    this.hideSalesPrice.value = hideSalesPricePref.value === null ? "0" : hideSalesPricePref.value;

    newPreferences.push(this.hideSalesPrice);

    // Show/Hide Manufacturer Cost
    const hideManufacturerCost = this.preferencesForm.controls["hideManufactureCostsPreference"];

    this.hideManufactureCosts.value = hideManufacturerCost.value === null ? "0" : hideManufacturerCost.value;

    newPreferences.push(this.hideManufactureCosts);

    // CV Design standard
    const cvDesignStandardPref = this.preferencesForm.controls["cvDesignStandardPreference"];

    this.cvDesignStandard.value = cvDesignStandardPref.value;

    newPreferences.push(this.cvDesignStandard);

    // Spec language
    const specLanguagePref = this.preferencesForm.controls["specLanguagePreference"];

    this.specLanguage.value = specLanguagePref.value;

    newPreferences.push(this.specLanguage);

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
    this.preferenceService.manageUserPreferences(newPreferences).subscribe((response: boolean) => {
      // Mark the form as submitted
      this.formSubmitted = false;
      // Set the operation based on the response.
      this.isSuccess = response;
      this.alertVisible = true;

      // Set the form back to pristine only if the data has been saved successfully.
      if (this.isSuccess) {
        this.preferenceService.clearUnitPreferences();
        this.preferencesForm.markAsPristine();
      }
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
