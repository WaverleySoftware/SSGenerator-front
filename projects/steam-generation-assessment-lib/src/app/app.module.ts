import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { BlockUIModule } from "ng-block-ui";
import { ProjectsJobsModule, SizingSharedLibModule } from "sizing-shared-lib";
import { SteamGenerationAssessmentComponent } from './steam-generation-assessment/steam-generation-assessment.component';
import { SharedModule } from "./modules/shared/shared.module";
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SgaInputParametersComponent } from './sga-input-parameters/sga-input-parameters.component';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    SteamGenerationAssessmentComponent,
    SgaInputParametersComponent
  ],
	imports: [
		CommonModule,
		SizingSharedLibModule.forRoot(),
		ProjectsJobsModule,
		FormsModule,
		ReactiveFormsModule,
		BlockUIModule,
		SharedModule,
    TabsModule.forRoot(),
    ChartsModule,
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
