import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: 'form-modal',
  exportAs: 'form-modal',
  templateUrl: './form-modal.component.html',
  styleUrls: ['./form-modal.component.scss']
})
export class FormModalComponent implements OnInit {
  @Input("modal-title") modalTitle: string = "";
  @Input('modal-data') data: any;
  @Input("close-on-submit") closeOnSubmit: boolean = true;
  @Output("on-container-click") onContainerClick: EventEmitter<any> = new EventEmitter();
  @Output("on-ok") onOkClick: EventEmitter<any> = new EventEmitter();

  public visible = false;
  public visibleAnimate = 0;
  public animationDuration = 500;

  constructor() { }

  ngOnInit() {
  }

  open() {
    console.log('---OPEN----')
    if (this.visible === false) {
      this.visible = true;
    }

    if (this.visibleAnimate === 0) setTimeout(() => this.visibleAnimate = 1);
  }

  close() {
    console.log('---CLOSE----')
    if (this.visibleAnimate === 1) {
      this.visibleAnimate = 0;
    }
    if (this.visible) setTimeout(() => this.visible = false, this.animationDuration);
  }

  ok() {
    this.onOkClick.emit(this.data);

    this.closeOnSubmit && this.close(); // Close on submit
  }

  onContainerClicked(event: MouseEvent) {
    if ((<HTMLElement>event.target).classList.contains("modal")) this.onContainerClick.emit(event);
  }
}
