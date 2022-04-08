import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminService } from "./admin.service";
import {ProductSelectionAdminService} from '../../sizingModules/safetyValves/modulePreference/productSelectionAdmin/productSelectionAdmin.service'
import { CurrencyComponent } from "./currency/currency.component";
import { OperatingCompanyPreferencesComponent } from './operatingCompany-preferences/operatingCompany-preferences.component';
import { UserPreferencesComponent } from "./user-preferences/user-preferences.component";
import { ModulePreferencesComponent } from "./module-preferences/module-preferences.component";
import { ModuleAccessComponent } from './module-access/module-access.component';
import { ProductSelectionComponent } from './product-selection/product-selection.component';

import { PreferenceModule } from "../../shared/preference/preference.module";
import { TranslationModule } from "../../shared/translation/translation.module";
import { SharedModule } from "../../shared/shared.module";
import { BlockUIModule } from 'ng-block-ui';

import { GenericChangesGuard } from "../generic.changes.guard";
import { SizingModuleAccessGuard } from '../../shared/sizingModuleAccess/sizingModuleAccess.guard';
//import { SizingModuleModule } from '../../sizingModules/sizingModule.module';
import { CleanSteamGeneratorFBMiniModulePreferencesComponent } from '../../sizingModules/cleansteamgeneratorfbmini/modulePreference/cleanSteamGeneratorFBMini.component';
import { CleanSteamGeneratorModulePreferencesComponent } from '../../sizingModules/cleansteamgenerator/modulePreference/cleanSteamGenerator.component';
import { TranslationResolver } from '../../shared/translation/translation.resolver';
import { ProductSelectionAdminComponent } from '../../sizingModules/safetyValves/modulePreference/productSelectionAdmin/productSelectionAdmin.component';
import { EasiHeatPreferencesComponent } from '../../sizingModules/easiHeat/modulePreference/easiHeat.component';
import { SteamGenerationAssessmentModulePreferencesComponent } from "../../sizingModules/seamGenerationAssessment/modulePreference/steamGenerationAssessment.component";

//import { EasiheatModulePreferencesComponent } from 'src/app/sizingModules/easiHeat/modulePreference/easiHeat.component';
//import { SteamGenerationAssessmentModulePreferencesComponent } from 'src/app/sizingModules/steamGenerationAssessment/modulePreference/steamGenerationAssessment.component';


// Route definitions for module preferences.
const modulePreferencesRoutes = [
  { path: '', canActivateChild: [SizingModuleAccessGuard], canDeactivate: [GenericChangesGuard], redirectTo: '/admin/modulePreferences', pathMatch: 'full' },
   // The resolver in csg has been removed as the translations are in the admin module pref display group
  { path: 'cleanSteamGenerator', canDeactivate: [GenericChangesGuard], component: CleanSteamGeneratorModulePreferencesComponent, data: { moduleName: "Clean Steam Generator",  displayGroup: "CLEAN_STEAM_GENERATOR_MODULE_PREFERENCES" } },
  { path: 'cleanSteamGeneratorFB', canDeactivate: [GenericChangesGuard], component: CleanSteamGeneratorFBMiniModulePreferencesComponent, resolve: { resolver: TranslationResolver }, data: { moduleName: "Clean Steam Generator FB", displayGroup: "CLEAN_STEAM_GENERATOR_FB_MODULE_PREFERENCES" } },
  { path: 'easiHeat', canDeactivate: [GenericChangesGuard], component: EasiHeatPreferencesComponent, resolve: { resolver: TranslationResolver }, data: { moduleName: "EasiHeat", displayGroup: "EASIHEAT_MODULE_PREFERENCES" } },
  {
    path: 'steamGenerationAssessment',
    canDeactivate: [GenericChangesGuard],
    component: SteamGenerationAssessmentModulePreferencesComponent,
    resolve: { resolver: TranslationResolver },
    data: { moduleName: "Steam Generation Assessment", displayGroup: "STEAM_GENERATION_ASSESSMENT_MODULE_PREFERENCES" }
  }
];

// Route definitions for the Angular Admin Module
const routes = [
  { path: '', pathMatch: 'full', component: AdminComponent, data: { displayGroup: "ADMIN_LANDING" } },
  { path: 'currency', component: CurrencyComponent, data: { displayGroup: "ADMIN_CURRENCY" } },
  { path: 'operatingCompanyPreferences', component: OperatingCompanyPreferencesComponent, canDeactivate: [GenericChangesGuard], data: { displayGroup: "ADMIN_OPERATING_COMPANY_PREFERENCES" } },
  { path: 'preferences', component: UserPreferencesComponent, canDeactivate: [GenericChangesGuard], data: { displayGroup: "ADMIN_USER_PREFERENCES" } },
  { path: 'modulePreferences', canActivateChild: [SizingModuleAccessGuard], component: ModulePreferencesComponent, canDeactivate: [GenericChangesGuard], data: { displayGroup: "ADMIN_MODULE_PREFERENCES" }, children: modulePreferencesRoutes },
  { path: 'moduleAccess', canDeactivate: [GenericChangesGuard], redirectTo: '/admin/moduleAccess/cleanSteamGenerator', pathMatch: 'full' },
  { path: 'moduleAccess/:sizingModule', component: ModuleAccessComponent, canDeactivate: [GenericChangesGuard], data: { displayGroup: "ADMIN_MODULE_ACCESS" } },
  { path: 'productSelection', component: ProductSelectionComponent, data: { displayGroup: "ADMIN_PRODUCT_SELECTION" } },
  { path: 'productSelectionAdmin', component: ProductSelectionAdminComponent, data: { displayGroup: "ADMIN_PRODUCT_SELECTION" } }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslationModule,
    PreferenceModule,
    SharedModule,
    BlockUIModule,
    RouterModule.forChild(routes),
   // SizingModuleModule
  ],
  exports: [RouterModule, CurrencyComponent, ProductSelectionAdminComponent],
  providers: [AdminService,ProductSelectionAdminService, PreferenceModule, GenericChangesGuard],
  declarations: [
    AdminComponent,
    CurrencyComponent,
    OperatingCompanyPreferencesComponent,
    UserPreferencesComponent,

    // List of module preference components
    ModulePreferencesComponent,

    // List of module access components
    ModuleAccessComponent,
    ProductSelectionComponent,
    ProductSelectionAdminComponent,
    CleanSteamGeneratorModulePreferencesComponent,
    CleanSteamGeneratorFBMiniModulePreferencesComponent,
    EasiHeatPreferencesComponent,
    SteamGenerationAssessmentModulePreferencesComponent,
  ]
})
export class AdminModule { }
