import { NgModule, ModuleWithProviders } from '@angular/core';
import { CleanSteamGeneratorFBComponent } from './cleanSteamGeneratorFB.component';
import { Routes, RouterModule } from '@angular/router';
import { SizingSharedLibModule } from 'sizing-shared-lib';
import { SizingModuleChangesGuard } from 'sizing-shared-lib';
import { CommonModule } from '@angular/common';
import { ProjectsJobsModule } from "sizing-shared-lib";
import { BrowserModule } from '@angular/platform-browser';
import { BlockUIModule } from 'ng-block-ui';


const routes: Routes = [
  { path: '', pathMatch : 'full',  component: CleanSteamGeneratorFBComponent, canDeactivate: [SizingModuleChangesGuard] }
];

const providers = []

@NgModule({
  imports: [
    CommonModule,
  //  RouterModule.forChild(routes),
    SizingSharedLibModule.forRoot(),
    ProjectsJobsModule,
    BrowserModule,
    BlockUIModule
  ],
  declarations: [CleanSteamGeneratorFBComponent],
  entryComponents: [CleanSteamGeneratorFBComponent],
  exports: [
  //  RouterModule,
    CleanSteamGeneratorFBComponent
  ],
  providers: providers
})
export class AppModule { }


@NgModule({})
export class CleanSteamGeneratorFBSharedModule{
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AppModule,
      providers: providers
    }
  }
}

