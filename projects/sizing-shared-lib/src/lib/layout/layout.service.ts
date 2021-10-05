import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from "rxjs/Rx";
import { ModuleGroup } from "../modules/admin/module-group.model";
import { Subject } from 'rxjs';

@Injectable()
export class LayoutService {

  // Exposed field and private subject for when module groups change.
  userModuleGroups: ModuleGroup[] = null;
  private userModuleGroupsChange: Subject<ModuleGroup[]> = new Subject<ModuleGroup[]>();

  constructor(private http: HttpClient) {
    // Create a subscriber for when preferences change.
    this.userModuleGroupsChange.subscribe((moduleGroups: ModuleGroup[]) => {
      this.userModuleGroups = moduleGroups;
    });
  }

  /**
  * Gets all module groups for the current user.
  */
  getModuleGroupsForUser(): Observable<void> {
    return this.http.get<Array<ModuleGroup>>(`./Api/Admin/GetModuleGroupsForUser/`).map(moduleGroups => {
      // Notify the subject that the module groups have changed.
      this.userModuleGroupsChange.next(moduleGroups);
    });
  }
}
