import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { PreferenceService, TranslatePipe } from 'sizing-shared-lib';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FormControl } from '@angular/forms';

/**
 * Anonymous hash to determine severity icons.
 */
const SEVERITY_HASH: { icon: string }[] = [
  { icon: "fa fa-info-circle info-message-class" },
  { icon: "fa fa-warning warning-message-class" },
  { icon: "fa fa-times-circle error-message-class" }
];

@Component({
  selector: 'app-results-table',
  templateUrl: './results-table.component.html',
  styleUrls: ['./results-table.component.scss']
})
export class ResultsTableComponent implements OnInit, AfterViewInit {
  @Input() tableRows: Array<any> = [];
  @Input() tableRowsSelected: Array<any> = [];
  @Input() flowType = '';
  @Output() rowSelected: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('resultsTable', { static: false }) resultsTable: DatatableComponent;

  /**
   * Messages to display in DataTable
   */
  get messages() {
    return {
      emptyMessage: this.translatePipe.transform('NO_DATA_TO_DISPLAY', true),
      totalMessage: this.translatePipe.transform('TOTAL', true),
      selectedMessage: false
    };
  }
  public warningVisible: boolean = false;
  public infoVisible: boolean = false;

  public alertMessage: string;
  public alertMessageList: Array<string> = [];

  /**
   * Show mass or vol flow columns?
   */
  get isMassFlow() {
    return this.flowType === 'mass';
  }

  constructor(
    private translatePipe: TranslatePipe,
    private preferenceService: PreferenceService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  /**
   * DataTable select event handler
   * @param event
   */
  onSelect(event) {
    //this.isSpecSheetEnabled = true;
    this.toggleRowDetails(event.selected);
    this.rowSelected.emit(event.selected[0]);
  }

  /**
   * Get unit label for display in table
   * @param unitName - unit group name
   */
  getUnitLabel(unitName: string) {
    const units = this.preferenceService.sizingUnitPreferences;
    const unit = units.find(sizingUnit => sizingUnit.preference.name === unitName);

    if (unit && unit.preference && unit.preference.masterTextKey) {
      return unit.preference.masterTextKey;
    } else {
      // If unit not set in the sizing, then try the global one
      const globalUnit = this.preferenceService.getUserPreferenceByName(unitName);
      if (globalUnit && globalUnit.masterTextKey) {
        return globalUnit.masterTextKey;
      }
    }

    console.error('Trying to use sizing unit preference, that was not found');
    return null;
  }

  /**
   * Does row has a message icon to display?
   * @param messages - row messages
   */
  hasMessageIcon(messages: any) {
    return messages && messages.length;
  }

  /**
   * Get message icon for the message
   * @param message message
   */
  getMessageIcon(message) {
    const severity = +message.severity;
    return SEVERITY_HASH[severity].icon;
  }

  /**
   * Get message icon for the row
   * @param row
   */
  getRowIcon(row: any) {
    let messages = row.messages;
    // First, check if the current row has been returned with any sizing messages?
    if (SEVERITY_HASH && SEVERITY_HASH.length > 0 && messages && messages.length > 0) {      
      // Error takes precedence over any other severity.
      if (messages.find(item => item.severity === '2')) {
        return SEVERITY_HASH[2].icon;
      }
      else if (messages.find(item => item.severity === '1')) {
        return SEVERITY_HASH[1].icon;
      }

      return SEVERITY_HASH[0].icon;
    }
    // const maxSeverity = messages.map(message => message.severity).reduce((prev, curr) => curr > prev ? curr : prev);

    // switch (maxSeverity.toString()) {
    //   case '0':
    //     return '/assets/img/flowmeter/msg-info.png';
    //   case '1':
    //     return '/assets/img/flowmeter/msg-warning.png';
    //   default:
    //     return '';
    // }
  }

  toggleRowDetails(row) {
    this.warningVisible = false;
    this.infoVisible = false;
    this.alertMessageList = [];
    this.resultsTable.rowDetail.collapseAllRows();
    if (row[0].messages && row[0].messages.length) {
      this.resultsTable.rowDetail.toggleExpandRow(row[0]);
           
      row[0].messages.forEach(msg =>  {
        this.alertMessageList.push(msg);
        if (msg.severity == "0") {
          this.infoVisible = true;
        }
        if (msg.severity == "1") {
          this.warningVisible = true;
        }
      });
    }
  }

  onToggleDetails(event) {
  }

  ngAfterViewInit() {
    const conditionToExpandRowDetails = this.resultsTable &&
                                     this.resultsTable.rowDetail &&
                                     this.tableRowsSelected.length &&
                                     this.tableRowsSelected[0].messages &&
                                     this.tableRowsSelected[0].messages.length;

    if (conditionToExpandRowDetails) {
      this.toggleRowDetails(this.tableRowsSelected);
      this.cdRef.detectChanges();
    }
  }
}
