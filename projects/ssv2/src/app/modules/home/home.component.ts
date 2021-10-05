import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'sizing-shared-lib';
import { MenuService } from 'sizing-shared-lib';

import { ModuleGroup } from 'sizing-shared-lib';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  get userModuleGroups(): ModuleGroup[] {
    return this.layoutService.userModuleGroups;
  }

  constructor(private layoutService: LayoutService, private menuService: MenuService) { }

  ngOnInit() {

  }

}
