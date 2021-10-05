import { Component, OnInit, ViewChild } from '@angular/core';

import * as screenfull from "screenfull";
import { Screenfull } from "screenfull";

import browser from 'jquery.browser';

declare var $: any;

import { SettingsService } from 'sizing-shared-lib';
import { MenuService } from 'sizing-shared-lib';

import { SizingSuiteModalComponent } from 'sizing-shared-lib';
import { AuthenticationService } from 'sizing-shared-lib';
import { AuthenticatedUser } from 'sizing-shared-lib';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  navCollapsed = true; // for horizontal layout
  menuItems: Array<any>;

  isNavSearchVisible: boolean;
  @ViewChild('fsbutton', { static: false }) fsbutton;  // the fullscreen button

  @ViewChild("translationModal", { static: false } ) translationModal: SizingSuiteModalComponent;

  get currentUser(): AuthenticatedUser {
    return this.authenticationService.authenticatedUser;
  }

  constructor(public menu: MenuService, public settings: SettingsService, private authenticationService: AuthenticationService) {

    this.menuItems = menu.getMenu().filter(mu => {

      let canViewMenuItem = false;

      // Filter each menu item based on name and permission
      if      (mu.text === "ADMINISTRATION_TASKS" && this.currentUser.permissions['canViewAdminTasks'])      { canViewMenuItem = true; }
      else if (mu.text === "PROJECTS_AND_JOBS"    && this.currentUser.permissions['canViewProjectsJobs'])    { canViewMenuItem = true; }
      else if (mu.text === "MY_PROFILE"           && this.currentUser.permissions['canViewMyProfile'])       { canViewMenuItem = true; }
      else if (mu.text === "MY_PREFERENCES" && this.currentUser.permissions['canViewUserPreferences']) { canViewMenuItem = true; }
      else if (mu.text === "SYNC_CLIENT" && this.currentUser.clientMode) { canViewMenuItem = true; }


      return mu.isHeaderItem === true && canViewMenuItem;
    }); // for horizontal layout
  }

  ngOnInit() {
    this.isNavSearchVisible = false;
  }

  toggleUserBlock(event) {
    event.preventDefault();
  }

  setNavSearchVisible(stat: boolean) {
    // console.log(stat);
    this.isNavSearchVisible = stat;
  }

  getNavSearchVisible() {
    return this.isNavSearchVisible;
  }

  toggleOffsidebar() {
    this.settings.layout.offsidebarOpen = !this.settings.layout.offsidebarOpen;
  }

  toggleCollapsedSideabar() {
    this.settings.layout.isCollapsed = !this.settings.layout.isCollapsed;
  }

  isCollapsedText() {
    return this.settings.layout.isCollapsedText;
  }

  public modalCallbackCancel() {
    console.log("Oh look, it's closed without this function calling anything!!");
  }

  public modalCallbackOk() {
    console.log("Oh look, it's OK'd without this function calling anything!!");
  }
}
