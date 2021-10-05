export interface CalculateVelocityRequestPayloadModel {
  mediaType: string;
  mediaState: string;
  inletPressure: number;
  inletPressureUnit: number;
  inletTemperature: number;
  inletTemperatureUnit: number;
  massFlow: number;
  massFlowUnit: number;
  volumetricFlow: number;
  volumetricFlowUnit: number;
  normalTemperature: number;
  normalTemperatureUnit: number;
  lengthUnitId: number;
  velocityUnitId: number;
  pipeId?: number | null;
  pipeInternalDiameter?: number;
}
