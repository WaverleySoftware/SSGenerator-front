import { Injectable } from '@angular/core';

import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }

  /**
  * Set the Industrial Enumeration Name dependant on the selected Trade Enumeration definition. (switch to new list)
  */
  getIndustryEnumNameForProvidedTrade(tradeEnum: string): string {
    // Load the corresponding Industry Enumeration list into the <Enumeration> control
    switch (tradeEnum) {
    case "0":
      return "PrimaryIndustry_Platform";
    case "1":
      return "EnergyAndWater_Platform";
    case "2":
      return "ChemicalIndustry_Platform";
    case "3":
      return "MetalIndustry_Platform";
    case "4":
      return "TextilesAndFibres_Platform";
    case "5":
      return "FoodIndustry_Platform";
    case "6":
      return "OtherManufacturing_Platform";
    case "7":
      return "ServicesIndustry_Platform";
    case "8":
      return "None_Platform";
    default:
      return "None_Platform";
    }

  }
}
