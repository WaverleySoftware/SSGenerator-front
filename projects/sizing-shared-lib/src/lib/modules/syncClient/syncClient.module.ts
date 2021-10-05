import { NgModule } from '@angular/core';

import { SharedModule } from "../../shared/shared.module";

import { SyncClientService } from "./syncClient.service";
import { SyncClientComponent } from "./syncClient.component";


@NgModule({
  imports: [
    SharedModule
  ],
  providers: [ SyncClientService],
  declarations: [ SyncClientComponent]
})
export class  SyncClientModule { }
