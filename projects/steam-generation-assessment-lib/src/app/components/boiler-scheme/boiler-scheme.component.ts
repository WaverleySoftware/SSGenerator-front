import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { SgaBoilerSchemeInterface, SgaBoilerSchemeTabsInterface } from "../../interfaces/sga-boiler-scheme.interface";
import { SteamGenerationAssessmentService } from "../../services/steam-generation-assessment.service";

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
  @ViewChild('svg', { static: false, read: ElementRef }) svg: ElementRef;

  constructor(private sgaService: SteamGenerationAssessmentService) { }

  blockClick(e: Event, tabNumber: number): void {
    this.setTab.emit(tabNumber);
  }

  getBase64Scheme() {
    if (this.svg && this.svg.nativeElement) {
      const results = this.sgaService.getBase64FromElem(this.svg.nativeElement);
      console.log(results, '-----results');
    }
  }

}
