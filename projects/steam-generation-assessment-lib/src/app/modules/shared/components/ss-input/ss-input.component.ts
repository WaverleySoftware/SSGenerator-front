import { Component, EventEmitter, Input, OnInit } from "@angular/core";

@Component({
  selector: 'ss-input',
  templateUrl: './ss-input.component.html',
  styleUrls: ['./ss-input.component.scss']
})
export class SsInputComponent implements OnInit {
  @Input() className: string;
  @Input() type: string = 'text';
  @Input() unit: string;
  @Input() required: boolean;
  @Input() statusLine: boolean;
  @Input() onChange: EventEmitter<Event> = new EventEmitter<Event>();
  @Input() onKeydown: EventEmitter<Event> = new EventEmitter<Event>();
  @Input() onKeypress: EventEmitter<Event> = new EventEmitter<Event>();
  @Input() onKeyup: EventEmitter<Event> = new EventEmitter<Event>();
  @Input() onFocus: EventEmitter<Event> = new EventEmitter<Event>();
  @Input() onFocusOut: EventEmitter<Event> = new EventEmitter<Event>();

  public inputValue: string;
  constructor() { }

  ngOnInit() {
  }

  public onChangeEvent(event: Event): void {
    this.onChange.emit(event);
  }

  public onKeydownEvent($event: Event): void {
    this.onKeydown.emit($event);
  }

  public onKeypressEvent($event: Event): void {
    this.onKeypress.emit($event);
  }

  public onKeyupEvent($event: Event): void {
    this.onKeyup.emit($event);
  }

  public onFocusEvent($event: Event): void {
    this.onFocus.emit($event);
  }
  public onFocusOutEvent($event: Event): void {
    this.onFocusOut.emit($event);
  }
}
