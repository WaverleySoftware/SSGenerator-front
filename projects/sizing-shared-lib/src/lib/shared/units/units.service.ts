import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from "rxjs/Rx";

import { Unit } from "../units/unit.model";
import { UnitConvert, UnitsConverter } from "../units/unit-convert.model";

@Injectable()
export class UnitsService {
  units: Unit[] = [];
  unitsChange: Subject<Unit[]> = new Subject<Unit[]>();

  constructor(private http: HttpClient) {

    // When the class in constructed, initialise the subject so that whenever it is called, its subscriber resolves the result to the current units.
    this.unitsChange.subscribe(val => {
      if (!!val) {
        this.units = val;
      }
    });

    // If no units are loaded, get it ONCE from the server.
    if (this.units.length === 0) {
      this.getAllUnitsByAllTypes().subscribe((units: Unit[]) => {
        // Update the subject with the data that's just been retrieved (see the constructor).
        this.unitsChange.next(units);
      });
    }

  }

  /**
   * Gets all units and their respective unit types.
   */
  getAllUnitsByAllTypes(): Observable<Array<Unit>> {
    return this.http.get<{units: Array<Unit>}>(`./Api/Calculations/GetAllUnitsByAllTypes`).map(({units}) => {

      return units;
    });
  }

  unitsConverter(unitsConverter: UnitsConverter): Observable<UnitsConverter> {
    return this.http.post<UnitsConverter>(`./Api/Calculations/UnitsConverter`, unitsConverter).map((unitsConvertedData: UnitsConverter) => {

      return unitsConvertedData;
    });
  }

}
