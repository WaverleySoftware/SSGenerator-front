import { NgModule } from '@angular/core';
//import { RouterModule } from '@angular/router';

import { HeaderComponent } from './header.component';

import { TranslationModule } from 'sizing-shared-lib';
import { TranslationComponent } from 'sizing-shared-lib';

import { SizingSuiteModalModule } from 'sizing-shared-lib'; // '../../shared/sizing-suite-modal/sizing-suite-modal.module';
import { SharedModule } from 'sizing-shared-lib'; // "../../shared/shared.module";

@NgModule({
  imports: [
    SharedModule,
    TranslationModule,
    SizingSuiteModalModule,
   // RouterModule
  ],
  declarations: [HeaderComponent],
  entryComponents: [TranslationComponent],
  exports: [HeaderComponent]
})
export class HeaderModule { }
