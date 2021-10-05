import { Preference } from "sizing-shared-lib";

/**
 * The Safety Valve Process Conditions model class.
 */
export class SafetyValveProcessConditions {

  /**
  * Gets or sets the Media.
  */
  media: string;

  /**
   * Gets or sets the Pressure.
   */
  pressure: number;

  /**
 * Gets or sets the relievingPressure.
 */
  relievingPressure: number;

  /**
 * Gets or sets the massDensity.
 */
  massDensity: number;

  /**
   * Gets or sets the overPressure.
   */
  overPressure: number;

  /**
  * Gets or sets the Pressure Unit Id.
  */
  pressureUnitId: number;

  /**
   * Gets or sets the Temperature.
   */
  temperature: number;

  /**
   * Gets or sets the relievingTemperature.
   */
  relievingTemperature: number;

  /**
   * Gets or sets the Temperature Unit Id.
   */
  temperatureUnitId: number;

  /**
   * Gets or sets the Normal Temperature.
   */
  normalTemperature: number;

  /**
   * Gets or sets the Normal Temperature Unit Id.
   */
  normalTemperatureUnitId: number;

  /**
  * Gets or sets the Mass Flow.
  */
  massFlow: number;


  /**
  * Gets or sets the Mass Flow Unit Id.
  */
  massFlowUnitId: number;

  /**
  * Gets or sets the Mass Flow Is Master (UI entered last, calculate the opposite).
  */
  massflowIsMaster: boolean = true;

  /**
 * Gets or sets the Volumetric Flow.
 */
  volumetricFlow: number;

  /**
  * Gets or sets the Volumetric Flow Unit Id.
  */
  volumetricFlowUnitId: number;

  /**
  * Gets or sets the Standard.
  */
  standard: string;

  /**
  * Gets or sets the Noise Distance.
  */
  noise: number;

  /**
  * Gets or sets the Noise Unit Id.
  */
  noiseUnitId: number;

  /**
 * Gets or sets the media state.
 */
  mediaState: string;

  /**
 * Gets or sets the Noise Unit Id.
 */
  backPressureChecked: boolean;
  
  /**
 * Gets or sets the selected valves.
 */
  selectedValves: Array<string>;

  /**
 * Gets or sets the Heat Output.
 */
  heatOutput: number;

  /**
  * Gets or sets the Load Unit Id.
  */
  loadUnitId: number;

  isMassFlow: boolean;

  areaUnitId: number;

  forceUnitId: number;

  nozzleList: Array<string>;

  userPrefs: Array<Preference>;
}

export class SafetyValveSizingResult {
  productRange: string;
  inletSize: number;
  inletDisplay: string;
  outletSize: number;
  bodyMaterial: string;
  overPressure: number;
  relievingPressure: number;
  displayRelievingPressure: string;
  relievingTemperature: number;
  displayRelievingTemperature: string;
  calculatedArea: number;
  displayCalculatedArea: string;
  flowArea: number;
  displayFlowArea: string;
  ratedCapacity: number;
  ratedCapacityInVolumetricUnit: number;
  displayRatedCapacity: string;
  displayRatedCapacityInVolumetricUnit: string;
  percentCapacity: number;
  displayPercentCapacity: string;
  heatOutputUnit: number;
  orifice: string;
  nozzle: string;
  nozzleList: Array<string>;
  noiseAtDistance: number;
  displayNoiseAtDistance: string;
  reactionForce: number;
  displayReactionForce: string;
  outletSizeList: Array<string>;
  bonnetList: Array<string>;
  leverList: Array<string>;
  inletConnectionList: Array<string>;
  inletConnection: string;
  outletConnectionList: Array<string>;
  outletConnection: string;
  springList: Array<string>;
  seatList: Array<string>;
  outletSizeDisplayList: Array<string>;
  outletDisplay: string;
  backPressure: number;
  backPressurePercentage: number;
  backpressureOk: boolean;
  temperature: number;

  dynamicViscosity: number;
  compressibility: number;
  isentropicCoefficient: number;
  specificVolume: number;
  molecularWeight: number;
  capMaterial: string;
  capGrade: string;
  nozzleMaterial: string;
  stemMaterial: string;
  stemGrade: string;
  guideMaterial: string;
  guideGrade: string;
  bodyGasket: string;
  glandPacking: string;
  bellows: string;
}

export class Options {
  inletSize: number;
  selectedInletConnection: string;
  selectedOutletConnection: string;
  inletConnectionList: Array<string>;
  outletConnectionList: Array<string>;
  selectedBonnet: string;
  bonnetList: Array<string>;
  selectedSeat: string;
  seatList: Array<string>;
  sealMaterial: string;
  selectedOutletSize: number;
  selectedLever: string;
  selectedSpring: string;
  selectedFinish: string = "None";
  selectedNozzle: string;
  NozzleList: Array<string>;
  selectedProductRange: string;
  standard: string;
  valveOrifice: string;
  inletPressure: number;
  pressureUnit: number;
  valveInletSize: number;
  setOutletConnection: boolean;
  leverList: Array<string>;
  setInletConnection: boolean;
  springList: Array<string>;
  outletSizeList: Array<string>;
  outletSizeListDisplay: Array<string>;
  selectedBodyMaterial: string;
  translatedPressureUnit: string;
  inletSizeDisplay: string;
  selectedOutletSizeDisplay: string;
  mediaState: string;
  media: string;
  relievingTemperature: number;
  dimA: number;
  dimB: number;
  dimC: number;
  valveWeight: number;
  weightUnit: number;
  lengthUnit: number;


  // Options to drive UI state
  outletConnectionEnabled: boolean;
  inletConnectionEnabled: boolean;
  leverDisabled: boolean;
  finishDisplayed: boolean;
  temperature: number;
  temperatureUnitId: number;
}

export class OptionsResults {

  productCode: string;
  outletConnectionEnabled: boolean;
  outletConnection: string;
  productNumber: string;
  dimA: number;
  dimB: number;
  dimC: number;
  lengthUnit: number;
  weightUnit: number;
  inletConnectionEnabled: boolean;
  inletConnection: string;
  selectedLever: string;
  selectedBonnet: string;
  leverDisabled: boolean;
  bonnetDisabled: boolean;
  finishDisplayed: boolean;
  springDisabled: boolean;
  temperature: number;
  selectedSeat: string;
  seatDisabled: boolean;
  selectedNozzle: string;
  selectedSpring: string;
  leverList: Array<string>;
  weight: number;
}

export class CalculationDetails {
  listOfDetails: Array<Details>;
}

export class Details {
  name: string;
  calculation: string;
}





