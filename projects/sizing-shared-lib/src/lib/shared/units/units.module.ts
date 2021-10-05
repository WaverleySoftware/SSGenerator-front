import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UnitsModalComponent } from "./units.modal.component";
import { UnitsService } from "./units.service";
import { TranslationModule } from "../../shared/translation/translation.module";

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    TranslationModule
  ],
  declarations: [UnitsModalComponent],
  exports: [UnitsModalComponent],
  providers: [UnitsService]
})
export class UnitsModule { }
