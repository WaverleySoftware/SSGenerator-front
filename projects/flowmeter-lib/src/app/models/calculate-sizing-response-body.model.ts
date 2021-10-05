export interface CalculateSizingResponseBodyModel {
  flowMeterSizing: FlowMeterSizingResponse;
}

export interface FlowMeterSizing {
  productCode: string;
  type: null; // TODO: update the type to more specific
  size: number;
  translatedSize: string;
  pipeSize: string;
  bushKitList: null; // TODO: update the type to more specific
  material: string;
  translatedMaterial: string;
  connection: string;
  translatedConnection: string;
  orientation: string;
  transOrientation: string;
  wireless: string;
  transWireless: string;
  manifold: string;
  transManifold: string;
  transmitterCertification: string;
  tIs: string;
  maximumFlow: number;
  minimumFlow: number;
  maximumFlowVol: number;
  minimumFlowVol: number;
  turnDown: number;
  productTurndown: number;
  pressureLoss: number;
  percentageCapacity: number;
  meterVelocity: number;
  velocity: number;
  minimumVelocity: number;
  maximumVelocity: number;
  wallThickness: number;
  reynoldsNumber: number;
  rotorInternalDiameter: number;
  selectMeterIsDisabled: boolean;
  waterEquivalencyRate: number;
  waterEquivalencyRateUnit: number;
  density: number;
  densityUnit: number;
  pipeStandard: string;
  designation: string;
  nominalSize: number;
  viscosity: number;
  viscosityUnit: number;
  pipeInternalDiameter: number;
}

export interface SizingMessage {
  code: string;
  severity: string;
  value: number;
}

export interface FlowMeterSizingResponse {
  meters: FlowMeterSizing[];
  messages: SizingMessage[];
}
