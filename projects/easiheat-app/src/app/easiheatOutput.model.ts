/**
 * The CSG output data model.
 */
import { Message } from "sizing-shared-lib";

export class EasiheatOutput {

  nomenclature: string;
  subCooling: number;
  numberOfPlates: number;
  primaryPressureDrop: number;
  secondaryPressureDrop: number;
  displaySecondaryPressureDrop: string;
  cvSize: string;
  cvSizeAnsi: string;
  oversurfacing: number;
  primaryVelocity: number;
  secondaryVelocity: number;
  heOutletPressure: number;
  trimType: string;
  height: string;
  width: string;
  length: string;
  weight: string;
  condensateRemoval: string;
  grossMargin: number;
  hePressure: number;
  DrawingFile: string;
  DrawingOnlineLink: string;
  DrawingOfflineLink: string;
  TiFile: string;
  TiOfflineLink: string;
  TiOnlineLink: string;
  cvTrimType: string;
  maxCondensateTemp: number;
  unitPrice: number;
  o1Available: false;
  o2Available: false;
  o3Available: false;
  hePrice: number;
  heWeight: number;
  heatExchangerPlateType: string;
  channelTypeSide1: string;
  channelTypeSide2: string;
  connectionStandard: string;
  numberOfChannelsSide1: number;
  numberOfChannelsSide2: number;
  energyMonitoringAvailable: false;
  bomUpdateInProgress: false;
  unitModel: string;
  dpPresent: false;
  /**
   * Gets or sets the modelSizingMessages.
   */
  modelSizingMessages: Message[];
}
