/* tslint:disable:no-unused-variable */
import { Injector } from '@angular/core';
import { TestBed, async, inject } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
//import { RouterModule, Router } from '@angular/router';

import { MenuService } from 'sizing-shared-lib';
import { SettingsService } from 'sizing-shared-lib';
import { LayoutService } from 'sizing-shared-lib';

describe('Component: Sidebar', () => {
    let mockRouter = {
        navigate: jasmine.createSpy('navigate')
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MenuService,
                SettingsService,
               // { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();
    });

  it('should create an instance', async(inject([MenuService, SettingsService,
     // Router,
      LayoutService, Injector], (menuService, settingsService, layoutService, injector) => {
    let component = new SidebarComponent(menuService, settingsService, layoutService, injector);
        expect(component).toBeTruthy();
    })));
});
