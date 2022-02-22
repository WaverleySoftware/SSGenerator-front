import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BlockUIModule } from 'ng-block-ui';
import { ProjectsJobsModule, SizingSharedLibModule } from 'sizing-shared-lib';
import { SteamGenerationAssessmentComponent } from './steam-generation-assessment.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SteamGenerationAssessmentService } from './services/steam-generation-assessment.service';
import { SgaInputParametersComponent, SgaBenchmarkComponent, SgaProposedSetupComponent, SgaFinalProposalComponent } from './tabs';
import { BoilerSchemeComponent, ChartBarComponent, FormListComponent } from './components';
import { DisableControlDirective } from './directives/disable-control.directive';
import { NoCommaPipe } from './pipes/no-comma.pipe';
import { ChartsModule } from 'ng2-charts';
import { SgaFormService } from './services/sga-form.service';
import { SgaApiService } from './services/sga-api.service';
import { DecimalPlacePipe } from './pipes/decimal-place.pipe';

const providers = [SteamGenerationAssessmentService, SgaFormService, SgaApiService];

@NgModule({
  declarations: [
    SteamGenerationAssessmentComponent,
    SgaInputParametersComponent,
    SgaBenchmarkComponent,
    SgaProposedSetupComponent,
    SgaFinalProposalComponent,
    BoilerSchemeComponent,
    ChartBarComponent,
    FormListComponent,
    DisableControlDirective,
    NoCommaPipe,
    DecimalPlacePipe
  ],
  imports: [
    CommonModule,
    SizingSharedLibModule.forRoot(),
    ProjectsJobsModule,
    FormsModule,
    ReactiveFormsModule,
    BlockUIModule,
    TabsModule.forRoot(),
    ChartsModule
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
