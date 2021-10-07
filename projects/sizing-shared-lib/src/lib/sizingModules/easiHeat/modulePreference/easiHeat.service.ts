import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { EasiHeatPricing, EasiHeatBOMPriceOutput } from "./easiHeatPricingOptions.model";

/*************************************
    MODULE PREFERENCES VERSION!
**************************************/

@Injectable()
export class EasiHeatService {

  constructor(private http: HttpClient) {

  }

  calculateBOMPrice(csgPricing: EasiHeatPricing): Observable<EasiHeatBOMPriceOutput> {
    return this.http.post<EasiHeatBOMPriceOutput>(`./Api/CSG/CalculateBOMPrice`, csgPricing);
  }
}
