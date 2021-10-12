import { Component, EventEmitter, Input, OnInit } from "@angular/core";

@Component({
  selector: 'ss-button',
  templateUrl: './ss-button.component.html',
  styleUrls: ['./ss-button.component.scss']
})
export class SsButtonComponent implements OnInit {
  @Input() click: EventEmitter<Event> = new EventEmitter<Event>();
  @Input() className: string;
  @Input() type: 'button' | 'submit' = 'button';
  constructor() { }

  ngOnInit() {
  }

  public onButtonClick(event: Event): void {
    this.click.emit(event)
  }
}
