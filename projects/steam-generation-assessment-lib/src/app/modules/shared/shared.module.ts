import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { SsButtonComponent } from './components/ss-button/ss-button.component';
import { SgaPanelComponent } from './components/sga-panel/sga-panel.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ChartBarComponent } from './components/chart-bar/chart-bar.component';
import { ChartsModule } from "ng2-charts";
import { BoilerSchemeComponent } from './components/boiler-scheme/boiler-scheme.component';
import { FormInputComponent } from "./components/form-input/form-input.component";
import { SizingSharedLibModule } from "sizing-shared-lib";
import { FormListComponent } from './components/form-list/form-list.component';
import { FormToggleComponent } from './components/form-toggle/form-toggle.component';
import { FormRadioComponent } from './components/form-radio/form-radio.component';
import { SetUnitsDirective } from './directives/set-units.directive';
import { InputLimitToDirective } from "./directives/limit-length.directive";
import { FormModalComponent } from './components/form-modal/form-modal.component';
import { OnlyNumberDirective } from "./directives/only-number.directive";


@NgModule({
  declarations: [
    SsButtonComponent,
    SgaPanelComponent,
    ChartBarComponent,
    BoilerSchemeComponent,
    FormInputComponent,
    FormListComponent,
    FormToggleComponent,
    FormRadioComponent,
    SetUnitsDirective,
    InputLimitToDirective,
    FormModalComponent,
    OnlyNumberDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CollapseModule.forRoot(),
    TooltipModule.forRoot(),
    SizingSharedLibModule.forRoot(),
    ChartsModule
  ],
	exports: [
		SsButtonComponent,
		SgaPanelComponent,
		ChartBarComponent,
		BoilerSchemeComponent,
		FormInputComponent,
		FormListComponent,
		FormToggleComponent,
		FormRadioComponent,
		SetUnitsDirective,
		FormModalComponent,
    OnlyNumberDirective
	],
})
export class SharedModule { }
