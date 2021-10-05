import { NgModule, ModuleWithProviders } from '@angular/core';
//import { CleanSteamGeneratorFBMiniComponent } from 'projects/cleansteamgenerator-fbmini-lib/src/app/cleansteamgeneratorFBMini.component';
import { CleanSteamGeneratorFBMiniComponent } from './cleanSteamGeneratorFBMini.component';
import { Routes, RouterModule } from '@angular/router';
import { SizingSharedLibModule } from 'sizing-shared-lib';
import { SizingModuleChangesGuard } from 'sizing-shared-lib';
import { ProjectsJobsModule } from "sizing-shared-lib";
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { csgFbMiniDocGenService } from './csgFBMiniDocGen.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BlockUIModule } from 'ng-block-ui';

const routes: Routes = [
  { path: '', pathMatch : 'full', component: CleanSteamGeneratorFBMiniComponent, canDeactivate: [SizingModuleChangesGuard] },
];

const providers = [csgFbMiniDocGenService]

@NgModule({
    imports: [
      CommonModule,
      BrowserModule,
     // RouterModule.forChild(routes),
      SizingSharedLibModule.forRoot(),
    ProjectsJobsModule, FormsModule,
    ReactiveFormsModule,
    BlockUIModule
    ],
  declarations: [CleanSteamGeneratorFBMiniComponent],
  entryComponents: [CleanSteamGeneratorFBMiniComponent],
    exports: [
    //    RouterModule,
        CleanSteamGeneratorFBMiniComponent
    ],
    providers: providers
})
export class AppModule { }


@NgModule({})
export class CleanSteamGeneratorFBMiniSharedModule{
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AppModule,
      providers: providers
    }
  }
}
