import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SettingsService } from './settings/settings.service';
import { MenuService } from './menu/menu.service';

import { throwIfAlreadyLoaded } from './module-import-guard';
import { AuthenticationModule } from './authentication/authentication.module';
import { MessagesModule } from './messages/messages.module';


@NgModule({
  imports: [FormsModule, AuthenticationModule],
  providers: [
    SettingsService,
    MenuService
  ], exports: [ AuthenticationModule, MessagesModule ]
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
