import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BlockUIModule } from 'ng-block-ui';

import {
  ProjectsJobsModule,
  SizingSharedLibModule
} from 'sizing-shared-lib';

import { FlowMeterComponent } from './flow-meter/flow-meter.component';
import { ProcessConditionsComponent } from './process-conditions/process-conditions.component';
import { PipeSelectionComponent } from './pipe-selection/pipe-selection.component';
import { MeterDetailsComponent } from './meter-details/meter-details.component';
import { FlowMeterService } from './flow-meter.service';
import { ResultsTableComponent } from './results-table/results-table.component';
import { ResultsFiltersComponent } from './results-filters/results-filters.component';
import { ResultsItemDetailsComponent } from './results-item-details/results-item-details.component';
import { ResultsAncillariesComponent } from './results-ancillaries/results-ancillaries.component';
import { ItemDetailsService } from './item-details.service';
import { EnumerationService } from './enumeration.service';
import { RequestDeduplicationService } from './request-deduplication.service';
import { FlowMeterEnumerationComponent } from './flow-meter-enumeration/flow-meter-enumeration.component';
import { flowMeterDocGenService } from './flowMeterDocGen.service';


export const providers = [FlowMeterService, ItemDetailsService, EnumerationService, RequestDeduplicationService, flowMeterDocGenService, ResultsItemDetailsComponent, ProcessConditionsComponent ];

@NgModule({
  declarations: [
    FlowMeterComponent,
    ProcessConditionsComponent,
    PipeSelectionComponent,
    MeterDetailsComponent,
    ResultsTableComponent,
    ResultsFiltersComponent,
    ResultsItemDetailsComponent,
    ResultsAncillariesComponent,
    FlowMeterEnumerationComponent,
    ResultsItemDetailsComponent
  ],
  imports: [
    CommonModule,
    SizingSharedLibModule.forRoot(),
    ProjectsJobsModule,
    FormsModule,
    ReactiveFormsModule,
    BlockUIModule,
  ],
  providers: providers,
  entryComponents: [FlowMeterComponent],
  exports: [
    FlowMeterComponent,
  ]
})
export class AppModule { }

@NgModule({})
export class FlowMeterSharedModule {
  static forRoot (): ModuleWithProviders {
    return {
      ngModule: AppModule,
      providers: providers,
    };
  }
}
