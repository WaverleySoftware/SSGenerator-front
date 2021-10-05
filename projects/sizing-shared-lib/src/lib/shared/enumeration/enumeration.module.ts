import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { EnumerationComponent } from './enumeration.component';

import { TranslationModule } from "../translation/translation.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslationModule
  ],
  exports: [EnumerationComponent],
  declarations: [EnumerationComponent]
})
export class EnumerationModule { }
