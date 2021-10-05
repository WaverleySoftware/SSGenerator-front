import { Component, OnInit } from '@angular/core';
import { ConfirmService } from './confirm.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: './confirm.component.html',
    styleUrls: ['./confirm.component.scss']
})

export class ConfirmComponent implements OnInit {
    route: ActivatedRoute;

    verificationSucceeded: boolean;

    verificationPending: boolean = true;

    constructor(private confirmService: ConfirmService, route: ActivatedRoute) {
        this.route = route;
    }

    ngOnInit() {
        let uniqueCode = this.route.snapshot.params['uniqueCode'];

        this.confirmService.verifyRegistrationToken(uniqueCode).subscribe((result: boolean) => {

            this.verificationSucceeded = result;
            this.verificationPending = false;

        });
    }
}
