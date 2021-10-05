import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AuthenticationGuard } from './authentication.guard';
import { AuthenticationService } from './authentication.service';

@NgModule({
  imports: [HttpClientModule ],
    declarations: [],
    providers:[AuthenticationService, AuthenticationGuard],
    exports: [ ]
})
export class AuthenticationModule { }
