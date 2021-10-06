import { BrowserModule } from '@angular/platform-browser';
import { ModuleWithProviders, NgModule } from "@angular/core";

import { CommonModule } from "@angular/common";
import { ProjectsJobsModule, SizingSharedLibModule } from 'sizing-shared-lib';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BlockUIModule } from "ng-block-ui";

import { SteamGenerationAssessmentComponent } from './steam-generation-assessment/steam-generation-assessment.component';

const providers = [];

@NgModule({
  declarations: [
    SteamGenerationAssessmentComponent
  ],
  imports: [
    CommonModule,
    SizingSharedLibModule.forRoot(),
    // ProjectsJobsModule,
    // FormsModule,
    // ReactiveFormsModule,
    // BlockUIModule,
  ],
  providers,
  entryComponents: [SteamGenerationAssessmentComponent],
  exports: [SteamGenerationAssessmentComponent]
})
class AppModule { }

@NgModule({})
export class SteamGenerationAssessmentSharedModule {
  static forRoot (): ModuleWithProviders {
    return {
      ngModule: AppModule,
      providers
    };
  }
}
