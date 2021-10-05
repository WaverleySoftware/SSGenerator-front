import { NgModule } from '@angular/core';

import { SharedModule } from "../../shared/shared.module";

import { ProjectsJobsComponent } from './projects-jobs.component';
import { JobsComponent } from "./jobs/jobs.component";
import { ProjectsJobsService } from './projects-jobs.service';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { GenericChangesGuard } from "../generic.changes.guard";


@NgModule({
  imports: [
    SharedModule, NgxDatatableModule
  ],
  providers: [ProjectsJobsService, GenericChangesGuard],
  declarations: [ProjectsJobsComponent, JobsComponent]
})
export class ProjectsJobsModule { }
