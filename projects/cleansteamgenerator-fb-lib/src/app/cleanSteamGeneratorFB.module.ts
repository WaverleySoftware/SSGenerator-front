import { NgModule } from '@angular/core';
import { CleanSteamGeneratorFBComponent } from './cleanSteamGeneratorFB.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'sizing-shared-lib';
import { SizingModuleChangesGuard } from 'sizing-shared-lib';
import { ProjectsJobsModule } from "sizing-shared-lib";

const routes: Routes = [
  { path: '', component: CleanSteamGeneratorFBComponent, canDeactivate: [SizingModuleChangesGuard] },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    ProjectsJobsModule
  ],
  declarations: [CleanSteamGeneratorFBComponent],
  entryComponents: [CleanSteamGeneratorFBComponent],
  exports: [
    RouterModule
  ]
})
export class CleanSteamGeneratorFBModule { }
