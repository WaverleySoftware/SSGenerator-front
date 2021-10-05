/**
 * Structure to be sent for Process Conditions validation
 */
export interface ProcessConditionsModel {
  // Media and its state
  Media?: string;
  MediaState?: string;

  // Mass flow or Volumetric flow
  FlowType?: string;

  // Inlet pressure
  InletPressure?: number;
  InletPressureUnit?: number;
  InletPressureDecimalPlaces?: number;

  // Inlet temperature
  InletTemperature?: number;
  InletTemperatureUnit?: number;
  InletTemperatureDecimalPlaces?: number;

  // Mass flow
  MassFlow?: number;
  MassFlowUnit?: number;
  MassFlowDecimalPlaces?: number;

  // Volumetric flow
  VolumetricFlow?: number;
  VolumetricFlowUnit?: number;
  VolumetricFlowDecimalPlaces?: number;

  // Normal temperature
  NormalTemperature?: number;
  NormalTemperatureUnit?: number;
  NormalTemperatureDecimalPlaces?: number;
}
