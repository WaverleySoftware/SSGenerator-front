import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { CleanSteamGeneratorPricing, CleanSteamGeneratorBOMPriceOutput } from "./cleanSteamGeneratorPricingOptions.model";

/*************************************
    MODULE PREFERENCES VERSION!
**************************************/

@Injectable()
export class CleanSteamGeneratorService {

  constructor(private http: HttpClient) {

  }

  calculateBOMPrice(csgPricing: CleanSteamGeneratorPricing): Observable<CleanSteamGeneratorBOMPriceOutput> {
    return this.http.post<CleanSteamGeneratorBOMPriceOutput>(`./Api/CSG/CalculateBOMPrice`, csgPricing);
  }
}
