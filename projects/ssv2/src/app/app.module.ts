import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
// HTTP interceptor services, intercepts any http requests and attaches token information to the request so we don't have to.
import { SizingModuleModule } from 'projects/ssv2/src/app/sizingModules/sizingModule.module';
import { SafetyValvesSharedModule } from 'projects/safetyvalves-lib/src/app/app.module';
import { CleanSteamGeneratorSharedModule } from 'projects/cleansteamgenerator-lib/src/app/app.module';
import { CleanSteamGeneratorFBSharedModule } from 'projects/cleansteamgenerator-fb-lib/src/app/app.module';
import { CleanSteamGeneratorFBMiniSharedModule } from 'projects/cleansteamgenerator-fbmini-lib/src/app/app.module';
import { FlowMeterSharedModule } from 'projects/flowmeter-lib/src/app/app.module';
import { EasiHeatSharedModule } from 'projects/easiheat-app/src/app/app.module'
import { SteamGenerationAssessmentSharedModule } from "projects/steam-generation-assessment-lib/src/app/app.module";
import { AppRoutingModule } from './app-routing.module';
import { LayoutModule } from './layout/layout.module';
import {
  SizingSharedLibModule,
  ProjectsJobsModule,
  UserProfileModule,
  SyncClientModule,
  MenuService,
  SettingsService,
  RoutesService,
  PreferenceService,
  TranslationService,
  PreferenceModule,
  UnitsService,
  AdminService,
  User,
} from 'sizing-shared-lib'; // './modules/projects-jobs/projects-jobs.module';
import { HomeModule } from './modules/home/home.module';


// Need to add Lazy loaded child routes here for event lifecycle reasons
// This is then edited in app.component.ts to correct architecture in method addLazyChildRouting() //, HomeComponent
@NgModule({
  declarations: [
    AppComponent
  ],
    imports: [
      BrowserModule,
      FlowMeterSharedModule.forRoot(),
      EasiHeatSharedModule.forRoot(),
      SizingSharedLibModule.forRoot(),
      SafetyValvesSharedModule.forRoot(),
      CleanSteamGeneratorSharedModule.forRoot(),
      CleanSteamGeneratorFBSharedModule.forRoot(),
      CleanSteamGeneratorFBMiniSharedModule.forRoot(),
      SteamGenerationAssessmentSharedModule.forRoot(),
      AppRoutingModule,
      PreferenceModule,
      LayoutModule,
      ProjectsJobsModule,
      UserProfileModule,
      SyncClientModule,
      HomeModule
    ],
  providers : [
    MenuService,
    SettingsService,
    RoutesService,
    PreferenceService,
    TranslationService,
    UnitsService,
    AdminService,
    User
  ],
  bootstrap: [AppComponent],
  exports: [SizingModuleModule]
})
export class AppModule {

}




