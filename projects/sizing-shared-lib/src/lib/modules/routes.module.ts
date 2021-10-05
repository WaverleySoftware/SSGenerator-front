// import { NgModule } from '@angular/core';
// import { RouterModule } from '@angular/router';

// import { RoutesService } from "./routes.service";
// import { MenuService } from '../core/menu/menu.service';
// import { SharedModule } from '../shared/shared.module';

// import { menu } from './menu';
// import { routes } from './routes';

// import { AuthenticationModule } from '../core/authentication/authentication.module';
// import { SizingModuleAccessModule } from "../shared/sizingModuleAccess/sizingModuleAccess.module";

// import { AdminModule } from './admin/admin.module';

// import { UserProfileModule } from './user-profile/user-profile.module';

// import { LoginComponent } from './login/login.component';
// import { RegisterComponent } from './register/register.component';
// import { RecoverComponent } from './recover/recover.component';
// import { ResetComponent } from './reset/reset.component';
// import { MaintenanceComponent } from './maintenance/maintenance.component';
// import { Error404Component } from './error404/error404.component';
// import { Error500Component } from './error500/error500.component';
// import { ConfirmComponent } from './confirm/confirm.component';
// import { SyncClientComponent } from './syncClient/syncClient.component';

// import { FormsModule } from '@angular/forms';

// // Services
// import { RecoverService } from './recover/recover.service';
// import { ResetService } from './reset/reset.service';

// import { ConfirmService } from './confirm/confirm.service';



// import { TranslationModule } from '../shared/translation/translation.module';
// import { ProjectsJobsModule } from "./projects-jobs/projects-jobs.module";
// import { SyncClientModule } from "./syncClient/syncClient.module";

// import { from } from 'rxjs';


// @NgModule({
//   imports: [
//     SharedModule,
//    // RouterModule.forChild(routes),
//     AuthenticationModule,
//     AdminModule,
//     UserProfileModule,
//     SizingModuleAccessModule,
//     ProjectsJobsModule,
//     SharedModule,
//     AuthenticationModule,
//     FormsModule,
//     TranslationModule,
//     SyncClientModule
//   ],
//   entryComponents: [  ],
//   providers: [RoutesService, RecoverService, ResetService, ConfirmService],
//   declarations: [
//     LoginComponent,
//     RegisterComponent,
//     ConfirmComponent,
//     RecoverComponent,
//     ResetComponent,
//     MaintenanceComponent,
//     Error404Component,
//     Error500Component
//   ],
//   exports: [
//     //RouterModule,
//     LoginComponent,
//     RegisterComponent,
//     ConfirmComponent,
//     RecoverComponent,
//     ResetComponent,
//     MaintenanceComponent,
//     Error404Component,
//     Error500Component
//   ]
// })

// export class RoutesModule {
//   constructor(public menuService: MenuService) {
//     menuService.addMenu(menu);
//   }
// }
