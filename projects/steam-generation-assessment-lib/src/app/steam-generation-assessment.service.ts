import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { SteamGenerationFormInterface } from "./steam-generation-form.interface";

@Injectable()
export class SteamGenerationAssessmentService {
  constructor(private http: HttpClient) {}
  public calculateResults(form: Partial<SteamGenerationFormInterface>): Observable<any> {
    return this.http.post<any>(`./Api/SteamGenerator/calculate-benchmark`, form);
  }

  public validateSgInput(field: keyof SteamGenerationFormInterface, form: Partial<SteamGenerationFormInterface>): Observable<any> {
    return this.http.post<any>(`./Api/SteamGenerator/validate-input/${field}`, form);
  }
}
