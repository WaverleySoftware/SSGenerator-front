import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

interface BoilerSchemeInterface {
  isEconomizerPresent?: boolean;
  isBlowdownVesselPresent?: boolean;
  isCoolingWaterUsed?: boolean;
  isAutoTdsControlPResent?: boolean;
  isFlashVesselPresent?: boolean;
  isHeatExchangerPresent?: boolean;
  pressurisedDeaerator?: boolean;
  isDsiPresent?: boolean;
}

@Component({
  selector: 'app-boiler-scheme',
  templateUrl: './boiler-scheme.component.html',
  styleUrls: ['./boiler-scheme.component.scss']
})
export class BoilerSchemeComponent implements OnInit {
  @Input() state: BoilerSchemeInterface = {
    isEconomizerPresent: false, //
    isBlowdownVesselPresent: false,
    isCoolingWaterUsed: false,
    isAutoTdsControlPResent: false,
    isFlashVesselPresent: false,
    isHeatExchangerPresent: false,
    pressurisedDeaerator: false,
    isDsiPresent: false,
  };
  @Output() setTab: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {

  }

  blockClick(e: Event, tabNumber: number): void {
    this.setTab.emit(tabNumber);
  }

}
