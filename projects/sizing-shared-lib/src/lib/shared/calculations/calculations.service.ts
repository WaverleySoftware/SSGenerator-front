import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalculationModel } from "./calculations.model";

@Injectable({
  providedIn: 'root'
})
export class CalculationsService {

  constructor(private httpClient: HttpClient) {

  }
}
