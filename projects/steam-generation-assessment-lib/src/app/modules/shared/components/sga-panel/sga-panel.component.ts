import { AfterViewInit, Component, Input, OnInit } from "@angular/core";

@Component({
  selector: 'sga-panel',
  templateUrl: './sga-panel.component.html',
  styleUrls: ['./sga-panel.component.scss']
})
export class SgaPanelComponent implements OnInit, AfterViewInit {
  @Input() id: string = 'SgaPanelComponent-ID';
  @Input() title: string;
  @Input() isCollapsed: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.checkExistingContent();
  }

  private checkExistingContent(): void {

  }

}
