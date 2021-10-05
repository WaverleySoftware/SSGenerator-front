import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { DisplayGroup } from "../../shared/translation/translation.model";



@Injectable({
  providedIn:'root'
})
export class TranslationService {
  displayGroup: DisplayGroup = null;
  layoutDisplayGroup: DisplayGroup = null;
  displayGroupChange: Subject<DisplayGroup> = new Subject<DisplayGroup>();

  constructor(private http: HttpClient) {
    // When the class in constructed, initialise the subject so that whenever it is called, its subscriber resolves the result to the current Display Group object.
    this.displayGroupChange.subscribe(newDisplayGroup => {
      this.displayGroup = newDisplayGroup;
      console.log("Translation Service Const called")
    });
  }

  /**
  * Gets Translated DisplayGroup (normally for a page).
  */
  getTranslatedDisplayGroup(displayGroupName: string): Observable<DisplayGroup> {
    if (!!displayGroupName) {
      return this.http.get<DisplayGroup>(`./Api/Translation/GetTranslatedDisplayGroup/${displayGroupName}`)
        .map((displayGroupData: DisplayGroup) => {

          // Publish the next set of changes to the subject.
          this.displayGroupChange.next(displayGroupData);

          return displayGroupData;
        });
    }

    return Observable.of(null);
  }

  /**
  * Gets Translated Layout DisplayGroup (normally for a page).
  */
  getLayoutTranslatedDisplayGroup(): Observable<DisplayGroup> {
    return this.http.get<DisplayGroup>(`./Api/Translation/GetTranslatedDisplayGroup/LAYOUT`).map(
      (displayGroupData: DisplayGroup) => {
        this.layoutDisplayGroup = displayGroupData;
        return displayGroupData;
      });
  }

  /**
   * Manages the specified transaltion changes.
   * @param translation The array of changed Translations.
   */
  manageTranslationTexts(displayGroup: DisplayGroup): Observable<boolean> {
    return this.http.post<boolean>(`./Api/Translation/InsertUpdateDeleteTranslationText`, { displayGroup: displayGroup });
  }

  getEnumerationMasterKeyText(listName: string, valueString: string): string {
    let specificList = this.displayGroup.enumerations.filter(us => us.enumerationName === (listName) && us.opCoOverride === false)[0];
    let masterKeyText = specificList.enumerationDefinitions.filter(s => s.value === valueString)[0].masterTextKey;
    return masterKeyText;
  }

}
