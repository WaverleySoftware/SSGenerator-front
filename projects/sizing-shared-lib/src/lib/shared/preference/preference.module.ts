import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PreferenceComponent } from './preference.component';

import { DisplayPreferenceDirective } from "./display-preference.directive";

import { PreferenceDecimalPipe } from "./preference-decimal.pipe";

import { TranslationModule } from "../translation/translation.module";
import {PreferenceService} from './preference.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslationModule
  ],
  exports: [PreferenceComponent, DisplayPreferenceDirective, PreferenceDecimalPipe],
  providers: [PreferenceDecimalPipe, PreferenceService],
  declarations: [PreferenceComponent, DisplayPreferenceDirective, PreferenceDecimalPipe]
})
export class PreferenceModule { }
