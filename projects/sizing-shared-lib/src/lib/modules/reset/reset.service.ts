import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from "rxjs/Rx";

import { PasswordResetResponse } from "../recover/passwordReset.model";

@Injectable()
export class ResetService {
  constructor(private http: HttpClient) { }

  changePassword(uniqueCode: string, password: string, confirmPassword: string): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>('./Api/User/ChangePassword', { UniqueCode: uniqueCode, NewPassword: password, ConfirmPassword: confirmPassword });
  }

  verifyPasswordToken(uniqueCode: string): Observable<boolean> {
    return this.http.get<boolean>(`./Api/User/VerifyPasswordToken/` + uniqueCode);
  }
}
