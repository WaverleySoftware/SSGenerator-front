import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductSelectionAdminComponent } from "./productSelectionAdmin.component";
import { ProductSelectionAdminService } from './productSelectionAdmin.service';
import { SharedModule } from "projects/sizing-shared-lib/src/lib/shared/shared.module";
import { TranslationModule } from "projects/sizing-shared-lib/src/lib/shared/translation/translation.module";

@NgModule({

  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    TranslationModule
  ],

  providers: [ProductSelectionAdminService],

  declarations: [ProductSelectionAdminComponent],

  exports: []

})
export class ProductSelectionAdminModule { }

