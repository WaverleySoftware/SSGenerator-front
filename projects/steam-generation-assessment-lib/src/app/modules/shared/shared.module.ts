import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { SsButtonComponent } from './components/ss-button/ss-button.component';
import { SgaPanelComponent } from './components/sga-panel/sga-panel.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormFieldComponent } from './components/form-field/form-field.component';
import { ChartBarComponent } from './components/chart-bar/chart-bar.component';
import { ChartsModule } from "ng2-charts";
import { BoilerSchemeComponent } from './components/boiler-scheme/boiler-scheme.component';
import { FormInputComponent } from './components/form-input/form-input.component';
import { SizingSharedLibModule } from "sizing-shared-lib";
import { FormListComponent } from './components/form-list/form-list.component';


@NgModule({
  declarations: [
    SsButtonComponent,
    SgaPanelComponent,
    FormFieldComponent,
    ChartBarComponent,
    BoilerSchemeComponent,
    FormInputComponent,
    FormListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CollapseModule.forRoot(),
    TooltipModule.forRoot(),
    SizingSharedLibModule.forRoot(),
    ReactiveFormsModule,
    ChartsModule
  ],
	exports: [
		SsButtonComponent,
		SgaPanelComponent,
		FormFieldComponent,
		ChartBarComponent,
		BoilerSchemeComponent,
    FormInputComponent
	]
})
export class SharedModule { }
