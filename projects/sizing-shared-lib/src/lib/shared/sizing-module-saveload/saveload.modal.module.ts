import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SaveLoadModalComponent } from "./saveload.modal.component";
import { SaveLoadService } from "./saveload.modal.service";
import { TranslationModule } from "../../shared/translation/translation.module";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    TranslationModule,
    ReactiveFormsModule,
    NgxDatatableModule
  ],
  declarations: [SaveLoadModalComponent],
  exports: [SaveLoadModalComponent],
  providers: [SaveLoadService]
})
export class SaveLoadModule { }
