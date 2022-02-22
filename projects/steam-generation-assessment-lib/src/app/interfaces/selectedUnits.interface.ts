
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
  BoilerHouseEnergyUnits = 'energyUnitSelected',
  WeightUnit = 'smallWeightUnitSelected',
  BoilerHouseEmissionUnits = 'emissionUnitSelected',
  BoilerHouseVolumeUnits = 'volumeUnitSelected',
  BoilerHouseSmallVolumetricFlowUnits = 'smallVolumetricFlowUnitSelected',
  BoilerHouseMassFlowUnits = 'massFlowUnitSelected',
  BoilerHouseSmallMassFlowUnits = 'smallMassFlowUnitSelected',
  PressureUnit = 'pressureUnitSelected',
  TemperatureUnit = 'temperatureUnitSelected',
  BoilerHouseTDSUnits = 'tdsUnitSelected',
  // FUEL_TYPE = 'fuelUnitSelected'
  BoilerHouseLiquidFuelUnits = 'fuelUnitSelected',
  BoilerHouseElectricalFuelUnits = 'fuelUnitSelected',
  BoilerHouseGasFuelUnits = 'fuelUnitSelected',
  BoilerHouseSolidFuelUnits = 'fuelUnitSelected',
}
