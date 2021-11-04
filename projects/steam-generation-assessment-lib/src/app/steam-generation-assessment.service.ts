import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SteamGenerationFormInterface } from "./steam-generation-form.interface";

@Injectable()
export class SteamGenerationAssessmentService {
  steamGenerationForm: FormGroup;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
  ) {

    this.steamGenerationForm = this.fb.group({
      hoursOfOperation: [{value: 0, disabled: false}, Validators.required],
      isSteamFlowMeasured: [true],
      isAutoTdsControlPResent: [true],
      boilerSteamGeneratedPerYear: [0],
      boilerSteamGeneratedPerYearUnit: [0],
      inputFuelId: [null],
      inputFuelUnit: [{value: 1, disabled: false}, Validators.required],
      costOfFuelPerUnit: [{value: 1, disabled: false}, Validators.required],
      costOfFuelUnit: [0],
      costOfFuelPerYear: [0],
      fuelQtyPerYearIsKnown: [null],
      fuelConsumptionPerYear: [0, Validators.required],
      fuelConsumptionPerYearUnit: [0],
      fuelEnergyPerUnit: [0],
      fuelCarbonContent: [0],
      fuelCarbonContentUnit: [0],
      costOfWaterPerUnit: [0],
      costOfWaterUnit: [0],
      costOfEffluentPerUnit: [0],
      costOfEffluentUnit: [0],
      boilerHouseWaterQtyPerYearIsKnown: [true],
      waterConsumptionPerYear: [0],
      waterConsumptionPerYearUnit: [0],
      boilerWaterTreatmentChemicalCostsIsKnown: [true],
      totalChemicalCostPerYear: [0], // TOTAL_CHEMICAL_COSTS_PER_YEAR
      totalChemicalCostPerYearUnit: [0],
      costOfChemistsPerUnitOfWater: [0],
      costOfChemistsPerUnitOfWaterUnit: [0],
      o2ScavengingChemicalsCostSavings: [0], // O2_SCAVENGING_CHEMICALS_COST_SAVINGS
      o2ScavengingChemicalsCostSavingsUnit: [0],
      carbonTaxLevyCostPerUnit: [0],
      carbonTaxLevyCostUnit: [0],
      costOfCo2PerUnitMass: [0],
      costOfCo2Unit: [0],
      isBlowdownVesselPresent: [true],
      isCoolingWaterUsed: [true],
      isSuperheatedSteam: [true],
      boilerEfficiency: [0],
      isFeedWaterMeasured: [null],
      boilerSteamPressure: [0],
      boilerSteamPressureUnit: [0],
      boilerSteamTemperature: [0],
      boilerSteamTemperatureUnit: [0],
      isEconomizerPresent: [true],
      boilerAverageTds: [0],
      boilerAverageTdsUnit: [0],
      boilerMaxTds: [0],
      boilerMaxTdsUnit: [0],
      boilerFeedwaterConsumption: [0],
      boilerFeedwaterConsumptionUnit: [0],
      isFlashVesselPresent: [true],
      isHeatExchangerPresent: [true],
      waterTemperatureLeavingHeatExchanger: [0],
      waterTemperatureLeavingHeatExchangerUnit: [0],
      waterTreatmentMethod: [0],
      percentageWaterRejection: [0],
      percentageWaterRejectionUnit: [0],
      tdsOfMakeupWater: [0],
      tdsOfMakeupWaterUnit: [0],
      temperatureOfMakeupWater: [0],
      temperatureOfMakeupWaterUnit: [0],
      makeupWaterAmount: [0],
      makeupWaterAmountUnit: [0],
      atmosphericDeaerator: [true],
      pressurisedDeaerator: [true],
      temperatureOfFeedtank: [0],
      temperatureOfFeedtankUnit: [0],
      tdsOfFeedwaterInFeedtank: [0],
      tdsOfFeedwaterInFeedtankUnit: [0],
      tdsOfCondensateReturn: [0],
      tdsOfCondensateReturnUnit: [0],
      temperatureOfCondensateReturn: [0],
      temperatureOfCondensateReturnUnit: [0],
      areChemicalsAddedDirectlyToFeedtank: [true],
      pressureOfFeedtank: [0],
      pressureOfFeedtankUnit: [0],
      pressureOfSteamSupplyingDsi: [0],
      pressureOfSteamSupplyingDsiUnit: [0],
      isCondensateReturnKnown: [true],
      percentageOfCondensateReturn: [0],
      percentageOfCondensateReturnUnit: [0],
      volumeOfCondensateReturn: [0],
      volumeOfCondensateReturnUnit: [0],
      isDsiPresent: [true],
      proposalTemperatureUnit: ["string"],
      proposalTemperatureUnitUnit: [0],
      isBoilerEfficiencySelected: [true],
      isBoilerEfficiencyAvailable: [true],
      proposalBoilerEfficiency: [0],
      isIncreasingCondensateReturnSelected: [true],
      isIncreasingCondensateReturnAvailable: [true],
      proposalCondensateReturned: [0],
      proposalCondensateReturnedUnit: [0],
      proposalCondensateReturnedPercentage: [0],
      proposalCondensateTemperature: [0],
      proposalCondensateTemperatureUnit: [0],
      changingWaterTreatmentMethodSelected: [true],
      changingWaterTreatmentMethodAvailable: [true],
      proposalMakeUpWaterTds: [0],
      proposalMakeUpWaterTdsUnit: [0],
      proposalPercentFeedwaterRejected: [0],
      proposalPercentFeedwaterRejectedUnit: [0],
      addingAutomaticTdsControlSelected: [true],
      addingAutomaticTdsControlAvailable: [true],
      addingFlashHeatRecoveryToAutoTdsControlSelected: [true],
      addingFlashHeatRecoveryToAutoTdsControlAvailable: [true],
      addingHeatExchangerforHeatRecoveryToTdsBlowdownSelected: [true],
      addingHeatExchangerforHeatRecoveryToTdsBlowdownAvailable: [true],
      effectOfDsiOnHotwellSelected: [true],
      effectOfDsiOnHotwellAvailable: [true],
      proposalDesiredHotwellTemperatureUsingDSI: [0],
      proposalDesiredHotwellTemperatureUsingDSIUnit: [0],
      proposalCostOfSodiumSulphite: [0],
      proposalCostOfSodiumSulphiteUnit: [0],
      proposalDSIPressure: [0],
      proposalDSIPressureUnit: [0]
    });
  }

  public getForm(): FormGroup {
    return this.steamGenerationForm;
  }

  public getUserUnits() {

  }

  public validateSgInput(field: keyof SteamGenerationFormInterface, form: Partial<SteamGenerationFormInterface>): Observable<any> {
    return this.http.post<any>(`./Api/SteamGenerator/validate-input/${field}`, form);
  }
}
