import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { EasiheatProcessConditions } from "./easiheatInputValidation.model";
import { EasiheatOutput } from "./easiheatOutput.model";
import { EasiheatInputValidation } from "./easiheatInputValidation.model";
import { EasiheatFlowOrLoad } from "./easiheatInputValidation.model";
import { EasiheatProcessConditionsValidation } from "./easiheatInputValidation.model";
import { EasiheatValidationMessage } from "./easiheatInputValidation.model";
import { EasiheatBackPressureValidation } from "./easiheatInputValidation.model";
import { EasiheatFlowRateValidation } from "./easiheatInputValidation.model";
import { EasiheatDiffTempValidation } from "./easiheatInputValidation.model";
import { EasiheatValidationErrorMessage } from "./easiheatInputValidation.model";

import { EHPricing, EasiheatBOMPriceOutput, BOMItem } from "./easiheatPricingOptions.model";
import { EHPricingOutput } from "./easiheatPricingOptions.model";
import { EHSizingDataInput } from './easiheatSizingInput.model';
//import { DocGen } from "./doc-gen.model";


@Injectable()
export class EasiHeatService {

  constructor(private http: HttpClient) {

  }

  inletPressureCheck(inletPressureInput: EasiheatInputValidation, htgcc: boolean): Observable<Array<EasiheatValidationMessage>> {
    if (!htgcc) {
      return this.http.post<Array<EasiheatValidationMessage>>(`./Api/EasiHeatValidation/InletPressureCheck`, inletPressureInput);
    }
    else {
      return this.http.post<Array<EasiheatValidationMessage>>(`./Api/EasiHeatValidation/InletPressureHTGCheck`, inletPressureInput);
    }
  }

  backPressureCheck(backPressureInput: EasiheatBackPressureValidation): Observable<Array<EasiheatValidationMessage>> {
    return this.http.post<Array<EasiheatValidationMessage>>(`./Api/EasiHeatValidation/BackPressureCheck`, backPressureInput);
  }

  motiveInletPressureCheck(inletPressureInput: EasiheatBackPressureValidation): Observable<Array<EasiheatValidationMessage>> {
    return this.http.post<Array<EasiheatValidationMessage>>(`./Api/EasiHeatValidation/MotiveInletPressureCheck`, inletPressureInput);
  }

  differentialTempCheck(diffPressureInput: EasiheatDiffTempValidation, dhw: boolean): Observable<Array<EasiheatValidationMessage>> {
    if (dhw) {
      return this.http.post<Array<EasiheatValidationMessage>>(`./Api/EasiHeatValidation/DiffTempCheck`, diffPressureInput);
    }
    else {
      return this.http.post<Array<EasiheatValidationMessage>>(`./Api/EasiHeatValidation/DiffTempHTGCheck`, diffPressureInput);
    }
  }

  inletTemperatureCheck(inletTemperatureInput: EasiheatInputValidation): Observable<Array<EasiheatValidationMessage>> {
    return this.http.post<Array<EasiheatValidationMessage>>(`./Api/EasiHeatValidation/InletTempCheck`, inletTemperatureInput);
  }

  PRVInletPressureCheck(packageInletPressure: EasiheatInputValidation): Observable<Array<EasiheatValidationMessage>> {
    return this.http.post<Array<EasiheatValidationMessage>>(`./Api/EasiHeatValidation/PRVInletPressureCheck`, packageInletPressure);
  }

  outletTemperatureCheck(outletTemperatureInput: EasiheatInputValidation): Observable<Array<EasiheatValidationMessage>> {
    return this.http.post<Array<EasiheatValidationMessage>>(`./Api/EasiHeatValidation/OutletTempCheck`, outletTemperatureInput);
  }

  waterFlowRateCheck(outletTemperatureInput: EasiheatFlowRateValidation): Observable<Array<EasiheatValidationMessage>> {
    return this.http.post<Array<EasiheatValidationMessage>>(`./Api/EasiHeatValidation/InputFlowRateCheck`, outletTemperatureInput);
  }

  loadInputCheck(inletTemperatureInput: EasiheatInputValidation): Observable<Array<EasiheatValidationMessage>> {
    return this.http.post<Array<EasiheatValidationMessage>>(`./Api/EasiHeatValidation/InputLoadCheck`, inletTemperatureInput);
  }

  sizeEasiheat(ehSizingData: EHSizingDataInput): Observable<EasiheatOutput> {
    return this.http.post<EasiheatOutput>(`./Api/EasiHeat/Calculate`, ehSizingData);
  }

  validateEasiheatInput(ehInput: EasiheatInputValidation): Observable<Array<EasiheatValidationMessage>> {
    return this.http.post<Array<EasiheatValidationMessage>>(`./Api/CSG/ValidateCleanSteamGeneratorInput`, ehInput);
  }

  validateEasiheatProcessConditions(ehInput: EasiheatProcessConditionsValidation): Observable<Array<EasiheatValidationMessage>> {
    return this.http.post<Array<EasiheatValidationMessage>>(`./Api/EasiHeatValidation/ValidateEasiHeatProcessConditions`, ehInput);
  }

  calculateTotalPrice(ehPricing: EHPricing): Observable<EHPricingOutput> {
    return this.http.post<EHPricingOutput>(`./Api/EasiHeat/Pricing`, ehPricing);
  }

  calculateBOMPrice(ehPricing: EHPricing): Observable<EasiheatBOMPriceOutput> {
    return this.http.post<EasiheatBOMPriceOutput>(`./Api/CSG/CalculateBOMPrice`, ehPricing);
  }

  calculateVolumetricFlow(ehFlowOrLoad: EasiheatFlowOrLoad): Observable<number> {
    return this.http.post<number>(`./Api/EasiHeatValidation/CalculateVolumetricFlow`, ehFlowOrLoad);
  }

  calculateLoad(ehFlowOrLoad: EasiheatFlowOrLoad): Observable<number> {
    return this.http.post<number>(`./Api/EasiHeatValidation/CalculateLoad`, ehFlowOrLoad);
  }

  // getExcel(docGen: DocGen): Observable<boolean> {
  //   return this.http.post<boolean>(`./Api/CSG/GetExcelSpecSheet`, docGen);
  // }

}
