import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

@Component({
  selector: 'alert-block',
  exportAs: 'alert-block',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  @Input("type") type: string = "success";
  @Input("message") message: string = null;
  @Input("auto-close") autoClose: boolean = false;
  @Input("auto-close-timeout") autoCloseTimeout: number = 10000;

  @Output("close-callback") closeCallback: EventEmitter<any> = new EventEmitter<any>();

  public alertClass: string;
  public alertIconClass: string;

  ngOnInit(): void {
    this.alertClass = `alert alert-${this.type} alert-dismissible ng-star-inserted`;
    let icon: string;

    switch (this.type) {
      case "danger": {
        icon = "exclamation-circle";
        break;
      }
      case "warning": {
        icon = "exclamation-circle";
        break;
      }
      case "info": {
        icon = "info-circle";
        break;
      }
      case "inverse": {
        icon = "info-circle";
        break;
      }
      default: {
        icon = "check-circle";
        break;
      }
    }

    this.alertIconClass = `fa fa-${icon}`;

    // Initialise an auto-close interval if it's been specified
    if (this.autoClose) {
      const interval = setTimeout(() => {
        this.dismissAlert();

        clearInterval(interval);
      }, this.autoCloseTimeout);
    }
  }

  dismissAlert(): void {
    this.message = null;

    this.closeCallback.emit();
  }
}
