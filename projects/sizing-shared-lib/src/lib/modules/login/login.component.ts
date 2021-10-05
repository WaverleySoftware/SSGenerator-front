import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { SettingsService } from '../../core/settings/settings.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    model: any = {};
    loading = false;
    returnUrl: string;
    hasErrored: boolean = false;
    errorMessage: string = "";
    language: string;

  private title: string = "Login";

  @ViewChild("loginForm", { static: false }) loginForm: any;

    constructor(public settingsService: SettingsService, private authenticationService: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router,
        private titleService: Title) {
        
            this.loading = false;
            this.language = navigator.language;
    }

    ngOnInit() {
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

        this.titleService.setTitle(`${this.settingsService.app.name} - ${this.title}`);
    }

    login() {
        this.loading = true;
        this.errorMessage = null;

        this.authenticationService.getAuthToken(this.model.username, this.model.password, this.language)
            .subscribe(
                data => {
                  if (data) {
                    var newClientUser = this.authenticationService.authenticatedUser.newClientUser;
                    if (newClientUser) 
                    {
                      // Sync user data to offline client implementation, then navigate onward
                      this.router.navigate(['/newUserSync'], { queryParams: { returnUrl: this.returnUrl } } ); 
                    }
                    else
                    {
                      // online navigate onward
                      this.router.navigate([this.returnUrl]);
                    }
                  }
                    
                    this.loading = false;
            },
        (error: Error) => {
            this.loading = false;

            this.errorMessage = "Invalid username or password";
        });
  }

}
