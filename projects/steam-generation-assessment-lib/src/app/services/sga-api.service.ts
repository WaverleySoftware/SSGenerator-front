import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BenchmarkInputsInterface } from '../interfaces/benchmarkInputs.interface';
import { InputParametersFormInterface } from '../interfaces/forms.interface';

@Injectable()
export class SgaApiService {

  constructor(private http: HttpClient) { }

  benchmarkValidate(name: keyof BenchmarkInputsInterface, data: InputParametersFormInterface): Observable<any> {
    return this.http.post(`./Api/SteamGenerator/validate-benchmark-input/${name}`, data);
  }
}
