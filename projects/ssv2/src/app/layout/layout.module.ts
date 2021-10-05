import { NgModule } from '@angular/core';

import { LayoutComponent } from './layout.component';
import { LayoutService } from 'sizing-shared-lib';

import { SidebarComponent } from './sidebar/sidebar.component';
import { UserblockComponent } from './sidebar/userblock/userblock.component';
import { FooterComponent } from './footer/footer.component';

import { HeaderModule } from './header/header.module';
import { SharedModule } from 'sizing-shared-lib';
import { MessagesModule } from 'sizing-shared-lib';

@NgModule({
  imports: [
    HeaderModule,
    SharedModule,
    MessagesModule
  ],
  providers: [LayoutService],
  declarations: [
    LayoutComponent,
    SidebarComponent,
    UserblockComponent,
    FooterComponent
  ],
  exports: [
    LayoutComponent,
    SidebarComponent,
    UserblockComponent,
    FooterComponent
  ]
})
export class LayoutModule { }
