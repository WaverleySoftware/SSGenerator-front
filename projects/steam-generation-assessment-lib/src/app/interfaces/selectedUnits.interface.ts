
export interface SelectedUnitsInterface {
  energyUnitSelected: number;
  smallWeightUnitSelected: number;
  emissionUnitSelected: number;
  volumeUnitSelected: number;
  smallVolumetricFlowUnitSelected: number;
  massFlowUnitSelected: number;
  smallMassFlowUnitSelected: number;
  pressureUnitSelected: number;
  temperatureUnitSelected: number;
  tdsUnitSelected: number;
  fuelUnitSelected: number;
}

export enum SelectedUnitPreferenceEnum {
  energyUnitSelected = 'BoilerHouseEnergyUnits',
  smallWeightUnitSelected = 'WeightUnit',
  emissionUnitSelected = 'BoilerHouseEmissionUnits',
  volumeUnitSelected = 'BoilerHouseVolumeUnits',
  smallVolumetricFlowUnitSelected = 'BoilerHouseSmallVolumetricFlowUnits',
  massFlowUnitSelected = 'BoilerHouseMassFlowUnits',
  smallMassFlowUnitSelected = 'BoilerHouseSmallMassFlowUnits',
  pressureUnitSelected = 'PressureUnit',
  temperatureUnitSelected = 'TemperatureUnit',
  tdsUnitSelected = 'BoilerHouseTDSUnits',
  fuelUnitSelected = 'FUEL_TYPE'
}
