import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpiraxPanelComponent } from './components/spirax-panel/spirax-panel.component';
import { CollapseModule, TooltipModule } from 'ngx-bootstrap';
import { SpiraxFormRadioGroupComponent } from './components/spirax-form-radio-group/spirax-form-radio-group.component';
import { TranslationModule } from '../translation/translation.module';
import { SpiraxToggleComponent } from './components/spirax-toggle/spirax-toggle.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslationModule,
    CollapseModule.forRoot(),
    TooltipModule.forRoot(),
  ],
  exports: [
    TooltipModule,
    SpiraxPanelComponent,
    SpiraxFormRadioGroupComponent,
    SpiraxToggleComponent,
  ],
  declarations: [
    SpiraxPanelComponent,
    SpiraxFormRadioGroupComponent,
    SpiraxToggleComponent,
  ],
})

export class SpiraxFormsModule {
}
