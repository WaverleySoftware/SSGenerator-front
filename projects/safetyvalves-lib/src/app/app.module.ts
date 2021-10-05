import { NgModule, ModuleWithProviders } from '@angular/core';
import { SafetyValvesComponent } from './safetyValves.component';
import { Routes, RouterModule } from '@angular/router';
import { SizingSharedLibModule } from 'sizing-shared-lib';
import { ProjectsJobsModule } from "sizing-shared-lib";
import { CommonModule } from '@angular/common';
import { SafetyValvesService } from './safetyValves.service';
import { svDocGenService } from './svDocGen.service';
import { BlockUIModule } from 'ng-block-ui';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SizingModuleChangesGuard } from 'sizing-shared-lib';

const providers = [SafetyValvesService, svDocGenService];

export const routes: Routes = [
  { path: '', pathMatch: 'full',  component: SafetyValvesComponent, canDeactivate: [SizingModuleChangesGuard] },
];

@NgModule({

  imports: [
    CommonModule,
  //  RouterModule.forChild(routes),
    SizingSharedLibModule.forRoot(),
    ProjectsJobsModule,
    FormsModule, ReactiveFormsModule,
    BlockUIModule
  ],
  providers: providers,
  declarations: [SafetyValvesComponent],
  entryComponents: [SafetyValvesComponent],
  exports: [
  //  RouterModule,
    SafetyValvesComponent
   // FormsModule, ReactiveFormsModule
  ]
})
export class AppModule { }

@NgModule({})
export class SafetyValvesSharedModule{
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AppModule,
      providers: providers
    }
  }
}
