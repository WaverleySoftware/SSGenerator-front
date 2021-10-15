import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { SsButtonComponent } from './components/ss-button/ss-button.component';
import { CustomFieldComponent } from './components/custom-field/custom-field.component';
import { SgaPanelComponent } from './components/sga-panel/sga-panel.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';


@NgModule({
  declarations: [
    SsButtonComponent,
    CustomFieldComponent,
    SgaPanelComponent
  ],
	imports: [
		CommonModule,
		FormsModule,
		CollapseModule.forRoot(),
    TooltipModule.forRoot()
	],
  exports: [
    SsButtonComponent,
    CustomFieldComponent,
    SgaPanelComponent
  ]
})
export class SharedModule { }
