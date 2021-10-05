

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { RecoverComponent } from './recover/recover.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { Error404Component } from './error404/error404.component';
import { Error500Component } from './error500/error500.component';
import { SyncClientComponent } from './syncClient/syncClient.component';

import { AuthenticationGuard } from '../core/authentication/authentication.guard';
import { SizingModuleAccessGuard } from '../shared/sizingModuleAccess/sizingModuleAccess.guard';
import { AdminComponent } from './admin/admin.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ResetComponent } from './reset/reset.component';

//import { SizingModuleComponent } from "./sizingModules/sizingModule.component";

import { TranslationResolver } from "../shared/translation/translation.resolver";
import { PreferenceResolver } from "../shared/preference/preference.resolver";
import { RunGuardsAndResolvers } from '@angular/router';
import { ProjectsJobsComponent } from "./projects-jobs/projects-jobs.component";
import { GenericChangesGuard } from "./generic.changes.guard";
import { ModulePreferenceResolver } from "../shared/module-preference/module-preference.resolver";

// The runGuardsAndResolvers property must be declared as the correct type or build issues will occur.
const alwaysRun: RunGuardsAndResolvers = 'always';

 export const routes = [

  {
    path: '',
    canActivateChild: [AuthenticationGuard],
   // component: LayoutComponent,
    runGuardsAndResolvers: alwaysRun,
    resolve: { resolver: TranslationResolver },
        children: [
          { path: '', redirectTo: '/login', pathMatch: 'full' },
        // { path: 'home', loadChildren:( './lib/modules/home/home.module#HomeModule'), data: { displayGroup: "LAYOUT" } },
        //   {
        //     path: 'sizingModules', component: SizingModuleComponent, canActivateChild: [SizingModuleAccessGuard], runGuardsAndResolvers: alwaysRun, resolve: { resolver: PreferenceResolver, modulePrefsResolver: ModulePreferenceResolver }, children: [
        //       // Create two routes so that URL parameters can be optional
        //       { path: 'safetyValves', loadChildren: './lib/sizingModules/safetyValves/safetyValves.module#SafetyValvesModule', data: { moduleName: "Safety Valves", displayGroup: "SAFETY_VALVE_SIZING", moduleId: "3" } },
        //       { path: 'safetyValves/:projectId/:jobId', loadChildren: './lib/sizingModules/safetyValves/safetyValves.module#SafetyValvesModule', data: { moduleName: "Safety Valves", displayGroup: "SAFETY_VALVE_SIZING", moduleId: "3" } },

        //       { path: 'cleanSteamGenerator', loadChildren: './lib/sizingModules/cleanSteamGenerator/cleanSteamGenerator.module#CleanSteamGeneratorModule', data: { moduleName: "Clean Steam Generator", displayGroup: "CSG_SIZING", moduleId: "8" } },
        //       { path: 'cleanSteamGenerator/:projectId/:jobId', loadChildren: './lib/sizingModules/cleanSteamGenerator/cleanSteamGenerator.module#CleanSteamGeneratorModule', data: { moduleName: "Clean Steam Generator", displayGroup: "CSG_SIZING", moduleId: "8" } },

        //       { path: 'cleanSteamGeneratorFB', loadChildren: './lib/sizingModules/cleanSteamGeneratorFBMini/cleanSteamGeneratorFBMini.module#CleanSteamGeneratorFBMiniModule', data: { moduleName: "Clean Steam Generator FB", displayGroup: "CSGFB_SIZING", moduleId: "12" } },
        //       { path: 'cleanSteamGeneratorFB/:projectId/:jobId', loadChildren: './lib/sizingModules/cleanSteamGeneratorFBMini/cleanSteamGeneratorFBMini.module#CleanSteamGeneratorFBMiniModule', data: { moduleName: "Clean Steam Generator FB", displayGroup: "CSGFB_SIZING", moduleId: "12" } },
        //     ]
        //   },
            { path: 'adminTasks', component: AdminComponent, data: { displayGroup: "ADMIN_LANDING" } },
        //  { path: 'admin', loadChildren: './lib/modules/admin/admin.module#AdminModule' },

            { path: 'projectsJobs', component: ProjectsJobsComponent, canDeactivate: [GenericChangesGuard], data: { displayGroup: "PROJECTS_AND_JOBS" } },
            { path: 'profile', component: UserProfileComponent, canDeactivate: [GenericChangesGuard], data: { displayGroup: "USER_PROFILE" } },
            { path: 'syncClient', component: SyncClientComponent, data: { displayGroup: "SYNC_CLIENT" } }
        ]
  },

  // Not lazy-loaded routes
  { path: 'newUserSync', component: SyncClientComponent, resolve: { resolver: TranslationResolver }, data: { displayGroup: "SYNC_CLIENT" } },

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
