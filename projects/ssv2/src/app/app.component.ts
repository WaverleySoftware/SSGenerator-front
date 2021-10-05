import { Component, OnInit, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from "sizing-shared-lib";
import { RoutingState } from "sizing-shared-lib";
// import { lazyChildRoutes } from './lazychildroutes';
import { ViewEncapsulation } from '@angular/compiler/src/core';
declare var $: any;


@Component({
  selector: 'homeapp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ssv2';

  @HostBinding('class.layout-fixed') get isFixed() { return this.settings.layout.isFixed; };
  @HostBinding('class.aside-collapsed') get isCollapsed() { return this.settings.layout.isCollapsed; };
  @HostBinding('class.layout-boxed') get isBoxed() { return this.settings.layout.isBoxed; };
  @HostBinding('class.layout-fs') get useFullLayout() { return this.settings.layout.useFullLayout; };
  @HostBinding('class.hidden-footer') get hiddenFooter() { return this.settings.layout.hiddenFooter; };
  @HostBinding('class.layout-h') get horizontal() { return this.settings.layout.horizontal; };
  @HostBinding('class.aside-float') get isFloat() { return this.settings.layout.isFloat; };
  @HostBinding('class.offsidebar-open') get offsidebarOpen() { return this.settings.layout.offsidebarOpen; };
  @HostBinding('class.aside-toggled') get asideToggled() { return this.settings.layout.asideToggled; };
  @HostBinding('class.aside-collapsed-text') get isCollapsedText() { return this.settings.layout.isCollapsedText; };




  private lazyChildRoutesAdded: Boolean = false;

  constructor(private router: Router, routingState: RoutingState, public settings: SettingsService) {

  }

  // private addLazyChildRouting(): void {
  //   // Check if we already added child routes (lazy loaded product modules/libraries)
  //   if (!this.lazyChildRoutesAdded) {
  //     if (this.router != null) {
  //       // copy route config
  //       let configCopy = this.router.config;
  //       //Find and edit new sizing route to add children
  //       let route = configCopy.filter(obj => obj.path == "" && obj.component.name === "LayoutComponent");
  //       console.log('Route Length ' + route.length);
  //       if(route[0].children != null){
  //       const children = route[0].children;
  //       const sizingModulesRoute = children.filter(obj => obj.path == "sizingModules");
  //       // length of top level total routes
  //       const configLen = configCopy.length;
  //       // Number of routes in lazy loaded routing
  //       const moduleLength = lazyChildRoutes.length;
  //       //modules/routes to take from the end of the route config that we will add in to sizing modules child array
  //       const SizingChildren = configCopy.splice(configLen - moduleLength, moduleLength);
  //       //console.log(SizingChildren);
  //       // Add in to child routes of 'sizingModules' route
  //       //sizingModulesRoute[0].children = [...SizingChildren];
  //       //console.log(route[0].children+":route[0] children");
  //       //reset config with new route
  //       this.router.resetConfig(configCopy);
  //       }
  //       // prevent from repeating code by changing flag value
  //       this.lazyChildRoutesAdded = true;
  //     }
  //   }
  // }

  ngOnInit() {
    // this.addLazyChildRouting();
  }
}
