import { CommonModule } from '@angular/common';
import { NgModule , ModuleWithProviders} from '@angular/core';
import { EasiHeatComponent } from './easiHeat.component';
import { SizingSharedLibModule } from 'sizing-shared-lib';
import { BlockUIModule } from 'ng-block-ui';



const providers = [];

@NgModule({
  declarations: [
    EasiHeatComponent
  ],
  imports: [
    CommonModule,
    SizingSharedLibModule.forRoot(),
    BlockUIModule

  ],
  providers: providers,
  bootstrap: [EasiHeatComponent],
  exports: [EasiHeatComponent]
})
export class AppModule { }

@NgModule({})
export class EasiHeatSharedModule{
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AppModule,
      providers: providers
    }
  }
}
