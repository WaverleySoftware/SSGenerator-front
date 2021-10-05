import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';

import { Observable } from "rxjs";

import { Product } from "./product.model";

@Injectable()
export class ProductSelectorService {

  constructor(private http: HttpClient) {

  }

  /**
   * Gets all product ranges for the given module group Id.
   * @param moduleGroupId The Module Group Id.
   */
  getAllProductRanges(moduleGroupId: number, productTypeId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`./Api/safetyvalves/GetAllProductRanges/${moduleGroupId}/${productTypeId}`);
  }

}
