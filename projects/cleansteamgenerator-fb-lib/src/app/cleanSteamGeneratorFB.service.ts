import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { CleanSteamGeneratorFBProcessConditions } from "./cleanSteamGeneratorFBInput.model";
import { CleanSteamGeneratorFBOutput } from "./cleanSteamGeneratorFBOutput.model";
import { CleanSteamGeneratorFBInputValidation } from "./cleanSteamGeneratorFBInputValidation.model";
import { CleanSteamGeneratorFBProcessConditionsValidation } from "./cleanSteamGeneratorFBInputValidation.model";
import { CleanSteamGeneratorFBValidationMessage } from "./cleanSteamGeneratorFBInputValidation.model";
//import { CleanSteamGeneratorPricing } from "./cleanSteamGeneratorPricingOptions.model";
//import { CleanSteamGeneratorPricingOutput } from "./cleanSteamGeneratorPricingOptions.model";
import { DocGen } from "./doc-gen.model";


@Injectable()
export class CleanSteamGeneratorFBService {

  constructor(private http: HttpClient) {

  }

  //sizeCleanSteamGeneratorFB(csgFBProcessConditions: CleanSteamGeneratorFBProcessConditions): Observable<boolean> {
  sizeCleanSteamGeneratorFB(csgFBProcessConditions: CleanSteamGeneratorFBProcessConditions): Observable<Array<CleanSteamGeneratorFBOutput>> {
    return this.http.post<Array<CleanSteamGeneratorFBOutput>>(`./Api/CSGFB/SizeCleanSteamGeneratorFB`, csgFBProcessConditions);
  }

  validateCleanSteamGeneratorFBInput(csgFBInput: CleanSteamGeneratorFBInputValidation): Observable<Array<CleanSteamGeneratorFBValidationMessage>> {
    return this.http.post<Array<CleanSteamGeneratorFBValidationMessage>>(`./Api/CSGFB/ValidateCleanSteamGeneratorFBInput`, csgFBInput);
  }

  //validateCleanSteamGeneratorProcessConditions(csgInput: CleanSteamGeneratorProcessConditionsValidation): Observable<Array<CleanSteamGeneratorValidationMessage>> {
  //  return this.http.post<Array<CleanSteamGeneratorValidationMessage>>(`./Api/CSG/ValidateCleanSteamGeneratorProcessConditions`, csgInput);
  //}

  //calculateTotalPrice(csgPricing: CleanSteamGeneratorPricing): Observable<CleanSteamGeneratorPricingOutput> {
  //  return this.http.post<CleanSteamGeneratorPricingOutput>(`./Api/CSG/CalculateTotalPrice`, csgPricing);
  //}  

  getExcel(docGen: DocGen): Observable<boolean> {
    return this.http.post<boolean>(`./Api/CSG/GetExcelSpecSheet`, docGen);
  }

}
