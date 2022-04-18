import { FormGroup } from "@angular/forms";
import { KeyParametersChangedInterface } from "../interfaces/key-parameters-changed.interface";
import { BenchmarkInputsInterface } from "../interfaces/benchmarkInputs.interface";

export function generateKeyParametersChange(fg: FormGroup): KeyParametersChangedInterface {
  const isFieldWasChanged = (name: keyof BenchmarkInputsInterface): boolean => {
    const ctrl = fg.get(name);

    return (ctrl && ctrl.touched && ctrl.dirty);
  }

  return {
    isHoursOfOperationChanged: isFieldWasChanged('hoursOfOperation'),
    isCostOfFuelPerUnitChanged: isFieldWasChanged('costOfFuelPerUnit'),
    isCostOfWaterPerUnitChanged: isFieldWasChanged('costOfWaterPerUnit'),
    isCostChemM3Changed: false,
    isO2ScavengingChemicalsCostSavingsChanged: isFieldWasChanged('o2ScavengingChemicalsCostSavings'),
    isCostOfEffluentPerUnitChanged: isFieldWasChanged('costOfEffluentPerUnit'),
    isCostOfCo2PerUnitMassChanged: isFieldWasChanged('costOfCo2PerUnitMass'),
    isFuelTypeChanged: isFieldWasChanged('inputFuelId'),
    isFuelEnergyPerUnitUnitChanged: isFieldWasChanged('fuelEnergyPerUnit'),
    isFuelCarbonContentChanged: isFieldWasChanged('fuelCarbonContent'),
    isFuelConsumptionPerYearChanged: isFieldWasChanged('fuelConsumptionPerYear'),
    isBoilerEfficiencyChanged: isFieldWasChanged('boilerEfficiency'),
    isBoilerSteamGeneratedPerYearChanged: isFieldWasChanged('boilerSteamGeneratedPerYear'),
    isBoilerSteamGeneratedPerHourChanged: isFieldWasChanged('boilerSteamGeneratedPerHour'),
    isBoilerSteamPressureChanged: isFieldWasChanged('boilerSteamPressure'),
    isBoilerSteamTemperatureChanged: isFieldWasChanged('boilerSteamTemperature'),
    isBoilerAverageTdsChanged: isFieldWasChanged('boilerAverageTds'),
    isBoilerMaxTdsChanged: isFieldWasChanged('boilerMaxTds'),
    isBoilerFeedwaterConsumptionPerYearChanged: isFieldWasChanged('boilerFeedwaterConsumptionPerYear'),
    isFeedtankTypeChanged: false,
    isPressureOfFeedtankChanged: isFieldWasChanged('pressureOfFeedtank'),
    isPressureOfSteamSupplyingDsiChanged: isFieldWasChanged('pressureOfSteamSupplyingDsi'),
    isTemperatureOfFeedtankChanged: isFieldWasChanged('temperatureOfFeedtank'),
    isTdsOfFeedwaterInFeedtankChanged: isFieldWasChanged('tdsOfFeedwaterInFeedtank'),
    isWaterTreatmentMethodChanged: isFieldWasChanged('waterTreatmentMethod'),
    isVolumeOfWaterEnteringBoilerHouseChanged: false,
    isPercentageWaterRejectionChanged: isFieldWasChanged('percentageWaterRejection'),
    isTdsAfterWaterTreatmentChanged: false,
    isTemperatureOfMakeupWaterChanged: isFieldWasChanged('temperatureOfMakeupWater'),
    isMakeupWaterAmountPerYearChanged: isFieldWasChanged('makeupWaterAmountPerYear'),
    isPercentageOfCondensateReturnChanged: isFieldWasChanged('percentageOfCondensateReturn'),
    isVolumeOfCondensateReturnChanged: isFieldWasChanged('volumeOfCondensateReturn'),
    isTemperatureOfCondensateReturnChanged: isFieldWasChanged('temperatureOfCondensateReturn'),
    isTdsOfCondensateReturnChanged: isFieldWasChanged('tdsOfCondensateReturn'),
    isTdsBlowdownMethodChanged: false,
    isBottomBlowdownChanged: false,
    isBoilerHouseEffluentChanged: false,
  };
}
