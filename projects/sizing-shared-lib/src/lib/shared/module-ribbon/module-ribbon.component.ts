import { Component, Input, OnInit } from '@angular/core';

import { ModuleGroup } from "../../modules/admin/module-group.model";

import { MenuService } from "../../core/menu/menu.service";
import { UserProfileService } from "../../modules/user-profile/user-profile.service";
import { User } from "../../modules/user-profile/user.model";

@Component({
  selector: 'module-ribbon',
  exportAs: 'module-ribbon',
  templateUrl: './module-ribbon.component.html',
  styleUrls: ['./module-ribbon.component.scss']
})
export class ModuleRibbonComponent implements OnInit  {

  user: User;
  public operatingCompany: string;

  constructor(private menuService: MenuService,
    private userProfileService: UserProfileService) {

  }

  @Input('module-groups') moduleGroups: ModuleGroup[] = [];

  @Input('module-identifier') moduleIdentifier: string = "";

  private menuItem: any;

  ngOnInit() {
    this.userProfileService.getUserDetails().subscribe(user => {
      this.user = user;
    });
  }

  getRoute(masterTextKey: string): string {
    // Get the menu item based on the module group's master text key and identifier
    const menuItem = this.menuService.menuItems.find(mu => mu[this.moduleIdentifier] === true && mu.text === masterTextKey);


    if (!!menuItem) {

      if (!!menuItem.displayOperatingCompany && !!this.user) {
        this.operatingCompany = " : " + this.user.operatingCompanyName;
      } else {
        this.operatingCompany = "";
      }

      return menuItem.link;
    }

    return null;
  }

  getIcon(masterTextKey: string): string {
    // Get the menu item based on the module group's master text key and identifier
    const menuItem = this.menuService.menuItems.find(mu => mu[this.moduleIdentifier] === true && mu.text === masterTextKey);

    if (!!menuItem) {
      return menuItem.icon;
    }

    return null;
  }

  /**
   * Determines which image dimension to use on image load (width or height of 100px).
   * @param event The onload event.
   */
  useWidthOrHeight(image: HTMLImageElement) {

    const useWidth = image.naturalWidth > image.naturalHeight;

    // Assign a new property to the image.
    // @ts-ignore
    image["useWidth"] = useWidth;
  }
}
