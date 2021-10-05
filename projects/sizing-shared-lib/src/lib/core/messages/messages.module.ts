import { NgModule } from '@angular/core';

import { SharedModule } from "../../shared/shared.module";

import { MessagesComponent } from "./messages.component";
import { MessagesService } from "./messages.service";

@NgModule({
  imports: [
    SharedModule
  ],
  providers: [MessagesService],
  declarations: [MessagesComponent],
  exports: [MessagesComponent]
})
export class MessagesModule { }
