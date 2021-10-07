import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import { SafetyValveProduct } from "./safetyValveProduct.model";
import { SaveSafetyValvesProductSelection } from "./productSelectionAdminModel";
import { ExcludedSafetyValves } from "./excludedSafetyValves.model"

@Injectable({
  providedIn: 'root'
}
)
export class ProductSelectionAdminService {

  constructor(private http: HttpClient) {

  }

  getAllProductSelectionRanges(moduleGroupId: number): Observable<SafetyValveProduct[]> {
    return this.http.get<SafetyValveProduct[]>(`./Api/SafetyValves/GetAllProductSelectionRanges/${moduleGroupId}`);
  }

  getProductExclusionRanges(moduleGroupId: number): Observable<ExcludedSafetyValves> {
    return this.http.get<ExcludedSafetyValves>(`./Api/SafetyValves/GetProductExclusionRanges/${moduleGroupId}`);
  }

  selectedSafetyValves(saveSafetyValvesProductSelection: SaveSafetyValvesProductSelection): Observable<SaveSafetyValvesProductSelection> {
    return this.http.post<SaveSafetyValvesProductSelection>('./Api/SafetyValves/SaveProductSelection', saveSafetyValvesProductSelection);
  }

}
