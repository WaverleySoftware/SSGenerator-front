import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { CleanSteamGeneratorProcessConditions } from "./cleanSteamGeneratorInput.model";
import { CleanSteamGeneratorOutput } from "./cleanSteamGeneratorOutput.model";
import { CleanSteamGeneratorInputValidation } from "./cleanSteamGeneratorInputValidation.model";
import { CleanSteamGeneratorProcessConditionsValidation } from "./cleanSteamGeneratorInputValidation.model";
import { CleanSteamGeneratorValidationMessage } from "./cleanSteamGeneratorInputValidation.model";
import { CleanSteamGeneratorPricing, CleanSteamGeneratorBOMPriceOutput } from "./cleanSteamGeneratorPricingOptions.model";
import { CleanSteamGeneratorPricingOutput } from "./cleanSteamGeneratorPricingOptions.model";
import { DocGen } from "./doc-gen.model";


@Injectable()
export class CleanSteamGeneratorService {

  constructor(private http: HttpClient) {

  }

  sizeCleanSteamGenerator(csgProcessConditions: CleanSteamGeneratorProcessConditions): Observable<Array<CleanSteamGeneratorOutput>> {
    return this.http.post<Array<CleanSteamGeneratorOutput>>(`./Api/CSG/SizeCleanSteamGenerator`, csgProcessConditions);
  }

  validateCleanSteamGeneratorInput(csgInput: CleanSteamGeneratorInputValidation): Observable<Array<CleanSteamGeneratorValidationMessage>> {
    return this.http.post<Array<CleanSteamGeneratorValidationMessage>>(`./Api/CSG/ValidateCleanSteamGeneratorInput`, csgInput);
  }

  validateCleanSteamGeneratorProcessConditions(csgInput: CleanSteamGeneratorProcessConditionsValidation): Observable<Array<CleanSteamGeneratorValidationMessage>> {
    return this.http.post<Array<CleanSteamGeneratorValidationMessage>>(`./Api/CSG/ValidateCleanSteamGeneratorProcessConditions`, csgInput);
  }

  calculateTotalPrice(csgPricing: CleanSteamGeneratorPricing): Observable<CleanSteamGeneratorPricingOutput> {
    return this.http.post<CleanSteamGeneratorPricingOutput>(`./Api/CSG/CalculateTotalPrice`, csgPricing);
  }
  
  calculateBOMPrice(csgPricing: CleanSteamGeneratorPricing): Observable<CleanSteamGeneratorBOMPriceOutput> {
    return this.http.post<CleanSteamGeneratorBOMPriceOutput>(`./Api/CSG/CalculateBOMPrice`, csgPricing);
  }

  getExcel(docGen: DocGen): Observable<boolean> {
    return this.http.post<boolean>(`./Api/CSG/GetExcelSpecSheet`, docGen);
  }

}
