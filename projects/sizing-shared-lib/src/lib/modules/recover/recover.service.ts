import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class RecoverService {

  constructor(private http: HttpClient) { }

  sendForgotPasswordEmail(email: string): Observable<any> {
    return this.http.post(`./Api/User/SendForgotPasswordEmail`, { Email: email });
 }
}
