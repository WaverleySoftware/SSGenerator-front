import { AfterViewInit, Component, Input, OnInit, TemplateRef } from "@angular/core";

@Component({
  selector: 'sga-panel',
  templateUrl: './sga-panel.component.html',
  styleUrls: ['./sga-panel.component.scss']
})
export class SgaPanelComponent implements OnInit, AfterViewInit {
  @Input() id: string = 'SgaPanelComponent-ID';
  @Input() title: string;
  @Input() subtitle: string;
  @Input() titleSize: string = '16px';
  @Input() titleTooltip: string;
  @Input() background: string;
  @Input() isCollapsed: boolean = false;
  @Input() showSeparator: boolean = true;
  @Input() disableToggle: boolean;
  @Input() headingRef: TemplateRef<any>;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.checkExistingContent();
  }

  private checkExistingContent(): void {

  }

}
