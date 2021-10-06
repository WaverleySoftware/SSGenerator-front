import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './modules/login/login.component';
import { RegisterComponent } from  './modules/register/register.component';
import { ConfirmComponent } from  './modules/confirm/confirm.component';
import { RecoverComponent } from  './modules/recover/recover.component';
import { MaintenanceComponent } from  './modules/maintenance/maintenance.component';
import { Error404Component } from  './modules/error404/error404.component';
import { Error500Component } from  './modules/error500/error500.component';
import {
  SizingModuleChangesGuard,
  SyncClientComponent
} from 'sizing-shared-lib';
import { AuthenticationGuard } from  'sizing-shared-lib';
import { SizingModuleAccessGuard } from  'sizing-shared-lib';
import { UserProfileComponent } from  'sizing-shared-lib';
import { ResetComponent } from  './modules/reset/reset.component';
import { SizingModuleComponent } from "./sizingModules/sizingModule.component";
import { EasiHeatComponent } from 'projects/easiheat-app/src/app/easiHeat.component';
import { TranslationResolver } from  'sizing-shared-lib';
import { PreferenceResolver } from  'sizing-shared-lib';
import { RunGuardsAndResolvers } from '@angular/router';
import { ProjectsJobsModule} from 'sizing-shared-lib';
import { GenericChangesGuard } from 'sizing-shared-lib';
import { ModulePreferenceResolver } from  'sizing-shared-lib';
import {SafetyValvesSharedModule} from 'projects/safetyvalves-lib/src/app/app.module'
import {SafetyValvesComponent} from 'projects/safetyvalves-lib/src/app/safetyValves.component';
import {CleanSteamGeneratorSharedModule} from 'projects/cleansteamgenerator-lib/src/app/app.module';
import {CleanSteamGeneratorComponent} from 'projects/cleansteamgenerator-lib/src/app/cleanSteamGenerator.component';
import {CleanSteamGeneratorFBMiniSharedModule} from 'projects/cleansteamgenerator-fbmini-lib/src/app/app.module';
import {CleanSteamGeneratorFBMiniComponent} from 'projects/cleansteamgenerator-fbmini-lib/src/app/cleanSteamGeneratorFBMini.component';
import { FlowMeterSharedModule } from 'projects/flowmeter-lib/src/app/app.module';
import { FlowMeterComponent } from 'projects/flowmeter-lib/src/app/flow-meter/flow-meter.component';
import { SteamGenerationAssessmentComponent } from 'projects/steam-generation-assessment-lib/src/app/steam-generation-assessment/steam-generation-assessment.component';
import { RoutesService } from "sizing-shared-lib";
import { MenuService } from 'sizing-shared-lib';
import { SharedModule } from 'sizing-shared-lib';
import { menu } from 'sizing-shared-lib'
import { AuthenticationModule } from 'sizing-shared-lib';
import { SizingModuleAccessModule } from 'sizing-shared-lib';
import { UserProfileModule } from 'sizing-shared-lib';
import { FormsModule } from '@angular/forms';
import { RecoverService } from './modules/recover/recover.service';
import { ResetService } from './modules/reset/reset.service';
import { ConfirmService } from './modules/confirm/confirm.service';
import { LayoutModule } from './layout/layout.module';
import { LayoutComponent } from './layout/layout.component';
import { TranslationModule } from 'sizing-shared-lib';
import { ProjectsJobsComponent } from 'sizing-shared-lib';
import { SyncClientModule } from 'sizing-shared-lib';
import { HomeComponent } from './modules/home/home.component';
//import { AdminComponent } from  'sizing-shared-lib'; //'./modules/admin/admin.component';
// import {EasiHeatSharedModule} from 'projects/easiheat-app/src/app/app.module';
// import { AdminModule } from 'sizing-shared-lib';
// import {CleanSteamGeneratorFBSharedModule} from 'projects/cleansteamgenerator-fb-lib/src/app/app.module';
// import {CleanSteamGeneratorFBComponent} from 'projects/cleansteamgenerator-fb-lib/src/app/cleanSteamGeneratorFB.component';
// import {AdminModuleWrapperModule} from './modules/adminModuleWrapperModule';
// import {CurrencyComponent} from 'sizing-shared-lib';
// import {CleanSteamGeneratorModulePreferencesComponent} from 'sizing-shared-lib';
// import {CleanSteamGeneratorFBMiniModulePreferencesComponent} from 'sizing-shared-lib';
// import {OperatingCompanyPreferencesComponent} from 'sizing-shared-lib';
// import {UserPreferencesComponent} from 'sizing-shared-lib';
// import {ModulePreferencesComponent} from 'sizing-shared-lib';
// import {ModuleAccessComponent} from 'sizing-shared-lib';
// import {ProductSelectionComponent} from 'sizing-shared-lib';
// import {ProductSelectionAdminComponent} from 'sizing-shared-lib';
// import { from } from 'rxjs';

const alwaysRun: RunGuardsAndResolvers = 'always';

// const modulePreferencesRoutes = [
//   { path: '', canActivateChild: [SizingModuleAccessGuard], canDeactivate: [GenericChangesGuard], redirectTo: '/admin/modulePreferences', pathMatch: 'full' },
//   { path: 'cleanSteamGenerator', canDeactivate: [GenericChangesGuard], component: CleanSteamGeneratorModulePreferencesComponent, data: { moduleName: "Clean Steam Generator",  displayGroup: "CLEAN_STEAM_GENERATOR_MODULE_PREFERENCES" } },
//   { path: 'cleanSteamGeneratorFB', canDeactivate: [GenericChangesGuard], component: CleanSteamGeneratorFBMiniModulePreferencesComponent, resolve: { resolver: TranslationResolver },  data: { moduleName: "Clean Steam Generator FB",  displayGroup: "CLEAN_STEAM_GENERATOR_FB_MODULE_PREFERENCES" } }
// ];
// // Route definitions for the Angular Admin Module
// const adminroutes = [
//   { path: 'currency', component: CurrencyComponent, data: { displayGroup: "ADMIN_CURRENCY" } },
//   { path: 'operatingCompanyPreferences', component: OperatingCompanyPreferencesComponent, canDeactivate: [GenericChangesGuard], data: { displayGroup: "ADMIN_OPERATING_COMPANY_PREFERENCES" } },
//   { path: 'preferences', component: UserPreferencesComponent, canDeactivate: [GenericChangesGuard], data: { displayGroup: "ADMIN_USER_PREFERENCES" } },
//   { path: 'modulePreferences', canActivateChild: [SizingModuleAccessGuard], component: ModulePreferencesComponent, canDeactivate: [GenericChangesGuard], data: { displayGroup: "ADMIN_MODULE_PREFERENCES" }, children: modulePreferencesRoutes },
//   { path: 'moduleAccess', canDeactivate: [GenericChangesGuard], redirectTo: '/admin/moduleAccess/cleanSteamGenerator', pathMatch: 'full' },
//   { path: 'moduleAccess/:sizingModule', component: ModuleAccessComponent, canDeactivate: [GenericChangesGuard], data: { displayGroup: "ADMIN_MODULE_ACCESS" } },
//   { path: 'productSelection', component: ProductSelectionComponent, data: { displayGroup: "ADMIN_PRODUCT_SELECTION" } },
//   { path: 'productSelectionAdmin', component: ProductSelectionAdminComponent, data: { displayGroup: "ADMIN_PRODUCT_SELECTION" } }
// ];

export const routes = [
  {
    path: '',
    canActivateChild: [AuthenticationGuard],
    component: LayoutComponent,
    runGuardsAndResolvers: alwaysRun,
    resolve: { resolver: TranslationResolver},
    children: [
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent, data: { displayGroup: "LAYOUT" } },
      {
        path: 'sizingModules',
        component: SizingModuleComponent,
        canActivateChild: [SizingModuleAccessGuard],
        runGuardsAndResolvers: alwaysRun,
        resolve: { resolver: PreferenceResolver, modulePrefsResolver: ModulePreferenceResolver },
        children: [
          // Create two routes so that URL parameters can be optional
          {
            path: 'safetyValves',
            component: SafetyValvesComponent,
            canDeactivate: [GenericChangesGuard],
            data: { moduleName: "Safety Valves", displayGroup: "SAFETY_VALVE_SIZING", moduleId: "3" }
          },
          {
            path: 'safetyValves/:projectId/:jobId',
            component: SafetyValvesComponent,
            canDeactivate: [GenericChangesGuard],
            data: { moduleName: "Safety Valves", displayGroup: "SAFETY_VALVE_SIZING", moduleId: "3" }
          },
          {
            path: 'cleanSteamGenerator',
            component: CleanSteamGeneratorComponent,
            canDeactivate: [GenericChangesGuard],
            data: { moduleName: "Clean Steam Generator", displayGroup: "CSG_SIZING", moduleId: "8" }
          },
          {
            path: 'cleanSteamGenerator/:projectId/:jobId',
            component: CleanSteamGeneratorComponent,
            canDeactivate: [GenericChangesGuard],
            data: { moduleName: "Clean Steam Generator", displayGroup: "CSG_SIZING", moduleId: "8" }
          },
          {
            path: 'flowmeter',
            component: FlowMeterComponent,
            canDeactivate: [GenericChangesGuard],
            data: { moduleName: 'Flow Meter', displayGroup: 'FLOWMETER_SIZING', moduleId: '6'}
          },
          {
            path: 'flowmeter/:projectId/:jobId',
            component: FlowMeterComponent,
            data: { moduleName: 'Flow Meter', displayGroup: 'FLOWMETER_SIZING', moduleId: '6'},
            canDeactivate: [SizingModuleChangesGuard]
          },
          {
            path: 'cleanSteamGeneratorFB',
            component: CleanSteamGeneratorFBMiniComponent,
            canDeactivate: [GenericChangesGuard],
            data: { moduleName: "Clean Steam Generator FB", displayGroup: "CSGFB_SIZING", moduleId: "12" }
          },
          {
            path: 'cleanSteamGeneratorFB/:projectId/:jobId',
            component: CleanSteamGeneratorFBMiniComponent,
            canDeactivate: [GenericChangesGuard],
            data: { moduleName: "Clean Steam Generator FB", displayGroup: "CSGFB_SIZING", moduleId: "12" }
          },
          {
            path: 'easiHeat',
            component: EasiHeatComponent,
            canDeactivate: [GenericChangesGuard],
            data: { moduleName: "EasiHeat", displayGroup: "EASIHEAT_SIZING", moduleId: "5" }
          },
          {
            path: 'easiHeat/:projectId/:jobId',
            component: EasiHeatComponent,
            canDeactivate: [GenericChangesGuard],
            ata: { moduleName: "EasiHeat", displayGroup: "EASIHEAT_SIZING", moduleId: "5" }
          },
          {
            path: 'steamGenerationAssessment',
            component: SteamGenerationAssessmentComponent,
            canDeactivate: [GenericChangesGuard],
            data: {
              moduleName: 'Steam Generation Assessment',
              displayGroup: 'STEAM_GENERATION_ASSESSMENT',
              moduleId: '2'
            }
          }
        ]
      },
      // { path: 'adminTasks', component: AdminComponent, data: { displayGroup: "ADMIN_LANDING" } },
      {
        path: 'admin',
        loadChildren : './modules/adminModuleWrapperModule#AdminModuleWrapperModule'
      },
      {
        path: 'projectsJobs',
        component: ProjectsJobsComponent,
        canDeactivate: [GenericChangesGuard],
        data: { displayGroup: "PROJECTS_AND_JOBS" }
      },
      {
        path: 'profile',
        component: UserProfileComponent,
        canDeactivate: [GenericChangesGuard],
        data: { displayGroup: "USER_PROFILE" }
      },
      {
        path: 'syncClient',
        component: SyncClientComponent,
        data: { displayGroup: "SYNC_CLIENT" }
      }
    ]
  },
  // Not lazy-loaded routes
  {
    path: 'newUserSync',
    component: SyncClientComponent,
    resolve: { resolver: TranslationResolver },
    data: { displayGroup: "SYNC_CLIENT" }
  },
  // ToDo: These pages cannot be translated becuase no valid user authentication can occur before login,
  // as the server claims object is required for LanguageId and OperatingCompanyId for DisplayGroup Translations.
  // Also the browser language IsoName will have to find a corresponding match in the SSv2 database for a LanguageId,
  // plus the Browser's language may not even refect the User's selected LanguageId anyway.
  // If it is decided to attemp anonomyous public access to /Api/Translation/GetTranslatedDisplayGroup then
  // suggest we use the "LAYOUT" diplaygroup which can then be edited from the home landing page.
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'confirm/:uniqueCode', component: ConfirmComponent },
  { path: 'recover', component: RecoverComponent },
  { path: 'reset/:uniqueCode', component: ResetComponent },
  { path: 'maintenance', component: MaintenanceComponent },
  { path: '404', component: Error404Component },
  { path: '500', component: Error500Component },
  // Not found
  { path: '**', redirectTo: '404' }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forRoot(routes),
    CleanSteamGeneratorSharedModule,
    CleanSteamGeneratorFBMiniSharedModule,
    SafetyValvesSharedModule,
    FlowMeterSharedModule,
    AuthenticationModule,
   // AdminModule,
    UserProfileModule,
    SizingModuleAccessModule,
    ProjectsJobsModule,
    SharedModule,
    AuthenticationModule,
    LayoutModule,
    FormsModule,
    TranslationModule,
    SyncClientModule
  ],
  entryComponents: [ HomeComponent ],
  providers: [
    RoutesService,
    RecoverService,
    ResetService,
    ConfirmService,
    ModulePreferenceResolver,
    PreferenceResolver,
    TranslationResolver
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    ConfirmComponent,
    RecoverComponent,
    ResetComponent,
    MaintenanceComponent,
    Error404Component,
    Error500Component,

    // Possibly removed a circular dependency here
    // If something breaks, uncomment the next line:
    // CleanSteamGeneratorFBMiniComponent
  ],
  exports: [
    RouterModule,
    LoginComponent,
    RegisterComponent,
    ConfirmComponent,
    RecoverComponent,
    ResetComponent,
    MaintenanceComponent,
    Error404Component,
    Error500Component
  ]
})
export class AppRoutingModule { constructor(public menuService: MenuService) {
  menuService.addMenu(menu);
} }
