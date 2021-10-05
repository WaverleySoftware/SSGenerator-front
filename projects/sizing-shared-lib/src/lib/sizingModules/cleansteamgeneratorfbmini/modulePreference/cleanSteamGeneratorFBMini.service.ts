import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { CleanSteamGeneratorFBMiniPricing, CleanSteamGeneratorFBMiniBOMPriceOutput } from "./cleanSteamGeneratorFBMiniPricingOptions.model";

/*************************************
    MODULE PREFERENCES VERSION!
**************************************/

@Injectable()
export class CleanSteamGeneratorFBMiniService {

  constructor(private http: HttpClient) {

  }

  calculateBOMPrice(csgPricing: CleanSteamGeneratorFBMiniPricing): Observable<CleanSteamGeneratorFBMiniBOMPriceOutput> {
    return this.http.post<CleanSteamGeneratorFBMiniBOMPriceOutput>(`./Api/CSGFBMini/CalculateBOMPrice`, csgPricing);
  }

}
