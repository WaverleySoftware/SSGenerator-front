import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class ConfirmService {
  constructor(private http: HttpClient) { }

  verifyRegistrationToken(uniqueCode: string): Observable<boolean> {
    return this.http.get<boolean>(`./Api/User/VerifyRegistrationToken/` + uniqueCode);
  }
}
