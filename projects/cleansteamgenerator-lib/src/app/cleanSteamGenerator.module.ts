import { NgModule } from '@angular/core';
import { CleanSteamGeneratorComponent } from './cleanSteamGenerator.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'sizing-shared-lib';
import { SizingModuleChangesGuard } from 'sizing-shared-lib';
import { ProjectsJobsModule } from "sizing-shared-lib";
import { BrowserModule } from '@angular/platform-browser';

const routes: Routes = [
  { path: '', component: CleanSteamGeneratorComponent, canDeactivate: [SizingModuleChangesGuard] },
];

@NgModule({
    imports: [
      RouterModule.forChild(routes),
      SharedModule,
      ProjectsJobsModule, BrowserModule
  ],
    declarations: [CleanSteamGeneratorComponent],
    exports: [
        RouterModule
    ],
    bootstrap: [CleanSteamGeneratorComponent],
})
export class CleanSteamGeneratorModule { }
