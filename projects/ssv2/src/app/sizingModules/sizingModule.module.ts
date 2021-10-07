import { NgModule } from '@angular/core';
import { SharedModule } from "sizing-shared-lib"; // "../shared/shared.module";
import { UnitsModalComponent } from "sizing-shared-lib"; // "../shared/units/units.modal.component";
import { SizingModuleComponent } from './sizingModule.component';
import { SizingModuleChangesGuard } from  "sizing-shared-lib"; //"./sizingModule.changes.guard";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BlockUIModule } from 'ng-block-ui';

//import { EasiHeatModule } from "./easiHeat/easiHeat.module";
//import { SteamGenerationAssessmentModule } from "./steamGenerationAssessment/steamGenerationAssessment.module";
import { SaveLoadModalComponent } from "sizing-shared-lib"; // "../shared/sizing-module-saveload/saveload.modal.component";


/* The only reason Easiheat and Steam Generation Assessment is here, is because the modules are not lazily loaded. */
/* When implementation on these start, it is expected for them to become lazy loaded as well */
/* UPDATE - These have now been removed in anticipation of development and lazy loading */
@NgModule({
  imports: [SharedModule, NgxDatatableModule, BlockUIModule.forRoot()],
  declarations: [SizingModuleComponent],
  entryComponents: [UnitsModalComponent, SaveLoadModalComponent],
  providers: [SizingModuleChangesGuard],
  exports: [SizingModuleComponent]
})
export class SizingModuleModule { }
