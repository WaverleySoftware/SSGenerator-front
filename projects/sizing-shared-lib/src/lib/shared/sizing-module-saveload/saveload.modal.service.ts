import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from "rxjs/Rx";

import { SaveLoad } from "../sizing-module-saveload/saveload.modal.model";

@Injectable()
export class SaveLoadService {
  
  constructor(private http: HttpClient) {
    
    
  }
  
}
