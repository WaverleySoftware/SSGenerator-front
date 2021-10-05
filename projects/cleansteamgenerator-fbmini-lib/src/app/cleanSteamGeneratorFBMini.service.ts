import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { CleanSteamGeneratorFBMiniProcessConditions } from "./cleanSteamGeneratorFBMiniInput.model";
import { CleanSteamGeneratorFBMiniOutput } from "./cleanSteamGeneratorFBMiniOutput.model";
import { CleanSteamGeneratorFBMiniInputValidation } from "./cleanSteamGeneratorFBMiniInputValidation.model";
import { CleanSteamGeneratorFBMiniProcessConditionsValidation } from "./cleanSteamGeneratorFBMiniInputValidation.model";
import { CleanSteamGeneratorFBMiniValidationMessage } from "./cleanSteamGeneratorFBMiniInputValidation.model";
import { CleanSteamGeneratorFBMiniPricing, CleanSteamGeneratorFBMiniBOMPriceOutput } from "./cleanSteamGeneratorFBMiniPricingOptions.model";
import { CleanSteamGeneratorFBMiniPricingOutput } from "./cleanSteamGeneratorFBMiniPricingOptions.model";
import { DocGen } from "./doc-gen.model";


@Injectable()
export class CleanSteamGeneratorFBMiniService {

  constructor(private http: HttpClient) {

  }

  sizeCleanSteamGeneratorFBMini(csgProcessConditions: CleanSteamGeneratorFBMiniProcessConditions): Observable<Array<CleanSteamGeneratorFBMiniOutput>> {
    return this.http.post<Array<CleanSteamGeneratorFBMiniOutput>>(`./Api/CSGFBMini/SizeCleanSteamGenerator`, csgProcessConditions);
  }

  validateCleanSteamGeneratorFBMiniInput(csgInput: CleanSteamGeneratorFBMiniInputValidation): Observable<Array<CleanSteamGeneratorFBMiniValidationMessage>> {
    return this.http.post<Array<CleanSteamGeneratorFBMiniValidationMessage>>(`./Api/CSGFBMini/ValidateCleanSteamGeneratorFBInput`, csgInput);
  }

  validateCleanSteamGeneratorFBMiniProcessConditions(csgInput: CleanSteamGeneratorFBMiniProcessConditionsValidation): Observable<Array<CleanSteamGeneratorFBMiniValidationMessage>> {
    return this.http.post<Array<CleanSteamGeneratorFBMiniValidationMessage>>(`./Api/CSGFBMini/ValidateCleanSteamGeneratorProcessConditions`, csgInput);
  }

  calculateTotalPrice(csgPricing: CleanSteamGeneratorFBMiniPricing): Observable<CleanSteamGeneratorFBMiniPricingOutput> {
    return this.http.post<CleanSteamGeneratorFBMiniPricingOutput>(`./Api/CSGFBMini/CalculateTotalPrice`, csgPricing);
  }

  calculateBOMPrice(csgPricing: CleanSteamGeneratorFBMiniPricing): Observable<CleanSteamGeneratorFBMiniBOMPriceOutput> {
    return this.http.post<CleanSteamGeneratorFBMiniBOMPriceOutput>(`./Api/CSGFBMini/CalculateBOMPrice`, csgPricing);
  }

  getExcel(docGen: DocGen): Observable<boolean> {
    return this.http.post<boolean>(`./Api/CSGFBMini/GetExcelSpecSheet`, docGen);
  }

}
