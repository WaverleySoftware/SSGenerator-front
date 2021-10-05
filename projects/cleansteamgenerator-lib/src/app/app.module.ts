import { NgModule, ModuleWithProviders } from '@angular/core';
import { CleanSteamGeneratorComponent } from './cleanSteamGenerator.component';
import { Routes, RouterModule } from '@angular/router';
import { SizingSharedLibModule } from 'sizing-shared-lib';
import { SizingModuleChangesGuard } from 'sizing-shared-lib';
import { CommonModule } from '@angular/common';
import { ProjectsJobsModule } from "sizing-shared-lib";
import { BrowserModule } from '@angular/platform-browser';
import { csgDocGenService } from './csgDocGen.service';
import { BlockUIModule } from 'ng-block-ui';

const routes: Routes = [
  { path: '', pathMatch : 'full',  component: CleanSteamGeneratorComponent, canDeactivate: [SizingModuleChangesGuard] }
];

const providers = [csgDocGenService]

@NgModule({
    imports: [
      CommonModule,
  //    RouterModule.forChild(routes),
      SizingSharedLibModule.forRoot(),
    ProjectsJobsModule, BrowserModule,
    BlockUIModule
  ],
    declarations: [CleanSteamGeneratorComponent],
    exports: [
  //      RouterModule,
        CleanSteamGeneratorComponent
    ],
    providers: providers
})
export class AppModule { }

@NgModule({})
export class CleanSteamGeneratorSharedModule{
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AppModule,
      providers: providers
    }
  }
}
