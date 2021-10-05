import { Component, OnInit } from '@angular/core';

import { AuthenticatedUser } from "../../core/authentication/authenticatedUser.model";
import { AuthenticationService } from "../../core/authentication/authentication.service";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  get currentUser(): AuthenticatedUser {
    return this.authenticationService.authenticatedUser;
  }

  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit() {
  }

}
