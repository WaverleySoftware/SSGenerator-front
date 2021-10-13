import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { SsButtonComponent } from './components/ss-button/ss-button.component';
import { SsInputComponent } from './components/ss-input/ss-input.component';
import { SgaPanelComponent } from './components/sga-panel/sga-panel.component';


@NgModule({
  declarations: [
    SsButtonComponent,
    SsInputComponent,
    SgaPanelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CollapseModule.forRoot(),
  ],
  exports: [
    SsButtonComponent,
    SsInputComponent,
    SgaPanelComponent
  ]
})
export class SharedModule { }
