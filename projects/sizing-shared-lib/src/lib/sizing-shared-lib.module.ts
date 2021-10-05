import { NgModule, ModuleWithProviders, ErrorHandler } from '@angular/core';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
// import { RoutesModule } from './modules/routes.module';
import { SizingSharedLibComponent } from './sizing-shared-lib/sizing-shared-lib.component';
import { AuthenticationModule } from './core/authentication/authentication.module';
// import { SizingModuleAccessGuard } from './shared/sizingModuleAccess/sizingModuleAccess.guard';
import {SizingModuleAccessModule} from './shared/sizingModuleAccess/sizingModuleAccess.module';
import { ModulePreferenceResolver } from './shared/module-preference/module-preference.resolver';
import { PreferenceResolver } from './shared/preference/preference.resolver';
//import { SizingModuleModule } from './sizingModules/sizingModule.module';
// HTTP interceptor services, intercepts any http requests and attaches token information to the request so we don't have to.
import { HttpInterceptorService } from './core/http-interceptor/http-interceptor.service';
import { ErrorInterceptor } from './core/http-interceptor/http-interceptor.error';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { DocGenService } from './shared/doc-gen/doc-gen.service';
import { SyncClientService } from './modules/syncClient/syncClient.service';
import { ModulePreferenceService } from './shared/module-preference/module-preference.service';
import {MenuService} from './core/menu/menu.service';
import { PreferenceService } from './shared/preference/preference.service';
import { TranslationResolver } from './shared/translation/translation.resolver';
import { TranslationService } from './shared/translation/translation.service';
import { GlobalErrorHandler } from './core/global-error-handling/global-error-handler';
import { MessagesModule } from './core/messages/messages.module';
import { L10nConfig, LocalizationModule, LocaleValidationModule, LogLevel } from 'node_modules/angular-l10n';
import { BrowserModule } from '@angular/platform-browser';
// import { RouterModule } from '@angular/router';
//import { AdminModule } from './modules/admin/admin.module';
import {SizingSuiteModalModule} from './shared/sizing-suite-modal/sizing-suite-modal.module';
//import { FormsModule, ReactiveFormsModule } from '@angular/forms';



const l10nConfig: L10nConfig = {
  logger: {
    level: LogLevel.Warn
  }
};

@NgModule({
  declarations: [ SizingSharedLibComponent ],
  imports: [HttpClientModule,
    // AdminModule,
    BrowserModule, CoreModule, SharedModule,
    // RouterModule,
    // SizingModuleModule,
     MessagesModule, LocalizationModule.forRoot(l10nConfig),
    LocaleValidationModule.forRoot(), SizingModuleAccessModule,SizingSuiteModalModule
  ],
  exports: [SizingSharedLibComponent, AuthenticationModule,
    CoreModule, SharedModule,
     //SizingModuleModule,
     //RouterModule,
      SizingModuleAccessModule, SizingSuiteModalModule],
  bootstrap: [ SizingSharedLibComponent ]
})
export class SizingSharedLibModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SizingSharedLibModule,
      providers: [
        HttpInterceptorService,
        TranslationService,
        TranslationResolver,
        PreferenceService,
        PreferenceResolver,
        ModulePreferenceService,
        ModulePreferenceResolver,
        SyncClientService,
        MenuService,
        DocGenService,
        {
          provide: HTTP_INTERCEPTORS,
          useExisting: HttpInterceptorService,
          multi: true
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
      }
      ,
        {
          provide: ErrorHandler,
          useClass: GlobalErrorHandler
        }
        ]
    };
  }
}
