import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BenchmarkInputsInterface } from '../interfaces/benchmarkInputs.interface';
import { InputParametersFormInterface } from '../interfaces/forms.interface';
import {
  SgaCalcBoilerEfficiencyReqInterface,
  SgaCalcBoilerEfficiencyResInterface,
  SgaCalcCalorificReqInterface,
  SgaCalcCalorificResInterface,
  SgaCalcCarbonEmissionReqInterface,
  SgaCalcCarbonEmissionResInterface,
  SgaCalcFeedtankTemperatureAndPressureReqInterface,
  SgaCalcFeedtankTemperatureAndPressureResInterface,
  SgaCalcProposalEfficiencyReqInterface, SgaCalcProposalEfficiencyResInterface,
  SgaCalcSaturatedAndFreezingTemperatureReqInterface,
  SgaCalcSaturatedAndFreezingTemperatureResInterface,
  SgaCalcWaterTemperatureExchangerReqInterface,
  SgaCalcWaterTemperatureExchangerResInterface,
  SgaCalcWaterTreatmentReqInterface,
  SgaCalcWaterTreatmentResInterface, SgaValidationErrorResInterface
} from '../interfaces/api-requests.interface';
import { CalcBenchmarkResInterface } from '../interfaces/calc-benchmark-res.interface';
import { tap } from 'rxjs/operators/tap';
import { catchError } from 'rxjs/operators';
import { ProposedSetupInterface } from '../interfaces/proposed-setup.interface';
import { SteamGeneratorSelectedUnitsInterface } from "../interfaces/steam-generation-form.interface";

@Injectable()
export class SgaApiService {
  requestLoading$ = new BehaviorSubject<boolean>(false);
  private loadingTypes = {};

  constructor(private http: HttpClient) { }

  changeLoading(status: boolean, type: string, disableTimeout?: boolean) {
    if (status) {
      this.loadingTypes[type] = true;
    } else {
      delete this.loadingTypes[type];
    }

    if (status && !this.requestLoading$.value) {
      if (disableTimeout) {
        this.requestLoading$.next(status)
      } else {
        setTimeout(() => this.requestLoading$.next(status), 0);
      }
    } else if (!status && this.requestLoading$.value && JSON.stringify(this.loadingTypes) === '{}') {
      if (disableTimeout) {
        this.requestLoading$.next(!!status)
      } else {
        setTimeout(() => this.requestLoading$.next(!!status), 0);
      }
    }
  }

  private post<T>(link, data, name?: string, isSyncLoading?: boolean): Observable<T> {
    this.changeLoading(true, link, isSyncLoading);
    return this.http.post<T>(`./Api/SteamGenerator/${link}${name ? '/' + name : ''}`, data)
      .pipe(
        tap(()=>{}, ()=>{}, () => this.changeLoading(false, link, isSyncLoading)),
        catchError((err) => { this.changeLoading(false, link, isSyncLoading); return of(err); })
      );
  }

  benchmarkValidate(name: keyof BenchmarkInputsInterface, data: InputParametersFormInterface): Observable<any> {
    return this.post('validate-benchmark-input', data, name);
  }

  proposalValidate(
    name: string,
    data: { proposalSetup: ProposedSetupInterface, selectedUnits: SteamGeneratorSelectedUnitsInterface }
  ): Observable<any> {
    return this.post('validate-proposal-input', data, name);
  }

  calculateCalorific(calorificData: SgaCalcCalorificReqInterface): Observable<SgaCalcCalorificResInterface> {
    return this.post<SgaCalcCalorificResInterface>('calculate-carbon-and-calorific-value', calorificData);
  }

  calculateCarbonEmission(data: SgaCalcCarbonEmissionReqInterface): Observable<SgaCalcCarbonEmissionResInterface> {
    return this.post<SgaCalcCarbonEmissionResInterface>('calculate-carbon-emission-value', data);
  }

  calculateWaterTreatment(data: SgaCalcWaterTreatmentReqInterface): Observable<SgaCalcWaterTreatmentResInterface> {
    return this.post<SgaCalcWaterTreatmentResInterface>('calculate-water-treatment-method-parameters', data);
  }

  calculateBoilerEfficiency(data: SgaCalcBoilerEfficiencyReqInterface): Observable<SgaCalcBoilerEfficiencyResInterface> {
    return this.post<SgaCalcBoilerEfficiencyResInterface>('calculate-boiler-efficiency', data, null, true);
  }

  calculateProposedBoilerEfficiency(data: SgaCalcProposalEfficiencyReqInterface): Observable<SgaCalcProposalEfficiencyResInterface> {
    return this.post<SgaCalcProposalEfficiencyResInterface>('calculate-proposal-boiler-efficiency', data);
  }

  calculateTemperatureAndPressure(
    data: SgaCalcFeedtankTemperatureAndPressureReqInterface
  ): Observable<SgaCalcFeedtankTemperatureAndPressureResInterface> {
    return this.post<SgaCalcFeedtankTemperatureAndPressureResInterface>('calculate-feedtank-temperature-and-pressure', data);
  }

  calculateSaturatedAndTemperature(
    data: SgaCalcSaturatedAndFreezingTemperatureReqInterface
  ): Observable<SgaCalcSaturatedAndFreezingTemperatureResInterface> {
    return this.post<SgaCalcSaturatedAndFreezingTemperatureResInterface>('calculate-saturated-and-freezing-temperature', data);
  }

  calculateWaterTemperatureLeaving(
    data: SgaCalcWaterTemperatureExchangerReqInterface
  ): Observable<SgaCalcWaterTemperatureExchangerResInterface> {
    return this.post<SgaCalcWaterTemperatureExchangerResInterface>('calculate-water-temperature-leaving-heat-exchanger', data, null, true);
  }

  calculateBenchmark(data: InputParametersFormInterface): Observable<CalcBenchmarkResInterface | SgaValidationErrorResInterface> {
    return this.post<CalcBenchmarkResInterface | SgaValidationErrorResInterface>(`calculate-benchmark`, data);
  }

  calculateProposal(data): Observable<{ messages: any[], proposal: any[] }> {
    return this.post<any>('calculate-proposal', data);
  }

  getSgaSpecSheet(docGen: any): Observable<any> {
    this.changeLoading(true, 'getSgaSpecSheet', true);
    return this.http.post<any>('Api/reports/steamGenerationAssessment/DocGen/CacheModel', docGen, {
      headers: {"Content-Type": "application/json", Accept: "application/octet-stream"},
      responseType: 'json' as 'json'
    }).pipe(tap(()=>{},()=>{},()=>this.changeLoading(false, 'getSgaSpecSheet', true)));
  }
}
