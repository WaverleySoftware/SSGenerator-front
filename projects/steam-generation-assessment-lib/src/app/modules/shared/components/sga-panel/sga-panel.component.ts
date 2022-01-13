import { AfterContentInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef } from "@angular/core";

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
  @Input() showSeparator: boolean = true;
  @Input() disableToggle: boolean;
  @Input() headingRef: TemplateRef<any>;
  @Input() disabled: boolean;
  @Input() invalid: boolean;
  @Input() expanded: boolean = true;
  @Output() expandedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  ngAfterContentInit() {
  }

  togglePanel(): void {
    this.expanded = !this.expanded;
    this.expandedChange.emit(this.expanded);
  }

}
