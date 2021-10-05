import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TranslationModule } from "../translation/translation.module";

import { ProductSelectorComponent } from "./product-selector.component";
import { ProductSelectorService } from "./product-selector.service";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslationModule
  ],
  declarations: [ProductSelectorComponent],
  providers: [ProductSelectorService],
  exports: [ProductSelectorComponent]
})
export class ProductSelectorModule { }
