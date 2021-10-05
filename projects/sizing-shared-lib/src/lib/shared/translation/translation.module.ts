import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationComponent } from './translation.component';
import { TranslatePipe } from './translate.pipe';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule
  ],
  declarations: [TranslationComponent, TranslatePipe],
  providers: [TranslatePipe],
  exports: [TranslationComponent, TranslatePipe]
})
export class TranslationModule { }
