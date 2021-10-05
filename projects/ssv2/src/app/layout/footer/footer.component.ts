import { Component, OnInit, Input } from '@angular/core';
import { SettingsService } from 'sizing-shared-lib';

@Component({
    selector: '[app-footer]',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

    @Input("hasLayout") hasLayout?: boolean = false;

    constructor(public settings: SettingsService) { }

    ngOnInit() {

    }

}
