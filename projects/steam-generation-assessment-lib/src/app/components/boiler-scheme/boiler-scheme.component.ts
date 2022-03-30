import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SgaBoilerSchemeInterface, SgaBoilerSchemeTabsInterface } from "../../interfaces/sga-boiler-scheme.interface";

@Component({
  selector: 'app-boiler-scheme',
  templateUrl: './boiler-scheme.component.html',
  styleUrls: ['./boiler-scheme.component.scss']
})
export class BoilerSchemeComponent {
  @Input() state: SgaBoilerSchemeInterface = {
    isEconomizerPresent: false, //
    isBlowdownVesselPresent: false,
    isCoolingWaterUsed: false,
    isAutoTdsControlPResent: false,
    isFlashVesselPresent: false,
    isHeatExchangerPresent: false,
    pressurisedDeaerator: false,
    isDsiPresent: false,
  };
  @Input() activePanel: SgaBoilerSchemeTabsInterface;
  @Output() setTab: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  blockClick(e: Event, tabNumber: number): void {
    this.setTab.emit(tabNumber);
  }

}
