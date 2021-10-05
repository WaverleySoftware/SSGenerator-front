import { CalculateVelocityRequestPayloadModel } from './calculate-velocity-request-payload.model';

export interface CalculateSizingRequestPayloadModel extends CalculateVelocityRequestPayloadModel {
  productSelectionList: string[];
  isPipeSelectionChecked: boolean;
}

