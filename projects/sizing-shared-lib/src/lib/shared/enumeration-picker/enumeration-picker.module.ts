import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { EnumerationPickerComponent } from './enumeration-picker.component';

import { TranslationModule } from "../translation/translation.module";

//import { TranslatePipe } from './translate.pipe';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslationModule,
    NgxDatatableModule
  ],
  exports: [EnumerationPickerComponent],
  declarations: [EnumerationPickerComponent]
})
export class EnumerationPickerModule { }
