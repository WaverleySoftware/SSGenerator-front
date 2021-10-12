import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsButtonComponent } from './components/ss-button/ss-button.component';
import { SsInputComponent } from './components/ss-input/ss-input.component';
import { FormsModule } from "@angular/forms";



@NgModule({
  declarations: [
    SsButtonComponent,
    SsInputComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    SsButtonComponent,
    SsInputComponent
  ]
})
export class SharedModule { }
