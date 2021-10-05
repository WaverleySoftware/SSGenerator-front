import { NgModule } from '@angular/core';

import { SharedModule } from "../../shared/shared.module";

import { UserProfileComponent } from './user-profile.component';
import { GenericChangesGuard } from "../generic.changes.guard";

@NgModule({
  imports: [
    SharedModule
  ],
  providers: [GenericChangesGuard],
  declarations: [UserProfileComponent]
})
export class UserProfileModule { }
