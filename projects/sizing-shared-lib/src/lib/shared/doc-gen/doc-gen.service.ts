import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { DocGen, TiRequestModel, TiDocumentInfosModel, TiDocumentInfo } from "./doc-gen.model";
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
export class DocGenService {

  constructor(private http: HttpClient) {

  }



  getPdf(docGen: DocGen): Observable<any> {

    let options = {
      headers: {
        "Content-Type": "application/json", Accept: "application/octet-stream"
      },
      responseType: 'blob' as 'blob'
    };

    return this.http.post(`./Api/DocGen/GetPdfSpecSheet`, docGen, options);
  }

  getCSGPdf(docGen: DocGen) {

    let options = {
      headers: {
        "Content-Type": "application/json", Accept: "application/octet-stream"
      },
      responseType: 'json' as 'json'
    };

    this.http.post<any>('./CSG/DocGen/CacheModel', docGen, options).subscribe(response => {

      var sessionId = response.sessionId

      window.open('./CSG/DocGen/ReportViewer?id=' + sessionId);

    })

    //return this.http.post(`../CSG/DocGen/CacheModel`, docGen, options);
  }

  getCSGFBPdf(docGen: DocGen) {

    let options = {
      headers: {
        "Content-Type": "application/json", Accept: "application/octet-stream"
      },
      responseType: 'json' as 'json'
    };

    this.http.post<any>('./CSGFB/DocGen/CacheModel', docGen, options).subscribe(response => {

      var sessionId = response.sessionId

      window.open('./CSGFB/DocGen/ReportViewer?id=' + sessionId);

    })

    //return this.http.post(`../CSG/DocGen/CacheModel`, docGen, options);
  }

  getSafetyValvePdf(docGen: DocGen) {

    let options = {
      headers: {
        "Content-Type": "application/json", Accept: "application/octet-stream"
      },
      responseType: 'json' as 'json'
    };



    //this.http.post<any>('../SafetyValves/DocGen/CacheModel', docGen, options).subscribe(response => {
    this.http.post<any>('SVDocGen/CacheModel', docGen, options).subscribe(response => {

      var sessionId = response.sessionId

      window.open('SVDocGen/ReportViewer?id=' + sessionId);

    })

  }

  OpenWindowWithPost(url, windowoption, name, params) {
    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", url);
    form.setAttribute("target", name);

    for (var i in params) {
      if (params.hasOwnProperty(i)) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = i;
        input.value = params[i];
        form.appendChild(input);
      }
    }

    document.body.appendChild(form);

    window.open("./SafetyValves/DocGen/ReportViewer", name, windowoption);

    form.submit();

    document.body.removeChild(form);
  }

  NewFile(docGen: DocGen) {
    var param = docGen;
    // var param = { 'Guid': '1234' };
    this.OpenWindowWithPost("./SafetyValves/DocGen/ReportViewer",
      "width=730,height=345,left=100,top=100,resizable=yes,scrollbars=yes",
      "NewFile", param);
  }


  getExcel(docGen: DocGen): Observable<any> {

    let options = {
      headers: {
        "Content-Type": "application/json", Accept: "application/octet-stream"
      },
      responseType: 'blob' as 'blob'
    };

    return this.http.post(`./Api/DocGen/GetExcelSpecSheet`, docGen, options);
  }


  // ToDo: Awaiting final requirements
  getTiDocumentInfo(tiRequest: TiRequestModel): Observable<TiDocumentInfo[]> {
    return this.http.post<TiDocumentInfo[]>(`./api/reports/TiDocgen/GetTiDocumentInfo`, tiRequest);
  }

  // ToDo: Awaiting final requirements
  downloadFromAnyAPI(apiPath: string) {

    return this.http.get(apiPath,
      {
        headers: {
          "Content-Type": "application/json", Accept: "application/octet-stream",
          "Access-Control-Allow-Origin": "https://local-prsapps.spiraxsarco.com/", // Probably doesn't work?
          "Access-Control-Allow-Headers": "Content-Type"

        },
        responseType: 'blob'

      });
  }


  // ToDo: Awaiting final requirements
  getTiDocumentFile(tiDocumentInfo: TiDocumentInfo): Observable<any> {

    let options = {
      headers: {
        "Content-Type": "application/json", Accept: "application/octet-stream"
      },
      responseType: 'blob' as 'blob'
    };
    return this.http.post(`./api/reports/TiDocgen/GetTiDocumentFile`, tiDocumentInfo, options);
  }



}
