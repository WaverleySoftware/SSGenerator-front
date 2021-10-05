import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { NominalSizeModel } from './models/nominal-size.model';
import { DesignationModel } from './models/designation.model';
import { PipeSizeModel } from './models/pipe-size.model';
import { ProcessConditionsModel } from './models/process-conditions.model';
import { CalculateVelocityRequestPayloadModel } from './models/calculate-velocity-request-payload.model';
import { CalculateVelocityResponseModel } from './models/calculate-velocity-response.model';
import { CalculateSizingRequestPayloadModel } from './models/calculate-sizing-request-payload.model';
import { CalculateSizingResponseBodyModel } from './models/calculate-sizing-response-body.model';

@Injectable()
export class FlowMeterService {
  constructor(
      private http: HttpClient
  ) { }

  /**
   * Handle flow meter form changes
   * This method is supposed to trigger server request to calculate new values
   * @param value
   */
  handleFormChange(value: any) {
    console.log('MOCK', 'processing form update...', value);
  }

  /**
   * Validate and Calculate process condition inputs
   * Returns 200 if validation is OK
   * Returns 400 and an array of error messages, if validation is FAIL
   * @param processConditions - process conditions inputs with preferences
   */
  validateProcessCondition(processConditions: ProcessConditionsModel) {
    return this.http.post<any>(`./Api/FlowMeter/ValidateProcessCondition`, processConditions);
  }

  /**
   * I am not sure, that we will use this method in flow meter.
   * But, if it is required to validate every single control each time it is changed,
   * Then we will add single input validator.
   * @param input - flow meter input with preferences
   */
  validateFlowMeterInput(input: any): Observable<any> {
    return this.http.post<any>(`./Api/FlowMeter/ValidateProcessConditionInput`, input);
  }

  /**
   * TODO: I don't know what is the purpose of the API at the moment
   * Seems like it does some additional calculations for the flows
   * @param data
   */
  consolidateFlowRates(data: any) {
    return this.http.post<any>(`./Api/FlowMeter/ConsolidateFlowRates`, data);
  }

  getNominalSizes(standard: string, designation: string): Observable<NominalSizeModel[]> {
    return this.http.get<NominalSizeModel[]>(`./Api/FlowMeter/GetNominalSize`, {
      params: designation ? {
        standard,
        designation
      } : {standard}
    });
  }

  getDesignations(standard: string): Observable<DesignationModel[]> {
    return this.http.get<DesignationModel[]>(`./Api/FlowMeter/GetDesignation`, {params: {standard}});
  }

  getPipeSizes(standard: string, designation: string, dn: string, lengthUnitId: string): Observable<PipeSizeModel> {
    return this.http.get<PipeSizeModel>(
      `./Api/FlowMeter/GetPipeSizes`,
      {params: {standard, designation, dn, lengthUnitId}}
    );
  }

  getInternalDiameter(outsideDiameter: string, wallThickness: string): Observable<number | HttpErrorResponse> {
    return this.http.get<number | HttpErrorResponse>(
      `./Api/FlowMeter/GetInternalDiameter`,
      {params: {outsideDiameter, wallThickness}}
    );
  }

  calculateVelocity(body: CalculateVelocityRequestPayloadModel): Observable<CalculateVelocityResponseModel> {
    return this.http.post<CalculateVelocityResponseModel>(`./Api/FlowMeter/calculateVelocity`, body);
  }

  calculateResults(flowMeterModel: CalculateSizingRequestPayloadModel): Observable<CalculateSizingResponseBodyModel> {
    return this.http.post<CalculateSizingResponseBodyModel>(`./Api/FlowMeter/Calculate`, flowMeterModel);
  }

  validateUtm10Length(data): Observable<any> {
    return this.http.post(`./Api/FlowMeter/ValidateLengthUtm`, data);
  }

  getElmExtraDetails(productNomenclature: string): Observable<any> {
    return this.http.get(`./Api/FlowMeter/GetElmFlowMeterExtraDetails`, { params: { productNomenclature }});
  }
}
