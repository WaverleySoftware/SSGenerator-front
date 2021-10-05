import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import {
  Router,
  // import as RouterEvent to avoid confusion with the DOM Event
  Event as RouterEvent,
  NavigationEnd
} from '@angular/router';

import { MenuService } from 'sizing-shared-lib';
import { Title } from '@angular/platform-browser';
import { SettingsService } from 'sizing-shared-lib';
import { TranslationService } from "sizing-shared-lib";
import { RoutesService } from "sizing-shared-lib";
import { TranslatePipe } from "sizing-shared-lib";
import { UserProfileService } from 'sizing-shared-lib';
import { User } from 'sizing-shared-lib';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  public title: string;
  public subTitle: string;

  user: User;
  public operatingCompany: string;

  get pageLoading(): boolean {
    return this.routesService.pageLoading;
  }

  get pageLoadProgress(): number {
    return this.routesService.pageLoadProgress;
  }

  constructor(private router: Router,
    private titleService: Title,
    private menuService: MenuService,
    private settingsService: SettingsService,
    private translationService: TranslationService,
    private translatePipe: TranslatePipe,
    private routesService: RoutesService,
    private activatedRoute: ActivatedRoute,
    private userProfileService: UserProfileService) {

    this.userProfileService.getUserDetails().subscribe(user => {
      this.user = user;
    });

    router.events.subscribe((event: RouterEvent) => {
      this.routesService.navigationInterceptor(event);
    });

    this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .map(() => this.activatedRoute)
      .map((route: ActivatedRoute) => {
        // Loop through the routes and find the last activated route.
        while (route.firstChild) {
          route = route.firstChild;
        }

        return route;
      })
      //.filter((route: ActivatedRoute) => route.outlet === 'primary')
      //.mergeMap((route: ActivatedRoute) => route.data)
      .subscribe((event: ActivatedRoute) => {

        const url = this.router.url;

        let urlWithoutParams = url;

        event.paramMap.subscribe((paramMap: ParamMap) => {

          paramMap.keys.forEach(item => {

            const currentParam = paramMap.get(item);

            urlWithoutParams = urlWithoutParams.replace(`/${currentParam}`, '');
          });
        });


        var obj = this.menuService.getMenuObjByUrl(urlWithoutParams);

        this.title = !!obj ? obj.text : "";
        this.subTitle = !!obj ? obj.subText : "";

        if (!!obj && !!obj.displayOperatingCompany && !!this.user
            && obj.displayOperatingCompany ) {
          this.operatingCompany = " : " + this.user.operatingCompanyName;
        } else {
          this.operatingCompany = "";
        }

        this.refreshTitle();
      });
  }

  ngOnInit() {
    this.translationService.getLayoutTranslatedDisplayGroup().subscribe(() => {
      this.refreshTitle();
    });
  }

  private refreshTitle(): void {
    console.info(`The title is: '${this.title}'`);

    this.titleService.setTitle(`${this.translatePipe.transform("SIZING_SUITE", true)} - ${this.translatePipe.transform(this.title, true)}`);
  }
}
