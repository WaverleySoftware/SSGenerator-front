import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from "@angular/forms";
import { BlockUI, NgBlockUI } from 'ng-block-ui';

import { MenuService } from "../../../core/menu/menu.service";
import { TranslatePipe } from "../../../shared/translation/translate.pipe";
import { AdminService } from "../admin.service";

import { ModuleGroup } from "../module-group.model";
import { VettedUser } from "../../user-profile/vettedUser.model"
import { DatatableComponent } from '@swimlane/ngx-datatable';

import { IGenericChanges } from "../../generic.changes.interface";
import { debug } from 'util';

declare var swal: any;

@Component({
  selector: 'app-module-access',
  templateUrl: './module-access.component.html',
  styleUrls: ['./module-access.component.scss']
})
export class ModuleAccessComponent implements OnInit, IGenericChanges {

  public selectedVettedUsers: VettedUser[] = [];
  public selectedNonVettedUsers: VettedUser[] = [];

  get vettedUsers(): VettedUser[] {
    return this.adminService.vettedUsers.filter(vu => vu.isVetted && vu.hideFromDisplay === false && (this.userSearchFilter === null || vu.isInternal === this.userSearchFilter));
  }


  get nonVettedUsers(): VettedUser[] {
    return this.adminService.vettedUsers.filter(vu => !vu.isVetted && vu.hideFromDisplay === false && (this.userSearchFilter === null || vu.isInternal === this.userSearchFilter));
  }

  public vettedTableSelected: boolean = false;
  public nonVettedTableSelected: boolean = false;

  public userSelected: boolean = false;

  public moduleChangesMade: boolean = false;

  public noPricingLabel: string;
  public sellingPricesLabel: string;
  public allPricesLabel: string;

  public pricesLabel: string[];

  public userSearchFilter: boolean = null;

  @BlockUI('vetted-user-section') blockUi: NgBlockUI;

  @ViewChild("vettedUsersTable", { static: false }) vettedUsersTable: DatatableComponent;
  @ViewChild("nonVettedUsersTable", { static: false }) nonVettedUsersTable: DatatableComponent;

  @ViewChild("searchFilter", { static: false }) searchFilter: ElementRef;

  constructor(
    private adminService: AdminService,
    private activatedRoute: ActivatedRoute,
    private menuService: MenuService,
    private fb: FormBuilder,
    public translatePipe: TranslatePipe) {

    // Setup the access level labels.
    this.noPricingLabel = this.translatePipe.transform("NO_PRICING", false);
    this.sellingPricesLabel = this.translatePipe.transform("SELLING_PRICES", false);
    this.allPricesLabel = this.translatePipe.transform("ALL_PRICING", false);

    this.pricesLabel = [this.noPricingLabel, this.sellingPricesLabel, this.allPricesLabel];


  }

  accessibleModules: ModuleGroup[] = [];

  currentModule: ModuleGroup;

  private sizingModule: string;



  hasUnsavedDataChanges: boolean; // to drive GenericChangesGuard
  theFormGroup: FormGroup; // to drive GenericChangesGuard

  saveSuccessful: boolean;
  saveError: boolean;
  saveButtonActive: boolean;

  ngOnInit() {
    this.adminService.getAccessibleModuleGroups().subscribe((response: ModuleGroup[]) => {
      this.accessibleModules = response;
      console.info("Getting modules");
      this.setSelectedModule();
    });


    this.activatedRoute.params.subscribe(params => {
      this.sizingModule = params['sizingModule'];
      console.info("Route parameter set");
      this.setSelectedModule();
    });

  }

  /**
   * Sets the selected module based on the current routing parameter.
   */
  setSelectedModule() {
    console.info("Setting users");
    if (!!this.accessibleModules) {
      const menuItem = this.menuService.menuItems.find(mu => mu.isModuleAccess &&
        mu.link === `/admin/moduleAccess/${this.sizingModule}`);

      this.currentModule = this.accessibleModules.find(am => am.masterTextKey === menuItem.text);

      if (!!this.currentModule) {
        // Get the users
        this.showVettedAccessDetails();
      }
    }
  }

  showVettedAccessDetails() {

    // Start the busy block
    this.blockUi.start(this.translatePipe.transform("PLEASE_WAIT", true));


    this.adminService.getAllVettedTypeUsersByModuleGroupId(this.currentModule.moduleGroupId).subscribe(() => {
      // Reset the flags
      this.blockUi.stop();
      this.moduleChangesMade = false;

      // Apply the search in case a search was last applied
      this.searchUsers();
    });
  }

  deleteUser() {

    if (this.vettedTableSelected) {

      swal({
        title: "Delete User",
        text: "Deleting this user will remove them from all modules. Continue with deletion?",
        icon: "warning",
        dangerMode: true,
        buttons: ['Yes', 'Cancel']
      }).then((okbuttoncClicked?: boolean) => {

        // The parameter can also enter as null
        const returnVal = !(okbuttoncClicked === null);

        if (!returnVal) {

          const users: VettedUser[] = [];

          for (const selectedUser of this.selectedVettedUsers) {

            users.push(selectedUser);

            this.adminService.deleteUser(users).subscribe();

            var vettedUsers = this.vettedUsers.filter(item => item.userId !== selectedUser.userId);

            this.vettedUsersTable.rows = vettedUsers;

            this.showVettedAccessDetails();

            this.userSelected = false;
          }

        }

      });//end of swal

    }

    if (this.nonVettedTableSelected) {

      swal({
        title: "Delete User",
        text: "Deleting this user will remove them from all modules. Continue with deletion?",
        icon: "warning",
        dangerMode: true,
        buttons: ['Yes', 'Cancel']
      }).then((okbuttoncClicked?: boolean) => {

        // The parameter can also enter as null
        const returnVal = !(okbuttoncClicked === null);

        if (!returnVal) {

          const users: VettedUser[] = [];

          for (const selectedUser of this.selectedNonVettedUsers) {

            //const user = this.nonVettedUsers.find(vu => vu.userId === selectedUser.userId);

            users.push(selectedUser);

            this.adminService.deleteUser(users).subscribe();

            var nonVettedUsers = this.nonVettedUsers.filter(item => item.userId !== selectedUser.userId);

            this.nonVettedUsersTable.rows = nonVettedUsers;

            this.showVettedAccessDetails();

            this.userSelected = false;
          }
        }
      });//end of swal

    }

  }

  onUserSelect(event: any, isFromVettedList: boolean) {
    // Set the flags appropriately
    this.vettedTableSelected = isFromVettedList;
    this.nonVettedTableSelected = !isFromVettedList;

    this.userSelected = true;

    // Empty out the appropriate users list
    if (isFromVettedList) {
      this.selectedNonVettedUsers = [];
    } else {
      this.selectedVettedUsers = [];
    }

    const users = event.selected as VettedUser[];

    // If no users are selected, then nothing is selected
    if (users.length === 0) {
      this.vettedTableSelected = false;
      this.nonVettedTableSelected = false;
      this.userSelected = false;
    }
  }

  moveSelectedUsers(isMovingVettedUsers: boolean) {

    // Set each scenario up accordingly
    if (isMovingVettedUsers) {

      // Set the selected vetted users back to non-vetted
      for (const selectedUser of this.selectedVettedUsers) {

        const user = this.vettedUsers.find(vu => vu.userId === selectedUser.userId);

        this.adminService.updateVettedUser(user, false);
        this.saveButtonActive = true;
        this.saveSuccessful = false;
      }

    } else {

      // Set the selected non-vetted users to vetted
      for (const selectedUser of this.selectedNonVettedUsers) {

        const user = this.nonVettedUsers.find(vu => vu.userId === selectedUser.userId);

        this.adminService.updateVettedUser(user, true);
        this.saveButtonActive = true;
        this.saveSuccessful = false;
      }
    }

    // Empty out the selected users
    this.selectedVettedUsers = [];
    this.selectedNonVettedUsers = [];

    // Reset the buttons
    this.vettedTableSelected = false;
    this.nonVettedTableSelected = false;
    this.userSelected = false;

    // Reset the rows (to update the view)
    this.vettedUsersTable.rows = this.vettedUsers;
    this.nonVettedUsersTable.rows = this.nonVettedUsers;

    // Changes can be saved
    this.moduleChangesMade = true;

    this.hasUnsavedDataChanges = true; // to drive GenericChangesGuard
  }

  canSaveModuleChanges(): boolean {
    const actualVettedUsers = this.adminService.vettedUsers.filter(vu => vu.isVetted);

    return !this.moduleChangesMade || (actualVettedUsers.length === 0 && this.currentModule.isVetted);
  }

  saveModuleAccess() {
    const isVetted = this.currentModule.isVetted;

    this.adminService.manageModuleAccess(isVetted, this.currentModule.moduleGroupId).subscribe(isSuccessful => {
      // Reset the save changes flag
      this.moduleChangesMade = isSuccessful;

      if (isSuccessful) {
        // Show a success alert
        this.hasUnsavedDataChanges = false; // to drive GenericChangesGuard
        this.saveSuccessful = true;
        this.saveButtonActive = false;
      } else {
        // Show an error alert
        this.saveError = true;
        this.saveButtonActive = false;
      }
    });
  }

  getVettedUserAccessLevelFromTableRow(row: any): number {

    const index = this.vettedUsers.indexOf(row);

    if (index > -1) {
      return this.vettedUsers[index].accessLevel;
    }

    return 0;
  }

  /**
   * Searches users based on the search criteria input.
   */
  searchUsers() {

    const val = this.searchFilter.nativeElement.value.toLowerCase();

    // Do the search here.
    console.info(`Searching for: '${val}'; ${!!val ? "Valid Search" : "Invalid Search"}`);

    this.adminService.searchVettedUsers(val);

    console.info(`User Operation: We now have ${this.vettedUsers.length} vetted users and ${this.nonVettedUsers.length} non-vetted users`);

    // Whenever the filter changes, always go back to the first page
    if (!!this.vettedUsersTable && !!this.nonVettedUsersTable) {
      this.vettedUsersTable.offset = 0;
      this.nonVettedUsersTable.offset = 0;
    }
  }

  filterUsers(event: Event) {
    const filterCheckBox = event.target as HTMLInputElement;

    if (!!filterCheckBox.value) {
      this.userSearchFilter = filterCheckBox.value === "true";
    } else {
      this.userSearchFilter = null;
    }
  }
}

