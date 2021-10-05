import { NgModule } from '@angular/core';
import { CleanSteamGeneratorFBMiniComponent } from './cleanSteamGeneratorFBMini.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'sizing-shared-lib';
import { SizingModuleChangesGuard } from 'sizing-shared-lib';
import { ProjectsJobsModule } from "sizing-shared-lib";
import { BrowserModule } from '@angular/platform-browser';
import {BlockUIModule} from 'ng-block-ui';

const routes: Routes = [
  { path: '', component: CleanSteamGeneratorFBMiniComponent, canDeactivate: [SizingModuleChangesGuard] },
];

@NgModule({
    imports: [
      RouterModule.forChild(routes),
      SharedModule,
      ProjectsJobsModule, BrowserModule,BlockUIModule
    ],
  declarations: [CleanSteamGeneratorFBMiniComponent],
    exports: [
        RouterModule
    ]
})
export class CleanSteamGeneratorFBMiniModule { }
