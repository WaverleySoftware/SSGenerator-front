import { Component, Input } from '@angular/core';
import { ChartBarDataInterface } from '../../interfaces/chart-bar.interface';
import { horizontalChart, verticalChart, verticalChartLabels } from '../../utils/proposed-setup-def-data';
import { BenchmarkResBenchmarkInterface } from "../../interfaces/calc-benchmark-res.interface";

@Component({
  selector: 'app-sga-final-proposal',
  templateUrl: './sga-final-proposal.component.html',
  styleUrls: ['./sga-final-proposal.component.scss']
})
export class SgaFinalProposalComponent {
  @Input() current: Partial<BenchmarkResBenchmarkInterface>;
  @Input() potential: Partial<BenchmarkResBenchmarkInterface>;
  @Input() currency: string;
  @Input() verticalChart: ChartBarDataInterface[] = verticalChart;
  @Input() horizontalChart: ChartBarDataInterface[] = horizontalChart;
  @Input() units: { [key: number]: string };
  chartLabels: string[] = verticalChartLabels;

  constructor() {}


  savingPercent(current: number, potential: number): number {
    if (!current || !potential) {
      return 0;
    }

    return (current - potential) / current * 100
  }
}
