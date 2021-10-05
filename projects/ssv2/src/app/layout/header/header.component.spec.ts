/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

import { SettingsService } from 'sizing-shared-lib' //'../../core/settings/settings.service';
import { MenuService } from 'sizing-shared-lib' //'../../core/menu/menu.service';
import { AuthenticationService } from 'sizing-shared-lib' // "../../core/authentication/authentication.service";


describe('Component: Header', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MenuService, SettingsService]
        }).compileComponents();
    });

  it('should create an instance', async(inject([MenuService, SettingsService, AuthenticationService], (menuService, settingsService, authenticationService) => {
    let component = new HeaderComponent(menuService, settingsService, authenticationService);
        expect(component).toBeTruthy();
    })));
});
