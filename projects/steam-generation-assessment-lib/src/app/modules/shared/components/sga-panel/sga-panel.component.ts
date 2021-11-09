import { AfterContentInit, Component, Input, OnInit, TemplateRef } from "@angular/core";

@Component({
  selector: 'sga-panel',
  templateUrl: './sga-panel.component.html',
  styleUrls: ['./sga-panel.component.scss']
})
export class SgaPanelComponent implements OnInit, AfterContentInit {
  @Input() id: string = 'SgaPanelComponent-ID';
  @Input() title: string;
  @Input() subtitle: string;
  @Input() titleSize: string = '16px';
  @Input() titleTooltip: string | TemplateRef<any>;
  @Input() background: string;
  @Input() isCollapsed: boolean = false;
  @Input() showSeparator: boolean = true;
  @Input() disableToggle: boolean;
  @Input() headingRef: TemplateRef<any>;

  constructor() { }

  ngOnInit() {
  }

  ngAfterContentInit() {
    this.checkExistingContent();
  }

  private checkExistingContent(): void {

  }

}
