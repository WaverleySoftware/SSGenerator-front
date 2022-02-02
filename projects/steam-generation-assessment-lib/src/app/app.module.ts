import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BlockUIModule } from 'ng-block-ui';
import { ProjectsJobsModule, SizingSharedLibModule } from 'sizing-shared-lib';
import { SteamGenerationAssessmentComponent } from './steam-generation-assessment.component';
import { SharedModule } from './modules/shared/shared.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SgaInputParametersComponent } from './sga-input-parameters/sga-input-parameters.component';
import { SgaBenchmarkComponent } from './sga-benchmark/sga-benchmark.component';
import { SgaProposedSetupComponent } from './sga-proposed-setup/sga-proposed-setup.component';
import { SgaFinalProposalComponent } from './sga-final-proposal/sga-final-proposal.component';
import { SteamGenerationAssessmentService } from './steam-generation-assessment.service';
import { TypeOfFuelComponent } from './components/type-of-fuel/type-of-fuel.component';

const providers = [SteamGenerationAssessmentService];

@NgModule({
  declarations: [
    SteamGenerationAssessmentComponent,
    SgaInputParametersComponent,
    SgaBenchmarkComponent,
    SgaProposedSetupComponent,
    SgaFinalProposalComponent,
    TypeOfFuelComponent
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
	],
  providers,
  entryComponents: [SteamGenerationAssessmentComponent],
  exports: [SteamGenerationAssessmentComponent]
})
export class AppModule { }

@NgModule({})
export class SteamGenerationAssessmentSharedModule {
  static forRoot = (): ModuleWithProviders => ({
    ngModule: AppModule,
    providers
  })
}
