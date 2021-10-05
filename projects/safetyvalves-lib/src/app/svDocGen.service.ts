import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { DocGen } from "./doc-gen.model";
//import { SizingUnitPreference } from "./sizing-unit-preference.model";

import { Observable, Subject } from "rxjs/Rx";
import { map, publishReplay, refCount, tap } from 'rxjs/operators';
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { debug } from 'util';

// Create observable that holds two values
const observable$ = from(['first', 'last']).pipe(
  publishReplay(1),
  refCount()
)

// First time subscribing, we get both values
observable$.subscribe(data => console.log(data));

// Second time subscribing, we get the latest value
observable$.subscribe(data => console.log(data));
observable$.subscribe(data => console.log(data));
observable$.subscribe(data => console.log(data));

@Injectable()
export class svDocGenService {

  constructor(private http: HttpClient) {

  }

  getSafetyValvePdf(docGen: DocGen) {
    debugger;
    let options = {
      headers: {
        "Content-Type": "application/json", Accept: "application/octet-stream"
      },
      responseType: 'json' as 'json'
    };

    this.http.post<any>('./Api/reports/Sv/DocGen/CacheModel', docGen).subscribe(response => {

      var sessionId = response.sessionId;

      window.open('./Api/reports/Sv/DocGen/ReportViewer?id=' + sessionId);


    })

  }

}
