import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { SafetyValveProcessConditions, SafetyValveSizingResult, Options, OptionsResults } from "./safetyValves.model";
import { SafetyValvesValidationMessage, SafetyValvesInputValidation } from './safetyValvesInputValidation.model';
import { Preference } from "sizing-shared-lib";

@Injectable(
  //{
  //providedIn: 'root'
  //}
)
export class SafetyValvesService {
  safetyValves: SafetyValveSizingResult[] = null;
  private safetyValvesChange: Subject<SafetyValveSizingResult[]> = new Subject<SafetyValveSizingResult[]>();

  constructor(private http: HttpClient) {
    // When the class in constructed, initialise the subject so that whenever it is called, its subscriber resolves the result to the current Process Conditions object.
    this.safetyValvesChange.subscribe(newSafetyValves => {
      this.safetyValves = newSafetyValves;
    });
  }
  
  /**
 * Manages the specified transaltion changes.
 * @param translation The array of changed Translations.
 */
  calculate(processConditions: SafetyValveProcessConditions): Observable<Array<SafetyValveSizingResult>> {
    return this.http.post<Array<SafetyValveSizingResult>>(`./Api/SafetyValves/Calculate`, processConditions).map(response => {
      this.safetyValvesChange.next(response);

      return response;
    });
  }

  setOptions(options: Options): Observable<OptionsResults> {
    return this.http.post<OptionsResults>(`./Api/SafetyValves/SetOptions`, options);
  }

  //setOptions(options: Options): Observable<OptionsResults> {
  //  return this.http.post<OptionsResults>(`./Api/SafetyValves/SetOptions`, options);
  //}

  validateProcessCondition(processConditions: SafetyValveProcessConditions): Observable<SafetyValveProcessConditions> {
    return this.http.post<SafetyValveProcessConditions>(`./Api/SafetyValves/ValidateProcessCondition`, processConditions);
  }

  consolidateFlowRates(processConditions: SafetyValveProcessConditions): Observable<SafetyValveProcessConditions> {
    return this.http.post<SafetyValveProcessConditions>(`./Api/SafetyValves/ConsolidateFlowRates`, processConditions);
  }

  validateSafetyValvesInput(svInput: SafetyValvesInputValidation): Observable<Array<SafetyValvesValidationMessage>> {
    return this.http.post<Array<SafetyValvesValidationMessage>>(`./Api/SafetyValves/ValidateSafetyValvesInput`, svInput);
  }

}
