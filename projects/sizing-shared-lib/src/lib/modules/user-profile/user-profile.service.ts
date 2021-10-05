import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from "rxjs/Rx";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import { User } from "../user-profile/user.model";

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  constructor(private http: HttpClient) { }

  getUserDetails(): Observable<User> {
    return this.http.get<User>("./Api/User/GetUserDetails");
  }

  updateUserDetails(user: User): Observable<boolean> {
    return this.http.post<boolean>("./Api/User/UpdateUserDetails", user);
  }

  resetPassword(userName: string, currentPassword: string, newPassword: string, confirmPassword: string): Observable<boolean> {
    return this.http.post<boolean>("./Api/User/ResetPassword/", { UserName: userName, CurrentPassword: currentPassword, NewPassword: newPassword, ConfirmPassword: confirmPassword});
  }
}
