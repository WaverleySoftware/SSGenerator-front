import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormFieldTypesInterface, SteamGenerationFormInterface } from "../steam-generation-form.interface";
import { Preference } from "../../../../sizing-shared-lib/src/lib/shared/preference/preference.model";

@Component({
  selector: 'app-sga-input-parameters',
  templateUrl: './sga-input-parameters.component.html',
  styleUrls: ['./sga-input-parameters.component.scss']
})
export class SgaInputParametersComponent implements OnInit{
  @Input() formGroup: FormGroup;
  @Input() moduleGroupId: number;

  public fuelType: Preference
  public fields: FormFieldTypesInterface =  {
    hoursOfOperation: {
      formControlName: 'hoursOfOperation',
      label: 'HOURS_OF_OPERATION',
      required: true
    },
    // FUEL
    fuelEnergyPerUnit: {
      formControlName: 'fuelEnergyPerUnit',
      label: 'FUEL_CALORIFIC_VALUE',
      unitNames: ['BoilerHouseEnergyUnits'],
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
    // TODO: missing fields in form "COST_OF_WATER_PER_YEAR" && "WATER_CONSUMPTION_HOUR"
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
      required: false,
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
      required: false,
      filled: true,
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
      required: true,
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

  constructor() {}

  ngOnInit() {}

  public clearValues(clearFields: Array<keyof SteamGenerationFormInterface>, setVal: any = 0, event?: any) {
    if (!clearFields.length) return;

    for (let fieldName of clearFields) {
      if (this.formGroup.get(fieldName).value || this.formGroup.get(fieldName).value === "") {
        this.formGroup.get(fieldName).setValue(setVal);
      }
    }
  }

  public setFormValue(name: string, value: any): void {
    this.formGroup.get(name).setValue(value);
  }

  public setFuelType(
    fieldName: keyof FormFieldTypesInterface,
    index: 0 | 1 = 1,
    value: string = this.fuelType && this.fuelType.name,
    key: 'unitNames' | 'translations' = 'unitNames'
  ): [string, string?] {
    if (this.fields[fieldName]) {
      if (!this.fields[fieldName][key]) {
        this.fields[fieldName][key] = [null, null];
      }

      this.fields[fieldName][key][index] = value;
    }

    return this.fields[fieldName][key];
  }

  public changeFuelTypeHandle(preference: Preference): void {
    console.log(preference, '---changeFuelTypeHandle');
  }
}
