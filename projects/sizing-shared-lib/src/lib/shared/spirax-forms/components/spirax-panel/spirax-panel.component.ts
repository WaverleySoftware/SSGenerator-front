import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'spirax-panel',
  templateUrl: './spirax-panel.component.html',
  styleUrls: ['./spirax-panel.component.scss']
})
export class SpiraxPanelComponent {

  @Input() id = 'SgaPanelComponent-ID';
  @Input() title: string;
  @Input() subtitle: string;
  @Input() titleSize = '16px';
  @Input() titleTooltip: string | TemplateRef<any>;
  @Input() background: string;
  @Input() showSeparator = true;
  @Input() disableToggle: boolean;
  @Input() headingRef: TemplateRef<any>;
  @Input() disabled: boolean;
  @Input() invalid: boolean;
  @Input() expanded = true;
  @Output() expandedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  togglePanel(): void {
    this.expanded = !this.expanded;
    this.expandedChange.emit(this.expanded);
  }

}
