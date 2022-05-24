import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { BenchmarkResBenchmarkInterface } from "../../interfaces/calc-benchmark-res.interface";

@Component({
  selector: 'app-final-proposal-summary-sub-tab',
  templateUrl: './final-proposal-summary-sub-tab.component.html',
  styleUrls: ['./final-proposal-summary-sub-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinalProposalSummarySubTabComponent implements OnInit {
  @Input() current: BenchmarkResBenchmarkInterface;
  @Input() potential: BenchmarkResBenchmarkInterface;
  @Input() units: { [key: number]: string };
  @Input() currency: string;
  @Input() fuelTypeList: { [key: string]: string };

  constructor() { }

  ngOnInit() {
  }

}
