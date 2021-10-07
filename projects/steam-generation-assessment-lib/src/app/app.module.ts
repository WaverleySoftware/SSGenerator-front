import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { BlockUIModule } from "ng-block-ui";
import { ProjectsJobsModule, SizingSharedLibModule } from "sizing-shared-lib";
import { SteamGenerationAssessmentComponent } from './steam-generation-assessment/steam-generation-assessment.component';

@NgModule({
  declarations: [
    SteamGenerationAssessmentComponent
  ],
  imports: [
    CommonModule,
    SizingSharedLibModule.forRoot(),
    ProjectsJobsModule,
    FormsModule,
    ReactiveFormsModule,
    BlockUIModule,
  ],
  providers: [],
  entryComponents: [SteamGenerationAssessmentComponent],
  exports: [SteamGenerationAssessmentComponent]
})
export class AppModule { }

@NgModule({})
export class SteamGenerationAssessmentSharedModule {
  static forRoot = (): ModuleWithProviders => ({
    ngModule: AppModule,
    providers: []
  })
}
