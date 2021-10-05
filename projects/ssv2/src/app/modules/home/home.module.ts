import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
//import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SizingSuiteModalModule } from  'sizing-shared-lib'; //'../../shared/sizing-suite-modal/sizing-suite-modal.module';
import { SharedModule } from  'sizing-shared-lib'; //'../../shared/shared.module';

// const routes: Routes = [
//   { path: '', component: HomeComponent }
// ];

@NgModule({
  imports: [
    CommonModule,
    // RouterModule.forChild(routes),
    SizingSuiteModalModule,
    SharedModule
  ],
  declarations: [HomeComponent],
  exports: [
     //RouterModule
  ]
})
export class HomeModule { }
