import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { BlockUIModule } from "ng-block-ui";
import { ProjectsJobsModule, SizingSharedLibModule } from "sizing-shared-lib";
import { SteamGenerationAssessmentComponent } from './steam-generation-assessment/steam-generation-assessment.component';
import { SgaStepsComponent } from './sga-steps/sga-steps.component';
import { SharedModule } from "./modules/shared/shared.module";

@NgModule({
  declarations: [
    SteamGenerationAssessmentComponent,
    SgaStepsComponent
  ],
  imports: [
    CommonModule,
    SizingSharedLibModule.forRoot(),
    ProjectsJobsModule,
    FormsModule,
    ReactiveFormsModule,
    BlockUIModule,
    SharedModule,
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
