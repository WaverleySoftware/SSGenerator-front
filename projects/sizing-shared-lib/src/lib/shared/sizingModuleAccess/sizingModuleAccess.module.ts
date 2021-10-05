import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { SizingModuleAccessGuard } from './sizingModuleAccess.guard';
import { SizingModuleAccessService } from './sizingModuleAccess.service';

@NgModule({
    imports: [HttpClientModule ],
    declarations: [],
    providers:[SizingModuleAccessService, SizingModuleAccessGuard],
    exports: [ ]
})
export class SizingModuleAccessModule { }
