import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

@Injectable()
export class SgaApiService {

  constructor(private http: HttpClient) { }

  benchmarkValidate(name: keyof BenchmarkInputsInterface, data: InputParametersFormInterface): Observable<any> {
    return this.http.post(`./Api/SteamGenerator/validate-benchmark-input/${name}`, data);
  }

  proposalValidate(name: string, data: any): Observable<any> {
    return this.http.post(`./Api/SteamGenerator/validate-proposal-input/${name}`, data);
  }

  calculateCalorific(calorificData: SgaCalcCalorificReqInterface): Observable<SgaCalcCalorificResInterface> {
    return this.http.post<SgaCalcCalorificResInterface>('./Api/SteamGenerator/calculate-carbon-and-calorific-value', calorificData);
  }

  calculateCarbonEmission(data: SgaCalcCarbonEmissionReqInterface): Observable<SgaCalcCarbonEmissionResInterface> {
    return this.http.post<SgaCalcCarbonEmissionResInterface>('./Api/SteamGenerator/calculate-carbon-emission-value', data);
  }

  calculateWaterTreatment(data: SgaCalcWaterTreatmentReqInterface): Observable<SgaCalcWaterTreatmentResInterface> {
    return this.http.post<SgaCalcWaterTreatmentResInterface>('./Api/SteamGenerator/calculate-water-treatment-method-parameters', data);
  }

  calculateBoilerEfficiency(data: SgaCalcBoilerEfficiencyReqInterface): Observable<SgaCalcBoilerEfficiencyResInterface> {
    return this.http.post<SgaCalcBoilerEfficiencyResInterface>('./Api/SteamGenerator/calculate-boiler-efficiency', data);
  }

  calculateProposedBoilerEfficiency(data: SgaCalcProposalEfficiencyReqInterface): Observable<SgaCalcProposalEfficiencyResInterface> {
    return this.http.post<SgaCalcProposalEfficiencyResInterface>('./Api/SteamGenerator/calculate-proposal-boiler-efficiency', data);
  }

  calculateTemperatureAndPressure(
    data: SgaCalcFeedtankTemperatureAndPressureReqInterface
  ): Observable<SgaCalcFeedtankTemperatureAndPressureResInterface> {
    return this.http.post<SgaCalcFeedtankTemperatureAndPressureResInterface>(
      './Api/SteamGenerator/calculate-feedtank-temperature-and-pressure', data
    );
  }

  calculateSaturatedAndTemperature(
    data: SgaCalcSaturatedAndFreezingTemperatureReqInterface
  ): Observable<SgaCalcSaturatedAndFreezingTemperatureResInterface> {
    return this.http.post<SgaCalcSaturatedAndFreezingTemperatureResInterface>(
      './Api/SteamGenerator/calculate-saturated-and-freezing-temperature', data
    );
  }

  calculateWaterTemperatureLeaving(
    data: SgaCalcWaterTemperatureExchangerReqInterface
  ): Observable<SgaCalcWaterTemperatureExchangerResInterface> {
    return this.http.post<SgaCalcWaterTemperatureExchangerResInterface>(
      './Api/SteamGenerator/calculate-water-temperature-leaving-heat-exchanger', data
    );
  }

  calculateBenchmark(data: InputParametersFormInterface): Observable<CalcBenchmarkResInterface | SgaValidationErrorResInterface> {
    return this.http.post<CalcBenchmarkResInterface | SgaValidationErrorResInterface>(`./Api/SteamGenerator/calculate-benchmark`, data);
  }

  calculateProposal(data): Observable<any> {
    return this.http.post('./Api/SteamGenerator/calculate-proposal', data);
  }
}
