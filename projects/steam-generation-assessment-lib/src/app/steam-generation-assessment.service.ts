import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  FormFieldTypesInterface,
  SteamCalorificRequestInterface, SteamCarbonEmissionInterface,
  SteamGenerationFormInterface
} from "./steam-generation-form.interface";
import { PreferenceService, Preference } from "sizing-shared-lib";
import { SizingUnitPreference } from "../../../sizing-shared-lib/src/lib/shared/preference/sizing-unit-preference.model";
import { FormGroup } from "@angular/forms";

@Injectable()
export class SteamGenerationAssessmentService {
  private sgaFormFields: FormFieldTypesInterface =  {
    hoursOfOperation: {
      formControlName: 'hoursOfOperation',
      label: 'HOURS_OF_OPERATION',
      required: true
    },
    // FUEL
    fuelEnergyPerUnit: {
      formControlName: 'fuelEnergyPerUnit',
      label: 'FUEL_CALORIFIC_VALUE',
      unitNames: ['BoilerHouseEnergyUnits', /*inputFuelUnit*/],
      controlNames: ['fuelEnergyPerUnitUnit', 'inputFuelUnit'],
      translations: ['ENERGY'],
      required: true
    },
    fuelCarbonContent: {
      formControlName: 'fuelCarbonContent',
      label: 'CO2_EMISSIONS_PER_UNIT_FUEL',
      unitNames: ['WeightUnit'],
      translations: ['SMALL_WEIGHT'],
      controlNames: ['fuelCarbonContentUnit'],
      required: true,
    },
    costOfFuelPerUnit: {
      formControlName: 'costOfFuelPerUnit',
      label: 'COST_OF_FUEL_PER_UNIT',
      unitNames: ['BHCurrency'],
      translations: ['CURRENCY'],
      required: true
    },
    fuelQtyPerYearIsKnown: {
      formControlName: 'fuelQtyPerYearIsKnown',
      label: 'IS_FUEL_CONSUMPTION_MEASURED'
    },
    costOfFuelPerYear: {
      formControlName: 'costOfFuelPerYear',
      label: 'FUEL_COSTS_PER_YEAR',
      unitNames: ['BHCurrency'],
      translations: ['CURRENCY'],
      required: true,
    },
    fuelConsumptionPerYear: {
      formControlName: 'fuelConsumptionPerYear',
      label: 'FUEL_CONSUMPTION_PER_YEAR',
      required: true
    },
    // CO2 EMISSION
    carbonTaxLevyCostPerUnit: {
      formControlName: 'carbonTaxLevyCostPerUnit',
      label: 'CARBON_TAX_LEVY_COST_PER_UNIT',
      unitNames: ['BHCurrency', 'BoilerHouseEnergyUnits'],
      translations: ['CURRENCY', 'ENERGY'],
      required: true,
    },
    costOfCo2PerUnitMass: {
      formControlName: 'costOfCo2PerUnitMass',
      label: 'COST_OF_CO2_PER_UNIT_MASS',
      unitNames: ['BHCurrency', 'BoilerHouseEmissionUnits'],
      translations: ['CURRENCY', 'CO2_EMISSIONS'],
      controlNames: [null, 'costOfCo2Unit'],
      required: true,
    },
    // WATER
    boilerHouseWaterQtyPerYearIsKnown: {
      formControlName: 'boilerHouseWaterQtyPerYearIsKnown',
      label: 'IS_WATER_ENTERING_THE_BOILER_HOUSE_MEASURED'
    },
    costOfWaterPerUnit: {
      formControlName: 'costOfWaterPerUnit',
      label: 'COST_OF_WATER_FSLASH_UNIT',
      unitNames: ['BHCurrency', 'BoilerHouseVolumeUnits'],
      translations: ['CURRENCY', 'VOLUME'],
      controlNames: [null, 'costOfWaterUnit'],
      required: true,
      filled: false,
    },
    // TODO: missing fields in form "COST_OF_WATER_PER_YEAR (BoilerHouseVolume)" && "WATER_CONSUMPTION_HOUR (BoilerHouseVolume)"
    waterConsumptionPerYear: {
      formControlName: 'waterConsumptionPerYear',
      label: 'WATER_CONSUMPTION_YEAR',
      unitNames: ['BoilerHouseVolumeUnits'],
      translations: ['VOLUME'],
      controlNames: ['waterConsumptionPerYearUnit'],
      required: true,
    },
    // WATER TREATMENT CHEMICALS
    boilerWaterTreatmentChemicalCostsIsKnown: {
      formControlName: 'boilerWaterTreatmentChemicalCostsIsKnown',
      label: 'ARE_CHEMICAL_COST_KNOWN'
    },
    totalChemicalCostPerYear: {
      formControlName: 'totalChemicalCostPerYear',
      label: 'TOTAL_CHEMICAL_COSTS_PER_YEAR',
      unitNames: ['BHCurrency'],
      translations: ['CURRENCY'],
      required: true
    },
    o2ScavengingChemicalsCostSavings: {
      formControlName: 'o2ScavengingChemicalsCostSavings',
      label: 'O2_SCAVENGING_CHEMICALS_COST_SAVINGS',
      unitNames: ['BHCurrency'],
      translations: ['CURRENCY'],
    },
    // WATER EFFLUENT
    costOfEffluentPerUnit: {
      formControlName: 'costOfEffluentPerUnit',
      label: 'COST_OF_EFFLUENT_FSLASH_UNIT',
      unitNames: ['BHCurrency', 'BoilerHouseVolumeUnits'],
      translations: ['CURRENCY', 'VOLUME'],
      required: true,
    },
    // BOILER
    isSuperheatedSteam: {
      formControlName: 'isSuperheatedSteam',
      label: 'IS_SUPERHEATED_STEAM'
    },
    isSteamFlowMeasured: {
      formControlName: 'isSteamFlowMeasured',
      label: 'IS_STEAM_FLOW_MEASURED'
    },
    boilerSteamGeneratedPerHour: {
      formControlName: 'boilerSteamGeneratedPerHour',
      label: 'STEAM_GENERATION_PER_HOUR',
      unitNames: ['MassFlowUnit'],
      unitTypes: ['MassFlowUnits'],
      translations: ['MASS_FLOW_ALL'],
      controlNames: ['boilerSteamGeneratedPerHourUnit'],
      required: true,
      filled: false,
    },
    boilerSteamGeneratedPerYear: {
      formControlName: 'boilerSteamGeneratedPerYear',
      label: 'STEAM_GENERATION_PER_YEAR',
      unitNames: ['BoilerHouseMassFlowUnits'],
      translations: ['MASS_FLOW'],
      controlNames: ['boilerSteamGeneratedPerYearUnit'],
      required: true,
      filled: false,
    },
    boilerSteamTemperature: {
      formControlName: 'boilerSteamTemperature',
      label: 'STEAM_TEMPERATURE',
      unitNames: ['TemperatureUnit'],
      unitTypes: ['TemperatureUnits'],
      translations: ['TEMPERATURE'],
      controlNames: ['boilerSteamTemperatureUnit'],
    },
    boilerSteamPressure: {
      formControlName: 'boilerSteamPressure',
      label: 'STEAM_PRESSURE',
      unitNames: ['PressureUnit'],
      unitTypes: ['PressureUnits'],
      translations: ['PRESSURE'],
      controlNames: ['boilerSteamPressureUnit'],
      required: true,
    },
    boilerEfficiency: {
      formControlName: 'boilerEfficiency',
      label: 'BOILER_EFFICIENCY',
      required: true,
      filled: true,
    },
    // TDS BLOWDOWN
    isBlowdownVesselPresent: {
      formControlName: 'isBlowdownVesselPresent',
      label: 'IS_BLOWDOWN_VESSEL_PRESENT'
    },
    isCoolingWaterUsed: {
      formControlName: 'isCoolingWaterUsed',
      label: 'IS_COOLING_WATER_USED'
    },
    isAutoTdsControlPResent: {
      formControlName: 'isAutoTdsControlPResent',
      label: 'IS_AUTO_TDS_PRESENT'
    },
    isFlashVesselPresent: {
      formControlName: 'isFlashVesselPresent',
      label: 'IS_FLASH_VESSEL_PRESENT'
    },
    isHeatExchangerPresent: {
      formControlName: 'isHeatExchangerPresent',
      label: 'IS_HEAT_EXCHANGER_PRESENT'
    },
    waterTemperatureLeavingHeatExchanger: {
      formControlName: 'waterTemperatureLeavingHeatExchanger',
      label: 'WATER_TEMPERATURE_LEAVING_HEAT_EXCHANGER',
      unitNames: ['TemperatureUnit'],
      unitTypes: ['TemperatureUnits'],
      translations: ['TEMPERATURE'],
      controlNames: ['waterTemperatureLeavingHeatExchangerUnit'],
      required: true,
      filled: false,
    },
    tdsOfFeedwaterInFeedtank: { // TODO: Dublicate fields
      formControlName: 'tdsOfFeedwaterInFeedtank',
      label: 'TDS_OF_FEEDWATER_IN_FEEDTANK',
      unitNames: ['BoilerHouseTDSUnits'],
      translations: ['TDS'],
      controlNames: ['tdsOfFeedwaterInFeedtankUnit'],
      required: true,
    },
    boilerAverageTds: {
      formControlName: 'boilerAverageTds',
      label: 'AVERAGE_BOILER_TDS',
      unitNames: ['BoilerHouseTDSUnits'],
      translations: ['TDS'],
      controlNames: ['boilerAverageTdsUnit'],
      required: true,
    },
    boilerMaxTds: {
      formControlName: 'boilerMaxTds',
      label: 'MAXIMUM_ALLOWABLE_BOILER_TDS',
      unitNames: ['BoilerHouseTDSUnits'],
      translations: ['TDS'],
      controlNames: ['boilerMaxTdsUnit'],
      required: false,
    },
    // WATER_TREATMENT
    temperatureOfMakeupWater: {
      formControlName: 'temperatureOfMakeupWater',
      label: 'TEMPERATURE_OF_MAKE_UP_WATER',
      unitNames: ['TemperatureUnit'],
      unitTypes: ['TemperatureUnits'],
      translations: ['TEMPERATURE'],
      controlNames: ['temperatureOfMakeupWaterUnit'],
    },
    makeupWaterAmount: { //TODO: missing separate fields MAKE_UP_WATER_PER_HOUR && MAKE_UP_WATER_PER_YEAR
      formControlName: 'makeupWaterAmount',
      label: 'MAKE_UP_WATER_PER_HOUR', // MAKE_UP_WATER_PER_YEAR
      unitNames: ['BoilerHouseVolumeUnits'],
      translations: ['VOLUME'],
      controlNames: ['makeupWaterAmountUnit'],
      required: true,
    },
    // WATER_TREATMENT_PARAMETERS
    percentageWaterRejection: {
      formControlName: 'percentageWaterRejection',
      label: 'PERCENTAGE_WATER_REJECTION',
      required: true,
    },
    tdsOfMakeupWater: {
      formControlName: 'tdsOfMakeupWater',
      label: 'TDS_OF_MAKEUP_WATER',
      unitNames: ['BoilerHouseTDSUnits'],
      translations: ['TDS'],
      controlNames: ['tdsOfMakeupWaterUnit'],
      required: true
    },
    // FEEDWATER_AND_CONDENSATE
    atmosphericDeaerator: {
      formControlName: 'atmosphericDeaerator',
      label: 'AUTMOSPHERIC_DEAERATOR'
    },
    pressurisedDeaerator: {
      formControlName: 'pressurisedDeaerator',
      label: 'PRESSURLSED_DEAERATOR'
    },
    isFeedWaterMeasured: {
      formControlName: 'isFeedWaterMeasured',
      label: 'IS_FEEDWATER_FLOWRATE_MEASURED',
    },
    boilerFeedwaterConsumption: { //TODO: missing separate fields CONSUMPTION_PER_HR && CONSUMPTION_PER_YEAR
      formControlName: 'boilerFeedwaterConsumption',
      label: 'CONSUMPTION_PER_HR', // CONSUMPTION_PER_YEAR
      unitNames: ['BoilerHouseVolumeUnits'],
      translations: ['VOLUME'],
      controlNames: ['boilerFeedwaterConsumptionUnit'],
      required: true,
    },
    temperatureOfFeedtank: {
      formControlName: 'temperatureOfFeedtank',
      label: 'TEMPERATURE_OF_FEEDTANK',
      unitNames: ['TemperatureUnit'],
      unitTypes: ['TemperatureUnits'],
      translations: ['TEMPERATURE'],
      controlNames: ['temperatureOfFeedtankUnit'],
      required: true
    },
    areChemicalsAddedDirectlyToFeedtank: {
      formControlName: 'areChemicalsAddedDirectlyToFeedtank',
      label: 'ARE_CHEMICALS_ADDED_DIRECTLY_TO_FEEDTANK'
    },
    isDsiPresent: {
      formControlName: 'isDsiPresent',
      label: 'IS_DSI_PRESENT'
    },
    pressureOfSteamSupplyingDsi: {
      formControlName: 'pressureOfSteamSupplyingDsi',
      label: 'PRESSURE_OF_STEAM_SUPPLYING_DSI',
      unitNames: ['PressureUnit'],
      unitTypes: ['PressureUnits'],
      translations: ['PRESSURE'],
      controlNames: ['pressureOfSteamSupplyingDsiUnit'],
      required: true
    },
    isCondensateReturnKnown: {
      formControlName: 'isCondensateReturnKnown',
      label: 'IS_CONDENSATE_RETURN_KNOWN'
    },
    percentageOfCondensateReturn: {
      formControlName: 'percentageOfCondensateReturn',
      label: 'PERCENTAGE_OF_CONDENSATE_RETURN',
      required: true,
    },
    volumeOfCondensateReturn: {
      formControlName: 'volumeOfCondensateReturn',
      label: 'VOLUME_OF_CONDENSATE_RETURN',
      unitNames: ['BoilerHouseVolumeUnits'],
      translations: ['VOLUME'],
      controlNames: ['volumeOfCondensateReturnUnit'],
    },
    temperatureOfCondensateReturn: {
      formControlName: 'temperatureOfCondensateReturn',
      label: 'TEMPERATURE_OF_CONDENSATE_RETURN',
      unitNames: ['TemperatureUnit'],
      unitTypes: ['TemperatureUnits'],
      translations: ['TEMPERATURE'],
      controlNames: ['temperatureOfCondensateReturnUnit'],
      required: true,
    },
    tdsOfCondensateReturn: {
      formControlName: 'tdsOfCondensateReturn',
      label: 'TDS_OF_CONDENSATE_RETURN',
      unitNames: ['BoilerHouseTDSUnits'],
      translations: ['TDS'],
      controlNames: ['tdsOfCondensateReturnUnit'],
      required: true,
    }
  };

  constructor(
    private http: HttpClient,
    private preferenceService: PreferenceService,
    ) {
  }

  getSgaFormFields(): FormFieldTypesInterface {
    return this.sgaFormFields;
  }

  changeSgaFieldFilled(fieldName: keyof FormFieldTypesInterface, value?: boolean): void {
    if (this.sgaFormFields[fieldName]) {
      let filledValue = !this.sgaFormFields[fieldName].filled;
      if (value === true || value === false) {
        filledValue = value;
      }

      this.sgaFormFields[fieldName].filled = filledValue;
    }
  }

  changeSizingUnits(form?: FormGroup): {[key: string]: number} {
    if (!this.preferenceService.sizingUnitPreferences) return null;

    const sizingUnitPreference = this.preferenceService.sizingUnitPreferences;
    const result = {};

    for (const key in this.sgaFormFields) {
      const preferenceNames = this.sgaFormFields[key].unitNames;
      const controlNames = this.sgaFormFields[key].controlNames;

      if (preferenceNames && preferenceNames[0] && controlNames && controlNames[0]) {
        const sPreference = sizingUnitPreference
          .find(({ preference }) => preference && preference.name === preferenceNames[0]);
        if (sPreference && sPreference.preference && sPreference.preference.value) {
          result[controlNames[0]] = parseInt(sPreference.preference.value);
        }
      }

      if (preferenceNames && preferenceNames[1] && controlNames && controlNames[1]) {
        const sPreference = sizingUnitPreference
          .find(({ preference }) => preference && preference.name === preferenceNames[1]);
        if (sPreference && sPreference.preference && sPreference.preference.value) {
          result[controlNames[1]] = parseInt(sPreference.preference.value);
        }
      }
    }

    if (result && Object.keys(result).length && form && form.patchValue) {
      form.patchValue(result, { onlySelf: true, emitEvent: false });
    }

    return result;
  }

  calculateResults(form: Partial<SteamGenerationFormInterface>): Observable<any> {
    return this.http.post<any>(`./Api/SteamGenerator/calculate-benchmark`, form);
  }

  validateSgInput(field: keyof SteamGenerationFormInterface, form: Partial<SteamGenerationFormInterface>): Observable<any> {
    return this.http.post<any>(`./Api/SteamGenerator/validate-input/${field}`, form);
  }

  calculateCalorific(calorificData: SteamCalorificRequestInterface): Observable<{fuelCarbonContent: number; fuelEnergyPerUnit: number;} | HttpErrorResponse> {
    return this.http.post<any>('./Api/SteamGenerator/calculate-carbon-and-calorific-value', calorificData);
  }

  calculateCarbonEmission(data: SteamCarbonEmissionInterface): Observable<number> {
    return this.http.post<any>('./Api/SteamGenerator/calculate-carbon-emission-value', data);
  }

  public getSizingPreferenceValues(obj: { [key: string]: string }): {[key: string]: number} {
    let res: { [key: string]: number } = {};

    for (let sizingUnitPreference of this.preferenceService.sizingUnitPreferences) {
      for (let nameKey in obj) {
        if (
          obj[nameKey] &&
          sizingUnitPreference &&
          sizingUnitPreference.preference &&
          sizingUnitPreference.preference.name === obj[nameKey]
        ) {
          res[nameKey] = parseInt(sizingUnitPreference.preference.value);

          break;
        }
      }
    }

    return res;
  }

  public getSizingPreferenceByName(name: string): SizingUnitPreference {
    return this.preferenceService.sizingUnitPreferences
      .find(({ unitType, preference }) => {
        return unitType === name || unitType === `${name}s` || (preference && preference.name === name);
      });
  }

  public getPreferenceByName(name: string): Preference {
    return this.preferenceService.allPreferences.find((preference) => preference.name === name);
  }

  static getFuelTypeName(fuelTypeValue: string): string {
    // L, E, G, O, S
    const firstLetter = fuelTypeValue && fuelTypeValue.charAt(0);
    switch (firstLetter) {
      case 'L': return 'BoilerHouseLiquidFuelUnits';
      case 'E': return 'BoilerHouseElectricalFuelUnits';
      case 'G': return 'BoilerHouseGasFuelUnits';
      case 'O': return 'BoilerHouseGasFuelUnits';
      case 'S': return 'BoilerHouseSolidFuelUnits';
      default: return null;
    }
  }
}
