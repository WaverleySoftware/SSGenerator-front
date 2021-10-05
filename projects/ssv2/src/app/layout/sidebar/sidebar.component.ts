import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { MenuService } from 'sizing-shared-lib';
import { SettingsService } from 'sizing-shared-lib';
import { ModuleGroup } from 'sizing-shared-lib';
import { LayoutService } from 'sizing-shared-lib';
import 'jasmine';
import 'jquery';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  menuItems: Array<any>;
  router: Router;
  sbclickEvent = 'click.sidebar-toggle';
  $doc: any = null;

  get userModuleGroups(): ModuleGroup[] {
    return this.layoutService.userModuleGroups;
  }

  constructor(public menu: MenuService, public settings: SettingsService, private layoutService: LayoutService, public injector: Injector) {

    // Get the menu items, but exclude the sizing modules
    this.menuItems = menu.getMenu().filter(mu => mu.isSidebarNav === true && !mu.isSizingModule);

  }

  ngOnInit() {

    // Call the service if there are no module groups (unlikely), but best to be safe.
    this.layoutService.getModuleGroupsForUser().subscribe(() => {
      // Filter the menu items so that only the assigned modules are shown.
      const sizingModuleMenuItems = this.menu.getMenu().filter(mu => mu.isSidebarNav === true && !!this.userModuleGroups && this.userModuleGroups.length > 0 && this.userModuleGroups.findIndex(moduleGroup => moduleGroup.masterTextKey === mu.text) > -1);

      this.menuItems = this.menuItems.concat(sizingModuleMenuItems);
    });

    this.router = this.injector.get(Router);

    this.router.events.subscribe((val) => {
      // close any submenu opened when route changes
      this.removeFloatingNav();
      // scroll view to top
      window.scrollTo(0, 0);
      // close sidebar on route change
      this.settings.layout.asideToggled = false;
    });

    // enable sidebar autoclose from extenal clicks
    this.anyClickClose();

  }

  anyClickClose() {
    this.$doc = $(document).on(this.sbclickEvent, (e) => {
      if (!$(e.target).parents('.aside').length) {
        this.settings.layout.asideToggled = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.$doc)
      this.$doc.off(this.sbclickEvent);
  }

  toggleSubmenuClick(event) {
    if (!this.isSidebarCollapsed() && !this.isSidebarCollapsedText() && !this.isEnabledHover()) {
      event.preventDefault();

      let target = $(event.target || event.srcElement || event.currentTarget);
      let ul, anchor = target;

      // find the UL
      if (!target.is('a')) {
        anchor = target.parent('a').first();
      }
      ul = anchor.next();

      // hide other submenus
      let parentNav = ul.parents('.sidebar-subnav');
      $('.sidebar-subnav').each((idx, el) => {
        let $el = $(el);
        // if element is not a parent or self ul
        if (!$el.is(parentNav) && !$el.is(ul)) {
          this.closeMenu($el);
        }
      });

      // abort if not UL to process
      if (!ul.length) {
        return;
      }

      // any child menu should start closed
      ul.find('.sidebar-subnav').each((idx, el) => {
        this.closeMenu($(el));
      });

      // toggle UL height
      if (parseInt(ul.height(), 0)) {
        this.closeMenu(ul);
      }
      else {
        // expand menu
        ul.on('transitionend', () => {
          ul.height('auto').off('transitionend');
        }).height(ul[0].scrollHeight);
        // add class to manage animation
        ul.addClass('opening');
      }

    }

  }

  // Close menu collapsing height
  closeMenu(elem) {
    elem.height(elem[0].scrollHeight); // set height
    elem.height(0); // and move to zero to collapse
    elem.removeClass('opening');
  }

  listenForExternalClicks() {
    let $doc = $(document).on('click.sidebar', (e) => {
      if (!$(e.target).parents('.aside').length) {
        this.removeFloatingNav();
        $doc.off('click.sidebar');
      }
    });
  }

  removeFloatingNav() {
    $('.nav-floating').remove();
  }

  isSidebarCollapsed() {
    return this.settings.layout.isCollapsed;
  }
  isSidebarCollapsedText() {
    return this.settings.layout.isCollapsedText;
  }
  isEnabledHover() {
    return this.settings.layout.asideHover;
  }
}
