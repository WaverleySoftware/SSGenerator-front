import { Component, OnInit } from '@angular/core';

import { AdminService } from "../admin.service";
import { ModuleGroup } from "../module-group.model";

@Component({
  selector: 'app-module-preferences',
  templateUrl: './module-preferences.component.html',
  styleUrls: ['./module-preferences.component.scss']
})
export class ModulePreferencesComponent implements OnInit {

  constructor(private adminService: AdminService) { }

  requiredModules: ModuleGroup[] = [];

  ngOnInit() {
    //this.requiredModules.push({ allowsProductSelection: false, imageSrc: null, isVetted: false, masterTextKey:"delayCheck", moduleGroupId: 12, modules: null, name:"delayCheck", requiresPreferences:false, showPricing: false});

    this.adminService.getModuleRequiredPreferences().subscribe((response: ModuleGroup[]) => {

      //removed EasiHeat for CSG release
      //for (let module of response) {

      //  if (module.name == "EasiHeat") {
      //    response.splice(0, 1);
      //  }

      //}
      
      this.requiredModules = response;
    });
  }
}
