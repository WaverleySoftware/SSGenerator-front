import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Currency } from "./currency/currency.model";
import { Language } from "./language.model";
import { Country } from "./country.model";
import { ModuleGroup } from "./module-group.model";
import { VettedUser } from "../user-profile/vettedUser.model";
import { User } from "../user-profile/user.model";

import { Observable, Subject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { Manufacturer } from "../admin/module-preferences/manufacturer.model";
import { Enumeration } from "../../shared/translation/translation.model";
import { ModulePreferenceDetails } from "../../shared/module-preference/module-preference-details.model";
import { map } from "rxjs/operators";


@Injectable()
export class AdminService {

  vettedUsers: VettedUser[] = [];
  vettedUsersChange: Subject<VettedUser[]> = new Subject<VettedUser[]>();
  currenciesPending: boolean;

  constructor(private http: HttpClient) {
    // When the class in constructed, initialise the subject so that whenever it is called, its subscriber resolves the result to the current vetted users object.
    this.vettedUsersChange.subscribe(vettedUsers => {
      this.vettedUsers = vettedUsers;
    });
  }

  /**
   * Checks whether or not the provided username exists.
   * @param username
   */
  checkUsernameExists(username: string): Observable<boolean> {
    return this.http.post<boolean>(`./Api/User/CheckUsernameExists`, { Username: username });
  }

  /**
   * Checks whether or not the provided email address exists.
   * @param email
   */
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.post<boolean>(`./Api/User/CheckEmailExists/`, { Email: email });
  }

  /**
   * Registers the specified user.
   * @param userData
   */
  registerUser(userData: User): Observable<boolean> {
    return this.http.post<boolean>(`./Api/User/Register/`, userData);
  }

  /**
   * Gets all supported currencies.
   */
  getCurrencyData(): Observable<Array<Currency>> {
    this.currenciesPending = true;
    return this.http.get<Array<Currency>>(`./Api/Admin/GetCurrencyData`).pipe(
      map((currencies) => {
        this.currenciesPending = false;
        return currencies;
      })
    );
  }

  /**
   * Gets all supported languages.
   */
  getLanguages(): Observable<Array<Language>> {
    return this.http.get<Array<Language>>(`./Api/Admin/GetLanguages`);
  }

  /**
   * Gets all countries.
   */
  getCountries(): Observable<Array<Country>> {
    return this.http.get<Array<Country>>(`./Api/Admin/GetCountries`);
  }

  /**
   * Gets all the module group that requires preferences.
   */
  getModuleRequiredPreferences(): Observable<Array<ModuleGroup>> {
    return this.http.get<Array<ModuleGroup>>(`./Api/Admin/GetModuleRequiredPreferences`);
  }

  /**
   * Gets all accessible modules.
   */
  getAccessibleModuleGroups(): Observable<Array<ModuleGroup>> {
    return this.http.get<Array<ModuleGroup>>(`./Api/Admin/GetAccessibleModuleGroups`);
  }

  /**
   * Gets all accessible modules for the current operating company.
   * @param moduleName
   */
  getModuleAccessByModuleName(moduleName: string): Observable<any> {
    return this.http.get<Array<any>>(`./Api/Admin/GetAccessibleModuleGroups/${moduleName}`);
  }

  /**
   * Gets all users regardless of their vetted type based on the provided module group Id.
   * @param moduleGroupId The module group Id.
   */
  getAllVettedTypeUsersByModuleGroupId(moduleGroupId: number): Observable<void> {
    return this.http.get<Array<VettedUser>>(`./Api/Admin/GetAllVettedTypeUsersByModuleGroupId/${moduleGroupId}`).map(this.mapUserObj).map(
      vettedUsers => {
        // Assign the new users to the subject.
        this.vettedUsersChange.next(vettedUsers);
      });
  }

  /**
   *
   * @param vettedUsers
   */
  private mapUserObj(vettedUsers: VettedUser[]): VettedUser[] {
    if (!vettedUsers || vettedUsers.length === 0) {
      return [];
    }

    // Rationalise the UI properties here.
    vettedUsers.forEach(vu => { vu.hideFromDisplay = false; });

    return vettedUsers;
  }

  updateVettedUser(userToChange: VettedUser, isVetted: boolean) {

    // Go through each user
    this.vettedUsers.forEach(user => {
      // If a match is found, update the vetted status.
      if (user.userId === userToChange.userId) {
        user.isVetted = isVetted;

        // For vetted users, default access level to one star (No Pricing).
        if (isVetted) {
          user.accessLevel = 1;
        }
      }
    });

    // Update the subject
    this.vettedUsersChange.next(this.vettedUsers);
  }

  /**
   * Searches all vetted/non-vetted users for the provided search term.
   * @param searchVal The search term.
   */
  searchVettedUsers(searchVal: any) {

    // Searching through the global object means
    // that no - user gets accidently removed and
    // retains the original array of users.
    this.vettedUsers.forEach(user => {

      // Rationalise the search term
      searchVal = searchVal.toLowerCase();

      // Reset the user to its original state.
      user.hideFromDisplay = true;

      // Exclude users from display if they do not match the provided (valid) search term.
      // Username
      if (!!user && !!user.username) {
        if (user.username.toLowerCase().indexOf(searchVal) > -1 || !searchVal) {
          user.hideFromDisplay = false;
        }
      }

      // First name
        if (!!user && !!user.firstname) {
          if (user.firstname.toLowerCase().indexOf(searchVal) > -1 || !searchVal) {
            user.hideFromDisplay = false;
          }
        }

      // Last name
        if (!!user && !!user.lastname) {
          if (user.lastname.toLowerCase().indexOf(searchVal) > -1 || !searchVal) {
            user.hideFromDisplay = false;
          }
        }

      // First & Last name
          if (!!user && !!user.firstname && !!user.lastname) {
            if (`${user.firstname} ${user.lastname}`.toLowerCase().indexOf(searchVal) > -1 || !searchVal) {
              user.hideFromDisplay = false;
            }
          }
      // Email
        if (!!user && !!user.email) {
          if (user.email.toLowerCase().indexOf(searchVal) > -1 || !searchVal) {
            user.hideFromDisplay = false;
          }
        }

    });

    // Update the subject
    this.vettedUsersChange.next(this.vettedUsers);
  }

  deleteUser(user: VettedUser[]): Observable<boolean> {
    return this.http.post<boolean>(`./Api/Admin/DeleteUser/${user}`, user);
  }

  manageModuleAccess(isVetted: boolean, moduleGroupId: number): Observable<boolean> {
    // Only send the users that have been marked as isVetted = true
    return this.http.post<boolean>(`./Api/Admin/ManageVettedUsersForModule/${isVetted}/${moduleGroupId}`, this.vettedUsers.filter(vu => vu.isVetted));
  }

  /**
  * Gets all supported currencies.
  */
  getManufacturerData(moduleGroupId: number): Observable<Array<Manufacturer>> {
    return this.http.get<Array<Manufacturer>>(`./Api/Admin/GetManufacturersData/${moduleGroupId}`);
  }

  /**
  * Updates all enumeration module preferences.
  */
  manageEnumerationModulePreferences(enumerations: Enumeration[]): Observable<boolean> {
    return this.http.post<boolean>(`./Api/Admin/ManageEnumerationModulePreferences`, enumerations );
  }

  /**
  * Updates all module preferences.
  */
  manageModulePreferences(modPrefs: ModulePreferenceDetails[]): Observable<boolean> {
    return this.http.post<boolean>(`./Api/Admin/ManageModulePreferences`, modPrefs );
  }

  /**
 * Gets the module access level for the current user.
 */
  getUserModuleAccessDataByModuleGroupId(moduleGroupId: number): Observable<number> {
    return this.http.get<number>(`./Api/Admin/GetUserModuleAccessDataByModuleGroupId/${moduleGroupId}`);
  }
}
