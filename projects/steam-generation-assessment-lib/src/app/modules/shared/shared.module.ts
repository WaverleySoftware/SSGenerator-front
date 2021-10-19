import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { SsButtonComponent } from './components/ss-button/ss-button.component';
import { SgaPanelComponent } from './components/sga-panel/sga-panel.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormFieldComponent } from './components/form-field/form-field.component';


@NgModule({
  declarations: [
    SsButtonComponent,
    SgaPanelComponent,
    FormFieldComponent
  ],
	imports: [
		CommonModule,
		FormsModule,
		CollapseModule.forRoot(),
		TooltipModule.forRoot(),
		ReactiveFormsModule
	],
  exports: [
    SsButtonComponent,
    SgaPanelComponent,
    FormFieldComponent
  ]
})
export class SharedModule { }
