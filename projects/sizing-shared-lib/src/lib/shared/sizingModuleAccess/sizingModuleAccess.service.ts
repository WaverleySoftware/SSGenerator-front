import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';

import { Observable } from "rxjs/Rx";

@Injectable()
export class SizingModuleAccessService {
  constructor(private http: HttpClient) {

  }

  checkModuleAccess(moduleName: string): Observable<boolean> {
    return this.http.get(`./Api/Admin/CheckModuleAccess/${moduleName}`).map((result: boolean) => {
      // A sucessful response (200 OK) is what we're after
      return result;
    }, (error: Error) => {
      // Anything that's not 200, is an error
      return false;
    });
  }
}
